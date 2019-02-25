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

  function authorizeUser(username, password){
    
    return new Promise((resolve, reject) => {
      resolve(db.collection('users').findOne({ "handle": username }));
    }).then((userInDatabase) => {
      if (userInDatabase && bcrypt.compareSync(password, userInDatabase.password)){
        return true;
      } else {
        return false;
      }
    })
  }

  app.get("/login", function(req, res) {
    res.render("urls_login");
  });
  
  app.get("/signup", function(req, res) {
    res.render("urls_signup");
  });

  app.post("/login", function(req, res) {
    let username = `@${req.body.username}`;
    let password = req.body.password;
    let newUUID = uuidv4();
    async function authenticate(){
      let isUser = await authorizeUser(username, password);
      return isUser;
    }
    authenticate().then((isValid) => {
      if (isValid){
        db.collection("users").findOneAndUpdate({ "handle": username }, {$set: { "session_id": newUUID } }, {}, function(error, response) {
          if (error){
            console.log("Error: ", error);
          } else {
            console.log("Response: ", response);
          }
        })
        req.session.user_id = newUUID;
        res.redirect(301, `http://localhost:8080/`);
      } else {
        res.status(400).send("Incorrect username and/or password.");
      }
    })
    // let isValid = await authorizeUser(parsedUser.username, parsedUser.password);
    // console.log(isValid);
  })

  app.post("/signup", function(req, res) {
    let newUUID = uuidv4();
    let hashedPassword = bcrypt.hashSync(req.body.password, 10)
    let userAvatars = userHelpers.generateUserAvatars(req.body.username)
    let userProfile = {
      "session_id": newUUID,
      "name": `${req.body.firstName} ${req.body.lastName}`,
      "handle": `@${req.body.username}`,
      "password": hashedPassword,
      "avatars": userAvatars
    };
    return new Promise((resolve, reject) => {
      resolve(db.collection('users').find({ "handle": req.body.username }).count())
    }).then((countOfMatchingUsers) => {
      if (countOfMatchingUsers > 0){
        console.log("This user already exists in the database");
        res.status(400).send("400 Bad Request Error: A user with the handle provided already exists in the system.");
      } else {
        console.log("Adding the following user to the database: ", userProfile);
        db.collection("users").insertOne(userProfile);
        req.session.user_id = newUUID;
        userProfile, hashedPassword = null;
        res.redirect(301, `http://localhost:8080/`);
      }
    })
  });

  
  // Mount the tweets routes at the "/tweets" path prefix:
  app.use("/tweets", tweetsRoutes);
});

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
