/* AIDA Source Code */
/* Contributors located at: github.com/2nd47/CSC309-A4 */

// router middleware

var express = require('express');
var router = express.Router();
var User = require('../db/db');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');


// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});

// change the request methods as required
// refer to express documentation for more details

// if logged in: feed; else: landing page
router.get('/', ensureAuthenticated, function (req, res, next) {
  res.send('AIDA Home Page!');
});

// Ensure authenticated so the user cannot access the home page if not logged in
function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  } else {
    req.flash('error_msg', 'You are not logged in');
    res.redirect('/login');
  }
}

// Signup
router.post('/signup', function (req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;
  var email = req.body.email;
  var email2 = req.body.email2;

  // Validation
  req.checkBody(‘username’, 'Username is required').notEmpty();
  req.checkBody(‘password’, 'Password is required').notEmpty();
  req.checkBody(‘password2’, 'Passwords do not match').equals(req.body.password);
  req.checkBody(‘email’, 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody(‘email2’, 'Emails do not match').equals(req.body.email);

  var errors = req.validationErrors();

  if(errors) {
    console.log(msg);
    /*
    res.render('landingSignup', {
      errors:errors
    });
    On The Frontend add this placeholder:
    {{#if errors}}
      {{#each errors}}
        <div class="notice error">{{msg}}</div>
      {{/each}}
    {{/if}}
    */
  } else {
    console.log('Signup No Error');
    
    // Hash the password. Store the hash in var password
    bcrypt.genSalt(10, function(err, salt) {
    	bcrypt.hash(password, salt, function(err, hash) {
    		password = hash;	
    	});	
    });
    
    // Create the user
    var newUser = new User({
      username: username,
      password: password;
      email: email;
    });

    User.createUser(newUser, function(err, user){
      if(err) throw err;
      console.log(user);
    });

    req.flash('success_msg', 'You are registered and can now login');
    /* On Frontend add these placeholders
    {{#if success_msg}}
      <div class="notice_success">
        {{success_msg}}
      </div>
    {{/if}}
    {{#if error_msg}}
      <div class="notice_success">
        {{error_msg}}
      </div>
    {{/if}}
    {{#if error}}
      <div class="notice_success">
        {{error}}
      </div>
    {{/if}}
    */

    res.redirect('/login');
  }
});

// Passport Local Strategy
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.getUserByUsername(username, function(err, user){
      if(err) throw err;
      if(!user){
        return done(null, false, {message: 'Unknown User'});
      }
      User.comparePassword(password, user.passwordHash, function(err, isMatch){
        if(err) throw err;
        if(isMatch){
          return done(null, user);
        } else {
          return done(null, false, {message: 'Invalid password'});
        }
      });
    });
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

// Login
router.post('/login',
            passport.authenticate('local', {successRedirect:'/', failureRedirect:'/login', failureFlash: true}),
            function (req, res, next) {
              res.redirect('/');
});

// Logout
router.get('/logout', function(req, res, next) {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/login');
});



// list of contracts
router.get('/contracts', function (req, res) {
	/*
	get id, name, status, skillTags, tags*/
	var cursor = db.Contract.find({},{"name": 1, "status": 1, "skillTags": 1, "tags": 1}).sort({"updatedAt": -1});
	res.send(JSON.stringify(cursor.toArray()));
	
});

// create a new job
router.post('/jobs/new', function (req, res) {
	/*
		TODO:
		after the posting, send to the front end the link
		to the job page, so that the front end will
		redirect to the page
		{
			success: true/false
			url: the link to the new job page
		}
	*/
	var json = new Object();
	try {
		var userId = req.session.userId;
		if (userId) {
			var jobForm = qs.parse(req.data);
			var projectId = jobForm.project;
			if (canAddJobToProject(userId, projectId)) {
				// may createJob return job _id or something...
				var newJobId = db.createJob(jobForm.name, jobForm.project,
				userId, jobForm.deadline, jobForm.budget)._id;
				db.setJobField(newJobId, "intro", jobForm.intro);
				// Create new skill objects
				var skills = jobForm.skillTags;
				var numSkills = skills.length;
				var i;
				var skillTags = [];
				for (i=0;i<numSkills;i++) {
					var curSkill = skills[i];
					var newSkill = db.createSkill(curSkill.name, curSkill.rating);
					skillTags.push(newSkill);
				}
				db.setJobField(newJobId, "skillTags", skillTags);
				// Turn the tags in the form "tag1, tag2, tag3" (or without the whitespaces)
				// into an array of strings
				var tags = jobForm.descriptionTags.replace(/\s+/g, '');split(",");
				db.setJobField(newJobId, "descriptionTags", tags);
				db.setJobField(newJobId, "details", jobForm.details);
				db.setJobField(newJobId, "url", jobIdToUrl(newJobId));//??
				json.url = jobIdToUrl(newJobId);
				json.success = "true";
				// send broadcast to all followers of the project
				var broadcast = "A new job is added for " + db.getProjectField(projectId, "name") + " .";
				broadcastFollowers(projectId, jobIdToUrl(newJobId), broadcast);
			}
			else {
				json.success = "false";
			}
			
		}
		else {
			json.success = "false";
		}
		
	}
	catch (e) {
		json.success = "false";
		console.log(e.message);
	}
	
	res.send(JSON.stringify(json));
});

// details of job with job_id
router.get('/jobs/:job_id', function (req, res) {
	/*
	Job page:

	{
		id: job id,
		title: job title,
		employer_id: employer id,
		employer_name: employer name,
		project_id: project id,
		project_name: project name,
		status: job status,
		latest_update: date of the latest update,
		tags: [tag names],
		budget: budget level estimation between 1 to 5,
		deadline: job deadline,
		intro: introduction to the job details
	}*/
	try {
		var json = new Object();
		var job_id = req.params.job_id;
		var job = db.Job.findOne({"_id": ObjectId(job_id)});
		if (!job) {
			res.status(404);
			// page not found
			if (req.accepts('html')) {
				res.render('404', { url: req.url });
			}
			return;
		}
		json.id = job_id;
		json.title = job.name;
		json.employer_id = job.owner;
		json.employer_name = db.User.findOne({"_id": ObjectId(job.owner)},{name: 1}).name;
		json.project_id = job.project;
		json.project_name = db.Project.findOne({"_id": ObjectId(job.project)},{name: 1}).name;
		if (job.taker) {
			json.status = "signed";
		}
		else {
			json.status = "open";
		}
		json.latest_update = job.updatedAt;
		json.tags = job.skillTags;
		json.budget = job.budget;
		json.deadline = job.deadline;
		json.intro = job.details;
		res.send(JSON.stringify(json));
	}
	catch (e) {
		res.status(404);
		// page not found
		if (req.accepts('html')) {
			res.render('404', { url: req.url });
		}
		return;
	}
});

// prompt to sign a job with job_id
router.get('/jobs/:job_id/sign', function (req, res) {
	/**/
}


// list of profiles of top ten followed users
// if user is logged in, show their following users at the bottom
router.get('/people', function (req, res) {
	/*
	get _id, name, title, skillTags, tags
	{
		topTen: [list of info];
		following: [list of info, empty if user is not following anyone or is not logged in];
	}
	*/
	var json = new Object();
	var cursor = db.User.find({},{"name": 1, "title": 1, "skillTags": 1, "tags": 1}).sort({"numFollowers": -1}).limit(10);
	json.topTen = cursor.toArray();
	json.following = [];
	var userId = req.session.userId;
	if (userId) {
		var user = db.User.findById(userId);
		var followings = user.followings;
		var numFollowings = followings.length;
		var i;
		for (i=0;i<numFollowings;i++) {
			var person = db.User.findById(followings[i]);
			// the object being followed is an existing user
			if (person) {
				var newPerson = new Object();
				newPerson._id = person._id;
				newPerson.name = person.name;
				newPerson.title = person.title;
				newPerson.skillTags = person.skillTags;
				newPerson.tags = person.tags;
				json.following.push(newPerson);
			}
		}
	}
	res.send(JSON.stringify(json));
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
		jobs:
		[
			{
				job_id: job id,
				job_name: job name,
				completion_date: completion date,
				job_rating: job_rating,
				job_comment: comment on the work
			}
		]
	}*/
	try {
		var json = new Object();
		var user_name = req.params.username;
		var user = db.User.findOne({"username" : user_name});
		if (!user) {
			res.status(404);
			// page not found
			if (req.accepts('html')) {
				res.render('404', { url: req.url });
			}
			return;
		}
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
		json.jobs = [];
		var jobs = db.Job.find({"taker": ObjectId(user_id)});
		while (jobs.hasNext()) {
			var newJob = new Object();
			var current = jobs.next();
			newJob.job_id = current._id;
			newJob.job_name = current.name;
			newJob.completion_date = current.completion;
			newJob.job_rating = current.rating;
			newJob.job_comment = current.comment;
			json.projects.push(newJob);
		}

		res.send(JSON.stringify(json));
	}
	catch (e) {
		res.status(404);
		// page not found
		if (req.accepts('html')) {
			res.render('404', { url: req.url });
		}
	}
});

// list of top ten projects
// if user has followed projects, list them, too
router.get('/projects', function (req, res, next) {
	// get name, tags, showcase
	var json = new Object();
	var cursor = db.Project.find({},{"name": 1, "tags": 1, "showcase": 1}).sort({"numFollowers": -1}).limit(10);
	json.topTen = cursor.toArray();
	json.following = [];
	var userId = req.session.userId;
	if (userId) {
		var user = db.User.findById(userId);
		var followings = user.followings;
		var numFollowings = followings.length;
		var i;
		for (i=0;i<numFollowings;i++) {
			var project = db.Project.findById(followings[i]);
			// the object being followed is an existing project
			if (project) {
				var newProject = new Object();
				newProject._id = project._id;
				newProject.name = project.name;
				newProject.tags = project.tags;
				json.following.push(newProject);
			}
		}
	}
	res.send(JSON.stringify(json));
  //res.send('AIDA Home Page!');
});

// create a new project
router.post('/projects/new', function (req, res, next) {
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
		// may createJob return job _id or something...
		var newProjectId = db.createProject(projectForm.name, userId);
		// Turn the tags in the form "tag1, tag2, tag3" (or without the whitespaces)
		// into an array of strings
		var tags = jobForm.descriptionTags.replace(/\s+/g, '');split(",");
		db.setProjectField(newProjectId, "tags", tags);
		db.setProjectField(newProjectId, "members", projectForm.members);
		db.setProjectField(newProjectId, "details", projectForm.details);
		db.setProjectField(newProjectId, "url", projectIdToUrl(newProjectId));//??
		json.url = jobIdToUrl(newProjectId);
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
			open_jobs:
			[
				{
					job_id: job id,
					job_title: job title,
					job_tags: [list of skill names with ratings],
					job_budget: budget level estimation between 1 to 5,
					job_deadline: job deadline
				}
			],
		}
	*/
	try {
		var json = new Object();
		var project_id = req.params.project_id;
		var project = db.Project.findOne({"_id" : ObjectId(project_id)});
		if (!project) {
			res.status(404);
			// project page not found
			if (req.accepts('html')) {
				res.render('404', { url: req.url });
			}
			return;
		}
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
		var jobs = db.Job.find({"project": ObjectId(project_id)});
		json.open_jobs = [];
		while (jobs.hasNext()) {
			var newJob = new Object();
			var current = jobs.next();
			newJob.job_id = current._id;
			newJob.job_title = current.name;
			newJob.job_tags = current.skillTags;
			newJob.job_budget = current.budget;
			newJob.job_deadline = current.deadline;
		}
		res.send(JSON.stringify(json));
	}
	catch (e) {
		res.status(404);
		// page not found
		if (req.accepts('html')) {
			res.render('404', { url: req.url });
		}
	}
  //res.send('AIDA Home Page!');
});

// message inbox
router.get('/inbox', function (req, res) {
	/*
		send the user's unread messages sorted by creation date
		{
			success: true if no error occurred
			messageBoard: [{
				url: link to the page of updated content
				message: the message
			}]
			of followed projects/people
			chats:
			{
				chat_id:
				{
					chat_name: sender's name
					chat_avatar: sender's avatar
					last_message: last message of the chat
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
	json.chats = new Object();
	if (userId) {
		// The user is logged in
		db.User.findById(userId, function(err, found){
			if (!err) {
				// Add all existing chats to the chat list
				// Sort  messages in descending order by date, then
				// update last_message at first encounter of unread, and
				// update num_unread at each encounter of unread.
				var i;
				json.messageBoard = found.messageBoard;
				// Clear message board broadcasts
				db.setUserField(userId, messageBoard, []);
				var chats = found.chats;
				var numChats = chats.length;
				for (i=0;i<numChats;i++) {
					var other;
					var chat = db.Chat.findById(chats[i]);
					if (userId === chat.personOne) {
						other = db.User.findOne({_id: ObjectId(chat.personTwo)});
						json.chats[chat._id] = new Object();
						json.chats[chat._id].chat_name = other.name;
						// messages should be in ascending order by time
						json.chats[chat._id].last_message = messages[-1];
						// get the source of avatar
						json.chats[chat._id].chat_avatar = other.avatar;
						// count number of messages sent after the first read message
						var numUnread = 0;
						// while the current message is unread and it is a received message, keep counting
						while (messages[numUnread].unread && messages[numUnread].sender === other._id) {
							numUnread += 1;
						}
						json.chats[chat._id].num_unread = numUnread;
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

// chat message detail
router.get('/inbox/:chat_id', function (req, res) {
	/*
	Retrieve the chat by the id.
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
	var chat_id = req.params.chat_id;
	var chat = db.Chat.findOne({"_id": ObjectId(chat_id)});
	var json = new Object();
	if (userId === chat.personOne || userId === chat.personTwo) {
		json.success = "true";
		json.result = new Object();
		json.result.personOne = chat.personOne;
		json.result.personTwo = chat.personTwo;
		json.messages = chat.messages.slice(-20); // Get the last 20 messages
		var i;
		var numMessages = json.messages.length;
		for (i=0;i<numMessages;i++) {
			// Mark all the messages shown as read
			db.Message.findByIdAndUpdate(chat_id, {$set: { 'unread': false }});
		}
	}
	else {
		json.success = "false";
		json.result = null;
	}
	res.send(JSON.stringify(json));
});

// send message to chat_id
router.post('/inbox/:chat_id/new', function (req, res) {
	var userId = req.session.userId;
	var chatId = req.params.chat_id;
	if (canSendMessage(userId, chatId)) {
		var messageBox = qs.parse(req.data);
		var message = messageBox.message;
		sendMessageTo(userId, chatId, message);
	}
}

// load all messages from a chat history
router.get('/inbox/:chat_id/all', function (req, res) {
	/*
	Retrieve the chat by the id.
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
	var chat_id = req.params.chat_id;
	var chat = db.Chat.findOne({"_id": ObjectId(chat_id)});
	var json = new Object();
	if (userId === chat.personOne || userId === chat.personTwo) {
		json.success = "true";
		json.result = new Object();
		json.result.messages = chat.messages;
		var i;
		var numMessages = json.messages.length;
		for (i=0;i<numMessages;i++) {
			// Mark all the messages shown as read
			db.Message.findByIdAndUpdate(chat_id, {$set: { 'unread': false }});
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
		var personSkills = [];
		var n;
		var num = person.skillTags.length;
		for (n=0;n<num;n++) {
			personSkills.push(person.skillTags[n].name);
		}
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
		jobs_results[job._id].project_name = db.Project.findOne({"_id": ObjectId(job.project)}).name;
		jobs_results[job._id].project_tags = job.descriptionTags;
		jobs_results[job._id].deadline = job.deadline;
		jobs_results[job._id].budget = job.budget;
		// base priority
		jobs_results[job._id].priority = basePriority;
		// match priority by user's skills and the job's required skills
		var jobSkills = [];
		var n;
		var num = job.skillTags.length;
		for (n=0;n<num;n++) {
			jobSkills.push(job.skillTags[n].name);
		}
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

		// Get jobs
		if (category === "all" || category === "jobs") {
			var jobsByName = db.Job.find({"name": {$regex: ".*" + keyword + ".*/i"}, "status": "open"});
			var jobsByTags = db.Job.find({"tags": {$elemMatch: {$regex: ".*" + keyword + ".*/i"}}, "status": "open"});
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

});

// etc...

module.exports = router;
