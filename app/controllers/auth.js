var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    session = require('express-session'),
    expressValidator = require('express-validator'),
    bcrypt = require('bcryptjs'),
    flash = require('connect-flash'),
    cookieParser = require('cookie-parser'),
    bodyParser = require("body-parser"),
    User = require('../models/user');

module.exports = function(app) {

  // use cookies to transmit session info back and forth
  app.use(cookieParser('s00pers3kret'));

  // enable reading data from form POST requests and JSON data
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.use(bodyParser());
  app.use(expressValidator());

  app.use(flash());

  //use session
  app.use(session(
    { cookie: { maxAge: 60000 },
      secret: 's00pers3kret',
      resave: false,
      saveUninitialized: false}));

  app.use(passport.initialize());
  app.use(passport.session());

  // Passport Local Strategy
  passport.use(new LocalStrategy(function(username, password, done) {
    console.log("login credentials: " + username + password);
      User.findByUsername(username, function(err, user){
        if(err) throw err;
        if(!user){
          console.log("no such user.")
          return done(null, false, {message: 'Invalid username or password'});
        }
        bcrypt.compare(password, user.passwordHash, function(err, isMatch){
          console.log("comparing: " + password + " with " + user.passwordHash);
          if(err) throw err;
          if(isMatch){
            console.log("isMatch. User returned: " + user);
            return done(null, user);
          } else {
            console.log("not match");
            return done(null, false, {message: 'Invalid username or password'});
          }
        });
      });
  }));

  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  // Ensure authenticated so the user cannot access the home page if not logged in
  this.ensureAuthenticated = function(req, res, next) {
    if(req.isAuthenticated()) {
      res.redirect('/profile'); //TODO: change to feed or some shit
    } else {
      req.flash('error_msg', 'You are not logged in');
      next();
    }
  }

  this.signup = function(req, res, next) {
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
      console.log(errors);
    } else {
      console.log('Signup No Error');

      // Hash the password. Store the hash in var password
      bcrypt.genSalt(10, function(err, salt) {
      	bcrypt.hash(password, salt, function(err, hash) {
          var newUser = new User({
            username: username,
            passwordHash: hash,
            email: email
          });
          newUser.save(function(err, user){
            if(err) throw err;
          });
      	});
      });

      req.flash('success_msg', 'You are registered and can now login');
      res.redirect('/');
    }
  }

  this.login = passport.authenticate('local'),
  function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.redirect('/');
  }

  this.google = passport.authenticate('google'),
  function(req, res) {
    console.log("In auth.js > this.google");
    res.redirect('/');
  }

  this.github = passport.authenticate('github'),
  function(res, req) {
    console.log("In auth.js > this.github");
    res.redirect('/');
  }

  this.logout = function(req, res, next){
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/login');
  };

  return this;
}
