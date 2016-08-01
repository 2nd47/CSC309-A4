var mongoose = require('mongoose'),
    bcrypt = require('bcryptjs'),
    User = require('../../app/models/user'),
    Project = require('../../app/models/project'),
    Job = require('../../app/models/job');

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
    'projects',
    'jobs']
  for (var i = 0; i<collectionsToDrop.length; i++) {
    console.log('Dropping collection ' + collectionsToDrop[i]);
    mongoose.connection.collections[collectionsToDrop[i]].drop(function(err) {
      console.log('Dropped!');
    });
  }

  User.remove(function(err, removed) {
    Project.remove(function(err, removed) {
      Job.remove(function(err, removed) {
        console.log('All databases dropped!');
        createSampleDb();
      });
    });
  });

  var createSampleDb = function() {
    // Create users
    var user1 = User({
      username: 'dtrump',
      passwordHash: bcrypt.hashSync('passwordtrump'),
      email: 'dtrump@gmail.com',
      name: 'Donald Trump',
      title: 'Republican Presidential Nominee',
      bio: 'I am the greatest candidate for this position!',
      tags: 'Republican Party',
      isVerified: true,
      timeVerified: Date.now(),
      url: 'http://www.trump.com/'
    });
    var user2 = User({
      username: 'bsanders',
      passwordHash: bcrypt.hashSync('passwordsanders'),
      email: 'bsanders@gmail.com',
      name: 'Bernie Sanders',
      title: 'Democratic Presidential Nominee Runner-up',
      bio: 'I wish I had gotten that position!',
      isVerified: true,
      timeVerified: Date.now(),
      url: 'http://www.sanders.senate.gov/'
    });
    var user3 = User({
      username: 'vputin',
      passwordHash: bcrypt.hashSync('passwordputin'),
      email: 'vputin@gmail.com',
      name: 'Vladimir Putin',
      title: 'Russian Overlord',
      bio: 'I rule Russia forever!!!',
      isVerified: true,
      timeVerified: Date.now(),
      url: 'http://eng.putin.kremlin.ru/'
    });
    var user4 = User({
      username: 'aida',
      passwordHash: bcrypt.hashSync('aidapass'),
      email: 'aidawebapp@gmail.com',
      name: 'AIDA Master',
      bio: 'Hello, I am the adminstrator account for AIDA!',
      isVerified: true,
      timeVerified: Date.now(),
      url: 'https://www.hillaryclinton.com/'
    });
    // Save users
    user1.save(function(err, dtrump) {
      if (err) { console.log(err); }
      console.log('User created with: ' + dtrump);
      user2.save(function(err, bsanders) {
        if (err) { console.log(err); }
        console.log('User created with ' + bsanders);
        user3.save(function(err, vputin) {
          if (err) { console.log(err); }
          console.log('User created with ' + vputin);
          user4.save(function(err, hclinton) {
            if (err) { console.log(err); }
            console.log('User created with ' + hclinton);
            // Projects
            var project1 = Project({
              name: 'Trump for President!',
              owner: user1._id,
              tags: [
                'GOP',
                'Republican',
                'USA'
              ],
              members: [
                user3._id
              ],
              status: 'Active',
              basicInfo: 'This is basic information about the project!',
              detailedInfo: 'This is a much much much much much\
                much much much much much much much much much much much much much \
                much much much much much much much much much much much much much \
                much much much much much much much much much much much much much \
                much much much much much much much longer information section'
            });
            var project2 = Project({
              name: 'Sanders for President!',
              owner: user2._id,
              tags: [
                'USA',
                'Democratic',
                'DNC'
              ],
              status: 'Closed',
              basicInfo: 'This is basic information about the project!',
              detailedInfo: 'This is a much much much \
                much much much much much much much much much much much much much much \
                much much much much much much much much much much much much much much \
                much much much much much much much much much much much much much much \
                much much much much much much much much much longer information section'
            });
            project1.save(function(err, trumpProj) {
              if (err) { console.log(err); }
              console.log('project created ' + trumpProj);
              project2.save(function(err, sandersProj) {
                if (err) { console.log(err); }
                console.log('project created ' + sandersProj);
                var job1 = Job({
                  name: 'Website Designer',
                  project: project1._id,
                  owner: user1._id,
                  deadline: Date.now(),
                  budget: 1500,
                  intro: 'Need someone to make a great pro-Trump website!',
                  descriptionTags: [
                    'Webdev',
                    'Campaigning'
                  ],
                  details: 'These are the details for the job!',
                  url: 'http://www.trump.com/connect-with-us/'
                });
                var job2 = Job({
                  name: 'Campaign Stumper',
                  project: project1._id,
                  owner: user1._id,
                  deadline: Date.now(),
                  budget: 5000,
                  intro: 'Need someone to stump nay-sayers!',
                  descriptionTags: [
                    'Propoganda',
                    'Campaigning'
                  ],
                  details: 'These are the details for the job!',
                  url: 'http://www.trump.com/connect-with-us'
                });
                job1.save(function(err, job1) {
                  if (err) { console.log(err); }
                  console.log('job created at ' + job1);
                });
                job2.save(function(err, job2) {
                  if (err) { console.log(err); }
                  console.log('job created at ' + job2);
                });
              });
            });
          });
        });
      });
    });
  }
  /*
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
  */
}
