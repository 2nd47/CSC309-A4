var collectUserInfo = function(userId) {
  var userTags = [];
  var userSkills = [];
  var userProjectTags = [];
  var userContractSkills = [];
  if (userId) {
    var user = db.User.findOne({"_id": ObjectId(userId)});
    var userProjects = db.Project.find({"owner": user._id, "status": "ongoing"});
    var userContracts = db.Contract.find({"owner": ObjectId(userId), "status": "open"});
    // User's tags on themselves
    userTags = user.tags;
    // User's skills
    userSkills = user.skillTags;
    // User's tags on ongoing projects
    while (userProjects.hasNext()) {
      var current = userProjects.next();
      var tags = current.tags;
      for (i=0;i<tags.length;i++) {
        userProjectTags.push(tags[i]);
      }
    }
    // User's contracts' required skills
    while (userContracts.hasNext()) {
      var current = userContracts.next();
      var skillTags = current.skillTags;
      for (i=0;i<skillTags.length;i++) {
        userContractSkills.push(skillTags[i]);
      }
    }
  }
  var userInfo = new Object();
  userInfo.userTags = userTags;
  userInfo.userSkills = userSkills;
  userInfo.userProjectTags = userProjectTags;
  userInfo.userContractSkills = userContractSkills;
  return JSON.stringify(userInfo);
};

module.exports = function(app) {
  this.getSearch = function (req, res) {
  	/*
  	Probable Queries:
  	- page
  	  - page number (default=1)
  	- perpage
  		- number of results per page (default = 10)
  	- category
  	  - all (default)
  		- projects
  		- people
  		- jobs: open jobs only
  	- keywords
  		- the key word(s) for the search (e.g. hello,world,python)

  	If it were a project, get
  	_id: {
  		type: project,
  		title: project title,
  		short_intro: short description, 300 characters max,
  		latest_update: date of the latest update, in seconds,
  		status: project status,
  		tags: [list of tags],
  		priority: accumulating as encountering the object
  	}

  	If it were a person, get
  	_id: {
  		type: person,
  		name: person's name,
  		title: person's title,
  		skills: person's skillTag,
  		tags: [list of tags]
  		priority: accumulating as encountering the object
  	}

  	If it were a job, get from OPEN jobs:
  	_id: {
  		type: job,
  		name: job name,
  		intro: job intro,
  		skills: skillTags,
  		project_id: project id,
  		project_name: project name,
  		project_tags: tags for the project,
  		deadline: job deadline
  		budget: job budget
  	}
  	priorities adjusted based on user's skills
  	*/

  	////////////////////////////////////////////////////
  	//                                                //
  	// TODO: are ObjectIds hashable                   //
  	//                                                //
  	////////////////////////////////////////////////////

  	// Get the logged in user's id to adjust search priority
  	var userId = req.session.userId;
  	var userInfo = collectUserInfo(userId);
  	var userTags = userInfo.userTags;
  	var userSkills = userInfo.userSkills;
  	var userProjectTags = userInfo.userProjectTags;
  	var userJobSkills = userInfo.userJobSkills;

  	var projects_results = new Object(); //Store object_id: {...,priority_level:number}
  	var people_results = new Object();
  	var jobs_results = new Object();
  	var queries = url.parse(req.url, true).query;

  	// Parse the queries
  	var category;
  	if (queries.category) {
  		category = queries.category;
  	}
  	else {
  		category = "all";
  	}

  	var keywords = queries.keywords.split(",");
  	/*
  	var time;
  	if (queries.time) {
  		time = queries.time;
  	}
  	else {
  		time = "all";
  	}*/

  	var page;
  	if (queries.page) {
  		page = queries.page;
  	}
  	else {
  		page = 1;
  	}

  	var perpage;
  	if (queries.perpage) {
  		perpage = queries.perpage;
  	}
  	else {
  		perpage = 1;
  	}

  	// Priority: match name: +4 match tag: +2 match content: +1
  	// for each keyword:
  	const MATCH_USER = 2;
  	const MATCH_NAME = 4;
  	const MATCH_TAGS = 2;
  	const MATCH_REST = 1;

  	// helper function to decide matching priority based on two arrays' common elements
  	function matchPriority(arr1, arr2) {
  		var concatTags = arr1.concat(arr2);
  		var concatSet = new Set(concatTags);
  		var numMatchTag = concatTags.length - concatSet.size;
  		return MATCH_USER * numMatchTag;
  	}
  	// helper function to add priority to a project
  	function updateProjectPriority(project, value) {
  		projects_results[project._id].priority += value;
  	}

  	// helper function to add new project
  	function addNewProject(project, basePriority) {
  		projects_results[project._id] = new Object();
  		projects_results[project._id].id = current._id;
  		projects_results[project._id].type = "project";
  		projects_results[project._id].title = current.name;
  		projects_results[project._id].short_intro = current.basicInfo;
  		projects_results[project._id].latest_update = current.updatedAt;
  		projects_results[project._id].status =  current.status;
  		projects_results[project._id].tags = current.tags;
  		// base priority
  		projects_results[project._id].priority = basePriority;
  		// match priority by user's tags and project's tags
  		updateProjectPriority(project, matchPriority(userTags, project.tags));
  	}

  	function updatePersonPriority(person, value) {
  		people_results[person._id].priority += value;
  	}
  	// helper function to add new person
  	function addNewPerson(person, basePriority) {
  		people_results[person._id] = new Object();
  		people_results[person._id].id = current._id;
  		people_results[person._id].type = "person";
  		people_results[person._id].name = person.name;
  		people_results[person._id].title = person.title;
  		people_results[person._id].skills = person.skillTags;
  		people_results[person._id].tags = person.tags;
  		// base priority
  		people_results[person._id].priority = basePriority;
  		// match priority by jobs' required skills posted by user
  		var personSkills = person.skillTags;
  		updatePersonPriority(person, matchPriority(userJobSkills, personSkills));
  		// match priority by user's projects' tags and the person's tags
  		updatePersonPriority(person, matchPriority(userProjectTags, person.tags));
  	}

  	function updateJobPriority(job, value) {
  		jobs_results[job._id].priority += value;
  	}

  	function addNewJob(job, basePriority) {
  		jobs_results[job._id] = new Object();
  		jobs_results[job._id].id = current._id;
  		jobs_results[job._id].type = "job";
  		jobs_results[job._id].name = job.name;
  		jobs_results[job._id].intro = job.intro;
  		jobs_results[job._id].skills = job.skillTags;
  		jobs_results[job._id].project_id = job.project;
  		db.Project.findById(job.project, function(err, project){
  			jobs_results[job._id].project_name = project.name;
  		});
  		jobs_results[job._id].project_tags = job.descriptionTags;
  		jobs_results[job._id].deadline = job.deadline;
  		jobs_results[job._id].budget = job.budget;
  		// base priority
  		jobs_results[job._id].priority = basePriority;
  		// match priority by user's skills and the job's required skills
  		var jobSkills = job.skillTags;
  		updateJobPriority(job, matchPriority(userSkills, jobSkills));
  	}

  	var i;
  	var numKeywords = keywords.length;
  	for (i=0;i<numKeywords;i++) {
  		var keyword = keywords[i];
  		// Get projects
  		if (category === "all" || category === "projects") {
  			var projectsByName = db.Project.find({"name": {$regex: ".*" + keyword + ".*/i"}});
  			var projectsByTags = db.Project.find({"tags": {$elemMatch: {$regex: ".*" + keyword + ".*/i"}}});
  			var projectsByIntro = db.Project.find({"basicInfo": {$regex: ".*" + keyword + ".*/i"}});
  			var projectsByDetail = db.Project.find({"detailedInfo": {$regex: ".*" + keyword + ".*/i"}});

  			// match projects by name
  			while (projectsByName.hasNext()) {
  				var newProject = new Object();
  				var current = projectsByName.next();
  				if (current._id in projects_results) {
  					// The object is found before
  					updateProjectPriority(current, MATCH_NAME);
  				}
  				else {
  					// The object is found in current iteration
  					addNewProject(current, MATCH_NAME);
  				}
  			}

  			// match projects by tags
  			while (projectsByTags.hasNext()) {
  				var newProject = new Object();
  				var current = projectsByTags.next();
  				if (current._id in projects_results) {
  					// The object is found before
  					updateProjectPriority(current, MATCH_TAGS);
  				}
  				else {
  					// The object is found in current iteration
  					addNewProject(current, MATCH_TAGS);
  				}
  			}

  			// match projects by intro
  			while (projectsByIntro.hasNext()) {
  				var newProject = new Object();
  				var current = projectsByIntro.next();
  				if (current._id in projects_results) {
  					// The object is found before
  					updateProjectPriority(current, MATCH_REST);
  				}
  				else {
  					// The object is found in current iteration
  					addNewProject(current, MATCH_REST);
  				}
  			}

  			// match projects by detail
  			while (projectsByDetail.hasNext()) {
  				var newProject = new Object();
  				var current = projectsByDetail.next();
  				if (current._id in projects_results) {
  					// The object is found before
  					updateProjectPriority(current, MATCH_REST);
  				}
  				else {
  					// The object is found in current iteration
  					addNewProject(current, MATCH_REST);
  				}
  			}
  		}


  		// Get people
  		if (category === "all" || category === "people") {
  			var peopleByName = db.Project.find({"name": {$regex: ".*" + keyword + ".*/i"}});
  			var peopleByTags = db.Project.find({"tags": {$elemMatch: {$regex: ".*" + keyword + ".*/i"}}});
  			var peopleBySkill = db.Project.find({"skillTags": {$elemMatch: {$regex: ".*" + keyword + ".*/i"}}});
  			var peopleByTitle = db.Project.find({"title": {$regex: ".*" + keyword + ".*/i"}});
  			var peopleByBio = db.Project.find({"bio": {$regex: ".*" + keyword + ".*/i"}});

  			// match people by name
  			while (peopleByName.hasNext()) {
  				var newProject = new Object();
  				var current = peopleByName.next();
  				if (current._id in people_results) {
  					// The object is found before
  					updatePersonPriority(current, MATCH_NAME);
  				}
  				else {
  					// The object is found in current iteration
  					addNewPerson(current, MATCH_NAME);
  				}
  			}

  			// match people by tags
  			while (peopleByTags.hasNext()) {
  				var newProject = new Object();
  				var current = peopleByTags.next();
  				if (current._id in people_results) {
  					// The object is found before
  					updatePersonPriority(current, MATCH_TAGS);
  				}
  				else {
  					// The object is found in current iteration
  					addNewPerson(current, MATCH_TAGS);
  				}
  			}

  			// match people by skill
  			while (peopleBySkill.hasNext()) {
  				var newProject = new Object();
  				var current = peopleBySkill.next();
  				if (current._id in people_results) {
  					// The object is found before
  					updatePersonPriority(current, MATCH_TAGS);
  				}
  				else {
  					// The object is found in current iteration
  					addNewPerson(current, MATCH_TAGS);
  				}
  			}

  			// match people by title
  			while (peopleByTitle.hasNext()) {
  				var newProject = new Object();
  				var current = peopleByTitle.next();
  				if (current._id in people_results) {
  					// The object is found before
  					updatePersonPriority(current, MATCH_TAGS);
  				}
  				else {
  					// The object is found in current iteration
  					addNewPerson(current, MATCH_TAGS);
  				}
  			}

  			// match people by bio
  			while (peopleByBio.hasNext()) {
  				var newProject = new Object();
  				var current = peopleByBio.next();
  				if (current._id in people_results) {
  					// The object is found before
  					updatePersonPriority(current, MATCH_REST);
  				}
  				else {
  					// The object is found in current iteration
  					addNewPerson(current, MATCH_REST);
  				}
  			}
  		}

  		// Get jobs
  		if (category === "all" || category === "jobs") {
  			var jobsByName = db.Job.find({"name": {$regex: ".*" + keyword + ".*/i"}, "status": "open"});
  			var jobsByTags = db.Job.find({"tags": {$elemMatch: {$regex: ".*" + keyword + ".*/i"}}, "status": "open"});
  			var jobsBySkills = db.Job.find({"skillTags": {$elemMatch: {$regex: ".*" + keyword + ".*/i"}}, "status": "open"});
  			var jobsByIntro = db.Job.find({"info": {$regex: ".*" + keyword + ".*/i"}, "status": "open"});
  			var jobsByDetail = db.Job.find({"details": {$regex: ".*" + keyword + ".*/i"}, "status": "open"});

  			// match jobs by name
  			while (jobsByName.hasNext()) {
  				var newJob = new Object();
  				var current = jobsByName.next();
  				if (current._id in jobs_results) {
  					// The object is found before
  					updateJobPriority(current, MATCH_NAME);
  				}
  				else {
  					// The object is found in current iteration
  					addNewJob(current, MATCH_NAME);
  				}
  			}

  			// match jobs by tags
  			while (jobsByTags.hasNext()) {
  				var newJob = new Object();
  				var current = jobsByTags.next();
  				if (current._id in jobs_results) {
  					// The object is found before
  					updateJobPriority(current, MATCH_TAGS);
  				}
  				else {
  					// The object is found in current iteration
  					addNewJob(current, MATCH_TAGS);
  				}
  			}
				
				// match jobs by skills
  			while (jobsByTags.hasNext()) {
  				var newJob = new Object();
  				var current = jobsBySkills.next();
  				if (current._id in jobs_results) {
  					// The object is found before
  					updateJobPriority(current, MATCH_TAGS);
  				}
  				else {
  					// The object is found in current iteration
  					addNewJob(current, MATCH_TAGS);
  				}
  			}

  			// match jobs by intro
  			while (jobsByIntro.hasNext()) {
  				var newJob = new Object();
  				var current = jobsByIntro.next();
  				if (current._id in jobs_results) {
  					// The object is found before
  					updateJobPriority(current, MATCH_REST);
  				}
  				else {
  					// The object is found in current iteration
  					addNewJob(current, MATCH_REST);
  				}
  			}

  			// match jobs by detail
  			while (jobsByDetail.hasNext()) {
  				var newJob = new Object();
  				var current = jobsByDetail.next();
  				if (current._id in jobs_results) {
  					// The object is found before
  					updateJobPriority(current, MATCH_REST);
  				}
  				else {
  					// The object is found in current iteration
  					addNewJob(current, MATCH_REST);
  				}
  			}
  		}


  		var projectsArray = [];
  		for (var id in projects_results) {
  			if (projects_results.hasOwnProperty(id)) {
  				projectsArray.push(projects_results[id]);
  			}
  		}

  		var peopleArray = [];
  		for (var id in people_results) {
  			if (people_results.hasOwnProperty(id)) {
  				peopleArray.push(people_results[id]);
  			}
  		}

  		var jobsArray = [];
  		for (var id in jobs_results) {
  			if (jobs_results.hasOwnProperty(id)) {
  				jobsArray.push(jobs_results[id]);
  			}
  		}

  		// sort each array by priority
  		function prioritySort(a, b) {
  			if (a.priority > b.priority) {
  				return -1;
  			}
  			if (a.priority < b.priority) {
  				return 1;
  			}
  			return 0;
  		}
  		projectsArray.sort(prioritySort);
  		peopleArray.sort(prioritySort);
  		jobsArray.sort(prioritySort);

  		var json = new Object();
  		json.projects = projectsArray.slice((page-1)*perpage, page*perpage);
  		json.people = peopleArray.slice((page-1)*perpage, page*perpage);
  		json.jobs = jobsArray.slice((page-1)*perpage, page*perpage);
  		res.send(JSON.stringify(json));
  	}
  };

  return this;
}
