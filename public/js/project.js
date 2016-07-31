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

$(document).ready(function() {
	//set the path to the api
	var path = window.location.href.replace("project","api/project");

	//make api request and render json data on the html
	$.get(path, function(data) {
		$("#project_name").html(JSON.stringify(data.title).slice(1,-1));
		$("#project_owner").html(JSON.stringify(data.publisher.name).slice(1,-1));
		$("#project_owner").attr("href", "/profile/" + JSON.stringify(data.publisher.username).slice(1,-1));
		$("#project_brief").html(JSON.stringify(data.brief).slice(1,-1));
		$("#last_update").html(
			"<strong>Last Update:</strong> "
			+ JSON.stringify(data.latest_update).slice(1,-1)
		);
		$("#project_status").html(
			"<strong>Status:</strong> "
			+ JSON.stringify(data.status).slice(1,-1)
		);

		//render every tag
		$.each(data.tags, function(index, tag) {
			$("#project_tags").append(
				JSON.stringify(tag.name).slice(1,-1)
				+ " "
			);
		});

		$("#showcase_display").html(
			"<img src='"
			+ JSON.stringify(data.showcase.path).slice(1,-1)
			+ "'>"
		);

		$("#details_text").html(JSON.stringify(data.details).slice(1,-1));

		//render every contract
		$.each(data.jobs, function(index, job) {
			$("#contract_listing").append(
				"<li>"
				+ "<a href='/job/"
				+ JSON.stringify(job.id).slice(1,-1)
				+ "' style='text-decoration: none'>"
				+ "<div class='contract_intro'>"
				+ "<h2><strong>"
				+ JSON.stringify(job.title).slice(1,-1)
				+ "</strong></h2>"
				+ "<p><strong>Status:</strong> "
				+ JSON.stringify(job.status).slice(1,-1)
				+ "</p>"
				+ "<p><strong>Budget:</strong> "
				+ JSON.stringify(job.budget)
				+ "</p>"
				+ "</li>"
			);
		});
	});
});
