"use strict";

const userHelper    = require("../lib/util/user-helper")

const express       = require('express');
const tweetsRoutes  = express.Router();

module.exports = function(DataHelpers) {

  tweetsRoutes.get("/", function(req, res) {
    DataHelpers.getTweets((err, tweets) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(tweets);
      }
    });
  });

  // Handles the liking and unliking of tweets
  tweetsRoutes.put("/like", function(req, res) {
    let tweetID = req.body.tweetID;
    let loggedInUserID = req.body.loggedInUserID;
    DataHelpers.getSingleTweetByID(tweetID, (err, retrievedTweet) => {
      if (err){
        res.status(500).json({ error: err.message });
      } else {
        if (retrievedTweet.likes.includes(loggedInUserID)){
          DataHelpers.removeLike(tweetID, loggedInUserID, (err, updatedTweet) => {
            if (err){
              res.status(500).json({ error: err.message });
            } else {
              let newLikeCount = updatedTweet.value.likes.length;
              res.json({ "newLikeCount": newLikeCount })
            }
          })
        } else {
          DataHelpers.addNewLike(tweetID, loggedInUserID, (err, updatedTweet) => {
            if (err){
              res.status(500).json({ error: err.message });
            } else {
              let newLikeCount = updatedTweet.value.likes.length;
              res.json({ "newLikeCount": newLikeCount })
            }
          })
        }
      }
    })
  })

  // if the text field in the tweet box is empty, return the error
  tweetsRoutes.post("/", function(req, res) {
    if (!req.body.text) {
      res.status(400).json({ error: 'invalid request: no data in POST body'});
      return;
    }
    const user = req.body.user ? JSON.parse(req.body.user) : userHelper.generateRandomUser();
    const tweet = {
      user: user,
      content: {
        text: req.body.text
      },
      created_at: Date.now(),
      likes: []
    };
    DataHelpers.saveTweet(tweet, (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        console.log("Posting the following tweet to the Mongo database: ", tweet);
        res.status(201).send(tweet);
      }
    });
  });

  return tweetsRoutes;

}
