var User = require('../models/user'),
    Chat = require('../models/chat'),
    Project = require('../models/project'),
    permissionManager = require('../middleware/permission_manager');

// send all followers of the object (project or person) at given url
// the broadcast message to their messageBoard
var broadcastFollowers = function (id, url, message) {
	// Check if it's a user's id
	var object;
	User.findById(id, function(err, user){
		if (!user.length) {
			Project.findById(id, function(err, user){
				if (!project.length) {
					console.log("ERROR: something deleted is being updated");
					return;
				}
				else {
					object = project;
				}
			});
		}
		else {
			object = user;
		}
	});
	var followers = object.followers;
	var numFollowers = object.numFollowers;
	var i;
	for (i=0;i<numFollowers;i++) {
		User.findById(followers[i], function(err, follower){
			if (follower.length) {
				db.createBroadcast(url, message, function(err, broadcast){
					messageboard.push(broadcast);
					db.pushUserField(followers[i], "messageBoard", messageboard);
				})
			}
		});
	}
}

// push a message to a chat history
var pushMessage = function (sender, message, chatId) {
	db.createMessage(sender, message, function(err, message){
		Chat.findByIdAndUpdate(id, {$push: {"messages": message}});
	});
}

// send a message from the sender to the receiver
var sendMessageTo = function (sender, receiver, message) {
	// if there is existing chat, push message into the chat
	User.findById(sender, function(err, senderUser){
		User.findById(sender, function(err, receiverUser){
			if (senderUser.length && receiverUser.length) {
				var chats = senderUser.chats;
				var numChats = chats.length;
				var i;
				var chat;
				var found = false;
				for (i=0;i<numContracts;i++) {
					chat = Chat.findById(chats[i]);
					if (chat.personOne === receiver || chat.personTwo === receiver) {
						found = true;
						break;
					}
				}
				if (found) {
					// the chat exists
					pushMessage(sender, message, chat._id);
				}
				else {
					// if there is no existing chat, create a new one, add it
					// to the chat list of both users.
					var newChat =
					db.createChat(sender, receiver, function(err, chat){
						pushMessage(sender, message, chat._id);
						User.findByIdAndUpdate(sender, {$push: {"chats": newChat}});
						User.findByIdAndUpdate(receiver, {$push: {"chats": newChat}});
					});

				}
			}
			else {
				console.log("ERROR: user not found");
				return;
			}
		});
	});
}

module.exports = function(app) {
  this.renderMessagePage = function(req, res){
		res.sendFile('inbox.html', { root: "./views/" });
	}
  this.renderUserPage = function(req, res) {
    res.sendFile('profile.html', { root: "./views" });
  }
  this.getUser = function (req, res, next) {
  	/*
  	{
  		id: person id,
  		name: person's name,
  		title: person's title,
  		skills: person's skillTags,
  		tags: [tags]
  		biography: person's biography,
  		projects:
  		[
  			{
  				project_id: project id,
  				project_name: project name
  			}
  		],
  		jobs:
  		[
  			{
  				job_id: job id,
  				job_name: job name,
  				completion_date: completion date,
  				job_rating: job_rating,
  				job_comment: comment on the work
  			}
  		]
  	}*//*
  	try {
  		var json = new Object();
  		user.findByUsername(req.params.username, function(err, user){
  			if (!user.length) {
  				res.status(404);
  				// page not found
  				if (req.accepts('html')) {
  					res.render('404', { url: req.url });
  				}
  				return;
  			}
  			json.id = user._id;
  			json.name = user.name;
  			json.title = user.title;
  			json.skills = user.skillTags;
  			json.tags = user.tags;
  			json.biography = user.bio;
  			json.projects = [];
  			// Where the user is the owner
  			var projects = Project.find({"owner": user._id},{name: 1});
  			while (projects.hasNext()) {
  				var newProject = new Object();
  				var current = projects.next();
  				newProject.project_id = current._id;
  				newProject.project_name = current.name;
  				json.projects.push(newProject);
  			}
  			// Where the user is a member
  			var member_projects = Project.find({members: {$elemMatch: {"user": ObjectId(user_id)}}});
  			while (member_projects.hasNext()) {
  				var newProject = new Object();
  				var current = member_projects.next();
  				newProject.project_id = current._id;
  				newProject.project_name = current.name;
  				json.projects.push(newProject);
  			}
  			json.jobs = [];
  			var jobs = Job.find({"taker": ObjectId(user_id)});
  			while (jobs.hasNext()) {
  				var newJob = new Object();
  				var current = jobs.next();
  				newJob.job_id = current._id;
  				newJob.job_name = current.name;
  				newJob.completion_date = current.completion;
  				newJob.job_rating = current.rating;
  				newJob.job_comment = current.comment;
  				json.projects.push(newJob);
  			}
  			res.send(JSON.stringify(json));
        next();
  		});
  	}
  	catch (e) {
  		res.status(404);
  		// page not found
  		if (req.accepts('html')) {
  			res.render('404', { url: req.url });
  		}
  	}*/
    /*
     var person1 =
    {
      "id": "1",
      "name": "Jordan Belfort",
      "title": "Wolf of Wall Street",
      "avatar": "/images/users/putin.jpg",
      "skillTags": [{
        "name": "C++",
        "rating": 1
      }, {
        "name": "Banking",
        "rating": 5
      }, {
        "name": "Making Money",
        "rating": 4
      }],
      "tags": [{
        "name": "Fantasy"
      }, {
        "name": "Simulation"
      }],
      "biography": "I made a lot of money on Wall Street and got fucked by the feds.",
      "projects":  [{
        "id": "1",
        "name": "Super Awesome Game"
      }, {
        "id": "2",
        "name": "Not This Shit Again"
      }],
      "jobs": [{
        "id": "1",
        "name": "2D Animator",
        "completion_date": "August 12, 1994",
        "rating": 5,
        "comment": "Bloody brilliant mate good work made me $155,039.44!"
      }]
    }

    res.json(person1);*/
  };

  this.getPopularUsers = function (req, res) {
  	/*
  	get _id, name, title, skillTags, tags
  	{
  		topTen: [list of info];
  		following: [list of info, empty if user is not following anyone or is not logged in];
  	}
  	*/
    return res.redirect('/');

  	var json = new Object();
  	//var cursor =
    User.find(function(err, cursor) {
      console.log(err);
      console.log(cursor[0]);
        /*{"name": 1, "title": 1, "skillTags": 1, "tags": 1}*/
  		//cursor = cursor.sort({"numFollowers": -1}).limit(10);
  		json.topTen = cursor.toArray();
  		res.send(JSON.stringify(json));
  		return;
  		json.following = [];
  		var userId = req.session.userId;
  		if (userId) {
  			User.findById(userId, function(err, user){
  				var followings = user.followings;
  				var numFollowings = followings.length;
  				var i;
  				for (i=0;i<numFollowings;i++) {
  					User.findById(followings[i], function(err, person){
  						// the object being followed is an existing user
  						if (person) {
  							var newPerson = new Object();
  							newPerson._id = person._id;
  							newPerson.name = person.name;
  							newPerson.title = person.title;
  							newPerson.skillTags = person.skillTags;
  							newPerson.tags = person.tags;
  							json.following.push(newPerson);
  						}
  					});
  				}
  			});
      }
		});

  	res.send(JSON.stringify(json));
  };

  this.getMessages = function (req, res) {
  	/*
  		send the user's unread messages sorted by creation date
  		{
  			success: true if no error occurred
  			messageBoard: [{
  				url: link to the page of updated content
  				message: the message
  			}]
  			of followed projects/people
  			chats:
  			{
  				chat_id:
  				{
  					chat_name: sender's name
  					chat_avatar: sender's avatar
  					last_message: last message of the chat
  					num_unread: number of unread messages from the person
  				}
  			}
  		}

  	*/
  	////////////////////////////////////////////////////////
  	// TODO:                                              //
  	// If the user is not logged in (or login expired),   //
  	// prompt them to log in. Could be done at front end  //
  	////////////////////////////////////////////////////////
  	var userId = req.session.userId;
  	var json = new Object();
  	json.chats = new Object();
  	if (userId) {
  		// The user is logged in
  		User.findById(userId, function(err, found){
  			if (!err) {
  				// Add all existing chats to the chat list
  				// Sort  messages in descending order by date, then
  				// update last_message at first encounter of unread, and
  				// update num_unread at each encounter of unread.
  				var i;
  				json.messageBoard = found.messageBoard;
  				// Clear message board broadcasts
  				db.setUserField(userId, messageBoard, []);
  				var chats = found.chats;
  				var numChats = chats.length;
  				for (i=0;i<numChats;i++) {
  					var other;
  					Chat.findById(chats[i], function(err, chat){
  						if (userId === chat.personOne) {
  							User.findById(chat.personTwo, function(err, user){
  								other = user;
  							});
  						}
  						else {
  							User.findById(chat.personOne, function(err, user){
  								other = user;
  							});
  						}
  					});
  					json.chats[chat._id] = new Object();
  					json.chats[chat._id].chat_name = other.name;
  					// messages should be in ascending order by time
  					json.chats[chat._id].last_message = messages[-1];
  					// get the source of avatar
  					json.chats[chat._id].chat_avatar = other.avatar;
  					// count number of messages sent after the first read message
  					var numUnread = 0;
  					// while the current message is unread and it is a received message, keep counting
  					while (messages[numUnread].unread && messages[numUnread].sender === other._id) {
  						numUnread += 1;
  					}
  					json.chats[chat._id].num_unread = numUnread;
  				}
  				json.success = "true";
  			}
  			else {
  				json.success = "false";
  			}
  		});
  	}
  	else {
  		// The user is not logged in
  		json.success = "false";
  	}
  	res.send(JSON.stringify(json));

  };

  this.getChat = function (req, res) {
  	/*
  	Retrieve the chat by the id.
  	{
  		success: "true" if retrieved ok,
  		result:
  		{
  			other_id: other person's id,
  			messages: [{
  				sender: user/other,
  				text: text
  			}]
  		}
  	}
  	*/

  	// Check if the person is logged in as personOne or personTwo
  	var userId = req.session.userId;
  	var chat_id = req.params.chat_id;
  	Chat.findById(chat_id, function(err, chat){
  		var json = new Object();
  		if (userId === chat.personOne || userId === chat.personTwo) {
  			json.success = "true";
  			json.result = new Object();
  			var other;
  			if (userId === chat.personOne) {
  				// the other person is person two
  				User.findById(chat.personTwo, function(err, user){
  					other = user;
  				});
  			}
  			else {
  				// the other person is person one
  				User.findById(chat.personOne, function(err, user){
  					other = user;
  				});
  			}
  			// other user is not found
  			if (!other) {
  				json.success = "false";
  				res.send(JSON.stringify(json));
  				return;
  			}
  			json.result.other_id = other._id;
  			json.result.other_name = other.name;
  			json.messages = [];
  			var messages = chat.messages.slice(-10); // Get the last 10 messages

  			var i;
  			var numMessages = messages.length;
  			for (i=0;i<numMessages;i++) {
  				// Mark all the messages shown as read
  				readMessage(messages[i]);
  				// check sender of the message and append to list
  				var message = new Object();
  				if (messages[i].sender === userId) {
  					message.sender = "user";
  				}
  				else {
  					message.sender = "other";
  				}
  				message.text = messages[i].text;
  				json.messages.push(message);
  			}


  		}
  		else {
  			json.success = "false";
  			json.result = null;
  		}
  		res.send(JSON.stringify(json));
  	});
  };

  this.createMessage =  function (req, res) {
  	var userId = req.session.userId;
  	var personId = req.params.person_id;
  	if (canSendMessage(userId, personId)) {
  		var message = req.body['new-message-box'];
  		sendMessageTo(userId, chatId, message);
  		res.send("OK");
  	}
  	else {
  		res.send("Denied");
  	}
  };

  this.getChatHistory = function (req, res) {
  	/*
  	Retrieve the chat by the id.
  	{
  		success: "true" if retrieved ok,
  		result:
  		{
  			personOne: person one,
  			personTwo: person two,
  			messages: all messages
  		}
  	}
  	*/

  	// Check if the person is logged in as personOne or personTwo
  	var userId = req.session.userId;
  	var chat_id = req.params.chat_id;
  	Chat.findById(chat_id, function(err, chat){
  		var json = new Object();
  		if (userId === chat.personOne || userId === chat.personTwo) {
  			json.success = "true";
  			json.result = new Object();
  			json.result.messages = chat.messages;
  			var i;
  			var numMessages = json.messages.length;
  			for (i=0;i<numMessages;i++) {
  				// Mark all the messages shown as read
  				db.Message.findByIdAndUpdate(chat_id, {$set: { 'unread': false }});
  			}
  		}
  		else {
  			json.success = "false";
  			json.result = null;
  		}
  		res.send(JSON.stringify(json));
  	});
  };

  // Create a new user given the required fields
  this.createUser = function(username, passwordHash, email, callback) {
    var user = User();
    user.username = username;
    user.passwordHash = passwordHash;
    user.email = email;
    user.save(function(err, user) {
      if (err) { console.log(err); }
      else { callback(err, user); }
    });
  };

	// Delete an existing account given the id
	this.deleteUser = function(req, res) {
		var userId = req.user._id;
		var username = req.params.username;
		var accountId;
		User.findOne({"username": username}, function(err, user){
      if(err){console.log(err);}
      accountId = user._id;
      if (permissionManager.canDeleteProfile(userId, accountId)) {
  			User.remove({_id: accountId});
  		}
		});
	}

	this.editProfile = function(req, res){
		var userId = req.user._id;
		var username = req.params.username;
		var profileId;
		User.findOne({"username": username}, function(err, user){
			profileId = user._id;
		});
		var profileForm = qs.parse(req.data);
		if (canEditProfile(userId, profileId)) {
			db.setUserField(profileId, "name", profileForm.name);
			if (profileForm.newpassword.length != 0) {
				if (bcrypt.hash(profileForm.newpassword) === bcrypt.hash(profileForm.repeatpassword)) {
					db.setUserField(profileId, "passwordHash", bcrypt.hash(profileForm.newpassword));
				}
			}
			db.setUserField(profileId, "avatar", profileForm.image.id);
			db.setUserField(profileId, "title", profileForm.title);
			db.setUserField(profileId, "bio", profileForm.bio);
			db.setUserField(profileId, "tags", profileForm.tags.replace(/\s+/g, '').split(","));
			db.setUserField(profileId, "email", profileForm.email);
			db.setUserField(profileId, "skillTags", profileForm.skillTags.replace(/\s+/g, '').split(","));

			res.send('200');
		}
		else {
			res.send('401');
		}
	}
  return this;
}
