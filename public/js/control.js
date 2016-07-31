$(document).ready(function(){
	// show the profile editing page
	showProfile();
});

//////////////////////////////////////
// functions that tab between views //
//////////////////////////////////////
function showProfile() {
	$("#profileview").removeClass("hidden");
	$("#projectview").addClass("hidden");
	$("#jobview").addClass("hidden");
	$("#reportview").addClass("hidden");
	$("#accountview").addClass("hidden");
	$("#databaseview").addClass("hidden");
	
}

function showProject() {
	$("#profileview").addClass("hidden");
	$("#projectview").removeClass("hidden");
	$("#jobview").addClass("hidden");
	$("#reportview").addClass("hidden");
	$("#accountview").addClass("hidden");
	$("#databaseview").addClass("hidden");
}

function showJob() {
	$("#profileview").addClass("hidden");
	$("#projectview").addClass("hidden");
	$("#jobview").removeClass("hidden");
	$("#reportview").addClass("hidden");
	$("#accountview").addClass("hidden");
	$("#databaseview").addClass("hidden");
}

function showReport() {
	$("#profileview").addClass("hidden");
	$("#projectview").addClass("hidden");
	$("#jobview").addClass("hidden");
	$("#reportview").removeClass("hidden");
	$("#accountview").addClass("hidden");
	$("#databaseview").addClass("hidden");
}

function showAccount() {
	$("#profileview").addClass("hidden");
	$("#projectview").addClass("hidden");
	$("#jobview").addClass("hidden");
	$("#reportview").addClass("hidden");
	$("#accountview").removeClass("hidden");
	$("#databaseview").addClass("hidden");
}

function showDatabase() {
	$("#profileview").addClass("hidden");
	$("#projectview").addClass("hidden");
	$("#jobview").addClass("hidden");
	$("#reportview").addClass("hidden");
	$("#accountview").addClass("hidden");
	$("#databaseview").removeClass("hidden");
}