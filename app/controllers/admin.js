var User = require('../models/user'),
    Chat = require('../models/chat'),
    Project = require('../models/project'),
    permissionManager = require('../middleware/permission_manager');

		
module.exports = function(app) {
	this.searchUser = function (req, res) {
		/*
		[{
			id: user id,
			username: username
			frozen: true/false
			times_frozen: number of times frozen
		}]
		*/
		var json = [];
		var keyword = url.parse(req.url, true).query.key;
		var cursor = db.User.find({"username": {$regex: ".*" + keyword + ".*/i"}});
		while (cursor.hasNext()) {
			var curUser = cursor.next();
			if (!curUser.powerLevel) {
				var newUser = new Object();
				newUser.id = curUser._id;
				newUser.username = curUser.username;
				newUser.frozen = curUser.frozen;
				newUser.times_frozen = curUser.times_frozen;
				json.push(newUser);
			}
		}
	}
	return this;
}
