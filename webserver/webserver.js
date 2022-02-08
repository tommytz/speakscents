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
var app = express();
var session = require('client-sessions');

//Local modules required
var form = require('./form-reader.js');
var sql_api = require('./sql_api');

//Server details
const { allowedNodeEnvironmentFlags } = require('process');
const { resolve } = require('path');
var port = 8080;

//Setting node.js for parsing json, multibox forms, css styling
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(upload.array());
app.use(express.static('public'));
app.use(flash());
// app.use(function (req, res, next) { //Needed for connect-flash and session data, please leave for now AdL.
//   res.locals.messages = require('express-messages')(req, res);
//   next();
// });
app.use('/css', express.static(__dirname + '/css'));
app.use('/static_scripts', express.static(__dirname + '/static_scripts'));

app.set('view engine', 'ejs'); //Changing the engine to ejs, so we can view/embed data in particular way

//Server creation and listening on port number. This is called automatically when this module is initialised
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

//Opening connection to database
sql_api.connect2DB();

//cookie
app.use(session({
  cookieName: 'session',
  secret: 'random_string_goes_here',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

/* *************************************************************************
 * Processing requests from webengine
 * *************************************************************************/

//Landing page when a client access the server
app.get("/", function (req, res) {

  var fileName = "/quiz.html";
  res.sendFile(__dirname + fileName);
});

//This request gets form data from the quiz and stores data in the database
app.post("/quiz-submit", function (req, res) {

  //async db function handler
  callerFunQuizResults(req, res);

});

//store quiz results into db function
function storeQuizResults(req, res) {
  return new Promise((resolve, reject) => {
    //get form quiz results and then insert to db
    var jsonObject = form.get_json(req.body);

    sql_api.insertToDatabase(jsonObject);
    setTimeout(() => { resolve(); },
      500);
  });
}

//async database function 
//first waits for data to be inserted and then will run ejs dispay function
async function callerFunQuizResults(req, res) {
  console.log("Caller");
  await storeQuizResults(req, res);
  console.log("After waiting");
  //direct to the ejs quiz results page
  res.redirect('/quiz-results');

}


//Registration page
app.get('/registration', function (req, res) {
  res.sendFile(__dirname + '/registration.html');
});

//Submit registered data and returns them to the quiz.html page
app.post('/registration-submit', function (req, res) {

  var jsonObject = form.get_json(req.body);

  sql_api.insertToDatabaseRegistration(jsonObject);

  res.sendFile(__dirname + '/quiz.html');

});

//login page
app.get('/login', function (req, res) {
  res.render('login');
});

//login details submit
app.post('/login-submit', async function (req, res) {
  let valid;
  let quiz;

  try {

    valid = await form.valdiateLogin(req, res);
    quiz = await sql_api.readQuizEntry();

  } catch (error) {
    console.log("Error: ", error);
  }

  let loginValidation = await form.valdiateLogin(req, res);

  if (loginValidation.valid) {

    // sets a cookie with the user's info
    req.session.user = user;

    // Res page with results
    let quiz_data = await sql_api.readQuizEntry();
    res.render("profile", {
      name: loginValidation.name,
      email: loginValidation.email,
      suggestions: quiz_data[0],
      time: quiz_data[1],
      season: quiz_data[2],
      scentStrength: quiz_data[3],
      scentMood: quiz_data[4],
      scentStyles: quiz_data[5]
    });

  } else {
    res.send("Invalid Login");
  }

});

//This function returns the saved results from the DB and presents it back to the user.
app.get('/quiz-results', async function (req, res) {

  //Obatining data from database. Async function, returns promise.
  let quiz_data = await sql_api.readQuizEntry();
  res.render("profile", {
    suggestions: quiz_data[0],
    time: quiz_data[1],
    season: quiz_data[2],
    scentStrength: quiz_data[3],
    scentMood: quiz_data[4],
    scentStyles: quiz_data[5]
  });
});



//View Shop 
app.get('/shop', function (req, res) {
  res.render('shop');
});

