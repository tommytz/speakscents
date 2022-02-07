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
// app.use(function (req, res, next) { //Needed for connect-flash and session data, please leave for now AdL.
//   res.locals.messages = require('express-messages')(req, res);
//   next();
// });
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

  //async db function handler
  callerFunQuizResults(req, res);

});

//store quiz results into db function
function storeQuizResults(req, res) {
  return new Promise((resolve, reject) => {
    //get form quiz results and then insert to db
    var jsonObject = form.get_json(req.body);

    sql_api.insertToDatabase(jsonObject);
    setTimeout(() => {
      resolve();
      ;
    }, 5000
    );
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
  console.log("ejs login");
  res.render('login');
});

//login details submit
//TODO: Clean up, so ugly and not dynamic :((( AdL
app.post('/login-submit', function (req, res) {

  //We can probably move this to the form-reader module >>>>>
  //Retrieving login details
  let unparsedJSON = form.get_json(req.body);
  let login_details = [];

  for (let data in unparsedJSON) {
    let temp = unparsedJSON[data];

    if (temp instanceof Array) {
      temp = JSON.stringify(temp);
    }

    login_details.push(temp);
  }

  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  //Assigning login details
  let email = login_details[0];
  let enteredPassword = login_details[1];

  //Reading login data from SQL
  let data = sql_api.readLogin(email);
  let customer_values = [];

  data.then((result) => {

    for (var i in result) {
      customer_values.push(result[i]);

    }
  }).then(() => {
    // var custid = customer_values[0];
    var name = customer_values[1];
    var password = customer_values[2];
    var email = customer_values[3];

    if (password === enteredPassword) {

      var quiz_data = sql_api.readQuizEntry();
      var quiz_values = [];

      //Async chaining functions.
      quiz_data.then((result) => {

        for (var i in result) {
          quiz_values.push(result[i]);
        }

      }).then(() => {
        var suggestions = quiz_values[0];
        var time = quiz_values[1];
        var season = quiz_values[2];
        var scentStrength = quiz_values[3];
        var scentMood = quiz_values[4];
        var scentStyles = quiz_values[5];


        /* At the moment not redirecting through a get request, this needs to change.
         * Having trouble passing parameters to another route. Instead of res.render should be res.redirect('/profile') with
         * all the paramaters. AdL
         * */
        res.render("profile", {
          name: name,
          email: email,
          suggestions: suggestions,
          time: time,
          season: season,
          scentStrength: scentStrength,
          scentMood: scentMood,
          scentStyles: scentStyles

        }
        );

      });
    } else {
      res.redirect('/registration');
    }

  });

});

//Logout (forces cookies and session to clear from browser)
app.get('/logout',(req,res) => {
  req.session.destroy();
  res.redirect('/');
});

//This function returns the saved results from the DB and presents it back to the user
// WORK IN PROGRESS 02/02/2022 11:39am
app.get('/quiz-results', function (req, res) {

  //Obatining data from database. Async function, returns promise.
  var data = sql_api.readQuizEntry();
  var values = [];

  //Async chaining functions.
  data.then((result) => {
    // console.log(result);
    for (var i in result) {
      values.push(result[i]);
    }
  }).then(() => {

    var suggestions = values[0];
    var time = values[1];
    var season = values[2];
    var scentStrength = values[3];
    var scentMood = values[4];
    var scentStyles = values[5];

    res.render("quiz_results", {
      suggestions: suggestions,
      time: time,
      season: season,
      scentStrength: scentStrength,
      scentMood: scentMood,
      scentStyles: scentStyles
    });
  });

});