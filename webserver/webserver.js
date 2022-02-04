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
app.use('/static_scripts', express.static(__dirname + '/static_scripts'));
app.set('view engine', 'ejs'); //Changing the engine to ejs, so we can view/embed data in particular way

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
});

//This request gets form data from the quiz and stores data in the database
app.post("/quiz-submit", function (req, res) {

  //async db function handler
  callerFun(req, res);

});

//store quiz results into db function
function storeQuizResults(req, res){
  return new Promise((resolve,reject)=>{
    //get form quiz results and then insert to db
    var jsonObject = form.get_json(req.body);

    sql_api.insertToDatabase(jsonObject);
      setTimeout(()=>{
          resolve();
      ;} , 5000
      );
  });
}

//async database function 
//first waits for data to be inserted and then will run ejs dispay function
async function callerFun(req, res){
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
  res.sendFile(__dirname + '/login.html');
});

app.get('/account', function (req, res) {
  
  res.render("account");
});

//login details submit
//TODO don't yet have login verification
app.post('/login-submit', function (req, res) {

  form.get_json(req.body);
  res.sendFile(__dirname + '/quiz.html');

});

//This function returns the saved results from the DB and presents it back to the user.
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