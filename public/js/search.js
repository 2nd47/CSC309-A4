$(document).ready(function () {
  $('.group').hide();
  $('#option1').show();

  $('#dropDown').change(function () {
    $('.group').hide();
    $('#'+$(this).val()).show();
  })
});
