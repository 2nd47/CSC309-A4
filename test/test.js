var express = require('express'),
    request = require('supertest');

var app;

describe('APIs', function() {

  before(function(done) {
    app = require('../app')(done());
  });

  describe('Users', function() {
  });

  describe('GET routes for serving pages', function() {
    describe('/', function() {
      it('should respond with html for landing page', function(done) {
        request(app).
          get('/').
          expect('Content-Type', /html/).
          expect(200, done)
      });
    });
    describe('/jobs', function() {
      it('should respond with html for popular page', function(done) {
        request(app).
          get('/jobs').
          expect('Content-Type', /html/).
          expect(200, done)
      });
    });
    describe('/projects', function() {
      it('should respond with html for popular projects page', function(done) {
        request(app).
          get('/projects').
          expect('Content-Type', /html/).
          expect(200, done)
      });
    });
    describe('/inbox', function() {
      it('should respond with html for the inbox page', function(done) {
        request(app).
          get('/inbox').
          expect('Content-Type', /html/).
          expect(200, done)
      });
    });
    describe('/images/users/placeholder.jpg', function() {
      it('should respond with a placeholder user avatar ', function(done) {
        request(app).
          get('/images/users/placeholder.png').
          expect('Content-Type', /image/).
          expect(200, done)
      });
    });
  });
});
