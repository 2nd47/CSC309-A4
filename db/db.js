var mongoose = require('mongoose');

var models = require("./models.js");

var url = 'mongodb://localhost/appdb'

var connect = function(callback) {
  mongoose.connect(url);

  var db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", function() {
    callback();
  });
}

// Get individual user by searching for ID
var getUser = function(id) {
  return models.User.findById(id);
}

// Get individual user by searching for username
var getUserByUsername = function(username) {
  return models.User.findOne({
    'username' : username
  });
}

// Get individual project by searching for ID
var getProject = function(id) {
  return models.Project.findById(id);
}

// Get individual project by searching for name
var getProjectByName = function(name) {
  return models.Project.findOne({
    'name' : name
  })
}

// Get individual contract by searching for ID
var getContract = function(id) {
  return models.Contract.findById(id);
}


// Get contracts by price range
var getContractsByPrice = function(lowlimit, highlimit) {
  return models.Contract.
    find().
    where('budget').gt(lowlimit).lt(highlimit).
    exec();
}


module.exports.models = models;
module.exports.connect = connect;
