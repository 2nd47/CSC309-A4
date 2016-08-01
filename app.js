/* AIDA Source Code */
/* Contributors located at: github.com/2nd47/CSC309-A4 */

var startServer = function(testServer) {
  // server modules
  var express = require('express');
  var app = express();

  // require necessary modules and establish routing
  var auth = require('./app/controllers/auth')(app),
      user = require('./app/controllers/user')(app),
      project = require('./app/controllers/project')(app),
      job = require('./app/controllers/job')(app),
      search = require('./app/controllers/search')(app),
			admin = require('./app/controllers/admin')(app),
      router = require('./router')(app, auth, user, project, job, search, admin);

  //return 404 page
  app.use(function(req, res, next){
    res.status(404);
    res.sendFile('404.html', { root: "./views" });
  });

  // testing modules
  var testCase = require('mocha').describe;
  var pre = require('mocha').before;
  var assertions = require('mocha').it;
  var assert = require('chai').assert;

  // app init
  var INIT_SAMPLE_DB = process.env.INIT_SAMPLE_DB || true;
  var APP_PORT = process.env.PORT || 3000;

  db = require('./db')();
  if (INIT_SAMPLE_DB) {
    require('./test/backend/sampleDb')(app, auth, user, project, job, search);
  }

  app.listen(APP_PORT);
  console.log('Server listening on port ' + APP_PORT);
}

if (require.main === module) {
  startServer();
} else {
  module.exports = startServer;
}
