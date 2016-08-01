var url = require('url');

var collectUserInfo = function(userId) {
  var userTags = [];
  var userSkills = [];
  var userProjectTags = [];
  var userJobSkills = [];
  if (userId) {
    var user = db.User.findById(userId).exec(function(err, user){
			
		});
    var userProjects;
		db.Project.find({"owner": user._id, "status": "ongoing"}).lean().exec(function(err, projects){
			userProjects = projects;
		});
    var userJobs;
		db.Job.find({"owner": ObjectId(userId), "status": "open"}).lean().exec(function(err, jobs){
			userJobs = jobs;
		});
    // User's tags on themselves
    userTags = user.tags;
    // User's skills
    userSkills = user.skillTags;
    // User's tags on ongoing projects
		var i;
		var numUserProjects = userProjects.length;
    for (i=0;i<numUserProjects;i++) {
      var current = userProjects[i];
      var tags = current.tags;
			var j;
      for (j=0;j<tags.length;j++) {
        userProjectTags.push(tags[j]);
      }
    }
    // User's jobs' required skills
		var numUserJobs = userJobs.length;
    for (i=0;i<numUserJobs;i++) {
      var current = userJobs[i];
      var skillTags = current.skillTags;
			var j;
      for (j=0;j<skillTags.length;j++) {
        userJobSkills.push(skillTags[j]);
      }
    }
  }
  var userInfo = new Object();
  userInfo.userTags = userTags;
  userInfo.userSkills = userSkills;
  userInfo.userProjectTags = userProjectTags;
  userInfo.userJobSkills = userJobSkills;
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
  		- projects (default)
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
			username: username,
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
  	var userInfo = JSON.parse(collectUserInfo(userId));
  	var userTags = userInfo.userTags;
  	var userSkills = userInfo.userSkills;
  	var userProjectTags = userInfo.userProjectTags;
  	var userJobSkills = userInfo.userJobSkills;

  	var results = new Object();
  	var queries = url.parse(req.url, true).query;

  	// Parse the queries
  	var category;
  	if (queries.category) {
  		category = queries.category;
  	}
  	else {
  		category = "projects";
  	}
		
		var keywords;
		if (queries.keywords) {
			keywords = queries.keywords.split(",");
		}
		else {
			keywords = [];
		}
  	
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
  		results[project._id].priority += value;
  	}

  	// helper function to add new project
  	function addNewProject(project, basePriority) {
  		results[project._id] = new Object();
  		results[project._id].url = "/project/" + project._id;
  		results[project._id].type = "project";
  		results[project._id].title = project.name;
  		results[project._id].short_intro = project.basicInfo;
  		results[project._id].latest_update = project.updatedAt;
  		results[project._id].status =  project.status;
  		results[project._id].tags = project.tags;
  		// base priority
  		results[project._id].priority = basePriority;
  		// match priority by user's tags and project's tags
  		updateProjectPriority(project, matchPriority(userTags, project.tags));
  	}

  	function updatePersonPriority(person, value) {
  		results[person._id].priority += value;
  	}
  	// helper function to add new person
  	function addNewPerson(person, basePriority) {
  		results[person._id] = new Object();
  		results[person._id].url = "/profile/" + person.username;
  		results[person._id].type = "person";
  		results[person._id].username = person.username;
  		results[person._id].name = person.name;
  		results[person._id].title = person.title;
  		results[person._id].skills = person.skillTags;
  		results[person._id].tags = person.tags;
  		// base priority
  		results[person._id].priority = basePriority;
  		// match priority by jobs' required skills posted by user
  		var personSkills = person.skillTags;
  		updatePersonPriority(person, matchPriority(userJobSkills, personSkills));
  		// match priority by user's projects' tags and the person's tags
  		updatePersonPriority(person, matchPriority(userProjectTags, person.tags));
  	}

  	function updateJobPriority(job, value) {
  		results[job._id].priority += value;
  	}

  	function addNewJob(job, basePriority) {
  		results[job._id] = new Object();
  		results[job._id].url = "/job/" + job._id;
  		results[job._id].type = "job";
  		results[job._id].name = job.name;
  		results[job._id].intro = job.intro;
  		results[job._id].skills = job.skillTags;
  		results[job._id].project_id = job.project;
  		db.Project.findById(job.project, function(err, project){
  			results[job._id].project_name = project.name;
  		});
  		results[job._id].project_tags = job.descriptionTags;
  		results[job._id].deadline = job.deadline;
  		results[job._id].budget = job.budget;
  		// base priority
  		results[job._id].priority = basePriority;
  		// match priority by user's skills and the job's required skills
  		var jobSkills = job.skillTags;
  		updateJobPriority(job, matchPriority(userSkills, jobSkills));
  	}

  	var i;
  	var numKeywords = keywords.length;
  	for (i=0;i<numKeywords;i++) {
  		var keyword = keywords[i];
  		// Get projects
  		if (category === "projects") {
  			var projectsByName;
				db.Project.find({"name": {$regex: ".*" + keyword + ".*/i"}}).lean().exec(function(err, projects){
					projectsByName = projects;
				});
  			var projectsByTags;
				db.Project.find({"tags": {$elemMatch: {$regex: ".*" + keyword + ".*/i"}}}).lean().exec(function(err, projects){
					projectsByTags = projects;
				});
  			var projectsByIntro;
				db.Project.find({"basicInfo": {$regex: ".*" + keyword + ".*/i"}}).lean().exec(function(err, projects){
					projectsByIntro = projects;
				});
  			var projectsByDetail;
				db.Project.find({"detailedInfo": {$regex: ".*" + keyword + ".*/i"}}).lean().exec(function(err, projects){
					projectsByDetail = projects;
				});

  			// match projects by name
  			for (var current in projectsByName){
  				var newProject = new Object();
  				if (current._id in results) {
  					// The object is found before
  					updateProjectPriority(current, MATCH_NAME);
  				}
  				else {
  					// The object is found in current iteration
  					addNewProject(current, MATCH_NAME);
  				}
  			}

  			// match projects by tags
  			for (var current in projectsByTags) {
  				var newProject = new Object();
  				if (current._id in results) {
  					// The object is found before
  					updateProjectPriority(current, MATCH_TAGS);
  				}
  				else {
  					// The object is found in current iteration
  					addNewProject(current, MATCH_TAGS);
  				}
  			}

  			// match projects by intro
  			for (var current in projectsByIntro) {
  				var newProject = new Object();
  				if (current._id in results) {
  					// The object is found before
  					updateProjectPriority(current, MATCH_REST);
  				}
  				else {
  					// The object is found in current iteration
  					addNewProject(current, MATCH_REST);
  				}
  			}

  			// match projects by detail
  			for (var current in projectsByDetail) {
  				var newProject = new Object();
  				if (current._id in results) {
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
  		if (category === "people") {
  			var peopleByName;
				db.User.find({"name": {$regex: ".*" + keyword + ".*/i"}}).lean().exec(function(err, people){
					peopleByName = people;
				});
  			var peopleByTags;
				db.User.find({"tags": {$elemMatch: {$regex: ".*" + keyword + ".*/i"}}}).lean().exec(function(err, people){
					peopleByTags = people;
				});
  			var peopleBySkill;
				db.User.find({"skillTags": {$elemMatch: {$regex: ".*" + keyword + ".*/i"}}}).lean().exec(function(err, people){
					peopleBySkill = people;
				});
  			var peopleByTitle;
				db.User.find({"title": {$regex: ".*" + keyword + ".*/i"}}).lean().exec(function(err, people){
					peopleByTitle = people;
				});
  			var peopleByBio;
				db.User.find({"bio": {$regex: ".*" + keyword + ".*/i"}}).lean().exec(function(err, people){
					peopleByBio = people;
				});

  			// match people by name
  			for (var current in peopleByName){
  				var newProject = new Object();
  				if (current._id in results) {
  					// The object is found before
  					updatePersonPriority(current, MATCH_NAME);
  				}
  				else {
  					// The object is found in current iteration
  					addNewPerson(current, MATCH_NAME);
  				}
  			}

  			// match people by tags
  			for (var current in peopleByTags){
  				var newProject = new Object();
  				if (current._id in results) {
  					// The object is found before
  					updatePersonPriority(current, MATCH_TAGS);
  				}
  				else {
  					// The object is found in current iteration
  					addNewPerson(current, MATCH_TAGS);
  				}
  			}

  			// match people by skill
  			for (var current in peopleBySkill){
  				var newProject = new Object();
  				if (current._id in results) {
  					// The object is found before
  					updatePersonPriority(current, MATCH_TAGS);
  				}
  				else {
  					// The object is found in current iteration
  					addNewPerson(current, MATCH_TAGS);
  				}
  			}

  			// match people by title
  			for (var current in peopleByTitle){
  				var newProject = new Object();
  				if (current._id in results) {
  					// The object is found before
  					updatePersonPriority(current, MATCH_TAGS);
  				}
  				else {
  					// The object is found in current iteration
  					addNewPerson(current, MATCH_TAGS);
  				}
  			}

  			// match people by bio
  			for (var current in peopleByBio){
  				var newProject = new Object();
  				if (current._id in results) {
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
  		if (category === "jobs") {
  			var jobsByName;
				db.Job.find({"name": {$regex: ".*" + keyword + ".*/i"}, "status": "open"}).lean().exec(function(err, jobs){
					jobsByName = jobs;
				});
  			var jobsByTags;
				db.Job.find({"tags": {$elemMatch: {$regex: ".*" + keyword + ".*/i"}}, "status": "open"}).lean().exec(function(err, jobs){
					jobsByTags = jobs;
				});
  			var jobsBySkills;
				db.Job.find({"skillTags": {$elemMatch: {$regex: ".*" + keyword + ".*/i"}}, "status": "open"}).lean().exec(function(err, jobs){
					jobsBySkills = jobs;
				});
  			var jobsByIntro;
				db.Job.find({"info": {$regex: ".*" + keyword + ".*/i"}, "status": "open"}).lean().exec(function(err, jobs){
					jobsByIntro = jobs;
				});
  			var jobsByDetail;
				db.Job.find({"details": {$regex: ".*" + keyword + ".*/i"}, "status": "open"}).lean().exec(function(err, jobs){
					jobsByDetail = jobs;
				});

  			// match jobs by name
  			for (var current in jobsByName) {
  				var newJob = new Object();
  				if (current._id in results) {
  					// The object is found before
  					updateJobPriority(current, MATCH_NAME);
  				}
  				else {
  					// The object is found in current iteration
  					addNewJob(current, MATCH_NAME);
  				}
  			}

  			// match jobs by tags
  			for (var current in jobsByTags) {
  				var newJob = new Object();
  				if (current._id in results) {
  					// The object is found before
  					updateJobPriority(current, MATCH_TAGS);
  				}
  				else {
  					// The object is found in current iteration
  					addNewJob(current, MATCH_TAGS);
  				}
  			}

				// match jobs by skills
  			for (var current in jobsBySkills) {
  				var newJob = new Object();
  				if (current._id in results) {
  					// The object is found before
  					updateJobPriority(current, MATCH_TAGS);
  				}
  				else {
  					// The object is found in current iteration
  					addNewJob(current, MATCH_TAGS);
  				}
  			}

  			// match jobs by intro
  			for (var current in jobsByIntro) {
  				var newJob = new Object();
  				if (current._id in results) {
  					// The object is found before
  					updateJobPriority(current, MATCH_REST);
  				}
  				else {
  					// The object is found in current iteration
  					addNewJob(current, MATCH_REST);
  				}
  			}

  			// match jobs by detail
  			for (var current in jobsByName) {
  				var newJob = new Object();
  				if (current._id in results) {
  					// The object is found before
  					updateJobPriority(current, MATCH_REST);
  				}
  				else {
  					// The object is found in current iteration
  					addNewJob(current, MATCH_REST);
  				}
  			}
  		}


  		var resultsArray = [];
  		for (var id in results) {
  			if (results.hasOwnProperty(id)) {
  				projectsArray.push(results[id]);
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
  		resultsArray.sort(prioritySort);

  		res.send(JSON.stringify(resultsArray.slice((page-1)*perpage, page*perpage)));
  	}
  };

  return this;
}
