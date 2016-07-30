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
			messageboard.push(db.createBroadcast(url, message));
			db.setUserField(followers[i], "messageBoard", messageboard);
		}
	}
	return;
}

// push a message to a dialogue history
exports.pushMessage = function (sender, message, dialogueId) {
	var newMessage = db.createMessage(sender, message);
	db.Dialogue.findByIdAndUpdate(id, {$push: {"messages": newMessage}});
}

// send a message from the sender to the receiver
exports.sendMessageTo = function (sender, receiver, message) {
	// if there is existing dialogue, push message into the dialogue
	var senderUser = db.User.findById(sender);
	var receiverUser = db.User.findById(sender);
	if (senderUser && receiverUser) {
		var contacts = senderUser.contacts;
		var numContacts = contacts.length;
		var i;
		var contact;
		var found = false;
		for (i=0;i<numContracts;i++) {
			contact = db.Dialogue.findById(contacts[i]);
			if (contact.personOne === receiver || contact.personTwo === receiver) {
				found = true;
				break;
			}
		}
		if (found) {
			// the contact exists
			pushMessage(sender, message, contact._id);
		}
		else {
			// if there is no existing dialogue, create a new one, add it
			// to the contact list of both users.
			var newContact = db.createDialogue(sender, receiver);
			var contactId = newContact._id;
			pushMessage(sender, message, contactId);
			db.User.findByIdAndUpdate(sender, {$push: {"contacts": newContact}});
			db.User.findByIdAndUpdate(receiver, {$push: {"contacts": newContact}});
		}
	}
	else {
		console.log("ERROR: user not found");
		return;
	}
}