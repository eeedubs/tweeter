$(document).ready(function() {
    // --- our code goes here ---
    var textArea = document.querySelector(".new-tweet-container .new-tweet .textarea");
    if (textArea){
        textArea.addEventListener("keyup", function (event){
            var charactersLeft = 140 - this.textLength;
            // console.log(charactersLeft + " characters left");
            $(this).siblings(".counter").text(charactersLeft);
            if (charactersLeft < 0){
                $(this).siblings(".counter").css("color", "red");
            }
        })
    }
});

    
