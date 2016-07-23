$(document).ready(function() {
  //MOBILE NAVIGATION BAR THINGY IN THE HEADER
  var nav_show = false;

  $('#mobile_nav').click(function() {
    if (nav_show == false)
    {
      //show all the navigation pieces
      $('.navpiece').each(function(index) {
        $(this).show();
      });

      //change button picture
      $(this).css("background-image", "url('assets/images/closemenu.png')");

      nav_show = true;
    }
    else
    {
      //hide all the navigation pieces
      $('.navpiece').each(function(index) {
        $(this).hide();
      });

      //change button picture
      $(this).css("background-image", "url('assets/images/dropmenu.png')");

      nav_show = false;
    }
  });
});
