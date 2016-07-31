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
  user.createUser('dtrump', 'passwordhashtrump', 'dtrump@gmail.com', function(err, user) {
    user.setUserField(user._id, 'name', 'Donald Trump');
    user.setUserField(user._id, 'title', 'Republican Presidential Nominee');
    user.setUserField(user._id, 'bio', 'I am the greatest candidate for this position!');
    user.pushUserField(user._id, 'tags', 'Republican Party');
    user.pushUserField(user._id, 'tags', 'GOP');
    user.setUserField(user._id, 'isVerified', true);
    user.setUserField(user._id, 'timeVerified', Date.now());
    user.setUserField(user._id, 'url', 'http://www.trump.com/');
    // Create projects
    user.getUserByField('username', 'dtrump', function(err, creator) {
      console.log('creator is:');
      console.log(creator);
      project.createProject('Trump for President!', creator._id, function(err, project) {
        project.pushProjectField(project._id, 'tags', 'USA Presidential Campaign');
        project.pushProjectField(project._id, 'tags', 'Republican Party');
        project.pushProjectField(project._id, 'tags', 'GOP');
        user.getUserByField('username', 'vputin', function(err, user) {
          project.pushProjectField(project._id, 'members', user._id);
        });
        project.setProjectField(project._id, 'basicInfo',
          'This is basic information about the project!');
        project.setProjectField(project._id, 'detailedInfo', 'This is a much much much much much\
          much much much much much much much much much much much much much much much \
          much much much much much much much much much much much much much much much \
          much much much much much much much much much much much much much much much \
          much much much much much much much much much longer information section');
      }, function(err, project) {
        job.createJob(
          'Website Designer', project._id, creator._id, Date.now(), 1500, function(err, job) {
            job.setJobField(job._id, 'intro',
              'This is the introduction to the job!');
            job.pushJobField(job._id, 'descriptionTags', 'Webdev');
            job.pushJobField(job._id, 'descriptionTags', 'Campaigning');
            job.setJobField(job._id, 'details',
              'These are the details for the job!');
            job.setJobField(job._id, 'url', 'http://www.trump.com/connect-with-us/');
        });
        job.createJob(
          'Campaign Stumper', project._id, creator._id, Date.now(), 5000, function(err, job) {
            job.setJobField(job._id, 'intro',
              'This is the introduction to the job!');
            job.pushJobField(job._id, 'descriptionTags', 'Webdev');
            job.pushJobField(job._id, 'descriptionTags', 'Campaigning');
            job.setJobField(job._id, 'details',
              'These are the details for the job!');
            job.setJobField(job._id, 'url', 'http://www.trump.com/connect-with-us/');
        });
      });
    });
  });
  user.createUser('bsanders', 'passwordhashsanders', 'bsanders@gmail.com', function(err, user) {
    user.setUserField(user._id, 'name', 'Bernie Sanders');
    user.setUserField(user._id, 'title', 'Democratic Presidential Nominee Runner-up');
    user.setUserField(user._id, 'bio', 'I wish I had gotten that position!');
    user.setUserField(user._id, 'isVerified', true);
    user.setUserField(user._id, 'timeVerified', Date.now());
    user.setUserField(user._id, 'url', 'http://www.sanders.senate.gov/');
    // Create projects
    user.getUserByField('username', 'bsanders', function(err, creator) {
      project.createProject('Sanders for President!', creator._id, function(err, project) {
        project.pushProjectField(project._id, 'tags', 'USA Presidential Campaign');
        project.pushProjectField(project._id, 'tags', 'Democratic Party');
        project.pushProjectField(project._id, 'tags', 'DNC');
        project.setProjectField(project._id, 'basicInfo',
          'This is basic information about the project!');
        project.setProjectField(project._id, 'detailedInfo', 'This is a much much much \
          much much much much much much much much much much much much much much \
          much much much much much much much much much much much much much much \
          much much much much much much much much much much much much much much \
          much much much much much much much much much longer information section');
      });
    });
  });
  user.createUser('vputin', 'passwordhashputin', 'vputin@gmail.com', function(err, user) {
    user.setUserField(user._id, 'name', 'Vladimir Putin');
    user.setUserField(user._id, 'title', 'Russian Overlord');
    user.setUserField(user._id, 'bio', 'I rule Russia, forever.');
    user.setUserField(user._id, 'isVerified', true);
    user.setUserField(user._id, 'timeVerified', Date.now());
    user.setUserField(user._id, 'url', 'http://eng.putin.kremlin.ru/');
  });
  user.createUser('hclinton', 'passwordhashclinton', 'human@robots.gov', function(err, user) {
    user.setUserField(user._id, 'name', 'Hillary Clinton');
    user.setUserField(user._id, 'title', 'Democratic Presidential Nominee');
    user.setUserField(user._id, 'bio', 'VOTE FOR ME, HUMANS!');
    user.setUserField(user._id, 'isVerified', true);
    user.setUserField(user._id, 'timeVerified', Date.now());
    user.setUserField(user._id, 'url', 'https://www.hillaryclinton.com/');
  });
  // Create followings
  user.getUserByField('username', 'dtrump', function(err, user) {
    user.getUserByField('username', 'vputin', function(err, otherUser) {
      user.pushUserField(user._id, 'following', otherUser._id);
    });
    user.getUserByField('username', 'vputin', function(err, otherUser) {
      user.pushUserField(user._id, 'contacts', otherUser._id);
    });
    user.getUserByField('username', 'hclinton', function(err, otherUser) {
      user.pushUserField(user._id, 'blocked', otherUser._id);
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
