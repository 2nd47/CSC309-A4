//////////////////////
// Showcase control //
//////////////////////
$("#showcase_control_prev").click(function(){
	$("#media_1").toggleClass("hidden");
	$("#media_2").toggleClass("hidden");
});

$("#showcase_control_next").click(function(){
	$("#media_1").toggleClass("hidden");
	$("#media_2").toggleClass("hidden");
});

///////////////////
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
