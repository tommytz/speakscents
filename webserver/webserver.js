/*
 * This module's primary purpose is to process API calls from webengine to database.
 * This module controls the following:
 * - Opening server
 * - Open connection to database
 * - Process http post/get requests
 */

//Dependencies and required internal node.js modules
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var flash = require('connect-flash');
var ejs = require('ejs');
var upload = multer();
var helmet = require('helmet');
var cookieparser = require('cookie-parser');
var expSessions = require('express-session');
var app = express();

//Local modules required
var form = require('./form-reader.js');
var sql_api = require('./sql_api');

//Server details
const { allowedNodeEnvironmentFlags } = require('process');
var port = 8080;

//Setting node.js for parsing json, multibox forms, css styling
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(upload.array());
app.use(express.static('public'));
app.use(flash());
app.use('/css', express.static(__dirname + '/css'));
app.use(helmet());
app.use(cookieparser());
app.use(expSessions({
  secret: "thisismysecretkeyfhrgfgrfrty84fwir767",
  saveUninitialized:true,
  cookie: { 
    maxAge: 1800000,
    secure: true,
    httpOnly: true,
    sameSite: 'lax' },
    resave: false
}));

var session;

//Changing the engine to ejs, so we can view/embed data in particular way, that can we can then manipulate in express
//This replaces serving a html file, instead of send file, we use render. Please don't edit, thanks AL
app.set('view engine', 'ejs');

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
app.get("/", function (req, res) {

  var fileName = "/quiz.html";
  res.sendFile(__dirname + fileName);
  session = req.session;
  console.log(session);
  res.cookie(`Cookie token name`, `Cookie string value`, {
      
  });
});

//This request gets form data from the quiz and stores data in the database
app.post("/quiz-submit", function (req, res) {

  var jsonObject = form.get_json(req.body);

  sql_api.insertToDatabase(jsonObject);

  //Responds client to submission page
  res.sendFile(__dirname + "/quiz_results.html");

 
});

//Registration page
app.get('/registration', function (req, res) {
  res.sendFile(__dirname + '/registration.html');
});

//Submit registered data and returns them to the quiz.html page
app.post('/registration-submit', function (req, res) {

  form.get_json(req.body);

  //code for database injection goes here
  res.sendFile(__dirname + '/quiz.html');

});

//login page
app.get('/login', function (req, res) {
  res.sendFile(__dirname + '/login.html');
});

//login details submit
//TODO don't yet have login verification
app.post('/login-submit', function(req,res){

  form.get_json(req.body);
  res.sendFile(__dirname + '/quiz.html');

});

//Logout (forces cookies and session to clear from browser)
app.get('/logout',(req,res) => {
  req.session.destroy();
  res.redirect('/');
});

//This function returns the saved results from the DB and presents it back to the user
// WORK IN PROGRESS 02/02/2022 11:39am
app.get('/quiz-results', function (req, res) {

  //Data from sql
  var data = sql_api.queryFromDatabase();
  console.log(typeof data);
  console.log("From the function call: " + data);

  let html = ejs.render('<%= people.join(", "); %>', {people: people});

  var suggestions = "hellow";
  var time = "mate";
  var season = "what's going on?";
  var scentStrength = "you ok buddy?";
  var scentMood = "see ya matey";
  var scentStyles = "potatey";


  res.render("quiz_results", {
    suggestions: suggestions,
    time: time,
    season: season,
    scentStrength: scentStrength,
    scentMood: scentMood,
    scentStyles: scentStyles
  });


});