"use strict";

// Basic express setup:

const PORT          = 8080;
const express       = require("express");
const bodyParser    = require("body-parser");
const app           = express();
const path          = require("path");
const bcrypt        = require("bcrypt");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("views", path.join(__dirname, '../public/views'));

app.set("view engine", "ejs");

const MongoClient = require("mongodb").MongoClient;
const MongoURL = "mongodb://localhost:27017/tweeter";

MongoClient.connect(MongoURL, (err, db) => {
  if (err) {
    console.error("Failed to connect: ${MongoURL}");
    throw err;
  }
  console.log("Connected to mongodb: ${MongoURL}");

  // The `data-helpers` module provides an interface to the database of tweets.
  // This simple interface layer has a big benefit: we could switch out the
  // actual database it uses and see little to no changes elsewhere in the code
  // (hint hint).
  //
  // Because it exports a function that expects the `db` as a parameter, we can
  // require it and pass the `db` parameter immediately:
  const DataHelpers = require("./lib/data-helpers.js")(db);

  // The `tweets-routes` module works similarly: we pass it the `DataHelpers` object
  // so it can define routes that use it to interact with the data layer.
  const tweetsRoutes = require("./routes/tweets")(DataHelpers);

  const userHelpers = require('./lib/util/user-helper.js');

  
  app.get("/login", function(req, res) {
    res.render("urls_login");
  });
  
  app.get("/signup", function(req, res) {
    res.render("urls_signup");
  });

  app.post("/signup", function(req, res) {
    let userInfo = req.body;
    let avatars = UserHelpers.generateUserAvatars(userInfo.username)
    console.log(userInfo);
    // db.collection('users')
  });

  
  // Mount the tweets routes at the "/tweets" path prefix:
  app.use("/tweets", tweetsRoutes);
});

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
