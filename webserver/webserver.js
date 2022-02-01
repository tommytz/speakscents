var express = require('express')
var bodyParser = require('body-parser')
var multer = require('multer')
var sqltest = require('./sqltest')
var upload = multer()
var app = express()
var flash = require('connect-flash')
var ejs = require('ejs')
var quiz = require('./quiz.js')
const { allowedNodeEnvironmentFlags } = require('process')



var port = 8080

//for parsing json, multiforms
app.use(bodyParser.urlencoded({ extended: true}))
app.use(bodyParser.json())
app.use(upload.array())
app.use(express.static('public'))
app.use(flash())


//Changing the engine to ejs, so we can view/embed data in particular way, that can we can then manipulate in express
//This replaces serving a html file, instead of send file, we use render.
app.set('view engine', 'ejs')

//Server created and listening on port number
app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})


//Responding to requests
// app.get('route', fn(req,res)) route url address. , fn being what action to fire when it does

//Home page
app.get('/', function(req,res){

    res.sendFile(__dirname + '/quiz.html')
})

//recieving quiz results
app.post('/quiz-submit', function(req,res){

    var jsonString = quiz.get_json(req.body)
    console.log("123====")
    console.log(jsonString)
    console.log("123====")
    var sqlRun = sqltest.runQuery(jsonString)
    console.log(sqlRun)

    res.send("Results Recieved")
})


//This function returns the saved results from the DB and presents it back to the user
app.get('/quiz-results', function(req,res){

    //Data from sql
    var data ="abcdefghijklmenop"
    
    // let html = ejs.render('<%= people.join(", "); %>', {people: people});

    var suggestions = "hellow"
    var time = "mate"
    var season = "what's going on?"
    var scentStrength = "you ok buddy?"
    var scentMood = "see ya matey"
    var scentStyles = "potatey"


    res.render("quiz_results", {
        suggestions: suggestions,
        time: time,
        season: season,
        scentStrength: scentStrength ,
        scentMood: scentMood,
        scentStyles: scentStyles
    })






})