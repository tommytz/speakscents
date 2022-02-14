/*
 * This module's primary purpose is to process API calls from webengine to database.
 * This module controls the following:
 * - Opening server
 * - Open connection to database
 * - Process http post/get requests
 */

//Dependencies and required internal node.js modules
var express = require("express");
var bodyParser = require("body-parser");
var multer = require("multer");
var flash = require("connect-flash");
var ejs = require("ejs");
var upload = multer();
var helmet = require("helmet");
var cookieparser = require("cookie-parser");
var expSessions = require("express-session");
var MSSQLStore = require("connect-mssql-v2");
var mssql = require("mssql");
var app = express();

//Measuring user time
var cookieAllowed = false;
const { performance } = require("perf_hooks");
var startTime = {};

var loggedIn = false;

//Local modules required
var form = require("./form-reader.js");
var sql_api = require("./sql_api");

//Server details
const { allowedNodeEnvironmentFlags } = require("process");
const { resolve } = require("path");
const { Cookie } = require("express-session");
var port = 8080;
const key_array = [
  "suggestions",
  "time",
  "season",
  "scentStrength",
  "scentMood",
  "scentStyles",
];

//Setting node.js for parsing json, multibox forms, css styling
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(upload.array());
app.use(express.static("public"));
app.use(flash());
// app.use(function (req, res, next) { //Needed for connect-flash and session data, please leave for now AdL.
//   res.locals.messages = require('express-messages')(req, res);
//   next();
// });
app.use("/css", express.static(__dirname + "/css"));
app.use("/static_scripts", express.static(__dirname + "/static_scripts"));

//Changing the engine to ejs, so we can view/embed data in particular way, that can we can then manipulate in express
//This replaces serving a html file, instead of send file, we use render. Please don't edit, thanks AL
app.set("view engine", "ejs");

app.use(helmet());
app.use(cookieparser());

//Connection configuration for MSSQLStore
var options = {
  user: "Morgan",
  password: "TestDB0001928",
  database: "test_database",
  server: "speakscents-test-server.database.windows.net",
  port: 1433,
  options: {
    trustServerCertificate: true,
    encrypt: true,
    table: "sessions",
  },
};

//Establishing a connection to session table of the database and setting it as the storage location for session data
var connection = mssql.connect(options);
var sessionStore = new MSSQLStore(options, connection);
var session;

//Declare attributes of client session
app.use(
  expSessions({
    secret: "secret key to sign cookie",
    saveUninitialized: true,
    resave: false,
    store: sessionStore,
    cookie: {
      maxAge: 1800000,
      secure: false,
      httpOnly: false,
      sameSite: "lax",
    },
  })
);

//Server creation and listening on port number. This is called automatically when this module is initialised
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

//Opening connection to database
sql_api.connect2DB();

/* *************************************************************************
 * Processing requests from webengine
 * *************************************************************************/

//Landing page when a client access the server



app.get("/", async function (req, res) {
  startTime = performance.now().toFixed(0) / 1000; //Starts timing user quiz completion in seconds

  var name = "";
  session = req.session;
  if (!loggedIn) {

    req.session.user = 111;
    req.session.purchase_vist = false;
    console.log(req.session.user);
  
  }
  else{
    try {
    var databaseLogin = await sql_api.getUserName(req.session.user);

    name = databaseLogin.name;
  } catch (error) {
    console.log(error);
  }
  }
  res.cookie(`Cookie token name`, req.session.id, {
  });
  res.render("quiz", {
    cookieAllowed: cookieAllowed,
    loggedIn: loggedIn,
    name: name
  });
 
});





//This request gets form data from the quiz and stores data in the database
app.post("/quiz-submit", function (req, res) {
  //async db function handler
  callerFunQuizResults(req, res);
  var endTime = performance.now().toFixed(0) / 1000;
  var totalTime = endTime.toFixed(0) - startTime.toFixed(0);
  if (cookieAllowed) { //If user has accepted cookies
    req.session.quiztime = totalTime; //Logs total quiz time to user session in seconds
  }
  console.log(`Time to complete quiz took ${totalTime} seconds`);
});

//store quiz results into db function
function storeQuizResults(req, res) {
  return new Promise((resolve, reject) => {
    //get form quiz results and then insert to db

    console.log(req.session.user);
    sql_api.insertToDatabase(req.body, req.session.user);
    setTimeout(() => {
      resolve();
    }, 500);
  });
}

//async database function
//first waits for data to be inserted and then will run ejs dispay function
async function callerFunQuizResults(req, res) {
  console.log("Caller");
  await storeQuizResults(req, res);
  console.log("After waiting");
  //direct to the ejs quiz results page
  res.redirect("/quiz-results");
}

//Registration page
app.get("/registration", function (req, res) {
  res.sendFile(__dirname + "/registration.html");
});

//Submit registered data and returns them to the quiz.html page
app.post("/registration-submit", function (req, res) {
  var jsonObject = req.body;

  sql_api.insertToDatabaseRegistration(jsonObject);
  res.sendFile(__dirname + "/quiz.html");
});

//login page
app.get("/login", function (req, res) {
  res.render("login");
});

//login details submit
app.post("/login-submit", async function (req, res) {
  let loginValidation = await form.valdiateLogin(req, res);
  let results = {
    name: loginValidation.name,
    email: loginValidation.email,
  };

  if (loginValidation.valid) {
    // sets a cookie with the user's info
    req.session.user = loginValidation.id;

    loggedIn = true;

    console.log(loginValidation.id);
    console.log("login successful" + loginValidation.name);
    console.log(req.session.user);
    console.log(req.session.id);

    // Res page with results
    let quiz_data = await sql_api.readUserQuizEntry(req.session.user);

    i = 0;
    key_array.forEach((key) => {
      results[key] = quiz_data[i];
      i++;
    });
    res.render("profile", results);
  } else {
    res.send("Invalid Login");
  }
});

//Logout (forces cookies and session to clear from browser)
app.get("/logout", (req, res) => {
  loggedIn = false;
  req.session.destroy();
  res.redirect("/");
});

//This function returns the saved results from the DB and presents it back to the user
app.get("/quiz-results", async function (req, res) {
  //Obatining data from database. Async function, returns promise.
  let quiz_data = await sql_api.readQuizEntry();
  res.render("quiz_results", {
    suggestions: quiz_data[0],
    time: quiz_data[1],
    season: quiz_data[2],
    scentStrength: quiz_data[3],
    scentMood: quiz_data[4],
    scentStyles: quiz_data[5],
  });
});

//View Shop
app.get("/shop", function (req, res) {
  req.session.purchase_vist = true;
  console.log(req.session.id);
  console.log(req.session.purchase_vist);
  res.render("shop");
});

//Accept Cookie
app.get("/acceptCookie", function (req, res) {
  cookieAllowed = true;
  console.log("cookie allowed");
  res.redirect('/');
});

// Loads scripts for popup
app.get('/popupscript', (req, res) => {
  res.sendFile(__dirname + "/popup.js");
});

// Loads css for popup
app.get('/popupcss', (req, res) => {
  res.sendFile(__dirname + "/css/popup.css");
});

// Load random image for popup
app.get('/random-scent', async (req, res) => {
  let randomImage = await form.serveImage();
  let randomScent = "/css/" + randomImage;

  res.sendFile(__dirname + randomScent);
});
