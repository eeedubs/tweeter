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
        console.log("Retrieving the following tweets from the Mongo database: ", tweets);
        res.json(tweets);
      }
    });
  });

  // if the text field in the tweet box is empty, return the error
  tweetsRoutes.post("/", function(req, res) {
    if (!req.body.text) {
      res.status(400).json({ error: 'invalid request: no data in POST body'});
      return;
    }
    const user = req.body.user ? req.body.user : userHelper.generateRandomUser();
    const tweet = {
      user: JSON.parse(user),
      content: {
        text: req.body.text
      },
      created_at: Date.now()
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
