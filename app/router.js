/* AIDA Source Code */
/* Contributors located at: github.com/2nd47/CSC309-A4 */

// router middleware

var express = require('express');
var router = express.Router();

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});

// change the request methods as required
// refer to express documentation for more details

// if logged in: feed; else: landing page
router.get('/', function (req, res, next) {
  res.send('AIDA Home Page!');
});

router.post('/login', function (req, res, next) {
  res.send('AIDA Home Page!');
});

router.post('/signup', function (req, res, next) {
  res.send('AIDA Home Page!');
});

// list of contracts
router.get('/contracts', function (req, res) {
	/*
	get id, name, status, skillTags, tags*/
	var cursor = db.Contract.find({},{"name": 1, "status": 1, "skillTags": 1, "tags": 1}).sort({"updatedAt": -1});
	res.send(JSON.stringify(cursor.toArray()));
	
});

// create a new contract
router.post('/contracts/new', function (req, res) {
	/*
		TODO:
		after the posting, send to the front end the link
		to the contract page, so that the front end will
		redirect to the page
		{
			success: true/false
			url: the link to the new contract page
		}
	*/
	var json = new Object();
	try {
		var userId = req.session.userId;
		var contractForm = qs.parse(req.data);
		// may createContract return contract _id or something...
		var newContractId = db.createContract(contractForm.name, contractForm.project,
		userId, contractForm.deadline, contractForm.budget)._id;
		db.setContractField(newContractId, "intro", contractForm.intro);
		// Create new skill objects
		var skills = contractForm.skillTags;
		var numSkills = skills.length;
		var i;
		var skillTags = [];
		for (i=0;i<numSkills;i++) {
			var curSkill = skills[i];
			var newSkill = db.createSkill(curSkill.name, curSkill.rating);
			skillTags.push(newSkill);
		}
		db.setContractField(newContractId, "skillTags", skillTags);
		// Turn the tags in the form "tag1, tag2, tag3" (or without the whitespaces)
		// into an array of strings
		var tags = contractForm.descriptionTags.replace(/\s+/g, '');split(",");
		db.setContractField(newContractId, "descriptionTags", tags);
		db.setContractField(newContractId, "details", contractForm.details);
		db.setContractField(newContractId, "url", contractIdToUrl(newContractId));//??
		json.url = contractIdToUrl(newContractId);
		json.success = "true";
	}
	catch (e) {
		json.success = "false";
		console.log(e.message);
	}
	
	res.send(JSON.stringify(json));
});

// details of contract with contract_id
router.get('/contracts/:contract_id', function (req, res) {
	/*
	Contract page:

	{
		id: contract id,
		title: contract title,
		employer_id: employer id,
		employer_name: employer name,
		project_id: project id,
		project_name: project name,
		status: contract status,
		latest_update: date of the latest update,
		tags: [tag names],
		budget: budget level estimation between 1 to 5,
		deadline: contract deadline,
		intro: introduction to the contract details
	}*/
	var json = new Object();
	var contract_id = req.params.contract_id;
	var contract = db.Contract.findOne({"_id": ObjectId(contract_id)});
	json.id = contract_id;
	json.title = contract.name;
	json.employer_id = contract.owner;
	json.employer_name = db.User.findOne({"_id": ObjectId(contract.owner)},{name: 1}).name;
	json.project_id = contract.project;
	json.project_name = db.Project.findOne({"_id": ObjectId(contract.project)},{name: 1}).name;
	if (contract.taker) {
		json.status = "signed";
	}
	else {
		json.status = "open";
	}
	json.latest_update = contract.updatedAt;
	json.tags = contract.skillTags;
	json.budget = contract.budget;
	json.deadline = contract.deadline;
	json.intro = contract.details;
	res.send(JSON.stringify(json));
});


// list of profiles
router.get('/people', function (req, res) {
	/*
	get id, name, title, skillTags, tags*/
	var cursor = db.People.find({},{"name": 1, "title": 1, "skillTags": 1, "tags": 1}).sort({"updatedAt": -1});
	res.send(JSON.stringify(cursor.toArray()));
});

// details of people with username
router.get('/people/:username', function (req, res) {
	/*
	{
		id: person id,
		name: person's name,
		title: person's title,
		skills: person's skillTags,
		tags: [tags]
		biography: person's biography,
		projects:
		[
			{
				project_id: project id,
				project_name: project name
			}
		],
		contracts:
		[
			{
				contract_id: contract id,
				contract_name: contract name,
				completion_date: completion date,
				contract_rating: contract_rating,
				contract_comment: comment on the work
			}
		]
	}*/
	var json = new Object();
	var user_name = req.params.username;
	var user = db.User.findOne({"username" : user_name});
	json.id = user._id;
	json.name = user.name;
	json.title = user.title;
	json.skills = user.skillTags;
	json.tags = user.tags;
	json.biography = user.bio;
	json.projects = [];
	// Where the user is the owner
	var projects = db.Project.find({"owner": user._id},{name: 1});
	while (projects.hasNext()) {
		var newProject = new Object();
		var current = projects.next();
		newProject.project_id = current._id;
		newProject.project_name = current.name;
		json.projects.push(newProject);
	}
	// Where the user is a member
	var member_projects = db.Project.find({members: {$elemMatch: {"user": ObjectId(user_id)}}});
	while (member_projects.hasNext()) {
		var newProject = new Object();
		var current = member_projects.next();
		newProject.project_id = current._id;
		newProject.project_name = current.name;
		json.projects.push(newProject);
	}
	json.contracts = [];
	var contracts = db.Contract.find({"taker": ObjectId(user_id)});
	while (contracts.hasNext()) {
		var newContract = new Object();
		var current = contracts.next();
		newContract.contract_id = current._id;
		newContract.contract_name = current.name;
		newContract.completion_date = current.completion;
		newContract.contract_rating = current.rating;
		newContract.contract_comment = current.comment;
		json.projects.push(newContract);
	}

	res.send(JSON.stringify(json));
});

// list of projects
router.get('/projects', function (req, res, next) {
	// get name, title, tags, showcase
	var cursor = db.Projects.find({},{"name": 1, "title": 1, "tags": 1, "showcase": 1}).sort({"updatedAt": -1});
	res.send(JSON.stringify(cursor.toArray()));
  //res.send('AIDA Home Page!');
});

// create a new project
router.get('/projects/new', function (req, res, next) {
	/*
		TODO:
		after the posting, send to the front end the link
		to the project page, so that the front end will
		redirect to the page
		{
			success: true/false
			url: the link to the new project page
		}
	*/
	var json = new Object();
	try {
		var userId = req.session.userId;
		var projectForm = qs.parse(req.data);
		// may createContract return contract _id or something...
		var newProjectId = db.createProject(projectForm.name, userId);
		// Turn the tags in the form "tag1, tag2, tag3" (or without the whitespaces)
		// into an array of strings
		var tags = contractForm.descriptionTags.replace(/\s+/g, '');split(",");
		db.setProjectField(newProjectId, "tags", tags);
		db.setProjectField(newProjectId, "members", projectForm.members);
		db.setProjectField(newProjectId, "details", contractForm.details);
		db.setProjectField(newProjectId, "url", projectIdToUrl(newProjectId));//??
		json.url = contractIdToUrl(newProjectId);
		json.success = "true";
	}
	catch (e) {
		json.success = "false";
		console.log(e.message);
	}
	
	res.send(JSON.stringify(json));
  //res.send('AIDA Home Page!');
});

// details of project with project_id
router.get('/projects/:project_id', function (req, res, next) {
	/*
	{
		id: project id,
		title: project title,
		publisher:
		{
			publisher_id: id of owner,
			publisher_name: name of project owner
		},
		members:
		[
			{
				member_id: id of owner,
				member_name: name of project owner
			}
		],
		short_intro: short description, 300 characters max,
		long_intro: longer intro with no character limit,
		showcase:
		[
			{
				path: path to the file,
				type: type of the file
			}
		]
		latest_update: date of the latest update, in seconds,
		status: project status,
		tags: [list of tags],
		open_contracts:
		[
			{
				contract_id: contract id,
				contract_title: contract title,
				contract_tags: [list of skill names with ratings],
				contract_budget: budget level estimation between 1 to 5,
				contract_deadline: contract deadline
			}
		],
	}*/
	var json = new Object();
	var project_id = req.params.project_id;
	var project = db.Project.findOne({"_id" : ObjectId(project_id)});
	// Build the file
	json.id = project_id;
	json.title = project.name;
	json.publisher = new Object();
	json.publisher.publisher_id = project.owner;
	var publisher_info = db.User.findOne({"_id": ObjectId(project.owner)}, {name: 1});
	json.publisher.publisher_name = publisher_info.name;
	json.members = [];
	var i;
	var numMembers = project.members.length;
	for (i=0;i<numMembers;i++) {
		var newMember = new Object();
		newMember.member_id = project.members[i].user;
		var memberName = db.User.findOne({"_id": ObjectId(project.members[i].user)}, {name: 1});
		newMember.member_name = memberName.name;
		json.members.push(newMember);
	}
	json.short_intro = project.basicInfo;
	json.long_intro = project.detailedInfo;
	/*json.long_intro = [];
	var numParagraph = project.detailedInfo.length;
	for (i=0;i<numParagraph;i++) {
		var newParagraph = new Object();
		newParagraph.paragraph_title = project.detailedInfo[i].title;
		newParagraph.paragraph_content = project.detailedInfo[i].content;
		json.long_intro.push(newParagraph);
	}*/
	json.showcase = [];
	var numShowcase = project.showcase.assetPaths.length;
	for (i=0;i<numShowcase;i++) {
		var current_path = project.showcase.assetPaths[i];
		var current_type = project.showcase.mediaTypes[i];
		var newShowcase = new Object();
		newShowcase.path = current_path;
		newShowcase.type = currentcurrent_type;
	}
	json.latest_update = project.updatedAt;
	json.status = project.status;
	json.tags = project.tags;
	var contracts = db.Contract.find({"project": ObjectId(project_id)});
	json.open_contracts = [];
	while (contracts.hasNext()) {
		var newContract = new Object();
		var current = contracts.next();
		newContract.contract_id = current._id;
		newContract.contract_title = current.name;
		newContract.contract_tags = current.skillTags;
		newContract.contract_budget = current.budget;
		newContract.contract_deadline = current.deadline;
	}
	res.send(JSON.stringify(json));
  //res.send('AIDA Home Page!');
});

// message inbox
router.get('/inbox', function (req, res) {
	/*
		send the user's unread messages sorted by creation date
		{
			success: true if no error occurred
			contacts:
			{
				contact_id:
				{
					contact_name: sender's name
					last_message: most recent message
					num_unread: number of unread messages from the person
				}
			}
		}

	*/
	////////////////////////////////////////////////////////
	// TODO:                                              //
	// If the user is not logged in (or login expired),   //
	// prompt them to log in. Could be done at front end  //
	////////////////////////////////////////////////////////
	var userId = req.session.userId;
	var json = new Object();
	json.contacts = new Object();
	if (userId) {
		// The user is logged in
		db.User.findById(userId, function(err, found){
			if (!err) {
				// Add all existing contacts to the contact list
				// Sort  messages in descending order by date, then
				// update last_message at first encounter of unread, and
				// update num_unread at each encounter of unread.
				var i;
				var contacts = found.contacts;
				var numContacts = contacts.length;
				for (i=0;i<numContacts;i++) {
					var other;
					var contact = contacts[i];
					if (userId === contact.personOne) {
						other = db.User.findOne({_id: ObjectId(contact.personTwo)});
						json.contacts[contact._id] = new Object();
						json.contacts[contact._id].contact_name = other.name;
						// messages should be in ascending order by time
						json.contacts[contact._id].last_message = messages[-1];
						// count number of messages sent after the first read message
						var numUnread = 0;
						// while the current message is unread and it is a received message, keep counting
						while (messages[numUnread].unread && messages[numUnread].sender === other._id) {
							numUnread += 1;
						}
						json.contacts[contact._id].num_unread = numUnread;
					}
				}
				json.success = "true";
			}
			else {
				json.success = "false";
			}
		});
	}
	else {
		// The user is not logged in
		json.success = "false";
	}
	res.send(JSON.stringify(json));

});

// contact message detail
router.get('/inbox/:contact_id', function (req, res) {
	/*
	Retrieve the contact by the id.
	{
		success: "true" if retrieved ok,
		result:
		{
			personOne: person one,
			personTwo: person two,
			messages: latest ten messages
		}
	}
	*/

	// Check if the person is logged in as personOne or personTwo
	var userId = req.session.userId;
	var contact_id = req.params.contact_id;
	var contact = db.Contact.findOne({"_id": ObjectId(contact_id)});
	var json = new Object();
	if (userId === contact.personOne || userId === contact.personTwo) {
		json.success = "true";
		json.result = new Object();
		json.result.personOne = contact.personOne;
		json.result.personTwo = contact.personTwo;
		json.messages = contact.messages.slice(-20); // Get the last 20 messages
		var i;
		var numMessages = json.messages.length;
		for (i=0;i<numMessages;i++) {
			// Mark all the messages shown as read
			db.Message.findByIdAndUpdate(contact_id, {$set: { 'unread': false }});
		}
	}
	else {
		json.success = "false";
		json.result = null;
	}
	res.send(JSON.stringify(json));
});

// load all messages from a contact history
router.get('/inbox/:contact_id/all', function (req, res) {
	/*
	Retrieve the contact by the id.
	{
		success: "true" if retrieved ok,
		result:
		{
			personOne: person one,
			personTwo: person two,
			messages: all messages
		}
	}
	*/

	// Check if the person is logged in as personOne or personTwo
	var userId = req.session.userId;
	var contact_id = req.params.contact_id;
	var contact = db.Contact.findOne({"_id": ObjectId(contact_id)});
	var json = new Object();
	if (userId === contact.personOne || userId === contact.personTwo) {
		json.success = "true";
		json.result = new Object();
		json.messages = contact.messages;
		var i;
		var numMessages = json.messages.length;
		for (i=0;i<numMessages;i++) {
			// Mark all the messages shown as read
			db.Message.findByIdAndUpdate(contact_id, {$set: { 'unread': false }});
		}
	}
	else {
		json.success = "false";
		json.result = null;
	}
	res.send(JSON.stringify(json));
});

// search page
router.get('/search', function (req, res) {
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
		- contracts: open contracts only
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

	If it were a contract, get from OPEN contracts:
	_id: {
		type: contract,
		name: contract name,
		intro: contract intro,
		skills: skillTags,
		project_id: project id,
		project_name: project name,
		project_tags: tags for the project,
		deadline: contract deadline
		budget: contract budget
	}
	priorities adjusted based on user's skills
	*/

	////////////////////////////////////////////////////
	//                                                //
	// TODO: are ObjectIds hashable                   //
	//                                                //
	////////////////////////////////////////////////////
	var userId = req.session.userId;
	var userTags = [];
	var userSkills = [];
	var userProjectTags = [];
	var userContractSkills = [];
	if (userName) {
		var user = db.User.findOne({"_id": ObjectId(userId)});
		var userProjects = db.Project.find({"owner": user._id, "status": "ongoing"});
		var userContracts = db.Contract.find({"owner": ObjectId(userId), "status": "open"});
		// User's tags on themselves
		userTags = user.tags;
		// User's skills
		var i;
		var numSkills = user.skillTags.length;
		for (i=0;i<numSkills;i++) {
			userSkills.push(user.skillTags[i].name);
		}
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
				userContractSkills.push(skillTags[i].name);
			}
		}
	}

	var projects_results = new Object(); //Store object_id: {...,priority_level:number}
	var people_results = new Object();
	var contracts_results = new Object();
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
		// match priority by contracts' required skills posted by user
		var personSkills = [];
		var n;
		var num = person.skillTags.length;
		for (n=0;n<num;n++) {
			personSkills.push(person.skillTags[n].name);
		}
		updatePersonPriority(person, matchPriority(userContractSkills, personSkills));
		// match priority by user's projects' tags and the person's tags
		updatePersonPriority(person, matchPriority(userProjectTags, person.tags));
	}

	function updateContractPriority(contract, value) {
		contracts_results[contract._id].priority += value;
	}

	function addNewContract(contract, basePriority) {
		contracts_results[contract._id] = new Object();
		contracts_results[contract._id].id = current._id;
		contracts_results[contract._id].type = "contract";
		contracts_results[contract._id].name = contract.name;
		contracts_results[contract._id].intro = contract.intro;
		contracts_results[contract._id].skills = contract.skillTags;
		contracts_results[contract._id].project_id = contract.project;
		contracts_results[contract._id].project_name = db.Project.findOne({"_id": ObjectId(contract.project)}).name;
		contracts_results[contract._id].project_tags = contract.descriptionTags;
		contracts_results[contract._id].deadline = contract.deadline;
		contracts_results[contract._id].budget = contract.budget;
		// base priority
		contracts_results[contract._id].priority = basePriority;
		// match priority by user's skills and the contract's required skills
		var contractSkills = [];
		var n;
		var num = contract.skillTags.length;
		for (n=0;n<num;n++) {
			contractSkills.push(contract.skillTags[n].name);
		}
		updateContractPriority(contract, matchPriority(userSkills, contractSkills));
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
			var peopleBySkill = db.Project.find({"skillTags": {$elemMatch: {"name": {$regex: ".*" + keyword + ".*/i"}}}});
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

		// Get contracts
		if (category === "all" || category === "contracts") {
			var contractsByName = db.Contract.find({"name": {$regex: ".*" + keyword + ".*/i"}, "status": "open"});
			var contractsByTags = db.Contract.find({"tags": {$elemMatch: {$regex: ".*" + keyword + ".*/i"}}, "status": "open"});
			var contractsByIntro = db.Contract.find({"info": {$regex: ".*" + keyword + ".*/i"}, "status": "open"});
			var contractsByDetail = db.Contract.find({"details": {$regex: ".*" + keyword + ".*/i"}, "status": "open"});

			// match contracts by name
			while (contractsByName.hasNext()) {
				var newContract = new Object();
				var current = contractsByName.next();
				if (current._id in contracts_results) {
					// The object is found before
					updateContractPriority(current, MATCH_NAME);
				}
				else {
					// The object is found in current iteration
					addNewContract(current, MATCH_NAME);
				}
			}

			// match contracts by tags
			while (contractsByTags.hasNext()) {
				var newContract = new Object();
				var current = contractsByTags.next();
				if (current._id in contracts_results) {
					// The object is found before
					updateContractPriority(current, MATCH_TAGS);
				}
				else {
					// The object is found in current iteration
					addNewContract(current, MATCH_TAGS);
				}
			}

			// match contracts by intro
			while (contractsByIntro.hasNext()) {
				var newContract = new Object();
				var current = contractsByIntro.next();
				if (current._id in contracts_results) {
					// The object is found before
					updateContractPriority(current, MATCH_REST);
				}
				else {
					// The object is found in current iteration
					addNewContract(current, MATCH_REST);
				}
			}

			// match contracts by detail
			while (contractsByDetail.hasNext()) {
				var newContract = new Object();
				var current = contractsByDetail.next();
				if (current._id in contracts_results) {
					// The object is found before
					updateContractPriority(current, MATCH_REST);
				}
				else {
					// The object is found in current iteration
					addNewContract(current, MATCH_REST);
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

		var contractsArray = [];
		for (var id in contracts_results) {
			if (contracts_results.hasOwnProperty(id)) {
				contractsArray.push(contracts_results[id]);
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
		contractsArray.sort(prioritySort);

		var json = new Object();
		json.projects = projectsArray.slice((page-1)*perpage, page*perpage);
		json.people = peopleArray.slice((page-1)*perpage, page*perpage);
		json.contracts = contractsArray.slice((page-1)*perpage, page*perpage);
		res.send(JSON.stringify(json));
	}

});

// etc...

module.exports = router;
