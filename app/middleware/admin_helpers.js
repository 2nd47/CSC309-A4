exports.freezeUser = function (userId, freezeUsername) {
	if (isAdmin(userId)) {
		db.getUserByField("username", freezeUsername, function(err, user){
			var id = user._id;
			var times = user.times_frozen;
			db.setUserField(id, "frozen", true);
			db.setUserField(id, "times_frozen", times + 1);
		});
	}
}

