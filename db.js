var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

module.exports = function() {
  var dbUri = process.env.MONGODB_URI || 'mongodb://localhost/appdb';
  mongoose.connect(dbUri, {
      server: {
          auto_reconnect: true,
          socketOptions: {
              keepAlive: 1
          }
      }
  });
  var db = mongoose.connection;
  mongoose.promise = global.promise;
  db.once("open", function() {
    console.log('MongoDB connection opened to ' + dbUri);
  });
  db.on("error", console.error.bind(console, 'DATABASE ERROR:'));
}

// Create a new project given the required fields
module.exports.createProject = function(name, owner, callback) {
  var project = new models.Project();
  project.name = name;
  project.owner = owner;
  project.members = [owner];
  project.save(function(err, project) {
    if (err) { console.log(err); }
    else { callback(err, project); }
  });
  console.log('Created Project ' + project);
}

// Create a new job given the required fields
module.exports.createJob = function(name, project, owner, deadline, budget, callback) {
  var job = new models.Job();
  job.name = name;
  job.project = project;
  job.owner = owner;
  job.deadline = deadline;
  job.budget = budget;
  job.save(function(err, job) {
    if (err) { console.log(err); }
    else { callback(err, job); }
  });
  pushUserField('owner', 'jobs', job._id);
  pushProjectField('project', 'jobs', job._id);
  console.log('Created Job ' + job);
}

// Create a new message
module.exports.createMessage = function(sender, receiver, text, callback) {
  var message = new models.Message();
  message.sender = sender;
  message.text = text;
  message.save(function(err, message) {
    getContact(sender, receiver, function(err, contact) {
      models.Contact.findByIdAndUpdate(contact._id, {$push: {'messages':message}});
    }, callback);
  });
}

module.exports.readMessage = function(message, callback) {
  models.Message.findByIdAndUpdate(message._id, {
    $set: {
      'unread' : true
    }
  }, callback);
}

// Get a contact doc associated with this user and the other user
module.exports.getContact = function(userOne, userTwo, callback) {
  models.Contact.findOne({
    $or:[
      {'personOne': userOne, 'personTwo': userTwo},
      {'personOne': userTwo, 'personOne': userOne}
    ]}, callback);
}

// Create a new dialogue
module.exports.createDialogue = function(personOne, personTwo, callback) {
  var contact = new models.Dialogue();
  contact.personOne = personOne;
  contact.personTwo = personTwo;
  contact.save(callback);
}

// Create a new skill
module.exports.createSkill = function(name, rating, callback) {
  var skill = new models.Skill();
  skill.name = name;
  skill.rating = rating;
  skill.save(callback);
}

// Create a new broadcasr
module.exports.createBroadcast = function(url, message, callback) {
  var broadcast = new models.Broadcast();
  broadcast.url = url;
	broadcast.message = message;
  broadcast.save(callback);
}

// Adds a skill by ID to a user by ID
module.exports.addUserSkill = function(user, skillToAdd, callback) {
  return;
}

// Adds a skill by ID to a job by ID
module.exports.addJobSkill = function(job, skillToAdd, callback) {
  return;
}

// Adds a showcase item to a project showcase
module.exports.addShowcaseItem = function(project, itemPath, callback) {
  return;
}

// Get individual user by searching for ID
module.exports.getUser = function(id, callback) {
  return models.User.findById(id, callback);
}

// Get a field of a user document, searching user by ID
module.exports.getUserField = function(id, field, callback) {
  return models.User.findById(id, field, callback);
}

// Get individual user by searching for a field value
module.exports.getUserByField = function(field, value, callback) {
  var query = {};
  query[field] = value;
  models.User.find(query, callback);
}

// Get individual project by searching for ID
module.exports.getProject = function(id, callback) {
  models.Project.findById(id, callback);
}

// Get a field of a project document, searching user by ID
module.exports.getProjectField = function(id, field, callback) {
  models.Project.findById(id, field, callback);
}

// Get individual project by searching for a field value
module.exports.getProjectByField = function(field, value, callback) {
  var query = {};
  query[field] = value;
  models.Project.find(query, callback);
}

// Get all projects associated with a user ID
module.exports.getProjectsByUser = function(userId, callback) {
  var query = { $or: [
      {'owner': user},
      {'members.user': user}
    ]
  };
  Project.find(query, callback);
}

// Get projects by tag
module.exports.getProjectsByTag = function(tagString, callback) {
  models.Project.find({tags: tagString}, callback);
}

// Get individual job by searching for ID
module.exports.getJob = function(id, callback) {
  models.Job.findById(id, callback);
}

// Get individual job by searching for a field value
module.exports.getJobByField = function(field, value, callback) {
  var query = {};
  query[field] = value;
  models.Job.find(query, callback);
}

// Get a field of a job document, searching user by ID
module.exports.getJobField = function(id, field, callback) {
  models.Job.findById(id, field, callback);
}

// Get jobs by price range
module.exports.getJobsByPrice = function(lowlimit, highlimit, callback) {
  return models.Job.
    find().
    where('budget').gt(lowlimit).lt(highlimit).
    exec();
}

// Get jobs by skill tag
module.exports.getJobsByTag = function(skill, callback) {
  models.Job.find({skillTags: skill});
}

// Set a user document field, searching user by ID
module.exports.setUserField = function(id, field, value, callback) {
  var query = {};
  query[field] = value;
  console.log(query);
  models.User.findByIdAndUpdate(id, {$set: query}, callback);
}

// Set a user document field, searching user by ID
module.exports.setProjectField = function(id, field, value, callback) {
  var query = {};
  query[field] = value;
  models.Project.findByIdAndUpdate(id, {$set: query}, callback);
}

// Set a user document field, searching user by ID
module.exports.setJobField = function(id, field, value, callback) {
  var query = {};
  query[field] = value;
  models.Job.findByIdAndUpdate(id, {$set: query}, callback);
}

// Push a value to a field in the user schema
module.exports.pushUserField = function(id, field, value, callback) {
  var query = {};
  query[field] = value;
 models.User.findByIdAndUpdate(id, {$push: query}, callback);
}

// Push a value to a field in the project schema
module.exports.pushProjectField = function(id, field, value, callback) {
  var query = {};
  query[field] = value;
  models.Project.findByIdAndUpdate(id, {$push: query}, callback);
}

// Push a value to a field in the job schema
module.exports.pushJobField = function(id, field, value, callback) {
  var query = {};
  query[field] = value;
  models.Job.findByIdAndUpdate(id, {$push: query}, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    if(err) throw err;
    callback(null, isMatch);
  });
};
