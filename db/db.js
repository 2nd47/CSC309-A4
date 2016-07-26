var mongoose = require('mongoose');

var models = require("./models.js");

/*
var dbUser = 'aida-master';
var dbPassword = 'dbpassword';
var url = 'mongodb://' +
  dbUser + ':' +
  dbPassword +
  '@ds029735.mlab.com:29735/heroku_qdmfvghp'
*/

var url = 'mongodb://localhost/appdb';

var connect = function(callback) {
  mongoose.connect(url);

  var db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", function() {
    callback();
  });
}

// Generate a custom URL to be used when displaying pages
/*
var generateURL = function() {
  var randURL;
  var isUniqueId = false;
  while (!isUniqueId) {
    var noUserURL = false,
        noProjectURL = false,
        noContractURL = false;
    randURL = Math.Random() * 100000;
  }
  return randURL;
}
*/

// Create a new user given the required fields
var createUser = function(username, passwordHash, email) {
  var user = new User({
    'username': username,
    'passwordHash': passwordHash,
    'email': email
  });
  user.save();
}

// Create a new project given the required fields
var createProject = function(name, ownerUsername) {
  var project = new Project({
    'name': name,
    'ownerUsername': ownerUsername
  });
  project.save();
}

// Create a new contract given the required fields
var createContract = function(name, project, owner, deadline, budget) {
  var contract = new Contract({
    'name': name,
    'project': project,
    'owner': owner,
    'deadline': deadline,
    'budget': budget
  });
  contract.save();
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

// Get the owner of a project given some project id
var getProjectOwnerByProject = function(id) {
  return models.Project.findById(id).
    select('ownerUsername').
    exec();
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
