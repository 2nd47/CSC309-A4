var express = require('express'),
    request = require('supertest');

var app;

describe('APIs', function() {
  // within before() you can run all the operations that are needed to setup your tests. In this case
  // I want to create a connection with the database, and when I'm done, I call done().
  before(function(done) {
    app = require('../app')();
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
  });
  describe('GET /jobs', function() {
    it('should respond with JSON', function(done) {
      request(app).
        get('/jobs').
        set('Accept', 'application/json').
        expect('Content-Type', /json/).
        expect(200, done)
    });
  });
});
