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

// Init sample database info
var sample_data_init = false;
module.exports.initSampleDb = function() {
  if (sample_data_init) {
    return;
  }
  // Clear database
  for (var modelToRemove in [
    models.Skill,
    models.Message,
    models.Contact,
    models.User,
    models.ProjectMember,
    models.DetailedInfo,
    models.Showcase,
    models.Project,
    models.Contract,
    models.Report]) {
      modelToRemove.remove({});
  }
  // Create users
  var user1 = createUser('dtrump', 'passwordhashtrump', 'dtrump@gmail.com');
  setUserField(user1, 'name', 'Donald Trump');
  setUserField(user1, 'title', 'Republican Presidential Nominee');
  setUserField(user1, 'bio', 'I am the greatest candidate for this position!');
  pushUserField(user1, 'tags', 'Republican Party');
  pushUserField(user1, 'tags', 'GOP');
  setUserField(user1, 'isVerified', true);
  setUserField(user1, 'timeVerified', Date.now());
  setUserField(user1, 'url', 'http://www.trump.com/');
  pushUserField(user1, 'following', user3._id);
  pushUserField(user1, 'contacts', user3._id);
  pushUserField(user1, 'blocked', user2._id);
  var user2 = createUser('bsanders', 'passwordhashsanders', 'bsanders@gmail.com');
  setUserField(user1, 'name', 'Bernie Sanders');
  setUserField(user1, 'title', 'Democratic Presidential Nominee Runner-up');
  setUserField(user1, 'bio', 'I wish I had gotten that position!');
  setUserField(user1, 'isVerified', true);
  setUserField(user1, 'timeVerified', Date.now());
  setUserField(user1, 'url', 'http://www.sanders.senate.gov/');
  var user3 = createUser('vputin', 'passwordhashputin', 'vputin@gmail.com');
  setUserField(user1, 'name', 'Vladimir Putin');
  setUserField(user1, 'title', 'Russian Overlord');
  setUserField(user1, 'bio', 'I rule Russia, forever.');
  setUserField(user1, 'isVerified', true);
  setUserField(user1, 'timeVerified', Date.now());
  setUserField(user1, 'url', 'http://eng.putin.kremlin.ru/');
  pushUserField(user1, 'following', user1._id);
  pushUserField(user1, 'contacts', user1._id);
  pushUserField(user1, 'blocked', user2._id);
  // Create projects
  var project1 = createProject('Trump for President!', user1._id);
  pushProjectField(project1, 'tags', 'USA Presidential Campaign');
  pushProjectField(project1, 'tags', 'Republican Party');
  pushProjectField(project1, 'tags', 'GOP');
  pushProjectField(project1, 'members', user1._id);
  pushProjectField(project1, 'members', user3._id);
  setProjectField(project1, 'basicInfo',
    'This is basic information about the project!');
  setProjectField(project1, 'detailedInfo', 'This is a much much much much much\
    much much much much much much much much much much much much much much much \
    much much much much much much much much much much much much much much much \
    much much much much much much much much much much much much much much much \
    much much much much much much much much much longer information section');
  // Create contracts
  var contract1 = createContract(
    'Website Designer', project1._id, user1._id, Date.now(), 1500);
  setContractField(contract1._id, 'intro',
    'This is the introduction to the contract!');
  pushContractField(contract1._id, 'descriptionTags', 'Webdev');
  pushContractField(contract1._id, 'descriptionTags', 'Campaigning');
  setContractField(contract1._id, 'details',
    'These are the details for the contract!');
  setContractField(contract1._id, 'url', 'http://www.trump.com/connect-with-us/');
  // Create reports
}

// Create a new user given the required fields
module.exports.createUser = function(username, passwordHash, email) {
  var user = new User();
  user.username = username;
  user.passwordHash = passwordHash;
  user.email = email;
  user.save();
  return user;
}

// Create a new project given the required fields
module.exports.createProject = function(name, owner) {
  var project = new Project();
  project.name = name;
  project.owner = owner;
  project.save();
	return project;
}

// Create a new contract given the required fields
module.exports.createContract = function(name, project, owner, deadline, budget) {
  var contract = new Contract();
  contract.name = name;
  contract.project = project;
  contract.owner = owner;
  contract.deadline = deadline;
  contract.budget = budget;
  contract.save();
  pushUserField(owner, 'contracts', contract);
  pushProjectField(project, 'contracts', contract);
  return contract;
}

// Create a new message
module.exports.createMessage = function(sender, receiver, text) {
  var message = new Message();
  message.sender = sender;
  message.text = text;
  message.save();
  getContact(sender, receiver, function(err, contact) {
    models.Contact.findByIdAndUpdate(contact._id, {$push: {'messages':message}});
  });
  return message;
}

// Get a contact doc associated with this user and the other user
module.exports.getContact = function(userOne, userTwo, callback) {
  models.Contact.findOne({
    $or:[
      {'personOne': userOne, 'personTwo': userTwo},
      {'personOne': userTwo, 'personOne': userOne}
    ]}, function(err, contact) {
      if (err) {
        console.log(err);
      }
      callback(err, contact);
  });
}

// Create a new contact
module.exports.createContact = function(contacter, contactee) {
  var contact = new Contact();
  contact.contacter = contacter;
  contact.contactee = contactee;
  contact.save();
  return contact;
}

// Create a new skill
module.exports.createSkill = function(name, rating) {
  var skill = new Skill();
  skill.name = name;
  skill.rating = rating;
  skill.save();
  return skill;
}

// Adds a skill by ID to a user by ID
module.exports.addUserSkill = function(user, skillToAdd) {
  return;
}

// Adds a skill by ID to a contract by ID
module.exports.addContractSkill = function(contract, skillToAdd) {
  return;
}

// Adds a showcase item to a project showcase
module.exports.addShowcaseItem = function(project, itemPath) {
  return;
}

// Get individual user by searching for ID
module.exports.getUser = function(id) {
  return models.User.findById(id);
}

// Get a field of a user document, searching user by ID
module.exports.getUserField = function(id, field) {
  return models.User.findById(id, field, function(err, user) {});
}

// Get individual user by searching for a field value
module.exports.getUserByField = function(field, value) {
  var query = [];
  query[field] = value;
  return models.User.find(query, function(err, user) {});
}

// Get individual project by searching for ID
module.exports.getProject = function(id) {
  return models.Project.findById(id);
}

// Get a field of a project document, searching user by ID
module.exports.getProjectField = function(id, field) {
  return models.Project.findById(id, field, function(err, project) {});
}

// Get individual project by searching for a field value
module.exports.getProjectByField = function(field, value) {
  var query = [];
  query[field] = value;
  return models.Project.find(query, function(err, project) {});
}

// Get all projects associated with a user
module.exports.getProjectsByUsername = function(user) {
  var userId = user._id;
  var query = { $or: [
      {'owner': userId},
      {'members.user': userId}
    ]
  };
  return Project.find(query).exec();
}

// Get projects by tag
module.exports.getProjectsByTag = function(tagString) {
  return models.Project.find({tags: tagString});
}

// Get individual contract by searching for ID
module.exports.getContract = function(id) {
  return models.Contract.findById(id);
}

// Get individual contract by searching for a field value
module.exports.getContractByField = function(field, value) {
  var query = [];
  query[field] = value;
  return models.Contract.find(query, function(err, contract) {});
}

// Get a field of a contract document, searching user by ID
module.exports.getContractField = function(id, field) {
  return models.Contract.findById(id, field, function(err, contract) {});
}

// Get contracts by price range
module.exports.getContractsByPrice = function(lowlimit, highlimit) {
  return models.Contract.
    find().
    where('budget').gt(lowlimit).lt(highlimit).
    exec();
}

// Get contracts by skill tag
module.exports.getContractsByTag = function(skill) {
  return models.Contract.find({skillTags: skill});
}

// Set a user document field, searching user by ID
module.exports.setUserField = function(id, field, value) {
  var query = [];
  query[field] = value;
  return models.User.findByIdAndUpdate(id, {$set: query}, function(err, user) {});
}

// Set a user document field, searching user by ID
module.exports.setProjectField = function(id, field, value) {
  var query = [];
  query[field] = value;
  return models.Project.findByIdAndUpdate(id, {$set: query});
}

// Set a user document field, searching user by ID
module.exports.setContractField = function(id, field, value) {
  var query = [];
  query[field] = value;
  return models.Contract.findByIdAndUpdate(id, {$set: query});
}

// Push a value to a field in the user schema
module.exports.pushUserField = function(id, field, value) {
  var query = [];
  query[field] = value;
  return models.User.findByIdAndUpdate(id, {$push: query});
}

// Push a value to a field in the project schema
module.exports.pushProjectField = function(id, field, value) {
  var query = [];
  query[field] = value;
  return models.Project.findByIdAndUpdate(id, {$push: query});
}

// Push a value to a field in the contract schema
module.exports.pushContractField = function(id, field, value) {
  var query = [];
  query[field] = value;
  return models.Contract.findByIdAndUpdate(id, {$push: query});
}

module.exports.models = models;
module.exports.connect = connect;
