exports.collectUserInfo = function(userId) {
	var userTags = [];
	var userSkills = [];
	var userProjectTags = [];
	var userContractSkills = [];
	if (userId) {
		var user = db.User.findOne({"_id": ObjectId(userId)});
		var userProjects = db.Project.find({"owner": user._id, "status": "ongoing"});
		var userContracts = db.Contract.find({"owner": ObjectId(userId), "status": "open"});
		// User's tags on themselves
		userTags = user.tags;
		// User's skills
		var i;
		var numSkills = user.skillTags.length;
		for (i=0;i<numSkills;i++) {
			userSkills.push(user.skillTags[i].name);
		}
		// User's tags on ongoing projects
		while (userProjects.hasNext()) {
			var current = userProjects.next();
			var tags = current.tags;
			for (i=0;i<tags.length;i++) {
				userProjectTags.push(tags[i]);
			}
		}
		// User's contracts' required skills
		while (userContracts.hasNext()) {
			var current = userContracts.next();
			var skillTags = current.skillTags;
			for (i=0;i<skillTags.length;i++) {
				userContractSkills.push(skillTags[i].name);
			}
		}
	}
	var userInfo = new Object();
	userInfo.userTags = userTags;
	userInfo.userSkills = userSkills;
	userInfo.userProjectTags = userProjectTags;
	userInfo.userContractSkills = userContractSkills;
	return JSON.stringify(userInfo);
}