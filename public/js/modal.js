// Get the modal
var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById("login_nav");

//get the landing page signup button
var landingSignup = document.getElementById("brief_signup_button");

var signupSwitch = document.getElementById("signup_switch");
var loginSwitch = document.getElementById("login_switch");

var signupButton = document.getElementById("signup_button");
var loginButton = document.getElementById("login_button");

// When the user clicks the button, open the modal
btn.onclick = function() {
    modal.style.display = "block";

    loginMode();
    clearFields();
}

//when the user clicks the signup button
if (landingSignup) {
  landingSignup.onclick = function() {
    modal.style.display = "block";

    signupMode();
    clearFields();
  }
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
        document.getElementById("login_signup_content").style.display = "block";
        document.getElementById("verify_content").style.display = "none";
        $("#proceed_button").remove();

        clearFields();
    }
}

signupSwitch.onclick = function(event) {
  signupMode();
}

loginSwitch.onclick = function(event) {
  loginMode();
}

//switch to signup mode
function signupMode() {
  document.getElementById("signup_text").style.display = "none";
  document.getElementById("modal-signup-box").style.display = "inline-block";
  document.getElementById("login_text").style.display = "inline-block";
  document.getElementById("login_button").style.display = "none";
  document.getElementById("signup_button").style.display = "block";
  document.getElementById("modal_title").innerHTML = "<h2>Sign up</h2>";
}

//switch to login mode
function loginMode() {
  document.getElementById("login_text").style.display = "none";
  document.getElementById("modal-signup-box").style.display = "none";
  document.getElementById("signup_text").style.display = "inline-block";
  document.getElementById("login_button").style.display = "block";
  document.getElementById("signup_button").style.display = "none";
  document.getElementById("modal_title").innerHTML = "<h2>Log in</h2>";
}

loginButton.onclick = function(event) {

  /**
  document.getElementById("login_signup_content").style.display = "none";
  document.getElementById("verify_content").style.display = "block";
  var $proceedButton = $('<div>')
    .attr("id", "proceed_button")
    .text("Login");
  $('#verify_content').append($proceedButton);
  */
  var data = {
    username: $("#username").val(),
    password: $("#password").val()
  };

  $.ajax(
    {
      type: "post",
      url: "/login",
      data: data
    })
    .done(function(data) {
      alert("Done.");
    })
    .success(function(msg) {
      alert("Successfully logged in.");
    })
    .fail(function(jqXHR, textStatus) {
      $("#feedback_msg").html(jqXHR.status);
      $("#feedback_msg").css('display','block');
      $("#feedback_msg").css('background-color','#FF7F7F');
      alert("Failed to log in because of: " + textStatus);
    });
}

signupButton.onclick = function(event) {
  /**
  document.getElementById("login_signup_content").style.display = "none";
  document.getElementById("verify_content").style.display = "block";
  var $proceedButton = $('<div>')
    .attr("id", "proceed_button")
    .text("Login");
  $('#verify_content').append($proceedButton);
  */

  var data = {
    username: $("#username").val(),
    password: $("#password").val(),
    password2: $("#password2").val(),
    email: $("#email").val(),
    email2: $("#email2").val()
  };

    $.ajax(
      {
        type: "POST",
        url: "/signup",
        data: data
      })
      .done(function(data) {
        alert("Done.");
      })
      .success(function(msg) {
        alert("Successfully signed up.");
      })
      .fail(function(jqXHR, textStatus) {
        alert("Failed to sign up because of: " + textStatus);
      });
}

//clear the fields
function clearFields() {
  var elements = document.getElementsByTagName("input");

  for (var i=0; i < elements.length; i++)
  {
    elements[i].value = "";
  }
}
