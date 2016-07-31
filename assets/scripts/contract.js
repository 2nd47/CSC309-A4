/////////////////////////////////
//     Sign/finish/cancel      //
/////////////////////////////////

const OPEN = 0;
const SIGNED = 1;
const FINISHED = 2;

var contract_status = SIGNED;

function updateStatusButton() {
	if (contract_status === OPEN) {
		// If contract is open, show sign, not finish and cancel
		$("#sign").removeClass("hidden");
		$("#finish").addClass("hidden");
		$("#cancel").addClass("hidden");
	}
	else if (contract_status === SIGNED) {
		// If contract is signed, show finish and cancel
		$("#sign").addClass("hidden");
		$("#finish").removeClass("hidden");
		$("#cancel").removeClass("hidden");
	}
	else if (contract_status === FINISHED) {
		// If contract is finished, show no status change
		$("#status_change").addClass("hidden");
	}
}

function getRating() {

}

$("#submit").click(function(){
	contract_status = FINISHED;
	$("#status").html("finished");
	updateStatusButton();
});

$("#cancel_submit").click(function(){
	$("#rating").addClass("hidden");
});

$("#sign").click(function(){
	contract_status = SIGNED;
	$("#status").html("signed");
	updateStatusButton();
});

$("#finish").click(function(){
	$("#rating").removeClass("hidden");
});
$("#cancel").click(function(){
	contract_status = OPEN;
	$("#status").html("open");
	updateStatusButton();
});

updateStatusButton();

$(document).ready(function() {
	//set the path to the api
	var path = window.location.href.replace("job","api/job");

	//make api request and render json data on the html
	$.get(path, function(data) {
		$("#job_title").html(JSON.stringify(data.title).slice(1,-1));
		$("#job_intro").html(JSON.stringify(data.intro).slice(1,-1));
		$("#status").html(JSON.stringify(data.status).slice(1,-1));
		$("#employer").html(JSON.stringify(data.employer_name).slice(1,-1));

		$("#employer").attr("href", "../profile/" + JSON.stringify(data.employer_username).slice(1,-1));
		$("#project_link").attr("href", "../project/" + JSON.stringify(data.project_id).slice(1,-1));

		//render every skill requirement
		$.each(data.tags, function(index, skill) {
			$("#skill_tags").append("<li>"
			+ JSON.stringify(skill.name).slice(1,-1)
			+ ": "
			+ JSON.stringify(skill.rating)
			+ "</li>");
		});

		$("#budget").html("<strong>Budget:</strong> " + JSON.stringify(data.budget));
		$("#deadline").html("<strong>Deadline:</strong> " + JSON.stringify(data.deadline).slice(1,-1));
		$("#details_introduction").html(JSON.stringify(data.details).slice(1,-1));
	});
});
