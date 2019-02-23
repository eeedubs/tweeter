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
    let $datePosted = $("<p>").addClass("date-posted").text(unixDate(tweet.created_at)).appendTo($footer);
    let $socialIcons = $("<div>").addClass("icons").appendTo($footer);
    let $like = $(`<i class="far fa-thumbs-up"></i>`).appendTo($socialIcons);
    let $retweet = $(`<i class="fas fa-retweet"></i>`).appendTo($socialIcons);
    let $flag = $(`<i class="fas fa-flag"></i>`).appendTo($socialIcons);
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
                console.log("Got tweets! Rendering...");
                renderTweets(tweets);
            })
            .fail(() => {
                // if the tweets cannot be found, return an error
                alert("Error");
            });
    }
    loadTweets();

    function loadNewestTweet(){
        $.get("/tweets")
            .done(tweets => {
                console.log("Got newest tweet! Rendering...");
                let end = tweets.length - 1
                renderSingleTweet(tweets[end]);
            })
            .fail(() => {
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

    $('form.post-tweet').on('submit', function(event) {
        // when a submit event is called on "form", perform a function with argument "e" (for each event occurrence)
        event.preventDefault();
        // prevent the default, which is to reload the page
        const formContent = $(this).serialize();
        const formLength = $("textarea").val().length;
        // serialize creates key:value pairs with the data entered ( in this case, key:value = text:<tweet message> )
        // console.log('formContent', formLength);
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
        } else {
            // if successful, continue
            $.ajax({
                // sending the data to the server (asychronously)
                method: 'POST',
                url: '/tweets',
                data: formContent,
                success: function(data){
                    $("form")[0].reset();
                }
            }).then(() => {
                // after the data is sent, load the tweets, clear the error (if 
                // ... there is one), then clear the text area.
                loadNewestTweet();
                $(".new-tweet .error-container").slideUp();
                $(".new-tweet .textarea").text("");
                $(".counter").text("140");
            },
            (err) => {
                throw err;
                })
            }
    });
})