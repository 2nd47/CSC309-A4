var Job = require('../models/job'),
    User = require('../models/user'),
    Project = require('../models/project');

module.exports = function(app) {
  this.renderJobPage = function(req, res) {
    res.sendFile('job.html', { root: "./views" });
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
        res.status(404).send(err);
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
    Job.findById(req.params.job_id).
      select({
        _id: 1,
        name: 1,
        intro: 1,
        owner: 1,
        project: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        skillTags: 1,
        budget: 1,
        deadline: 1,
        details: 1
      }).
      exec(function(err, job) {
        if (err) {
          res.status(404).send(err);
        } else {
          User.findById(job.owner).
          select({
            username: 1,
            name: 1
          }).
          exec(function(err, owner) {
            if (err) {
              res.status(404).send(err);
            } else {
              job.owner = owner;
              Project.findById(job.project).
              select({
                _id: 1,
                name: 1
              }).
              exec(function(err, project) {
                if (err) {
                  res.status(404).send(err);
                } else {
                  job.project = project;
                  res.status(200).send(job);
                }
              });
            }
          });
        }
      });
  };

  this.signJob = function (req, res) {
  	/**/
  };

  return this;
}
