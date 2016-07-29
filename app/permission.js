function isAdmin(userId) {
	return (db.User.findById(userId).powerLevel != 0);
}

function canDeleteContract(userId, contractId){
	var contract = db.Contract.findById(contractId);
	return ((contract.owner === userId && contract.status === "open") || isAdmin(userId));
}

function canEditContract(userId, contractId){
	return canDeleteContract(userId, contractId);
}

// only owner and admin may delete
function canDeleteProject(userId, projectId){
	var project = db.Project.findById(projectId);
	return (project.owner === userId || isAdmin(userId));
}

// all members, owner and admin may edit
function canEditProject(userId, projectId){
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
function canEditProfile(userId, profileId) {
	return (userId === profileId || isAdmin(userId));
}

function canDeleteProfile(userId, profileId) {
	return canEditPrifile(userId, profileId);
}