"use strict";

// Basic express setup:

const PORT          = 8080;
const express       = require("express");
const bodyParser    = require("body-parser");
const app           = express();
const path          = require("path");
const bcrypt        = require("bcrypt");
const uuidv4        = require('uuid/v4');
const cookieSession = require('cookie-session')

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("views", path.join(__dirname, '../public/views'));

app.set("view engine", "ejs");

app.use(cookieSession({
  name: "session",
  keys: ["userID"]
}))

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
    let parsedUser = req.body;
    let uuid = uuidv4()
    let hashedPassword = bcrypt.hashSync(parsedUser.password, 10)
    let userAvatars = userHelpers.generateUserAvatars(parsedUser.username)
    let userProfile = {
      "session_id": uuid,
      "name": `${parsedUser.firstName} ${parsedUser.lastName}`,
      "handle": parsedUser.username,
      "password": hashedPassword,
      "avatars": userAvatars
    };
    return new Promise((resolve, reject) => {
      resolve(db.collection('users').find({ "handle": parsedUser.username }).count())
    }).then((countOfMatchingUsers) => {
      if (countOfMatchingUsers > 0){
        console.log("This user already exists in the database");
        res.status(400).send("400 Bad Request Error: A user with the handle provided already exists in the system.");
      } else {
        console.log("Adding the following user to the database: ", userProfile);
        db.collection("users").insertOne(userProfile);
        req.session.user_id = uuid;
        parsedUser, userProfile, hashedPassword = null;
        res.redirect("/");
      }
    })
  });

  
  // Mount the tweets routes at the "/tweets" path prefix:
  app.use("/tweets", tweetsRoutes);
});

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
