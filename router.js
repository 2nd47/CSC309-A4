/* AIDA Source Code */
/* Contributors located at: github.com/2nd47/CSC309-A4 */

var express = require('express');

module.exports = function(app, auth, user, project, job, search) {

  // middleware that is specific to this router
  app.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
  });

  // change the request methods as required
  // refer to express documentation for more details

  // if logged in: feed; else: landing page
  app.get('/', auth.ensureAuthenticated, function (req, res, next) {
    res.sendFile('landing.html', { root: "./views" });
  });

  app.post('/signup', auth.signup);
  app.post('/login', auth.login);
  app.get('/logout', auth.logout);

  // create a new job
  app.post('/job/new', job.createJob);

  app.get('/job/:job_id', function(req, res) {
    res.sendFile('contract.html', { root: "./views" });
  });

  // details of job with job_id
  app.get('/api/job/:job_id', job.getJob);

  // prompt to sign a job with job_id
  app.get('/job/:job_id/sign', job.signJob);


  // list of profiles of top ten followed users
  // if user is logged in, show their following users at the bottom
  app.get('/profile', user.getPopularUsers);

  app.get('/profile/:username', function(req, res) {
    res.sendFile('profile.html', { root: "./views" });
  });

  // details of people with username
  app.get('/api/profile/:username', user.getUser);


  // list of top ten projects
  // if user has followed projects, list them, too
  app.get('/project', project.getPopularProjects);

  // create a new project
  app.post('/project/new', project.createProject);

  app.get('/project/:username', function(req, res) {
    res.sendFile('profile.html', { root: "./views" });
  });

  // details of project with project_id
  app.get('/api/project/:project_id', project.getProject);

  // message inbox
  app.get('/inbox', user.getMessages);

  // chat message detail
  app.get('/inbox/:chat_id', user.getChat);

  // send message to person_id
  app.post('/inbox/:person_id/new', user.createMessage);

  // load all messages from a chat history
  app.get('/inbox/:chat_id/all', user.getChatHistory);

  // search page
  app.get('/search', search.getSearch);
}
