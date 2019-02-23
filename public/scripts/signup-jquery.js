$(document).ready(function() {
  
  $("form#signup-form").on("submit", function(event) {
    // event.preventDefault();
    let firstName = event.target[0].value;
    let lastName = event.target[1].value;
    let username = `@${event.target[2].value}`;
    let password = event.target[3].value;
    let user = {
      "firstName": firstName,
      "lastName": lastName,
      "username": username,
      "password": password
    }
    $.ajax({
      // sending the data to the server (asychronously)
      method: 'POST',
      url: '/signup',
      data: user,
      success: function(data){
          $("form#signup-form")[0].reset();
      }
    }).then(() => {
      // window.location.href = "http://localhost:8080";
    console.log("done");
    })
  });
})