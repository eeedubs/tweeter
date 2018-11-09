"use strict";

// Simulates the kind of delay we see with network or filesystem operations

// Defines helper functions for saving and getting tweets, using the database `db`
module.exports = function makeDataHelpers(db) {
  return {

    // since callbacks take the parameters of callback(err, result), getTweets will
    // reference to saveTweets once it has the tweets, and then saveTweets will reference 
    // back to getTweets in order to save each tweet. 
    saveTweet: function (newTweet, callback) {
      db.collection('tweets').insertOne(newTweet);
      callback(null, true);
    },

    getTweets: function (callback) {
      const sortNewestFirst = (a, b) => a.created_at - b.created_at;
      db.collection('tweets').find().toArray((err, tweets) => {
        console.log("data-helpers/getTweets: ", tweets);
        if (err) {
          return callback(err);
        }
        callback(null, tweets.sort(sortNewestFirst));
      });
    }
  };
}
