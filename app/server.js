/* AIDA Source Code */
/* Contributors located at: github.com/2nd47/CSC309-A4 */

// main app

// server modules
var bcrypt = require('bcryptjs');
var express = require('express');
var sequelize = require('sequelize');
var sqlite3 = require('sqlite3').verbose();
var validator = require('validator');

// testing modules
var testCase = require('mocha').describe;
var pre = require('mocha').before;
var assertions = require('mocha').it;
var assert = require('chai').assert;

// module init
var app = express()
// router import keeps main file clean
var router = require('./router')

// app init
const saltRounds = 10;

function main() {
  init();
  app.use('/', router);
  app.listen(3000);
}

main();
