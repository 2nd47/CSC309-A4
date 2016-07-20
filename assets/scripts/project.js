//////////////////////
// Showcase control //
//////////////////////
var current = 0;
var numMedia = 3;

function calcNext(cur, total) {
	return (cur + 1) % total;
}

function calcPrev(cur, total) {
	return (cur - 1 + total) % total;
}

$("#showcase_control_prev").click(function(){
	// hide current
	$("#media_" + current).addClass("hidden");
	// show next
	current = calcPrev(current, numMedia);
	$("#media_" + current).removeClass("hidden");
});

$("#showcase_control_next").click(function(){
	// hide current
	$("#media_" + current).addClass("hidden");
	// show next
	current = calcNext(current, numMedia);
	$("#media_" + current).removeClass("hidden");
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
