var following = false;
$("#profile_follow").click(function(){
	console.log("click");
	following = !following;
	if (following) {
		$("#profile_follow").html("Unfollow");
	}
	else {
		$("#profile_follow").html("Follow");
	}
});

///////////////////////////////////////////
$("#profile_bio_button").click(function(){
	$("#profile_bio_edit").removeClass("hidden");
	$("#profile_bio_save").removeClass("hidden");
	$("#profile_bio_content").addClass("hidden");
	$("#profile_bio_button").addClass("hidden");
});

$("#profile_bio_save").click(function(){
	$("#profile_bio_content").html($("#profile_bio_editor").val());
	$("#profile_bio_edit").addClass("hidden");
	$("#profile_bio_save").addClass("hidden");
	$("#profile_bio_content").removeClass("hidden");
	$("#profile_bio_button").removeClass("hidden");
});
