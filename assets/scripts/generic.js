$(document).ready(function() {
  //MOBILE NAVIGATION BAR THINGY IN THE HEADER
  var nav_show = false;

  $('#mobile_nav').click(function() {
    if (nav_show == false)
    {
      //hide searchbar and login button
      $('#searchbar_nav').hide();
      $('#login_nav').hide();

      //show all the navigation pieces
      $('.navpiece').each(function(index) {
        $(this).css("display","inline-block");
        $(this).css("margin","0 5px");
      });

      //show the inbox, change button picture
      $('#inbox_nav').show();
      $(this).css("background-image", "url('assets/images/closemenu.png')");

      nav_show = true;
    }
    else
    {
      //hide searchbar and login button
      $('#searchbar_nav').show();
      $('#login_nav').show();

      //show all the navigation pieces
      $('.navpiece').each(function(index) {
        $(this).hide();
      });

      //show the inbox, change button picture
      $('#inbox_nav').hide();
      $(this).css("background-image", "url('assets/images/dropmenu.png')");

      nav_show = false;
    }
  });
});
