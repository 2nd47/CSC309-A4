// Get the modal
var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById("login_nav");

var signupSwitch = document.getElementById("signup_switch");
var loginSwitch = document.getElementById("login_switch");

var signupButton = document.getElementById("signup_button");
var loginButton = document.getElementById("login_button");

// When the user clicks the button, open the modal
btn.onclick = function() {
    modal.style.display = "block";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
        document.getElementById("login_signup_content").style.display = "block";
        document.getElementById("verify_content").style.display = "none";
    }
}

signupSwitch.onclick = function(event) {
  document.getElementById("signup_text").style.display = "none";
  document.getElementById("modal-signup-box").style.display = "inline-block";
  document.getElementById("login_text").style.display = "inline-block";
  document.getElementById("login_button").style.display = "none";
  document.getElementById("signup_button").style.display = "block";
}

loginSwitch.onclick = function(event) {
  document.getElementById("login_text").style.display = "none";
  document.getElementById("modal-signup-box").style.display = "none";
  document.getElementById("signup_text").style.display = "inline-block";
  document.getElementById("login_button").style.display = "block";
  document.getElementById("signup_button").style.display = "none";
}

loginButton.onclick = function(event) {
  document.getElementById("login_signup_content").style.display = "none";
  document.getElementById("verify_content").style.display = "block";
}

signupButton.onclick = function(event) {
  document.getElementById("login_signup_content").style.display = "none";
  document.getElementById("verify_content").style.display = "block";
}
