$(document).ready(function() {    
    
    // Allows users to go home by clicking on the nav bar header in the top left corner.
    $(function goHome() {
      let $homeDiv = $("#nav-bar #nav-bar-header");
      $homeDiv.on("click", () => {
          window.location.href = "/";
      })
    });

    // Handles the routing to the login page from the home page
    $(function navLogin() {
        let $loginButton = $("#nav-bar button.login-button");
        let $signupPageLoginButton = $("button.button-to-login");
        $loginButton.on("click", () => {
            window.location.href = "/login";
        })
        $signupPageLoginButton.on("click", () => {
            window.location.href = "/login";
        })
    });

    // Handles the routing to the signup page from the home page
    $(function navSignup() {
        let $signupButton = $("#nav-bar .signup-button");
        let $loginPageSignUpButton = $("button.button-to-signup");
        $signupButton.on("click", () => {
            window.location.href = "/signup";
        })
        $loginPageSignUpButton.on("click", () => {
            window.location.href = "/signup";
        });
    });
  })