/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 */

function createTweetElement (tweet){
    let $tweet = $("<article>").addClass("tweet");
        let $header = $("<header>").appendTo($tweet);
            let $avatar = $("<img>").addClass("avatar").attr("src", tweet.user.avatars.small).appendTo($header);
            let $name = $("<h2>").text(tweet.user.name).appendTo($header);
            let $handle = $("<p>").addClass("handle").text(tweet.user.handle).appendTo($header);
        let $content = $("<p>").addClass("content").text(tweet.content.text).appendTo($tweet);
        let $footer = $("<footer>").appendTo($tweet);
            let $datePostedDiv = $("<div>").appendTo($footer);
                let $datePosted = $("<p>").text(unixDate(tweet.created_at)).appendTo($datePostedDiv);
            let $socialIcons = $("<div>").addClass("icons").appendTo($footer);
                let $numberOfLikesDiv = $(`<div id="likes-count-div">`).appendTo($socialIcons);
                    let $numberOfLikes = $(`<p class="likes-count" id="likes-count">${tweet.likes.length}</p>`).appendTo($numberOfLikesDiv);
                let $like = $(`<i class="fas fa-thumbs-up" id="like-button" style="color: ${tweet.likes.length === 0 ? "" : "#3b5998" }"></i>`).appendTo($socialIcons);
                let $retweet = $(`<i class="fas fa-retweet"></i>`).appendTo($socialIcons);
                let $flag = $(`<i class="fas fa-flag"></i>`).appendTo($socialIcons);
                let $tweetID = $(`<input type="hidden" id="tweetID" value="${tweet._id}">`).appendTo($socialIcons);
                let $userCreatedByID = $(`<input type="hidden" id="tweetCreatedByUserID" name="tweetCreatedByUserID" value="${tweet.user.id}">`).appendTo($socialIcons);
    return $tweet;
}

function unixDate(digits){
    const daysAgo = Math.floor((Date.now() - digits) / 86400000);
    const hoursAgo = Math.floor((Date.now() - digits) / 3600000);
    const minutesAgo = Math.floor((Date.now() - digits) / 60000);
    if (daysAgo < 2 && hoursAgo < 2 && minutesAgo < 2){
        return "Moments ago.";
    } else if (daysAgo < 2 && hoursAgo < 2){
        return minutesAgo + " minutes ago.";
    } else if (daysAgo < 2 && hoursAgo >= 2){
        return hoursAgo + " hours ago.";
    } else {
        return daysAgo + " days ago";
    }
}

$(document).ready(function() {
    loadTweets();

    function renderTweets(tweetDataArray){
        // render tweets for an array of tweet data
        tweetDataArray.forEach(function(item) {
            // for each tweet in the array of tweet data, render it an append it to the 
            // .all-tweets section in index.html
            let $tweet = createTweetElement(item);
            // console.log("Tweet item: ", $tweet);
            $(".all-tweets").prepend($tweet);
        });
    }
    // function to handle the rendering of tweets into DOM structure (tree)


    function renderSingleTweet(tweet){
        let $tweet = createTweetElement(tweet);
        $(".all-tweets").prepend($tweet);
    };

    function loadTweets (){
        $.get("/tweets")
        // this is getting the tweets from tweets.js through index.html
            .done(tweets => {
                // once the tweets have been received, render them
                renderTweets(tweets);
            })
            .fail(() => {
                // if the tweets cannot be found, return an error
                alert("Error");
            });
    }

    // Handles the toggling of the "Compose Tweet" field by clicking the 
    // ... "Compose" button. If the error field is visible, it will also 
    // slide up. When the compose button is clicked again to reveal the new-tweet
    // text area, it will autoselect it. 
    $(function toggleCompose() {
        let $navButton = $("#nav-bar .compose-button");
        $navButton.on("click", function() {
            $(".error-container").slideUp("slow");
            $(".new-tweet-container").slideToggle("slow");
            if ($(".new-tweet-container").is(":visible")){
                $(".container .new-tweet-container .new-tweet .textarea").focus();
            }
        });
    });

    // Handles the close error button: toggles the error field when clicked.
    $(function closeError() {
        let $errorButton =  $(".container .new-tweet-container .new-tweet .error-container .error button");
        $errorButton.on("click", function() {
            $(".error-container").slideToggle();
        });
    });


    $("body").on("click", "i.fas.fa-thumbs-up", function(event){
        let tweetID = $(this).siblings("input#tweetID")[0].value;
        let loggedInUserID = JSON.parse($("input#user")[0].value).id;
        let userWhoCreatedTweetID = $(this).siblings("input#tweetCreatedByUserID")[0].value;
        let variablesData = {
            "tweetID": tweetID,
            "loggedInUserID": loggedInUserID
        }
        if (loggedInUserID && loggedInUserID !== userWhoCreatedTweetID){
            $.ajax({
                method: "PUT",
                url: "/tweets/like", 
                data: variablesData
            }).then((data) => {
                let newLikeCount = data.newLikeCount;
                $(this).siblings("div#likes-count-div").children("p").text(newLikeCount);
                if (newLikeCount === 0){
                    $(this).css("color", "");
                } else {
                    $(this).css("color", "#3b5998");
                }
            })
        } else {
            alert("You cannot like your own tweet!");
        }
    })

    $('form#post-tweet').on("submit", function(event) {
        // when a submit event is called on "form", perform a function with argument "e" (for each event occurrence)
        // prevent the default, which is to reload the page
        event.preventDefault();
        const formContent = $(this).serialize();
        const formLength = $("textarea").val().length;
        // serialize creates key:value pairs with the data entered ( in this case, key:value = text:<tweet message> )
        function validateForm(){
            if (formLength >= 140){
                // Display the error field and add error text 
                $(".error-container").show();
                $(".error-container .error p").text("Your tweet exceeds the maximum number of characters permitted.");
                return false;             
            } else if (formLength == 0){
                // Display the error field and add error text
                $(".error-container").show();
                $(".error-container .error p").text("Your tweet is empty.");
                return false;
            } else {
                return true;
            }
        }
        if (validateForm() === false){
            event.stopPropagation();
        } 
        else {
            // if successful, continue
            $.ajax({
                // sending the data to the server (asychronously)
                method: 'POST',
                url: '/tweets/',
                data: formContent,
                success: () => {
                    $("form#post-tweet")[0].reset();
                }
            }).then((tweet) => {
                // after the data is sent, load the tweets, clear the error (if 
                // ... there is one), then clear the text area.
                renderSingleTweet(tweet);
                $(".new-tweet .error-container").slideUp();
                $(".new-tweet .textarea").text("");
                $(".counter").text("140");
            },
            (err) => {
                throw err.responseJSON;
            })
        }
    });
})