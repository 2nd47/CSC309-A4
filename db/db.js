var mongoose = require('mongoose');

var models = require("./models.js");
var url = process.env.MONGODB_URI || 'mongodb://localhost/appdb';
var sampleInit = process.env.INIT_SAMPLE_DB || false;

var connect = function(callback) {
  mongoose.connect(url);

  var db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", function() {
    if (sampleInit) {
      initSampleDb();
    }
    callback();
  });
}

// Init sample database info
var sample_data_init = false;
module.exports.initSampleDb = function() {
  if (sample_data_init) {
    return;
  } else {
    sample_data_init = true;
  }
  // Clear database
  collectionsToDrop = [
    'skills',
    'messages',
    'broadcasts',
    'chats',
    'users',
    'detailedinfos',
    'showcases',
    'projects',
    'jobs',
    'reports']
  for (var i; i<collectionsToDrop.length; i++) {
      mongoose.connection.collections[collectionsToDrop[i]].drop();
  }
  // Create users
  this.createUser('dtrump', 'passwordhashtrump', 'dtrump@gmail.com', function(err, user) {
    this.setUserField(user._id, 'name', 'Donald Trump');
    this.setUserField(user._id, 'title', 'Republican Presidential Nominee');
    this.setUserField(user._id, 'bio', 'I am the greatest candidate for this position!');
    this.pushUserField(user._id, 'tags', 'Republican Party');
    this.pushUserField(user._id, 'tags', 'GOP');
    this.setUserField(user._id, 'isVerified', true);
    this.setUserField(user._id, 'timeVerified', Date.now());
    this.setUserField(user._id, 'url', 'http://www.trump.com/');
  });
  this.createUser('bsanders', 'passwordhashsanders', 'bsanders@gmail.com', function(err, user) {
    this.setUserField(user._id, 'name', 'Bernie Sanders');
    this.setUserField(user._id, 'title', 'Democratic Presidential Nominee Runner-up');
    this.setUserField(user._id, 'bio', 'I wish I had gotten that position!');
    this.setUserField(user._id, 'isVerified', true);
    this.setUserField(user._id, 'timeVerified', Date.now());
    this.setUserField(user._id, 'url', 'http://www.sanders.senate.gov/');
  });
  this.createUser('vputin', 'passwordhashputin', 'vputin@gmail.com', function(err, user) {
    this.setUserField(user._id, 'name', 'Vladimir Putin');
    this.setUserField(user._id, 'title', 'Russian Overlord');
    this.setUserField(user._id, 'bio', 'I rule Russia, forever.');
    this.setUserField(user._id, 'isVerified', true);
    this.setUserField(user._id, 'timeVerified', Date.now());
    this.setUserField(user._id, 'url', 'http://eng.putin.kremlin.ru/');
  });
  this.createUser('hclinton', 'passwordhashclinton', 'human@robots.gov', function(err, user) {
    this.setUserField(user._id, 'name', 'Hillary Clinton');
    this.setUserField(user._id, 'title', 'Democratic Presidential Nominee');
    this.setUserField(user._id, 'bio', 'VOTE FOR ME, HUMANS!');
    this.setUserField(user._id, 'isVerified', true);
    this.setUserField(user._id, 'timeVerified', Date.now());
    this.setUserField(user._id, 'url', 'https://www.hillaryclinton.com/');
  });
  this.getUserByField('username', 'dtrump', function(err, user) {
    this.getUserByField('username', 'vputin', function(err, otherUser) {
      this.pushUserField(user._id, 'following', otherUser._id);
    });
    this.getUserByField('username', 'vputin', function(err, otherUser) {
      this.pushUserField(user._id, 'contacts', otherUser._id);
    });
    this.getUserByField('username', 'hclinton', function(err, otherUser) {
      this.pushUserField(user._id, 'blocked', otherUser._id);
    });
  });
  this.getUserByField('username', 'bsanders', function(err, user) {
    this.getUserByField('username', 'hclinton', function(err, otherUser) {
      this.pushUserField(user._id, 'following', otherUser._id);
    });
  });
  this.getUserByField('username', 'vputin', function(err, user) {
    this.getUserByField('username', 'dtrump', function(err, otherUser) {
      this.pushUserField(user._id, 'following', otherUser._id);
    });
    this.getUserByField('username', 'dtrump', function(err, otherUser) {
      this.pushUserField(user._id, 'contacts', otherUser._id);
    });
    this.getUserByField('username', 'bsanders', function(err, otherUser) {
      this.pushUserField(user._id, 'blocked', otherUser._id);
    });
  });
  this.getUserByField('username', 'hclinton', function(err, otherUser) {
    this.getUserByField('username', 'bsanders', function(err, user) {
      this.pushUserField(user._id, 'following', otherUser._id);
    });
  });
  // Create projects
  this.getUserByField('username', 'dtrump', function(err, creator) {
    this.createProject('Trump for President!', creator._id, function(err, project) {
      this.pushProjectField(project._id, 'tags', 'USA Presidential Campaign');
      this.pushProjectField(project._id, 'tags', 'Republican Party');
      this.pushProjectField(project._id, 'tags', 'GOP');
      this.getUserByField('username', 'vputin', function(err, user) {
        this.pushProjectField(project._id, 'members', user._id);
      });
      this.setProjectField(project._id, 'basicInfo',
        'This is basic information about the project!');
      this.setProjectField(project._id, 'detailedInfo', 'This is a much much much much much\
        much much much much much much much much much much much much much much much \
        much much much much much much much much much much much much much much much \
        much much much much much much much much much much much much much much much \
        much much much much much much much much much longer information section');
    }, function(err, project) {
      this.createJob(
        'Website Designer', project._id, creator._id, Date.now(), 1500, function(err, job) {
          this.setJobField(job._id, 'intro',
            'This is the introduction to the job!');
          this.pushJobField(job._id, 'descriptionTags', 'Webdev');
          this.pushJobField(job._id, 'descriptionTags', 'Campaigning');
          this.setJobField(job._id, 'details',
            'These are the details for the job!');
          this.setJobField(job._id, 'url', 'http://www.trump.com/connect-with-us/');
      });
      this.createJob(
        'Campaign Stumper', project._id, creator._id, Date.now(), 5000, function(err, job) {
          this.setJobField(job._id, 'intro',
            'This is the introduction to the job!');
          this.pushJobField(job._id, 'descriptionTags', 'Webdev');
          this.pushJobField(job._id, 'descriptionTags', 'Campaigning');
          this.setJobField(job._id, 'details',
            'These are the details for the job!');
          this.setJobField(job._id, 'url', 'http://www.trump.com/connect-with-us/');
      });
    });
  })
  this.getUserByField('username', 'bsanders', function(err, creator) {
    this.createProject('Sanders for President!', creator._id, function(err, project) {
      this.pushProjectField(project._id, 'tags', 'USA Presidential Campaign');
      this.pushProjectField(project._id, 'tags', 'Democratic Party');
      this.pushProjectField(project._id, 'tags', 'DNC');
      this.setProjectField(project._id, 'basicInfo',
        'This is basic information about the project!');
      this.setProjectField(project._id, 'detailedInfo', 'This is a much much much \
        much much much much much much much much much much much much much much \
        much much much much much much much much much much much much much much \
        much much much much much much much much much much much much much much \
        much much much much much much much much much longer information section');
    });
  });
  // Create reports
}

// Create a new user given the required fields
module.exports.createUser = function(username, passwordHash, email, callback) {
  var user = new models.User();
  user.username = username;
  user.passwordHash = passwordHash;
  user.email = email;
  user.save(callback);
}

// Create a new project given the required fields
module.exports.createProject = function(name, owner, callback) {
  var project = new models.Project();
  project.name = name;
  project.owner = owner;
  project.members = [owner];
  project.save(callback);
}

// Create a new job given the required fields
module.exports.createJob = function(name, project, owner, deadline, budget, callback) {
  var job = new models.Job();
  job.name = name;
  job.project = project;
  job.owner = owner;
  job.deadline = deadline;
  job.budget = budget;
  job.save(callback);
  pushUserField('owner', 'jobs', job._id);
  pushProjectField('project', 'jobs', job._id);
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
  var query = [];
  query[field] = value;
  return models.User.find(query, callback);
}

// Get individual project by searching for ID
module.exports.getProject = function(id, callback) {
  return models.Project.findById(id, callback);
}

// Get a field of a project document, searching user by ID
module.exports.getProjectField = function(id, field, callback) {
  return models.Project.findById(id, field, callback);
}

// Get individual project by searching for a field value
module.exports.getProjectByField = function(field, value, callback) {
  var query = [];
  query[field] = value;
  return models.Project.find(query, callback);
}

// Get all projects associated with a user
module.exports.getProjectsByUsername = function(user, callback) {
  var userId = user._id;
  var query = { $or: [
      {'owner': userId},
      {'members.user': userId}
    ]
  };
  return Project.find(query, callback);
}

// Get projects by tag
module.exports.getProjectsByTag = function(tagString, callback) {
  return models.Project.find({tags: tagString}, callback);
}

// Get individual job by searching for ID
module.exports.getJob = function(id, callback) {
  return models.Job.findById(id, callback);
}

// Get individual job by searching for a field value
module.exports.getJobByField = function(field, value, callback) {
  var query = [];
  query[field] = value;
  return models.Job.find(query, callback);
}

// Get a field of a job document, searching user by ID
module.exports.getJobField = function(id, field, callback) {
  return models.Job.findById(id, field, callback);
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
  return models.Job.find({skillTags: skill});
}

// Set a user document field, searching user by ID
module.exports.setUserField = function(id, field, value, callback) {
  var query = [];
  query[field] = value;
  return models.User.findByIdAndUpdate(id, {$set: query}, callback);
}

// Set a user document field, searching user by ID
module.exports.setProjectField = function(id, field, value, callback) {
  var query = [];
  query[field] = value;
  return models.Project.findByIdAndUpdate(id, {$set: query}, callback);
}

// Set a user document field, searching user by ID
module.exports.setJobField = function(id, field, value, callback) {
  var query = [];
  query[field] = value;
  return models.Job.findByIdAndUpdate(id, {$set: query}, callback);
}

// Push a value to a field in the user schema
module.exports.pushUserField = function(id, field, value, callback) {
  var query = [];
  query[field] = value;
  return models.User.findByIdAndUpdate(id, {$push: query}, callback);
}

// Push a value to a field in the project schema
module.exports.pushProjectField = function(id, field, value, callback) {
  var query = [];
  query[field] = value;
  return models.Project.findByIdAndUpdate(id, {$push: query}, callback);
}

// Push a value to a field in the job schema
module.exports.pushJobField = function(id, field, value, callback) {
  var query = [];
  query[field] = value;
  return models.Job.findByIdAndUpdate(id, {$push: query}, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    if(err) throw err;
    callback(null, isMatch);
  });
};

module.exports.models = models;
module.exports.connect = connect;
