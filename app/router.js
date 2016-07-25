/* AIDA Source Code */
/* Contributors located at: github.com/2nd47/CSC309-A4 */

// router middleware

var express = require('express');
var router = express.Router();
var User = require('../db/app-db');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

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

router.post('/login',
            passport.authenticate('local', {successRedirect:'/', failureRedirect:'/login', failureFlash: true}),
            function (req, res, next) {
              res.redirect('/');
});

router.get('/logout', function(req, res, next) {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/login');
});

// list of contracts
router.get('/contracts', function (req, res) {
});

// create a new contract
router.get('/contracts/new', function (req, res) {
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
	var contrat_id = req.params.contract_id;
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
});

// details of people with user_id
router.get('/people/:user_id', function (req, res) {
	/*
	{
		id: person id,
		name: person's name,
		skills:
		[
			{
				skill_id: skill id,
				skill_name: skill name,
				skill_level: self rating on the skill between 1 to 5
			}
		],
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
	var user_id = req.params.user_id;
	var user = db.User.findOne({"_id" : ObjectId(user_id)});
	json.id = user_id;
	json.name = user.name;
	json.skills = user.skillTags;
	json.biography = user.bio;
	json.projects = [];
	// Where the user is the owner
	var projects = db.Project.find({"ownerUsername": user.username},{name: 1});
	while (projects.hasNext()) {
		var newProject = new Object();
		var current = projects.next();
		newProject.project_id = current._id;
		newProject.project_name = current.name;
		json.projects.push(newProject);
	}
	// Where the user is a member
	var member_projects = db.Project.find({members: {$elemMatch: {"user": user_id}}});
	while (member_projects.hasNext()) {
		var newProject = new Object();
		var current = member_projects.next();
		newProject.project_id = current._id;
		newProject.project_name = current.name;
		json.projects.push(newProject);
	}
	json.contracts = [];
	var contracts = db.Contract.find({"taker": user_id});
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
  res.send('AIDA Home Page!');
});

// create a new project
router.get('/projects/new', function (req, res, next) {
  res.send('AIDA Home Page!');
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
		long_intro:
		[
			{
				paragraph_title: title,
				paragraph_content: content
			}
		],
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
	json.publisher.publisher_id = project.ownerUsername;
	var publisher_info = db.User.findOne({"username": project.ownerUsername}, {name: 1});
	json.publisher.publisher_name = publisher_info.name;
	json.members = [];
	var i;
	var numMembers = project.members.length;
	for (i=0;i<numMembers;i++) {
		var newMember = new Object();
		newMember.member_id = project.members[i].user;
		var memberName = db.User.findOne({"_id": project.members[i].user}, {name: 1});
		newMember.member_name = memberName.name;
		json.members.push(newMember);
	}
	json.short_intro = project.basicInfo;
	json.long_intro = [];
	var numParagraph = project.detailedInfo.length;
	for (i=0;i<numParagraph;i++) {
		var newParagraph = new Object();
		newParagraph.paragraph_title = project.detailedInfo[i].title;
		newParagraph.paragraph_content = project.detailedInfo[i].content;
		json.long_intro.push(newParagraph);
	}
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
});

// search page
router.get('/search', function (req, res) {
});

// etc...

module.exports = router;
