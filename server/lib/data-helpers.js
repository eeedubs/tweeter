"use strict";

const ObjectId    = require("mongodb").ObjectID;

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
        if (err) {
          return callback(err);
        }
        callback(null, tweets.sort(sortNewestFirst));
      });
    },

    getSingleTweetByID: function(tweetID, callback) {
      return new Promise((resolve, reject) => {
        resolve(db.collection("tweets").findOne({ "_id": ObjectId(tweetID) }));
      }).then((tweet, error) => {
        if (error){
          return callback(error);
        }
        callback(null, tweet);
      })
    },

    addNewLike: function(tweetID, userID, callback) {
      db.collection("tweets").findAndModify(
          { "_id": ObjectId(tweetID) },
          {}, 
          { $push: { "likes": userID } },
          { new: true, upsert: false },
          function(err, returnedTweet){
            if (err){
              return callback(err)
            }
            callback(null, returnedTweet)
          }
      );
    },

    removeLike: function(tweetID, userID, callback) {
      db.collection("tweets").findAndModify(
        { "_id": ObjectId(tweetID) }, 
        {},
        { $pull: {"likes": userID } },
        { new: true, upsert: false },
        function(err, returnedTweet){
          if (err){
            return callback(err)
          }
          callback(null, returnedTweet)
        }
      )
    }
  }
}
