$(document).ready(function(){
	var username;
	// get user's username
	$.ajax({
		type: "get",
		url: "/api/get_username"
	})
	.done(function(data){
		$.ajax({
			type: "get",
			url: "/api/profile/:" + username
		})
		.done(function(data)
		{
			var id = data.id;
			var name = data.name;
			var title = data.title;
			var skills = data.skills;
			var tags = data.tags;
			var biography = data.biography;
			var email = data.email;
			var $profileForm = $("<div id='profile-" + username + "'>\
														<form id='profile-edit-'" + username + ">\
															Name: <input type='text' name='name' value='" + name + "' required/></br>\
															New Password: <input type='password' placeholder='New password' name='newpassword'/></br>\
															Repeat Password: <input type='password' placeholder='Repeat password' name='repeatpassword'/></br>\
															Short description (30 chars max): <input type='text' name='title' value='" + title + "'/></br>\
															Profile image: <input type='file' name='image'/></br>\
															Biography: <textarea rows='10' type='text' name='bio' value='" + biography + "'></textarea></br>\
															Skills (e.g. conceptArt): <input type='text' name='skillTags' value='" + skills + "'/>\
															Tags (e.g. goat,pixel): <input type='text' name='tags' value='" + tags + "'/></br>\
															Email: <input type='text' name='email' value='" + email + "' pattern='/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i' required/></br>\
															<input type='submit' value='Submit' onClick='requestEditPrfile(" + username  + ") '/>\
														</form>\
													</div>");
			$("#profileview").append($profileForm);
			showProfile();
		})
		.fail(function( jqXHR, textStatus )
			{
				alert( "Failed to load user info: " + textStatus );
			});
	})
	.fail(function( jqXHR, textStatus )
		{
			alert( "Please re-login.");
			window.location.replace("/");
		});

	$("#profile-edit-submit").click(function(){requestEditProfile(),$("#profile-edit").serialize()});
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

/////////////////////////////////////////////////
// post requests and ther rendering functions  //
/////////////////////////////////////////////////

function requestEditProfile(username) {
	var queryString = $("#profile-" + username).serialize();
	$.ajax(
	{
		type: "post",
		url: "/profile/:" + username,
		data: queryString
	})
	.done(function(data)
	{
		alert("Profile updated!");
		location.reload();
	})
	.fail(function( jqXHR, textStatus )
    {
      alert( "Failed to edit: " + textStatus );
    });
}

function requestDeleteProfile(username) {
	var ans = confirm("ARE YOU SURE YOU WANT TO DELETE THIS ACCOUNT? THIS CANNOT BE REVERTED.");
	if (ans) {
		$.ajax({
			type: "delete",
			url: "/profile/:" + username
		})
		.done(function(data)
		{
			window.location.replace("/");
		})
		.fail(function( jqXHR, textStatus )
			{
        alert( "Failed to delete: " + textStatus );
			});
	}
}

function displayProfileForm(username) {
	$.ajax({
		type: "post",
		url: "/api/profile/:" + username
	})
	.done(function(data)
	{
		var name = data.name;
		var title = data.title;
		var skills = data.skills;
		var tags = data.tags.join();
		var biography = data.biography;
		var email = data.email;
		var $profileForm = $("<div id='profile-" + username + "'>\
														<form id='profile-edit-'" + username + ">\
															Name: <input type='text' name='name' value='" + name + "' required/></br>\
															New Password: <input type='password' placeholder='New password' name='newpassword'/></br>\
															Repeat Password: <input type='password' placeholder='Repeat password' name='repeatpassword'/></br>\
															Short description (30 chars max): <input type='text' name='title' value='" + title + "'/></br>\
															Profile image: <input type='file' name='image'/></br>\
															Biography: <textarea rows='10' type='text' name='bio' value='" + biography + "'></textarea></br>\
															Skills (e.g. conceptArt): <input type='text' name='skillTags' value='" + skills + "'/>\
															Tags (e.g. goat,pixel): <input type='text' name='tags' value='" + tags + "'/></br>\
															Email: <input type='text' name='email' value='" + email + "' pattern='/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i' required/></br>\
															<input type='submit' value='Submit' onClick='requestEditPrfile(" + username  + ") '/>\
														</form>\
													</div>");

		$("#user-" + username).append($profileForm);
	})
	.fail(function( jqXHR, textStatus )
		{
			alert( "Failed to get profile form: " + textStatus );
		});
}

function deleteProfileForm(username) {
	$("#updatebtn-" + username).removeClass("hidden");
	$("#hidebtn-" + username).addClass("hidden");
	$("#profile-" + username).remove();
}

function requestSearchUser() {
	var search = $("#search-for-user").serialize().usersearch;
	$.ajax({
		type: "get",
		url: "/api/admin/search",
		data: search
	})
	.done(function(data)
	{
		renderSearchUser(data);
	})
	.fail(function( jqXHR, textStatus )
		{
			alert( "Failed to search: " + textStatus );
		});
}

function renderSearchUser(data) {
	/*
	[{
		id: user id,
		username: username
		frozen: true/false
		times_frozen: number of times frozen
	}]
	*/
	var $userList = $("#user-list");
	var numUsers = data.length;
	var i;
	for (i=0;i<numUsers;i++) {
		var user = data[i];
		var $newUser = $("<div id='user-" + user.id + "'>\
												<h3>" + user.username + "</h3>\
												<p>Frozen: " + user.frozen + "</p>\
												<p>Freeze record: " + user.times_frozen + "</p>\
												<button onClick='requestDeleteProfile(" + user.id + ")'>DELETE USER</button>\
												<button onClick='requestFreezeProfile(" + user.id + ")'>Freeze User</button>\
												<button id='updatebtn-" + user.username +"' onClick='displayProfileForm(" + user.username + ")'>Update User</button>\
												<button id='hidebtn-" + user.username + "' class='hidden' onClick='deleteProfileForm(" + user.username + ")'>Hide Form</button>\
											</div>");
		$userList.append($newUser);
	}
}

function requestInitializeDatabase() {
	var x = confirm("Initialize database?");
	if (x) {
		$.ajax({
		type: "post",
		url: "/api/admin/delete_database",
		data: search
	})
	.done(function(data)
	{
		alert("Database initialized!");
		location.reload();
	})
	.fail(function( jqXHR, textStatus )
		{
			alert( "Failed to initialize database: " + textStatus );
		});
	}
}

function requestRepopolauteDatabase() {
	var x = confirm("Repopulate database?");
	if (x) {
		$.ajax({
		type: "post",
		url: "/api/admin/repopulate_database",
		data: search
	})
	.done(function(data)
	{
		alert("Database repopulated!");
		location.reload();
	})
	.fail(function( jqXHR, textStatus )
		{
			alert( "Failed to repopulate database: " + textStatus );
		});
	}
}
