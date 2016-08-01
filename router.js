/* AIDA Source Code */
/* Contributors located at: github.com/2nd47/CSC309-A4 */

var express = require('express');
var fs = require('fs');

var VIEWPATH = __dirname + '/views';

var walk = function(path, viewList, prepend) {
  if (!prepend) {
    prepend = "";
  }

  var views = fs.readdirSync(path);
  for (var i = 0; i < views.length; i++) {
    var file = views[i];
    var newPath = path + '/' + file;
    var stat = fs.statSync(newPath);

    if (stat.isFile()) {
      if (/(.*)\.(html$|ejs$)/.test(file)) {
        viewList.push(prepend + file.replace(/\.(html$|ejs$)/, ''));
      }
    } else if (stat.isDirectory() && file != 'partials') {
      walk(newPath, viewList, prepend + file + "/");
    }
  }

  return viewList;
};

var serveStaticPagesOnRequest = function(app, pageNames) {
  for (var i = 0; i < pageNames.length; i++) {
    var page = pageNames[i];
    app.get('/' + page, function(req, res) {
      res.sendFile(page, { root: './' });
    });
  }
};

module.exports = function(app, auth, user, project, job, search, admin) {

  app.use(express.static(__dirname + '/public'));
  app.set('view engine', 'html');
  app.set('views', __dirname + '/views');

  // middleware that is specific to this router
  app.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
  });

  // change the request methods as required
  // refer to express documentation for more details

  // if logged in: feed; else: landing page
  app.get('/', function (req, res, next) {
    res.sendFile('landing.html', { root: "./views" });
  });

  //serveStaticPagesOnRequest(app, walk(VIEWPATH, []));

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

  app.get('/project/:project_id', function(req, res) {
    res.sendFile('project.html', { root: "./views" });
  });

  // details of project with project_id
  app.get('/api/project/:project_id', project.getProject);

  // message inbox
  app.get('/api/inbox', user.getMessages);

  // chat message detail
  app.get('/inbox/:chat_id', user.getChat);

  // send message to person_id
  app.post('/inbox/:person_id/new', user.createMessage);

  // load all messages from a chat history
  app.get('/inbox/:chat_id/all', user.getChatHistory);

  // search page
  app.get('/search', search.getSearch);
	// username search page used by the admin
	app.get('/search_user', admin.searchUser);

	app.post('/delete_user/:username', user.deleteUser);
	//app.post('/admin/delete_database', admin.delete_database);
	//app.post('/admin/repopulate_database', admin.repopulate_database);
	app.get('/inbox', function(req, res){
		res.sendFile('inbox.html', { root: "./views/" });
	});
	app.get('/control.html', function(req, res){
		res.sendFile('control.html', { root: "./views/" });
	});
	app.get('/api/get_username', function(req, res){
		res.send(req.user._id);
	});
	// edit user profile (profile_id: the user id of the profile)
	app.post('/edit_profile/:username', user.editProfile);
};
