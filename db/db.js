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
  } else {
    sample_data_init = true;
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
  createUser('dtrump', 'passwordhashtrump', 'dtrump@gmail.com', function(err, user) {
    setUserField(user._id, 'name', 'Donald Trump');
    setUserField(user._id, 'title', 'Republican Presidential Nominee');
    setUserField(user._id, 'bio', 'I am the greatest candidate for this position!');
    pushUserField(user._id, 'tags', 'Republican Party');
    pushUserField(user._id, 'tags', 'GOP');
    setUserField(user._id, 'isVerified', true);
    setUserField(user._id, 'timeVerified', Date.now());
    setUserField(user._id, 'url', 'http://www.trump.com/');
  });
  createUser('bsanders', 'passwordhashsanders', 'bsanders@gmail.com', function(err, user) {
    setUserField(user._id, 'name', 'Bernie Sanders');
    setUserField(user._id, 'title', 'Democratic Presidential Nominee Runner-up');
    setUserField(user._id, 'bio', 'I wish I had gotten that position!');
    setUserField(user._id, 'isVerified', true);
    setUserField(user._id, 'timeVerified', Date.now());
    setUserField(user._id, 'url', 'http://www.sanders.senate.gov/');
  });
  createUser('vputin', 'passwordhashputin', 'vputin@gmail.com', function(err, user) {
    setUserField(user._id, 'name', 'Vladimir Putin');
    setUserField(user._id, 'title', 'Russian Overlord');
    setUserField(user._id, 'bio', 'I rule Russia, forever.');
    setUserField(user._id, 'isVerified', true);
    setUserField(user._id, 'timeVerified', Date.now());
    setUserField(user._id, 'url', 'http://eng.putin.kremlin.ru/');
  });
  createUser('hclinton', 'passwordhashclinton', 'human@robots.gov', function(err, user) {
    setUserField(user._id, 'name', 'Hillary Clinton');
    setUserField(user._id, 'title', 'Democratic Presidential Nominee');
    setUserField(user._id, 'bio', 'VOTE FOR ME, HUMANS!');
    setUserField(user._id, 'isVerified', true);
    setUserField(user._id, 'timeVerified', Date.now());
    setUserField(user._id, 'url', 'https://www.hillaryclinton.com/');
  });
  getUserByField('username', 'dtrump', function(err, user) {
    getUserByField('username', 'vputin', function(err, otherUser) {
      pushUserField(user._id, 'following', otherUser._id);
    });
    getUserByField('username', 'vputin', function(err, otherUser) {
      pushUserField(user._id, 'contacts', otherUser._id);
    });
    getUserByField('username', 'hclinton', function(err, otherUser) {
      pushUserField(user._id, 'blocked', otherUser._id);
    });
  });
  getUserByField('username', 'bsanders', function(err, user) {
    getUserByField('username', 'hclinton', function(err, otherUser) {
      pushUserField(user._id, 'following', otherUser._id);
    });
  });
  getUserByField('username', 'vputin', function(err, user) {
    getUserByField('username', 'dtrump', function(err, otherUser) {
      pushUserField(user._id, 'following', otherUser._id);
    });
    getUserByField('username', 'dtrump', function(err, otherUser) {
      pushUserField(user._id, 'contacts', otherUser._id);
    });
    getUserByField('username', 'bsanders', function(err, otherUser) {
      pushUserField(user._id, 'blocked', otherUser._id);
    });
  });
  getUserByField('username', 'hclinton', function(err, otherUser) {
    getUserByField('username', 'bsanders', function(err, user) {
      pushUserField(user._id, 'following', otherUser._id);
    });
  });
  // Create projects
  getUserByField('username', 'dtrump', function(err, creator) {
    createProject('Trump for President!', creator._id, function(err, project) {
      pushProjectField(project._id, 'tags', 'USA Presidential Campaign');
      pushProjectField(project._id, 'tags', 'Republican Party');
      pushProjectField(project._id, 'tags', 'GOP');
      getUserByField('username', 'vputin', function(err, user) {
        pushProjectField(project._id, 'members', user._id);
      });
      setProjectField(project._id, 'basicInfo',
        'This is basic information about the project!');
      setProjectField(project._id, 'detailedInfo', 'This is a much much much much much\
        much much much much much much much much much much much much much much much \
        much much much much much much much much much much much much much much much \
        much much much much much much much much much much much much much much much \
        much much much much much much much much much longer information section');
    }, function(err, project) {
      createContract(
        'Website Designer', project._id, creator._id, Date.now(), 1500, function(err, contract) {
          setContractField(contract._id, 'intro',
            'This is the introduction to the contract!');
          pushContractField(contract._id, 'descriptionTags', 'Webdev');
          pushContractField(contract._id, 'descriptionTags', 'Campaigning');
          setContractField(contract._id, 'details',
            'These are the details for the contract!');
          setContractField(contract._id, 'url', 'http://www.trump.com/connect-with-us/');
      });
      createContract(
        'Campaign Stumper', project._id, creator._id, Date.now(), 5000, function(err, contract) {
          setContractField(contract._id, 'intro',
            'This is the introduction to the contract!');
          pushContractField(contract._id, 'descriptionTags', 'Webdev');
          pushContractField(contract._id, 'descriptionTags', 'Campaigning');
          setContractField(contract._id, 'details',
            'These are the details for the contract!');
          setContractField(contract._id, 'url', 'http://www.trump.com/connect-with-us/');
      });
    });
  })
  getUserByField('username', 'bsanders', function(err, creator) {
    createProject('Sanders for President!', creator._id, function(err, project) {
      pushProjectField(project._id, 'tags', 'USA Presidential Campaign');
      pushProjectField(project._id, 'tags', 'Democratic Party');
      pushProjectField(project._id, 'tags', 'DNC');
      setProjectField(project._id, 'basicInfo',
        'This is basic information about the project!');
      setProjectField(project._id, 'detailedInfo', 'This is a much much much much much\
        much much much much much much much much much much much much much much much \
        much much much much much much much much much much much much much much much \
        much much much much much much much much much much much much much much much \
        much much much much much much much much much longer information section');
    });
  });
  // Create reports
}

// Create a new user given the required fields
module.exports.createUser = function(username, passwordHash, email, callback) {
  var user = new User();
  user.username = username;
  user.passwordHash = passwordHash;
  user.email = email;
  user.save(callback);
}

// Create a new project given the required fields
module.exports.createProject = function(name, owner, callback) {
  var project = new Project();
  project.name = name;
  project.owner = owner;
  project.members = [owner];
  project.save(callback);
}

// Create a new contract given the required fields
module.exports.createContract = function(name, project, owner, deadline, budget, callback) {
  var contract = new Contract();
  contract.name = name;
  contract.project = project;
  contract.owner = owner;
  contract.deadline = deadline;
  contract.budget = budget;
  pushUserField(owner, 'contracts', contract);
  pushProjectField(project, 'contracts', contract);
  contract.save(callback);
}

// Create a new message
module.exports.createMessage = function(sender, receiver, text, callback) {
  var message = new Message();
  message.sender = sender;
  message.text = text;
  message.save(function(err, message) {
    getContact(sender, receiver, function(err, contact) {
      models.Contact.findByIdAndUpdate(contact._id, {$push: {'messages':message}});
    }, callback;
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
  var contact = new Dialogue();
  contact.personOne = personOne;
  contact.personTwo = personTwo;
  contact.save(callback);
}

// Create a new skill
module.exports.createSkill = function(name, rating, callback) {
  var skill = new Skill();
  skill.name = name;
  skill.rating = rating;
  skill.save(callback);
}

// Create a new broadcasr
module.exports.createBroadcast = function(url, message, callback) {
  var broadcast = new Broadcast();
  broadcast.url = url;
	broadcast.message = message;
  broadcast.save(callback);
}

// Adds a skill by ID to a user by ID
module.exports.addUserSkill = function(user, skillToAdd, callback) {
  return;
}

// Adds a skill by ID to a contract by ID
module.exports.addContractSkill = function(contract, skillToAdd, callback) {
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

// Get individual contract by searching for ID
module.exports.getContract = function(id, callback) {
  return models.Contract.findById(id, callback);
}

// Get individual contract by searching for a field value
module.exports.getContractByField = function(field, value, callback) {
  var query = [];
  query[field] = value;
  return models.Contract.find(query, callback);
}

// Get a field of a contract document, searching user by ID
module.exports.getContractField = function(id, field, callback) {
  return models.Contract.findById(id, field, callback);
}

// Get contracts by price range
module.exports.getContractsByPrice = function(lowlimit, highlimit, callback) {
  return models.Contract.
    find().
    where('budget').gt(lowlimit).lt(highlimit).
    exec();
}

// Get contracts by skill tag
module.exports.getContractsByTag = function(skill, callback) {
  return models.Contract.find({skillTags: skill});
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
module.exports.setContractField = function(id, field, value, callback) {
  var query = [];
  query[field] = value;
  return models.Contract.findByIdAndUpdate(id, {$set: query}, callback);
}

<<<<<<< HEAD
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

// Push a value to a field in the contract schema
module.exports.pushContractField = function(id, field, value, callback) {
  var query = [];
  query[field] = value;
  return models.Contract.findByIdAndUpdate(id, {$push: query}, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    if(err) throw err;
    callback(null, isMatch);
  });
};

module.exports.models = models;
module.exports.connect = connect;
