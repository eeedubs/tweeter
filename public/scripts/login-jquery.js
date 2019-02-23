$(document).ready(function() {
  
  $(function login() {
    let $loginButton = $("#nav-bar .login-button");
    $loginButton.on("click", function() {
        window.location.href = "http://localhost:8080/login";
    })
});

})