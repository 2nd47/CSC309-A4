// send all followers of the object (project or person) at given url 
// the broadcast message to their messageBoard
exports.broadcastFollowers = function (id, url, message) {
	// Check if it's a user's id
	var object;
	object = db.User.findById(id);
	if (!user) {
		object = db.Project.findById(id);
		if (!object) {
			console.log("ERROR: something deleted is being updated");
			return;
		}
	}
	var followers = object.followers;
	var numFollowers = object.numFollowers;
	var i;
	for (i=0;i<numFollowers;i++) {
		var follower = db.User.findById(followers[i]);
		if (follower) {
			var messageboard = db.getUserField()
			db.createBroadcast(url, message, function(err, broadcast){
				messageboard.push(broadcast);
				db.setUserField(followers[i], "messageBoard", messageboard);
			})
			
			
		}
	}
	return;
}

// push a message to a chat history
exports.pushMessage = function (sender, message, chatId) {
	db.createMessage(sender, message, function(err, message){
		db.Chat.findByIdAndUpdate(id, {$push: {"messages": message}});
	});
}

// send a message from the sender to the receiver
exports.sendMessageTo = function (sender, receiver, message) {
	// if there is existing chat, push message into the chat
	var senderUser = db.User.findById(sender);
	var receiverUser = db.User.findById(sender);
	if (senderUser && receiverUser) {
		var chats = senderUser.chats;
		var numChats = chats.length;
		var i;
		var chat;
		var found = false;
		for (i=0;i<numContracts;i++) {
			chat = db.Chat.findById(chats[i]);
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
				db.User.findByIdAndUpdate(sender, {$push: {"chats": newChat}});
				db.User.findByIdAndUpdate(receiver, {$push: {"chats": newChat}});
			});
			
		}
	}
	else {
		console.log("ERROR: user not found");
		return;
	}
}