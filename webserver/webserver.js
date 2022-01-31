var express = require('express')
var bodyParser = require('body-parser')
var multer = require('multer')
var upload = multer()
var app = express()

var quiz = require('./quiz.js')
var reg = require('./registration.js')

const { allowedNodeEnvironmentFlags } = require('process')

//Changing the engine to ejs, so we can view/embed data in particular way, that can we can then manipulate in express
//This replaces serving a html file, instead of send file, we use render.
// app.set('view engine', 'ejs')

var port = 8080

//for parsing json, multiforms
app.use(bodyParser.urlencoded({ extended: true}))
app.use(bodyParser.json())
app.use(upload.array())
app.use(express.static('public'))

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

    quiz.get_json(req.body)

    res.send("Results Recieved")
})

//registration page
app.get('/registration', function(req,res){
    res.sendFile(__dirname + '/registration.html')
})

app.post('/registration-submit', function(req,res){

    reg.get_json(req.body)
    res.sendFile(__dirname + '/quiz.html')

})