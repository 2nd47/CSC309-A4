/* AIDA Source Code */
/* Contributors located at: github.com/2nd47/CSC309-A4 */

function startServer() {
  // server modules
  var express = require('express');
  var app = express();

  // require necessary modules and establish routing
  var auth = require('./app/controllers/auth')(app),
      user = require('./app/controllers/user')(app),
      project = require('./app/controllers/project')(app),
      job = require('./app/controllers/job')(app),
      search = require('./app/controllers/search')(app),
      router = require('./router')(app, auth, user, project, job, search);

  app.use(express.static('./public'));

  //return 404 page
  app.use(function(req, res, next){
    res.sendFile('404.html', { root: "./views" });
  });

  // testing modules
  var testCase = require('mocha').describe;
  var pre = require('mocha').before;
  var assertions = require('mocha').it;
  var assert = require('chai').assert;

  // app init
  var INIT_SAMPLE_DB = process.env.INIT_SAMPLE_DB || false;
  var APP_PORT = process.env.PORT || 3000;

  db = require('./db')(INIT_SAMPLE_DB);

  app.listen(APP_PORT);
  console.log('Server listening on port ' + APP_PORT);
}

startServer();
