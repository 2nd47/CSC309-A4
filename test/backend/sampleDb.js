var mongoose = require('mongoose');

// Init sample database info
var sample_data_init = false;

module.exports = function(app, auth, user, project, job, search) {
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
    'showcases',
    'projects',
    'jobs']
  for (var i = 0; i<collectionsToDrop.length; i++) {
    console.log(collectionsToDrop[i]);
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
