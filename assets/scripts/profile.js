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