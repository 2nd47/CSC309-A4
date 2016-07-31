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

  app.use(passport.initialize());
  app.use(passport.session());

  // Passport Local Strategy
  passport.use(new LocalStrategy(function(username, password, done) {
      db.getUserByField('username', username, function(err, user){
        if(err) throw err;
        if(!user.length){
          return done(null, false, {message: 'Unknown User'});
        }
        db.comparePassword(password, user[0].passwordHash, function(err, isMatch){
          console.log(user);
          if(err) throw err;
          if(isMatch){
            return done(null, user[0]);
          } else {
            return done(null, false, {message: 'Invalid password'});
          }
        });
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
      		var passwordHash = hash;
          db.createUser(username, passwordHash, email, function(err, user){
            if(err) throw err;
          });
      	});
      });

      req.flash('success_msg', 'You are registered and can now login');
      res.redirect('/');
    }
  }


  this.login = passport.authenticate('local', {
    successRedirect:'/',
    failureRedirect:'/login',
    failureFlash: true
  }, function (req, res, next) {
    console.log("Reached here in post/login with: " + req.username + req.password);
    res.redirect('/');
});

  this.logout = function(req, res, next){
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/login');
  };

  return this;
}
