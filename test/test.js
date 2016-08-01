var bcrypt = require('bcryptjs'),
    mongoose = require('mongoose'),
    user = require('../app/controllers/user')();

describe('APIs', function() {
  var url = 'localhost:3000';
  // within before() you can run all the operations that are needed to setup your tests. In this case
  // I want to create a connection with the database, and when I'm done, I call done().
  before(function(done) {
    // In our tests we use the sample db
    var db = require('../db')();
    collectionsToDrop = [
      'skills',
      'messages',
      'broadcasts',
      'chats',
      'users',
      'showcases',
      'projects',
      'jobs']
    for (var i = 0; i<collectionsToDrop.length; i++) {
      mongoose.connection.collections[collectionsToDrop[i]].drop();
    }
    done();
  });
  // use describe to give a title to your test suite, in this case the tile is "Account"
  // and then specify a function in which we are going to declare all the tests
  // we want to run. Each test starts with the function it() and as a first argument
  // we have to provide a meaningful title for it, whereas as the second argument we
  // specify a function that takes a single parameter, "done", that we will use
  // to specify when our test is completed, and that's what makes easy
  // to perform async test!
  describe('Users', function() {
    var userId;
    it('should create a new, unique user', function(done) {
      user.createUser('dkouznetsov', 'hashedPassword', 'dkouznetsov@aida.com', function(err, user) {
        if (err) {
          throw err;
        } else {
          userId = user._id;
          done();
        }
      });
    });
    /*
    it('should retrieve an existing user', function(done) {
      req = {
        user: {
          _id: userId
        },
        params: {
          username: 'dkouznetsov'
        }
      };
      res = {};
      user.deleteUser(req, res, function(err, user) {
        if (err) {
          throw err;
        } else {
          done();
        }
      });
      */
    });
});
