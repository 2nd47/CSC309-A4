var Job = require('../models/job'),
    User = require('../models/user');

module.exports = function(app) {
  this.renderJobPage = function(req, res) {
    res.sendFile('contract.html', { root: "./views" });
  }
  this.renderLatestJobPage = function(req, res) {
    res.sendFile('jobs.html', { root: './views' });
  }
  this.getLatestJobs = function (req, res) {
    //var pageNum = req.pageNum;
    var pageNum = 1;
    var resultsPerPage = 10;
    // Find all jobs but limit results to the ones relevant for the page number
    Job.find({}).
      sort({ createdAt: 1 }).
      skip((pageNum - 1) * resultsPerPage).
      limit(resultsPerPage).
      select({ _id: 1, createdAt: 1, name: 1, intro: 1, owner: 1 }).
      exec(function(err, jobs) {
        if (err) {
        res.status(500).send(err);
        } else {
          res.status(200).send(jobs);
        }
      });
  }
  this.createJob = function (req, res) {
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
  					var skills = jobForm.skillTags.replace(/\s+/g, '');split(",");
  					db.setJobField(newJobId, "skillTags", skills);
  					var tags = jobForm.descriptionTags.replace(/\s+/g, '');split(",");
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
  };

  this.getJob = function (req, res) {
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
    "post_date": "06-06-2006",
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
  };

  this.signJob = function (req, res) {
  	/**/
  };

  return this;
}
