var mongoose = require('mongoose');

module.exports = function(createSamples) {
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
  db.once("open", function() {
    console.log('MongoDB connection opened to ' + dbUrl);
  });
  db.on("error", console.error.bind(console, 'DATABASE ERROR:'));
  if (createSamples) {
    this.initSampleDb();
  }
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
    'detailedInfos',
    'showcases',
    'projects',
    'jobs',
    'reports']
  for (var i = 0; i<collectionsToDrop.length; i++) {
    mongoose.connection.collections[collectionsToDrop[i]].drop();
  }
  // Create users
  module.exports.createUser('dtrump', 'passwordhashtrump', 'dtrump@gmail.com', function(err, user) {
    module.exports.setUserField(user._id, 'name', 'Donald Trump');
    module.exports.setUserField(user._id, 'title', 'Republican Presidential Nominee');
    module.exports.setUserField(user._id, 'bio', 'I am the greatest candidate for this position!');
    module.exports.pushUserField(user._id, 'tags', 'Republican Party');
    module.exports.pushUserField(user._id, 'tags', 'GOP');
    module.exports.setUserField(user._id, 'isVerified', true);
    module.exports.setUserField(user._id, 'timeVerified', Date.now());
    module.exports.setUserField(user._id, 'url', 'http://www.trump.com/');
    // Create projects
    module.exports.getUserByField('username', 'dtrump', function(err, creator) {
      console.log('creator is:');
      console.log(creator);
      module.exports.createProject('Trump for President!', creator._id, function(err, project) {
        module.exports.pushProjectField(project._id, 'tags', 'USA Presidential Campaign');
        module.exports.pushProjectField(project._id, 'tags', 'Republican Party');
        module.exports.pushProjectField(project._id, 'tags', 'GOP');
        module.exports.getUserByField('username', 'vputin', function(err, user) {
          module.exports.pushProjectField(project._id, 'members', user._id);
        });
        module.exports.setProjectField(project._id, 'basicInfo',
          'This is basic information about the project!');
        module.exports.setProjectField(project._id, 'detailedInfo', 'This is a much much much much much\
          much much much much much much much much much much much much much much much \
          much much much much much much much much much much much much much much much \
          much much much much much much much much much much much much much much much \
          much much much much much much much much much longer information section');
      }, function(err, project) {
        module.exports.createJob(
          'Website Designer', project._id, creator._id, Date.now(), 1500, function(err, job) {
            module.exports.setJobField(job._id, 'intro',
              'This is the introduction to the job!');
            module.exports.pushJobField(job._id, 'descriptionTags', 'Webdev');
            module.exports.pushJobField(job._id, 'descriptionTags', 'Campaigning');
            module.exports.setJobField(job._id, 'details',
              'These are the details for the job!');
            module.exports.setJobField(job._id, 'url', 'http://www.trump.com/connect-with-us/');
        });
        module.exports.createJob(
          'Campaign Stumper', project._id, creator._id, Date.now(), 5000, function(err, job) {
            module.exports.setJobField(job._id, 'intro',
              'This is the introduction to the job!');
            module.exports.pushJobField(job._id, 'descriptionTags', 'Webdev');
            module.exports.pushJobField(job._id, 'descriptionTags', 'Campaigning');
            module.exports.setJobField(job._id, 'details',
              'These are the details for the job!');
            module.exports.setJobField(job._id, 'url', 'http://www.trump.com/connect-with-us/');
        });
      });
    });
  });
  module.exports.createUser('bsanders', 'passwordhashsanders', 'bsanders@gmail.com', function(err, user) {
    module.exports.setUserField(user._id, 'name', 'Bernie Sanders');
    module.exports.setUserField(user._id, 'title', 'Democratic Presidential Nominee Runner-up');
    module.exports.setUserField(user._id, 'bio', 'I wish I had gotten that position!');
    module.exports.setUserField(user._id, 'isVerified', true);
    module.exports.setUserField(user._id, 'timeVerified', Date.now());
    module.exports.setUserField(user._id, 'url', 'http://www.sanders.senate.gov/');
    // Create projects
    module.exports.getUserByField('username', 'bsanders', function(err, creator) {
      module.exports.createProject('Sanders for President!', creator._id, function(err, project) {
        module.exports.pushProjectField(project._id, 'tags', 'USA Presidential Campaign');
        module.exports.pushProjectField(project._id, 'tags', 'Democratic Party');
        module.exports.pushProjectField(project._id, 'tags', 'DNC');
        module.exports.setProjectField(project._id, 'basicInfo',
          'This is basic information about the project!');
        module.exports.setProjectField(project._id, 'detailedInfo', 'This is a much much much \
          much much much much much much much much much much much much much much \
          much much much much much much much much much much much much much much \
          much much much much much much much much much much much much much much \
          much much much much much much much much much longer information section');
      });
    });
  });
  module.exports.createUser('vputin', 'passwordhashputin', 'vputin@gmail.com', function(err, user) {
    module.exports.setUserField(user._id, 'name', 'Vladimir Putin');
    module.exports.setUserField(user._id, 'title', 'Russian Overlord');
    module.exports.setUserField(user._id, 'bio', 'I rule Russia, forever.');
    module.exports.setUserField(user._id, 'isVerified', true);
    module.exports.setUserField(user._id, 'timeVerified', Date.now());
    module.exports.setUserField(user._id, 'url', 'http://eng.putin.kremlin.ru/');
  });
  module.exports.createUser('hclinton', 'passwordhashclinton', 'human@robots.gov', function(err, user) {
    module.exports.setUserField(user._id, 'name', 'Hillary Clinton');
    module.exports.setUserField(user._id, 'title', 'Democratic Presidential Nominee');
    module.exports.setUserField(user._id, 'bio', 'VOTE FOR ME, HUMANS!');
    module.exports.setUserField(user._id, 'isVerified', true);
    module.exports.setUserField(user._id, 'timeVerified', Date.now());
    module.exports.setUserField(user._id, 'url', 'https://www.hillaryclinton.com/');
  });
  // Create followings
  module.exports.getUserByField('username', 'dtrump', function(err, user) {
    module.exports.getUserByField('username', 'vputin', function(err, otherUser) {
      module.exports.pushUserField(user._id, 'following', otherUser._id);
    });
    module.exports.getUserByField('username', 'vputin', function(err, otherUser) {
      module.exports.pushUserField(user._id, 'contacts', otherUser._id);
    });
    module.exports.getUserByField('username', 'hclinton', function(err, otherUser) {
      module.exports.pushUserField(user._id, 'blocked', otherUser._id);
    });
  });
  module.exports.getUserByField('username', 'bsanders', function(err, user) {
    module.exports.getUserByField('username', 'hclinton', function(err, otherUser) {
      module.exports.pushUserField(user._id, 'following', otherUser._id);
    });
  });
  module.exports.getUserByField('username', 'vputin', function(err, user) {
    module.exports.getUserByField('username', 'dtrump', function(err, otherUser) {
      module.exports.pushUserField(user._id, 'following', otherUser._id);
    });
    module.exports.getUserByField('username', 'dtrump', function(err, otherUser) {
      module.exports.pushUserField(user._id, 'contacts', otherUser._id);
    });
    module.exports.getUserByField('username', 'bsanders', function(err, otherUser) {
      module.exports.pushUserField(user._id, 'blocked', otherUser._id);
    });
  });
  module.exports.getUserByField('username', 'hclinton', function(err, otherUser) {
    module.exports.getUserByField('username', 'bsanders', function(err, user) {
      module.exports.pushUserField(user._id, 'following', otherUser._id);
    });
  });
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
  var query = [];
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
  var query = [];
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
  var query = [];
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
