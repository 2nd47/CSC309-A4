/* AIDA Source Code */
/* Contributors located at: github.com/2nd47/CSC309-A4 */

// main app

// server modules
var bcrypt = require('bcryptjs');
var express = require('express');
var mongoose = require('mongoose');
var session = require('express-session');
var validator = require('validator');
var qs = require('querystring');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');

// testing modules
var testCase = require('mocha').describe;
var pre = require('mocha').before;
var assertions = require('mocha').it;
var assert = require('chai').assert;

// module init
var app = express();
// router import keeps main file clean
var router = require('./router');
var db = require('../db/db.js');

app.use(bodyParser());
app.use(expressValidator());


// app init
var url = process.env.MONGODB_URI || 'mongodb://localhost/appdb';
var sampleInit = process.env.INIT_SAMPLE_DB || false;
const APP_PORT = process.env.PORT || 3000;
const saltRounds = 10;

function main() {
  app.use('/', router);
  app.listen(APP_PORT);
  db.connect(url, sampleInit);
  console.log('Server listening on port ' + APP_PORT);
}

main();
