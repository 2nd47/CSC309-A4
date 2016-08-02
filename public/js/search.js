$(document).ready(function () {
  $('.group').hide();
  $('#option1').show();

  $('#dropDown').change(function () {
    $('.group').hide();
    $('#'+$(this).val()).show();
  });
});

//////////////////////////////////////////////
// requests and their rendering functions   //
//////////////////////////////////////////////

function requestSearch() {
	var cat = $( "select#dropdownBox option:selected").val();
	var key = $("#search_input").val();
	
	$.ajax(
	{
		type: "get",
		url: "/api/search",
		data: {
			category: cat,
			search: key
		}
	})
	.done(function(data)
	{
		renderSearch(data);
	})
	.fail(function( jqXHR, textStatus )
    {
      alert( "Failed to search: " + textStatus );
    });
}

function renderSearch(results) {
	var $results = $("#results");
	$results.empty();
	var i;
	var numResults = results.length;
	$("#num-results").html(numResults);
	for (i=0;i<numResults;i++) {
		var result = results[i];
		var $newResult = $("<div>").addClass("result");
		$newResult.append(
			$("<a>").attr("href", result.url).append(
				$("<h3>").text(result.name)
			)
		);
		if (result.title) {
			$newResult.append(
				$("<p>").text(result.title)
			);
		}
		if (result.budget) {
			$newResult.append(
				$("<p>").text("Budget: " + result.budget)
			);
		}
		if (result.short_intro) {
			$newResult.append(
				$("<p>").text(result.short_intro)
			);
		}
		if (result.skills) {
			var skillLine = result.skills.join()
			$newResult.append(
				$("<p>").text("Skills: " + skillLine)
			);
		}
		if (result.tags) {
			var tagLine = result.tags.join();
			$newResult.append(
				$("<p>").text("Tags: " + tagLine)
			);
		}
		if (result.project_url) {
			$newResult.append(
				$("<a>").attr("href", result.project_url).text("View Project")
			);
		}
		if (result.deadline) {
			$newResult.append(
				$("<p>").text("Deadline: " + result.deadline)
			);
		}
		$results.append($newResult);
	}
}