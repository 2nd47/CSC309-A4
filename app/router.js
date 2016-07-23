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
});

// create a new contract
router.get('/contracts/new', function (req, res) {
});

// details of contract with contract_id
router.get('/contracts/:contract_id', function (req, res) {
});

// list of profiles
router.get('/people', function (req, res) {
});

// details of people with user_id
router.get('/people/:user_id', function (req, res) {
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
		var memberName = db.User.findOne({"username": project.members[i].user}, {name: 1});
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
