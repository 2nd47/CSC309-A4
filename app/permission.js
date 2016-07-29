exports.isAdmin = function (userId) {
	return (db.User.findById(userId).powerLevel != 0);
}

exports.canDeleteContract = function (userId, contractId) {
	var contract = db.Contract.findById(contractId);
	return ((contract.owner === userId && contract.status === "open") || isAdmin(userId));
}

exports.canEditContract = function (userId, contractId) {
	return canDeleteContract(userId, contractId);
}

// only the project owner may add contracts to the project
exports.canAddContractToProject = function (userId, projectId) {
	var project = db.Project.findById(projectId);
	return project.owner === userId;
}

// only owner and admin may delete
exports.canDeleteProject = function (userId, projectId){
	var project = db.Project.findById(projectId);
	return (project.owner === userId || isAdmin(userId));
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
	return (project.owner === userId || isAdmin(userId) || (userId in membersArray));
}

// return true iff the user is the profile owner or the user is admin
exports.canEditProfile = function (userId, profileId) {
	return (userId === profileId || isAdmin(userId));
}

exports.canDeleteProfile = function (userId, profileId) {
	return canEditPrifile(userId, profileId);
}