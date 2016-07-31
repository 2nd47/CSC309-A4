var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    session = require('express-session'),
    expressValidator = require('express-validator'),
    bcrypt = require('bcryptjs'),
    flash = require('connect-flash'),
    cookieParser = require('cookie-parser'),
    bodyParser = require("body-parser");

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

  // Passport Local Strategy
  passport.use(new LocalStrategy({
    passReqToCallback : true
    }, function(username, password, done) {
      User.findByName(username, function(err, user){
        if(err) throw err;
        if(!user){
          return done(null, false, {message: 'Invalid username/password'});
        } else if (!bcrypt.compareSync(password, user.password)) {
          return done(null, false, {message: 'Invalid username/password'});
        } else {
          return done(null, user);
        }
      });
  }));

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  const saltRounds = 10;

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
    console.log("Sign Up Mode");
    console.log("req.body: " + req.body);
    var username = req.body.username;
    console.log('username: ' + req.body.username);
    console.log('password: ' + req.body.password);
    console.log('email: ' + req.body.email);

    var password = req.body.password;
    var password2 = req.body.password2;
    var email = req.body.email;
    var email2 = req.body.email2;
    console.log(username + password + password2 + email + email2);

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
    } else {
      console.log('Signup No Error');

      // Hash the password. Store the hash in var password
      bcrypt.genSalt(saltRounds, function(err, salt) {
      	bcrypt.hash(password, salt, function(err, hash) {
      		password = hash;
      	});
      });

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
  };

  this.login = passport.authenticate('local', {
    successRedirect:'/',
    failureRedirect:'/login',
    failureFlash: true
  });

  this.logout = function(req, res, next){
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/login');
  };

  return this;
}
