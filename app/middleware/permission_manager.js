//Check to see if the user can create a team in the org
exports.canEditJob = function(user, job){
  return job.owner === user._id;
};

exports.isAdmin = function (userId) {
	return (db.User.findById(userId).powerLevel != 0);
}

// one cannot perfom any of the following actions if they are frozen
exports.isFrozen = function (userId) {
	return db.getUserField(userId, "frozen");
}

exports.canDeleteContract = function (userId, contractId) {
	var contract = db.Contract.findById(contractId);
	return (((contract.owner === userId && contract.status === "open") || isAdmin(userId))
						&& !isFrozen(userId));
}

exports.canEditContract = function (userId, contractId) {
	return canDeleteContract(userId, contractId);
}

exports.canApplyContract = function (userId, contractId) {
	var contract = db.Contract.findById(contractId);
	// Check if user is contract owner
	var isOwner = (contract.owner === userId);
	// Check if the member is a project member
	var isMember = false;
	var members = db.Project.findById(owner).members;
	var numMembers = members.length;
	var i;
	for (i=0;i<numMembers;i++) {
		var member = members[i];
		if (member.user === userId) {
			isMember = true;
			break;
		}
	}
	// Check if the user has already sent an application
	var hasApplied = (userId in contract.applicants);
	return !(isOwner||isMember||hasApplied||isFrozen(userId));
}

// only the project owner may add contracts to the project
exports.canAddContractToProject = function (userId, projectId) {
	var project = db.Project.findById(projectId);
	return (project.owner === userId && !isFrozen(userId));
}

// only owner and admin may delete
exports.canDeleteProject = function (userId, projectId){
	var project = db.Project.findById(projectId);
	return ((project.owner === userId || isAdmin(userId)) && !isFrozen(userId));
}

// all members, owner and admin may edit
exports.canEditProject = function (userId, projectId){
	var project = db.Project.findById(projectId);
	var members = project.members;
	var membersArray = [];
	var numMembers = members.length;
	var i;
	for (i=0;i<numMembers;i++) {
		membersArray.push(members[i].user);
	}
	return (project.owner === userId || isAdmin(userId) || (userId in membersArray)) && !isFrozen(userId);
}

// return true iff the user is the profile owner or the user is admin
exports.canEditProfile = function (userId, profileId) {
	return (userId === profileId || isAdmin(userId)) && !isFrozen(userId);
}

exports.canDeleteProfile = function (userId, profileId) {
	return canEditPrifile(userId, profileId);
}

exports.canSendMessage = function (userId, receiverId) {
	var receiver = db.User.findById(receiverId);
	return (!(userId in receiver.blocked) && !isFrozen(userId));
}

exports.canChangeDatabase = function (userId) {
	return isAdmin(userId);
}
