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

$(document).ready(function() {
	//set the path to the api
	var path = window.location.href.replace("profile","api/profile");

	//make api request and render json data on the html
	$.get(path, function(data) {
		$("#avatar").attr("src", JSON.stringify(data.avatar).slice(1,-1));
		$("#profile_name").html(JSON.stringify(data.name).slice(1,-1));
		$("#profile_tagline").html(JSON.stringify(data.title).slice(1,-1));

		//render every skill
		$.each(data.skillTags, function(index, skill) {
			$("#skillset_wrapper").append(
				JSON.stringify(skill.name).slice(1,-1)
				+ ": "
				+ JSON.stringify(skill.rating)
				+ "<br>"
			);
		});

		$("#profile_bio_content").html(JSON.stringify(data.biography).slice(1,-1));
		$("#profile_bio_edit").html(JSON.stringify(data.biography).slice(1,-1));

		//render every project
		$.each(data.projects, function(index, project) {
			$("#projects_list").append(
				"<a href='/projects/"
				+	JSON.stringify(project.id).slice(1,-1)
				+ "'>"
				+ JSON.stringify(project.name).slice(1,-1)
				+ "</a><br>"
			);
		});

		//render every contract
		$.each(data.jobs, function(index, job) {
			$("#contracts_list").append(
				"<a href='/job/"
				+	JSON.stringify(job.id).slice(1,-1)
				+ "'>"
				+ JSON.stringify(job.name).slice(1,-1)
				+ "</a><br>"
			);
		});
	});
});
