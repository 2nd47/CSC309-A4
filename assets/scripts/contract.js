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