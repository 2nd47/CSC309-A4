/* AIDA Source Code */
/* Contributors located at: github.com/2nd47/CSC309-A4 */

// router middleware
var express = require('express');
var router = express.Router();
var User = require('../../db/db.js');
// login
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var bcrypt = require('bcryptjs');
var session = require('express-session');
var validator = require('validator'); //added express-validator below, not sure if this one should be deleted

module.exports = function(app) {

  // use cookies to transmit session info back and forth
  app.use(cookieParser('s00pers3kret'));

  // enable reading data from form POST requests and JSON data
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  // Express validator
  app.use(expressValidator({
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

  // login signup initialization
  app.use(session({
    secret: 's00pers3kret',
    saveUninitialized: true,
    resave: true
  }))

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.getUser(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use(new LocalStrategy(
    // YOU MUST HASH THE PASSWORD HERE
    function(username, password, done) {
      User.getUserByField('username', username, function(err, user){
        if(err) throw err;
        if(!user){
          return done(null, false, {message: 'Unknown User'});
        }
        User.comparePassword(password, user.passwordHash, function(err, isMatch){
          if(err) throw err;
          if(isMatch){
            return done(null, user);
          } else {
            return done(null, false, {message: 'Invalid password'});
          }
        });
      });
  }));

  // Passport init
  app.use(passport.initialize());
  app.use(passport.session());

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

  this.register = function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    var email = req.body.email;
    var email2 = req.body.email2;

    // Validation
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('email2', 'Emails do not match').equals(req.body.email);

    var errors = req.validationErrors();

    if(errors) {
      console.log(msg);
      /*
      res.render('landingSignup', {
        errors:errors
      });

      On The Frontend add this placeholder:
      {{#if errors}}
        {{#each errors}}
          <div class="notice error">{{msg}}</div>
        {{/each}}
      {{/if}}
      */
    }
    else {
      console.log('Signup No Error');
      // Create the user
      var newUser = new User({
        username: username,
        password: password,
        email: email
      });

      User.createUser(newUser, function(err, user){
        if(err) throw err;
        console.log(user);
      });

      req.flash('success_msg', 'You are registered and can now login');
      /* On Frontend add these placeholders
      {{#if success_msg}}
        <div class="notice_success">
          {{success_msg}}
        </div>
      {{/if}}

      {{#if error_msg}}
        <div class="notice_success">
          {{error_msg}}
        </div>
      {{/if}}

      {{#if error}}
        <div class="notice_success">
          {{error}}
        </div>
      {{/if}}
      */

      res.redirect('/login');
    }
  }

  this.login = passport.authenticate('local', {
    successRedirect:'/',
    failureRedirect:'/login',
    failureFlash: true
  });

  this.logout =  function(req, res, next) {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
  };

  return this;
}
