$(document).ready(function() {    
    
    // Allows users to go home by clicking on the nav bar header in the top left corner.
    $(function goHome() {
      let $homeDiv = $("#nav-bar #nav-bar-header");
      $homeDiv.on("click", function() {
          window.location.href = "/";
      })
    });

    // Handles the routing to the login page from the home page
    $(function login() {
        let $loginButton = $("#nav-bar button.login-button");
        $loginButton.on("click", function() {
            window.location.href = "/login";
        })
    });

    // Handles the routing to the signup page from the home page
    $(function signup() {
        let $signupButton = $("#nav-bar .signup-button");
        $signupButton.on("click", function() {
            window.location.href = "/signup";
        })
    });
  })