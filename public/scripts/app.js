/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 */

function createTweetElement (tweet){
    var $tweet = $("<article>").addClass("tweet");
    var $header = $("<header>").appendTo($tweet);
    var $avatar = $("<img>").addClass("avatar").attr("src", tweet.user.avatars.small).appendTo($header);
    var $name = $("<h2>").text(tweet.user.name).appendTo($header);
    var $handle = $("<p>").addClass("handle").text(tweet.user.handle).appendTo($header);
    var $content = $("<p>").addClass("content").text(tweet.content.text).appendTo($tweet);
    var $footer = $("<footer>").appendTo($tweet);
    var $datePosted = $("<p>").addClass("date-posted").text(unixDate(tweet.created_at)).appendTo($footer);
    return $tweet;
}

// const data = [
//     // data[0] level
//     {
//     // data[0].tweet level (3 tweets in data)
//     // first tweet
//         "user": {
//             "name": "Newton",
//             "avatars": {
//                 "small":   "https://vanillicon.com/788e533873e80d2002fa14e1412b4188_50.png",
//                 "regular": "https://vanillicon.com/788e533873e80d2002fa14e1412b4188.png",
//                 "large":   "https://vanillicon.com/788e533873e80d2002fa14e1412b4188_200.png"
//             },
//             "handle": "@SirIsaac"
//         },
//         "content": {
//             "text": "If I have seen further it is by standing on the shoulders of giants"
//         },
//         "created_at": 1461116232227
//     },
//     {
//     // second tweet
//         "user": {
//             "name": "Descartes",
//             "avatars": {
//                 "small":   "https://vanillicon.com/7b89b0d8280b93e2ba68841436c0bebc_50.png",
//                 "regular": "https://vanillicon.com/7b89b0d8280b93e2ba68841436c0bebc.png",
//                 "large":   "https://vanillicon.com/7b89b0d8280b93e2ba68841436c0bebc_200.png"
//             },
//             "handle": "@rd" 
//         },
//         "content": {
//             "text": "Je pense , donc je suis"
//         },
//         "created_at": 1461113959088
//     },
//     {
//     // third tweet        
//         "user": {
//             "name": "Johann von Goethe",
//             "avatars": {
//                 "small":   "https://vanillicon.com/d55cf8e18b47d4baaf60c006a0de39e1_50.png",
//                 "regular": "https://vanillicon.com/d55cf8e18b47d4baaf60c006a0de39e1.png",
//                 "large":   "https://vanillicon.com/d55cf8e18b47d4baaf60c006a0de39e1_200.png"
//             },
//             "handle": "@johann49"
//         },
//         "content": {
//             "text": "Es ist nichts schrecklicher als eine tätige Unwissenheit."
//         },
//         "created_at": 1461113796368
//     }
//   ];

function unixDate(digits){
    var dateTime = new Date(digits);
    return dateTime;
}

$(document).ready(function() {

    function renderTweets(tweetDataArray){
        // render tweets for an array of tweet data
        tweetDataArray.forEach(function(item) {
            // for each tweet in the array of tweet data, render it an append it to the 
            // .all-tweets section in index.html
            var $tweet = createTweetElement(item);
            // console.log("Tweet item: ", $tweet);
            $(".all-tweets").prepend($tweet);
        });
    }
    // function to handle the rendering of tweets into DOM structure (tree)

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

    $('form').on('submit', function(event) {
        // when a submit event is called on "form", perform a function with argument "e" (for each event occurrence)
        event.preventDefault();
        // prevent the default, which is to reload the page
        const formContent = $(this).serialize();
        const formLength = $("textarea").val().length;
        // serialize creates key:value pairs with the data entered ( in this case, key:value = text:<tweet message> )
        console.log('formContent', formLength);
        function validateForm(){
            if (formLength >= 140){
                alert("You have exceeded the maximum number of characters.");
                return false;             
            } else if (formLength == 0){
                alert("Your tweet is empty.");
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
            }).then(data => {
                // after the data is sent, load the tweets.
                loadTweets();
                $("textarea").text("");
            },
            (err) => {
                throw err;
                })
            }
        // response after the data has been sent
    });
})