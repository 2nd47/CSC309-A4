$("#users").click(function(){
	$("#user_list").removeClass("hidden");
	$("#project_list").addClass("hidden");
	$("#contract_list").addClass("hidden");
});

$("#projects").click(function(){
	$("#user_list").addClass("hidden");
	$("#project_list").removeClass("hidden");
	$("#contract_list").addClass("hidden");
});

$("#contracts").click(function(){
	$("#user_list").addClass("hidden");
	$("#project_list").addClass("hidden");
	$("#contract_list").removeClass("hidden");
});

////////////////////////////////////////

$("#toggle_password_1").click(function(){
	$("#password_1").toggleClass("hidden");
});

$("#toggle_password_2").click(function(){
	$("#password_2").toggleClass("hidden");
});

/////////////////////////////////////////

$("#change_password_1").click(function(){
	if ($("#new_password_1").val()) {
		$("#password_1").html($("#new_password_1").val());
	}
});

$("#change_password_2").click(function(){
	console.log($("#new_password_2").val());
	if ($("#new_password_2").val()) {
		$("#password_2").html($("#new_password_2").val());
	}
});

/////////////////////////////////////////

var freeze_1 = false;
var freeze_2 = false;
var freeze_3 = false;
var freeze_4 = false;

$("#freeze_1").click(function(){
	freeze_1 = !freeze_1;
	if (freeze_1) {
		$("#status_1").html("Frozen");
	}
	else {
		$("#status_1").html("Normal");
	}
});

$("#freeze_2").click(function(){
	freeze_2 = !freeze_2;
	if (freeze_2) {
		$("#status_2").html("Frozen");
	}
	else {
		$("#status_2").html("Normal");
	}
});
$("#freeze_3").click(function(){
	freeze_3 = !freeze_3;
	if (freeze_3) {
		$("#status_3").html("Frozen");
	}
	else {
		$("#status_3").html("Normal");
	}
});
$("#freeze_4").click(function(){
	freeze_4 = !freeze_4;
	if (freeze_4) {
		$("#status_4").html("Frozen");
	}
	else {
		$("#status_4").html("Normal");
	}
});

/////////////////////////////////////////