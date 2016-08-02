var User = require('../models/user'),
    Project = require('../models/project'),
    permissionManager = require('../middleware/permission_manager');

module.exports = function(app) {
  this.renderPopularProjectPage = function(req, res) {
    res.sendFile('popularProjects.html', { root: './views' });
  }
  this.renderProjectPage = function(req, res) {
    res.sendFile('project.html', { root: "./views" });
  }
  this.getProject = function (req, res, next) {
  	/*
  		{
  			id: project id,
  			name: project name,
  			owner:
  			{
  				_id: id of owner,
          username: String,
  				name: name of project owner
  			},
  			members:
  			[
  				{
  					member_id: id of owner,
  					member_name: name of project owner
  				}
  			],
  			basicInfo: short description, 300 characters max,
  			detailedInfo: longer intro with no character limit,
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
    Project.findById(req.params.project_id).
      select({
        _id: 1,
        owner: 1,
        name: 1,
        members: 1,
        showcase: 1,
        jobs: 1,
        basicInfo: 1,
        detailedInfo: 1,
        updatedAt: 1,
        status: 1,
        tags: 1}).
      lean().
      exec(function(err, project) {
        if (err) {
          res.status(404).send(err);
        } else {
          User.findById(project.owner).
            select({
              _id: 1,
              name: 1,
              username: 1
            }).
            lean().
            exec(function(err, owner) {
            if (err) {
              res.status(404).send(err);
            } else {
              project.owner = owner;
              console.log(project);
              res.status(200).send(project);
            }
          });
        }
      });
  	/*try {
  		var json = new Object();
  		Project.findById(req.params.project_id, function(err, project){
        if (!project.length) {
  				res.status(404);
  				// project page not found
  				if (req.accepts('html')) {
  					res.render('404', { url: req.url });
  				}
  				return;
  			}
  			// Build the file
  			json.id = project._id;
  			json.title = project.name;
  			json.publisher = new Object();
  			json.publisher.publisher_id = project.owner;
  			User.findById(project.owner, function(err, publisher_info){
  				json.publisher.publisher_name = publisher_info.name;
  				json.members = [];
  			});
  			var i;
  			var numMembers = project.members.length;
  			for (i=0;i<numMembers;i++) {
  				var newMember = new Object();
  				newMember.member_id = project.members[i].user;
  				User.findById(project.members[i].user, function(err, memberName){
  					newMember.member_name = memberName.name;
  					json.members.push(newMember);
  				});
  			}
  			json.basicInfo = project.basicInfo;
  			json.long_intro = project.detailedInfo;

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
  			var jobs = Job.find({"project": ObjectId(project_id)});
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
  	}*/
    //res.send('AIDA Home Page!');
    /*
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
            "path": "/images/gs1.jpg"
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

      res.json(project1);*/
  };
  this.getPopularProjects = function (req, res) {
    var pageNum = 1;
    var resultsPerPage = 10;
  	Project.find({}).
      select({_id: 1, name: 1, tags: 1, showcase: 1, createdAt: 1, basicInfo: 1}).
      sort({numFollowers: -1}).
      skip((pageNum - 1) * resultsPerPage).
      limit(resultsPerPage).
      exec(function(err, projects) {
        if (err) {
          res.status(404).send(err);
        } else {
          res.status(200).send(projects);
        }
      });
  };

  this.createProject = function (req, res, next) {
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
  		var projectForm = qs.parse(req.data);
      var tags = jobForm.descriptionTags.replace(/\s+/g, '').split(",");
  		// may createJob return job _id or something...
			var showcasePath = projectForm.image.id;
      var newProject = Project({
        name: projectForm.name,
        owner: req.user._id,
        tags: tags,
        members: projectForm.members,
        details: projectForm.details
      });

      newProject.save(function(err, project) {
        json.url = '/project/' + newProject._id;
        json.success = true;
      });
  	}
  	catch (e) {
  		json.success = "false";
  		console.log(e.message);
  	}

  	res.send(JSON.stringify(json));
    //res.send('AIDA Home Page!');
  };
  return this;
}
