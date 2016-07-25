/* AIDA Source Code */
/* Contributors located at: github.com/2nd47/CSC309-A4 */

// main app

// server modules
var bcrypt = require('bcryptjs');
var express = require('express');
var sequelize = require('sequelize');
var session = require('express-session');
var sqlite3 = require('sqlite3').verbose();
var validator = require('validator'); //added express-validator below, not sure if this one should be deleted
//login
var path = require('path');
var cookieParser = require('coockie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;



// testing modules
var testCase = require('mocha').describe;
var pre = require('mocha').before;
var assertions = require('mocha').it;
var assert = require('chai').assert;

// module init
var app = express()
// router import keeps main file clean
var router = require('./router')

// app init
const saltRounds = 10;

// login signup initialization
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}))

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express validator
app.use(expresaValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.')
    , root = namespace.shift()
    , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  /* If user is logged in, it can be accessed anywhere globally. O.w null.
     Add these placeholders in frontend:
     {{#if user}}
      Show Logout and Landingpage maybe
     {{else}}
      Show Login and Signup and Feed maybe
     {{/if}}
  */
  res.locals.user = req.user || null;
  next();
});

function main() {
  init();
  app.use('/', router);
  app.listen(3000);
}

main();
