/* AIDA Source Code */
/* Contributors located at: github.com/2nd47/CSC309-A4 */

// router middleware

var express = require('express');
var router = express.Router();

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});

// change the request methods as required
// refer to express documentation for more details

// if logged in: feed; else: landing page
router.get('/', function (req, res, next) {
  res.send('AIDA Home Page!');
});

router.post('/login', function (req, res, next) {
  res.send('AIDA Home Page!');
});

router.post('/signup', function (req, res, next) {
  res.send('AIDA Home Page!');
});

// list of contracts
router.get('/contracts', function (req, res) {
});

// create a new contract
router.get('/contracts/new', function (req, res) {
});

// details of contract with contract_id
router.get('/contracts/:contract_id', function (req, res) {
});

// list of profiles
router.get('/people', function (req, res) {
});

// details of people with user_id
router.get('/people/:user_id', function (req, res) {
});

// list of projects
router.get('/projects', function (req, res, next) {
  res.send('AIDA Home Page!');
});

// create a new project
router.get('/projects/new', function (req, res, next) {
  res.send('AIDA Home Page!');
});

// details of project with project_id
router.get('/projects/:project_id', function (req, res, next) {
  res.send('AIDA Home Page!');
});

// message inbox
router.get('/inbox', function (req, res) {
});

// search page
router.get('/search', function (req, res) {
});

// etc...

module.exports = router;
