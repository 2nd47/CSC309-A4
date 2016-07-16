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

// if logged in: feed; else: landing page
router.get('/', function (req, res, next) {
  res.send('AIDA Home Page!');
});

// list of contracts
router.get('/contracts', function (req, res) {
});

// list of profiles
router.get('/people', function (req, res) {
});

// message inbox
router.get('/inbox', function (req, res) {
});

// search page
router.get('/search', function (req, res) {
});

// etc...

module.exports = router;
