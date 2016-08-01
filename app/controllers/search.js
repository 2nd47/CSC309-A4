var url = require('url');

var User = require('../models/user'),
    Chat = require('../models/chat'),
    Project = require('../models/project'),
		Job = require('../models/job');

var collectUserInfo = function(userId, callback) {
  var userTags = [];
  var userSkills = [];
  var userProjectTags = [];
  var userJobSkills = [];
	if (userId) {
		User.findById(userId).exec(function(err, user){
			// User's tags on themselves
			userTags = user.tags;
			// User's skills
			userSkills = user.skillTags;
			Project.find({"owner": user._id, "status": "ongoing"}).lean().exec(function(err, userProjects){
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
				Job.find({"owner": ObjectId(userId), "status": "open"}).lean().exec(function(err, userJobs){
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
					var userInfo = new Object();
					userInfo.userTags = userTags;
					userInfo.userSkills = userSkills;
					userInfo.userProjectTags = userProjectTags;
					userInfo.userJobSkills = userJobSkills;
					callback(userInfo);
				});
			});
		});
	}
	else {
		var userInfo = new Object();
		userInfo.userTags = userTags;
		userInfo.userSkills = userSkills;
		userInfo.userProjectTags = userProjectTags;
		userInfo.userJobSkills = userJobSkills;
		callback(userInfo);
	}
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
  	var userId;
		if (req.user) {
			userId = req.user._id;
		}
		collectUserInfo(userId, function(userInfo){
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
			
			var keyword;
			if (queries.search) {
				keyword = queries.search;
			}
			else {
				keyword = "";
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
				perpage = 10;
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
				results[job._id].url = "/jobs/" + job._id;
				results[job._id].type = "job";
				results[job._id].name = job.name;
				results[job._id].intro = job.intro;
				results[job._id].skills = job.skillTags;
				results[job._id].project_id = job.project;
				results[job._id].project_tags = job.descriptionTags;
				results[job._id].deadline = job.deadline;
				results[job._id].budget = job.budget;
				// base priority
				results[job._id].priority = basePriority;
				// match priority by user's skills and the job's required skills
				var jobSkills = job.skillTags;
				updateJobPriority(job, matchPriority(userSkills, jobSkills));
			}
		
			if (category === "projects") {
				Project.find({"name": {$regex: '.*' + keyword + '.*', $options: 'i'}}).lean().exec(function(err, projectsByName){
					// match projects by name
					for (var current in projectsByName){
						current = projectsByName[current];
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
					Project.find({"tags": {$elemMatch: {$regex: '.*' + keyword + '.*', $options: 'i'}}}).lean().exec(function(err, projectsByTags){
						// match projects by tags
						for (var current in projectsByTags) {
							current = projectsByTags[current];
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
						Project.find({"basicInfo": {$regex: '.*' + keyword + '.*', $options: 'i'}}).lean().exec(function(err, projectsByIntro){
							// match projects by intro
							for (var current in projectsByIntro) {
								current = projectsByIntro[current];
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
							Project.find({"detailedInfo": {$regex: '.*' + keyword + '.*', $options: 'i'}}).lean().exec(function(err, projectsByDetail){
								// match projects by detail
								for (var current in projectsByDetail) {
									current = projectsByDetail[current];
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
								var resultsArray = [];
								for (var id in results) {
									if (results.hasOwnProperty(id)) {
										resultsArray.push(results[id]);
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
							});
						});
					});
				});
			}
			// Get people
			if (category === "people") {
				User.find({"name": {$regex: '.*' + keyword + '.*', $options: 'i'}}).lean().exec(function(err, peopleByName){
					// match people by name
					for (var current in peopleByName) {
						current = peopleByName[current];
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
					User.find({"tags": {$elemMatch: {$regex: '.*' + keyword + '.*', $options: 'i'}}}).lean().exec(function(err, peopleByTags){
						// match people by tags
						for (var current in peopleByTags){
							current = peopleByTags[current];
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
						User.find({"skillTags": {$elemMatch: {$regex: '.*' + keyword + '.*', $options: 'i'}}}).lean().exec(function(err, peopleBySkill){
							// match people by skill
							for (var current in peopleBySkill){
								var newProject = new Object();
								current = peopleBySkill[current];
								if (current._id in results) {
									// The object is found before
									updatePersonPriority(current, MATCH_TAGS);
								}
								else {
									// The object is found in current iteration
									addNewPerson(current, MATCH_TAGS);
								}
							}
							User.find({"title": {$regex: '.*' + keyword + '.*', $options: 'i'}}).lean().exec(function(err, peopleByTitle){
								// match people by title
								for (var current in peopleByTitle){
									current = peopleByTitle[current];
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
								User.find({"bio": {$regex: '.*' + keyword + '.*', $options: 'i'}}).lean().exec(function(err, peopleByBio){
									// match people by bio
									for (var current in peopleByBio){
										current = peopleByBio[current];
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
									var resultsArray = [];
									for (var id in results) {
										if (results.hasOwnProperty(id)) {
											resultsArray.push(results[id]);
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
								});
							});
						});
					});
				});
			}
			// Get jobs
			if (category === "jobs") {
				Job.find({"name": {$regex: '.*' + keyword + '.*', $options: 'i'}, "status": "open"}).lean().exec(function(err, jobsByName){
					// match jobs by name
					for (var current in jobsByName) {
						current = jobsByName[current];
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
					Job.find({"tags": {$elemMatch: {$regex: '.*' + keyword + '.*', $options: 'i'}}, "status": "open"}).lean().exec(function(err, jobsByTags){
						// match jobs by tags
						for (var current in jobsByTags) {
							current = jobsByTags[current];
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
						Job.find({"skillTags": {$elemMatch: {$regex: '.*' + keyword + '.*', $options: 'i'}}, "status": "open"}).lean().exec(function(err, jobsBySkills){
							// match jobs by skills
							for (var current in jobsBySkills) {
								current = jobsBySkills[current];
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
							Job.find({"intro": {$regex: '.*' + keyword + '.*', $options: 'i'}, "status": "open"}).lean().exec(function(err, jobsByIntro){
								// match jobs by intro
								for (var current in jobsByIntro) {
									current = jobsByIntro[current];
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
								Job.find({"details": {$regex: '.*' + keyword + '.*', $options: 'i'}, "status": "open"}).lean().exec(function(err, jobsByDetail){
									// match jobs by detail
									for (var current in jobsByDetail) {
										current = jobsByDetail[current];
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
									var resultsArray = [];
									for (var id in results) {
										if (results.hasOwnProperty(id)) {
											resultsArray.push(results[id]);
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
								});
							});
						});
					});
				});
			}
		});
  };

  return this;
}
