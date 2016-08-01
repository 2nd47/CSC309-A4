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
	var i;
	var numResults = reuslts.length;
	for (i=0;i<numResults;i++) {
		var result = results[i];
		var $newResult = $("<div>").addClass("result")
      $newJob.append(
        $("<a>").attr("href", result.url).append(
          $("<h3>").text(result.name)
        )
      );
      /*$newJob.append(
        $("<p>").text(item.basicInfo)
      );
      $newJob.append(
        $("<p>").addClass("timestamp").
          text('Created at: ' + item.createdAt)
      );*/
      $("#results").append($newJob);
	}
}