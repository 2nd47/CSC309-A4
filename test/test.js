var assert = require('chai').assert;
var db = require('../db/db');
var router = require('../app/router.js');

before(function() {
  // runs before all tests in this block
});

after(function() {
  // runs after all tests in this block
});

beforeEach(function() {
  // runs before each test in this block
});

afterEach(function() {
  // runs after each test in this block
});

// Some variables that are common among tests
var username = 'testman77';
var password = 'testpass';
var email = 'testman77@email.org';

// Enter a new user into the database without error
describe('User', function() {
  before(function() {
    db.models.user.find({username:username}).remove();
  });
  describe('#save()', function() {
    it('should create a new user', function(done) {
      var user = new User({
        username: username,
        passwordHash:password,
        email: email
      });
      user.save(done);
    });
  });
});

// Attempt to sign up with appropriate information
/*
describe('router', function() {

});
*/
