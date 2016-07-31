/* AIDA Source Code */
/* Contributors located at: github.com/2nd47/CSC309-A4 */

// router middleware

var express = require('express');
var router = express.Router();
var db = require('../db/db.js');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcryptjs');
var flash = require('connect-flash');
var session = require('express-session');
var shortid = require('shortid');
var fs = require('fs');
var qs = require('querystring');
var expressValidator = require('express-validator');


// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});

//use static
router.use(express.static("./"));

//use flash
router.use(flash());

//use session
router.use(session(
  { cookie: { maxAge: 60000 },
    secret: 'garble',
    resave: false,
    saveUninitialized: false}));

// Passport Local Strategy
passport.use(new LocalStrategy({
  passReqToCallback : true
  }, function(username, password, done) {
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

// change the request methods as required
// refer to express documentation for more details

// if logged in: feed; else: landing page
router.get('/', ensureAuthenticated, function (req, res, next) {
  res.sendFile('landing.html', { root: "./" });
});

// Ensure authenticated so the user cannot access the home page if not logged in
function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    res.redirect('/profile'); //TODO: change to feed or some shit
  } else {
    req.flash('error_msg', 'You are not logged in');
    next();
  }
}

// Signup
router.post('/signup', function (req, res, next) {
  console.log("Sign Up Mode");

  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;
  var email = req.body.email;
  var email2 = req.body.email2;
  console.log(username + password + password2 + email + email2);

  // Validation
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('email2', 'Emails do not match').equals(req.body.email);

  var errors = req.validationErrors();

  if(errors) {
    console.log(errors);
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
    		var passwordHash = hash;
        console.log("hash: " + hash);
        db.createUser(username, passwordHash, email, function(err, user){
          //if(err) throw err;
          console.log("user created: " + user);
        });
    	});
    });

/**
    db.createUser(username, passwordHash, email, function(err, user){
      if(err) throw err;
      console.log(user);
    });
    */
    console.log("arrived here at req.flash");
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

    res.redirect('/');
  }
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

// edit user profile (profile_id: the user id of the profile)
router.post('/edit_profile/:profile_id', function(req, res){
	var userId = req.session.userId;
	var profileId = req.params.profile_id;
	var profileForm = qs.parse(req.data);
	if (canEditProfile(userId, profileId)) {
		db.setUserField(profileId, "name", profileForm.name);
		// TODO: set the user's password hash to profileForm.newpassword's hash
		if (profileForm.newpassword.length != 0) {
			if (bcrypt.hash(profileForm.newpassword) === bcrypt.hash(profileForm.repeatpassword)) {
				db.setUserField(profileId, "passwordHash", bcrypt.hash(profileForm.newpassword));
			}
		}
		db.setUserField(profileId, "avatar", profileForm.image.id);
		db.setUserField(profileId, "title", profileForm.title);
		db.setUserField(profileId, "bio", profileForm.bio);
		db.setUserField(profileId, "tags", profileForm.tags.replace(/\s+/g, '').split(","));
		db.setUserField(profileId, "email", profileForm.email);
		
		// edit skill tags
		db.getUserById(profileId, function(err, profile){
			// delete all current skills
			var curSkills = profile.skillTags;
			var numCurSkills = curSkills.length;
			var i;
			if (i=0;i<numCurSkills;i++) {
				var id = curSkills[i]._id;
				db.Skill.remove({_id: id});
			}
			db.setUserField(profileId, "skillTags", []);
			
		});
		// build new skill tags
		var skills = profileForm.skill
		var skillLevels = profileForm.level;
		var numSkills = skills.length;
		var i;
		if (i=0;i<numSkills;i++) {
			var skill = new models.Skill({
				name: skills[i],
				rating: skillLevel[i]
			});
			skill.save(function(err, st){
				db.pusUserField(profileId, "skillTags", st);
			});
		}
		res.send('200');
	}
	else {
		res.send('401');
	}
	
});

/*
// edit project
router.post('/edit_project/:project_id', function(req, res){
	var userId = req.session.userId;
	var 
}
	
// edit contract
router.post('/edit_contract/:contract_id', function(req, res){
}*/

// create a new job
router.post('/job/new', function (req, res) {
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

				db.createJob(jobForm.name, jobForm.project,
				userId, jobForm.deadline, jobForm.budget, function(err, job) {
					var newJobId = job._id
					db.setJobField(newJobId, "intro", jobForm.intro);
					// Create new skill objects
					var skills = jobForm.skillTags;
					var numSkills = skills.length;
					var i;
					var skillTags = [];
					for (i=0;i<numSkills;i++) {
						var curSkill = skills[i];
						db.createSkill(curSkill.name, curSkill.rating, function(err, skill){
							skillTags.push(skill);
						});

					}
					db.setJobField(newJobId, "skillTags", skillTags);
					// Turn the tags in the form "tag1, tag2, tag3" (or without the whitespaces)
					// into an array of strings
					var tags = jobForm.descriptionTags.replace(/\s+/g, '').split(",");
					db.setJobField(newJobId, "descriptionTags", tags);
					db.setJobField(newJobId, "details", jobForm.details);
					db.setJobField(newJobId, "url", jobIdToUrl(newJobId));//??
					json.url = jobIdToUrl(newJobId);
					json.success = "true";
					// send broadcast to all followers of the project
					var broadcast = "A new job is added for " + db.getProjectField(projectId, "name") + " .";
					broadcastFollowers(projectId, jobIdToUrl(newJobId), broadcast);
				});
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

router.get('/job/:job_id', function(req, res) {
  res.sendFile('contract.html', { root: "./" });
});

// details of job with job_id
router.get('/api/job/:job_id', function (req, res) {
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

  /*try {
		var json = new Object();
		var job_id = req.params.job_id;
		db.Job.findById(job_id, function(err, job){
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
			db.User.findById(job.owner, function(err, owner){
				json.employer_name = owner.name;
			});
			json.project_id = job.project;
			db.Project.findById(job.project, function(err, project){
				json.project_name = project.name;
			});
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
		});
	}
	catch (e) {
		res.status(404);
		// page not found
		if (req.accepts('html')) {
			res.render('404', { url: req.url });
		}
		return;
	}
  */

  //SEND DUMMY JSON TODO: CHANGE THIS!!!
      var contract1 =
      {
      "id": "1",
      "title": "2D Animator",
      "intro": "Animate 2D stuff for us pls",
      "employer_id": "1",
      "employer_name": "Jordan Belfort",
      "employer_username": "jbelfort",
      "project_id": "1",
      "project_name": "Super Awesome Game",
      "status": "open",
      "latest_update": "06-06-2006",
      "tags": [{
        "name": "Cooking",
        "rating": 3
      }, {
        "name": "Eating",
        "rating": 5
      }],
      "budget": 2000,
      "deadline": "June 13 1995",
      "details": "What an awesome game this is wow amazing how great and fun please support me and give me money also help me out and subscribe to my youtube channel for some awesome tetris lets plays and giveaways!"
      }

      res.json(contract1);
});

// prompt to sign a job with job_id
router.get('/job/:job_id/sign', function (req, res) {
	/**/
});


// list of profiles of top ten followed users
// if user is logged in, show their following users at the bottom
router.get('/profile', function (req, res) {
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
		db.User.findById(userId, function(err, user){
			var followings = user.followings;
			var numFollowings = followings.length;
			var i;
			for (i=0;i<numFollowings;i++) {
				db.User.findById(followings[i], function(err, person){
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
				});
			}
		});
	}
	res.send(JSON.stringify(json));
});

router.get('/profile/:username', function(req, res) {
  res.sendFile('profile.html', { root: "./" });
});

// details of people with username
router.get('/api/profile/:username', function (req, res) {
	/*
	{
		id: person id,
		name: person's name,
		avatar: path to the person's avatar,
		title: person's title,
		skills: person's skillTags,
		tags: [tags],
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
		email: user's email
	}*/
	/*try {
		var json = new Object();
		var user_name = req.params.username;
		db.getUserByField(user_name, function(err, user){
			if (!user.length) {
				res.status(404);
				// page not found
				if (req.accepts('html')) {
					res.render('404', { url: req.url });
				}
				return;
			}
			json.id = user._id;
			json.name = user.name;
			json.avatar = user.avatar;
			json.title = user.title;
			json.skills = user.skillTags;
			json.tags = user.tags;
			json.biography = user.bio;
			json.projects = [];
			json.email = user.email;
			// Where the user is the owner
			db.Project.find({"owner": user._id},{name: 1}, function(err, projects){
				while (projects.hasNext()) {
					var newProject = new Object();
					var current = projects.next();
					newProject.project_id = current._id;
					newProject.project_name = current.name;
					json.projects.push(newProject);
				}
			});
			
			// Where the user is a member
			db.Project.find({members: {$elemMatch: {"user": ObjectId(user_id)}}}, function(err, member_projects){
				while (member_projects.hasNext()) {
					var newProject = new Object();
					var current = member_projects.next();
					newProject.project_id = current._id;
					newProject.project_name = current.name;
					json.projects.push(newProject);
				}
			});
			
			json.jobs = [];
			db.Job.find({"taker": ObjectId(user_id)}, function(err, jobs){
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
			});
			

			res.send(JSON.stringify(json));
		});
	}
	catch (e) {
		res.status(404);
		// page not found
		if (req.accepts('html')) {
			res.render('404', { url: req.url });
		}
	}*/

   var person1 =
  {
    "id": "1",
    "name": "Jordan Belfort",
    "title": "Wolf of Wall Street",
    "avatar": "/assets/images/users/putin.jpg",
    "skillTags": [{
      "name": "C++",
      "rating": 1
    }, {
      "name": "Banking",
      "rating": 5
    }, {
      "name": "Making Money",
      "rating": 4
    }],
    "tags": [{
      "name": "Fantasy"
    }, {
      "name": "Simulation"
    }],
    "biography": "I made a lot of money on Wall Street and got fucked by the feds.",
    "projects":  [{
      "id": "1",
      "name": "Super Awesome Game"
    }, {
      "id": "2",
      "name": "Not This Shit Again"
    }],
    "jobs": [{
      "id": "1",
      "name": "2D Animator",
      "completion_date": "August 12, 1994",
      "rating": 5,
      "comment": "Bloody brilliant mate good work made me $155,039.44!"
    }]
  }

  res.json(person1);
});


// list of top ten projects
// if user has followed projects, list them, too
router.get('/project', function (req, res, next) {
	// get name, tags, showcase
	var json = new Object();
	var cursor = db.Project.find({},{"name": 1, "tags": 1, "showcase": 1}).sort({"numFollowers": -1}).limit(10);
	json.topTen = cursor.toArray();
	json.following = [];
	var userId = req.session.userId;
	if (userId) {
		db.User.findById(userId, function(err, user){
			var followings = user.followings;
			var numFollowings = followings.length;
			var i;
			for (i=0;i<numFollowings;i++) {
				db.Project.findById(followings[i], function(){
					// the object being followed is an existing project
					if (project.length) {
						var newProject = new Object();
						newProject._id = project._id;
						newProject.name = project.name;
						newProject.tags = project.tags;
						json.following.push(newProject);
					}
				});
			}
		});
	}
	res.send(JSON.stringify(json));
  //res.send('AIDA Home Page!');
});

router.post('/image_upload', function(req, res){
	/* uploads a file and res.send path of uploaded file*/
	var upload = req.files.image;
	fs.readFile(upload.path, function(err, data){
		var filePath = __dirname + "assets/user_content" + shortid.generate() + upload.name;
		fs.writeFile(filePath, data, function(err){	
			res.send(filePath);
		});
	});
});

// create a new project
router.post('/project/new', function (req, res, next) {
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
		db.createProject(projectForm.name, userId, function(err, project) {
			// Turn the tags in the form "tag1, tag2, tag3" (or without the whitespaces)
			// into an array of strings
			var newProjectId = project._id;
			var tags = jobForm.descriptionTags.replace(/\s+/g, '');split(",");
			db.setProjectField(newProjectId, "tags", tags);
			db.setProjectField(newProjectId, "members", projectForm.members);
			db.setProjectField(newProjectId, "details", projectForm.details);
			// build up the showcase object with uploaded file
			var showcasePath = projectForm.image.id;
			var showcase = new models.Showcase({
																						project: newProjectId,
																						assetPath: showcasePath
																					});
			showcase.save(
				function(err, sc){
					db.setProjectField(newProjectId, "showcase", sc);
				}
			);
			db.setProjectField(newProjectId, "showcase", );
			db.setProjectField(newProjectId, "url", projectIdToUrl(newProjectId));
			json.url = jobIdToUrl(newProjectId);
			json.success = "true";
		});
	}
	catch (e) {
		json.success = "false";
		console.log(e.message);
	}

	res.send(JSON.stringify(json));
  //res.send('AIDA Home Page!');
});

router.get('/project/:username', function(req, res) {
  res.sendFile('profile.html', { root: "./" });
});

// details of project with project_id
router.get('/api/project/:project_id', function (req, res, next) {
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
	/*try {
		var json = new Object();
		var project_id = req.params.project_id;
		var project = db.Project.findById(project_id, function(err, project){
			if (!project.length) {
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
			db.User.findById(project.owner, function(err, publisher_info){
				json.publisher.publisher_name = publisher_info.name;
				json.members = [];
			});
			var i;
			var numMembers = project.members.length;
			for (i=0;i<numMembers;i++) {
				var newMember = new Object();
				newMember.member_id = project.members[i].user;
				db.User.findById(project.members[i].user, function(err, memberName){
					newMember.member_name = memberName.name;
					json.members.push(newMember);
				});
			}
			json.short_intro = project.basicInfo;
			json.long_intro = project.detailedInfo;*/

			/*json.long_intro = [];
			var numParagraph = project.detailedInfo.length;
			for (i=0;i<numParagraph;i++) {
				var newParagraph = new Object();
				newParagraph.paragraph_title = project.detailedInfo[i].title;
				newParagraph.paragraph_content = project.detailedInfo[i].content;
				json.long_intro.push(newParagraph);
			}*/

      /*json.showcase = [];
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

		});

	}
	catch (e) {
		res.status(404);
		// page not found
		if (req.accepts('html')) {
			res.render('404', { url: req.url });
		}
	}
  //res.send('AIDA Home Page!');*/

  var project1 =
    {
      "id":"1",
      "title":"Super Awesome Game",
      "publisher": {
        "id":"1",
        "username": "jbelfort",
        "name":"Jordan Belfort"
      },
      "members": [{
        "id":"2",
        "name": "Donald Trump",
        "username": "bigDTrump"
      }],
      "latest_update": "100 million years ago",
      "status": "abandoned and forgotten",
      "tags": [{
        "name":"Fatasy"
      }, {
        "name":"Adventure"
      }],
      "brief": "This is a cool game about awesomeness and stuff I guess",
      "details": "This game features hundreds of awesome features that are featured throughout the game. Features include featuring features featured in the game. Specifically, you can specifically specify specific specifics. Additionally, many innovative innovations have been innovated.",
      "showcase": {
          "path": "../assets/images/gs1.jpg"
      },
      "jobs": [{
        "id": "1",
        "title": "2D Animator",
        "status": "open",
        "tags": [{
          "name": "Cooking",
          "rating": 3
        }, {
          "name": "Eating",
          "rating": 5
        }],
        "budget": 2000,
        "deadline": "June 13 1995",
      }]
    }

    res.json(project1);
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
					db.Chat.findById(chats[i], function(err, chat){
						if (userId === chat.personOne) {
							db.User.findById(chat.personTwo, function(err, user){
								other = user;
							});
						}
						else {
							db.User.findById(chat.personOne, function(err, user){
								other = user;
							});
						}
					});
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
			other_id: other person's id,
			messages: [{
				sender: user/other,
				text: text
			}]
		}
	}
	*/

	// Check if the person is logged in as personOne or personTwo
	var userId = req.session.userId;
	var chat_id = req.params.chat_id;
	db.Chat.findById(chat_id, function(err, chat){
		var json = new Object();
		if (userId === chat.personOne || userId === chat.personTwo) {
			json.success = "true";
			json.result = new Object();
			var other;
			if (userId === chat.personOne) {
				// the other person is person two
				db.User.findById(chat.personTwo, function(err, user){
					other = user;
				});
			}
			else {
				// the other person is person one
				db.User.findById(chat.personOne, function(err, user){
					other = user;
				});
			}
			// other user is not found
			if (!other) {
				json.success = "false";
				res.send(JSON.stringify(json));
				return;
			}
			json.result.other_id = other._id;
			json.result.other_name = other.name;
			json.messages = [];
			var messages = chat.messages.slice(-10); // Get the last 10 messages

			var i;
			var numMessages = messages.length;
			for (i=0;i<numMessages;i++) {
				// Mark all the messages shown as read
				readMessage(messages[i]);
				// check sender of the message and append to list
				var message = new Object();
				if (messages[i].sender === userId) {
					message.sender = "user";
				}
				else {
					message.sender = "other";
				}
				message.text = messages[i].text;
				json.messages.push(message);
			}


		}
		else {
			json.success = "false";
			json.result = null;
		}
		res.send(JSON.stringify(json));
	});
});

// send message to person_id
router.post('/inbox/:person_id/new', function (req, res) {
	var userId = req.session.userId;
	var personId = req.params.person_id;
	if (canSendMessage(userId, personId)) {
		var message = req.body['new-message-box'];
		sendMessageTo(userId, chatId, message);
		res.send("OK");
	}
	else {
		res.send("Denied");
	}
});

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
	db.Chat.findById(chat_id, function(err, chat){
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
		db.Project.findById(job.project, function(err, project){
			jobs_results[job._id].project_name = project.name;
		});
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

// username search page used by the admin
router.get('/search', function (req, res) {
	/*
	[{
		username: username
		frozen: true/false
		times_frozen: number of times frozen
	}]
	*/
	var json = [];
	var keyword = url.parse(req.url, true).query.key;
	var cursor = db.User.find({"username": {$regex: ".*" + keyword + ".*/i"}});
	while (cursor.hasNext()) {
		var curUser = cursor.next();
		var newUser = new Object();
		newUser.username = curUser.username;
		newUser.frozen = curUser.frozen;
		newUser.times_frozen = curUser.times_frozen;
	}
}
// etc...

module.exports = router;
