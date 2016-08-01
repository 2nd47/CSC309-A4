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
		url: "/search",
		data: {
			category: cat,
			keywords: key
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

function renderSearch(data) {
	// find where the s
}