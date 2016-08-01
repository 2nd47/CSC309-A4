/* AIDA Source Code */
/* Contributors located at: github.com/2nd47/CSC309-A4 */

var express = require('express');

module.exports = function(app, auth, user, project, job, search, admin) {

  // Set static files with Express
  app.use(express.static(__dirname + '/public'));
  app.set('view engine', 'html');
  app.set('views', __dirname + '/views');

  // Log when routes are accessed
  app.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
  });

  // ROUTES BEGIN HERE

  // HOME PAGE
  app.get('/', function (req, res, next) {
    res.sendFile('landing.html', { root: "./views" });
  });

  // USER AUTHENTICATION
  app.post('/signup', auth.signup);

  app.post('/login', auth.login, auth.redirectToHome);
  //app.post('/google', auth.google, auth.redirectToHome);
  app.get('/google', auth.google, auth.redirectToHome);
  app.get('/google/callback', auth.googleCallback);

  app.post('/github', auth.github, auth.redirectToHome);

  app.get('/logout', auth.logout);

  // FRONT-FACING ROUTES
  // USER ROUTES
  app.get('/profiles', user.getPopularUsers);
  app.get('/profile/:username', user.renderUserPage);
  app.post('/profile/:username', user.editProfile);
  app.delete('/profile/:username', user.deleteUser);

  // INBOX ROUTES
  app.get('/inbox', user.renderMessagePage);
  app.get('/inbox/:chat_id', user.getChat);
  app.get('/inbox/:chat_id/all', user.getChatHistory);
  app.post('/inbox/:person_id/new', user.createMessage);

  // PROJECT ROUTES
  app.get('/projects', project.renderPopularProjectPage);
  app.get('/projects/:project_id', project.renderProjectPage);
  app.post('/projects/new', project.createProject);

  // JOB ROUTES
  app.get('/jobs', job.renderLatestJobPage)
  app.get('/jobs/:job_id', job.renderJobPage);
  app.get('/jobs/:job_id/sign', job.signJob);
  app.post('/jobs/new', job.createJob);

	app.get('/control.html', function(req, res){
		res.sendFile('control.html', { root: "./views/" });
	});

  app.get('/search', search.getSearch);

  // API ROUTES
  app.get('/api/profile/:username', user.getUser);

  app.get('/api/projects', project.getPopularProjects);
  app.get('/api/projects/:project_id', project.getProject);

  app.get('/api/jobs', job.getLatestJobs);
  app.get('/api/jobs/:job_id', job.getJob);

  app.get('/api/inbox', user.getMessages);

  app.get('/api/admin/search', admin.searchUser);
  //app.post('/api/admin/delete_database', admin.delete_database);
	//app.post('/api/admin/repopulate_database', admin.repopulate_database);

	app.get('/api/get_username', function(req, res){
		res.send(req.user._id);
	});
};
