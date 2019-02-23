$(document).ready(function() {
  
  $("form#signup-form").on("submit", function(event) {
    event.preventDefault();
    console.log("event");
  });
})