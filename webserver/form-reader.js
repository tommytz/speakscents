
/* This module processes form data. 
 * All data should  be validated in here
 * This module does the following:
 * - Recieves form data
 * - Validates data
 * - Returns an object of some form
 * 
 * ===========================================================
 * All functions that recieve form data MUST return an object
 * ===========================================================
 */

/* 
 *  This function retrieves the results from HTML form when submitted and returns a JSON object.
    Note: not useful for Express.js
 */

var sql_api = require('./sql_api');
var fs = require("fs");


const get_results = function (body) {

  var data = "{";

  var data_elements = document.getElementById("quiz").elements;

  for (var i = 0; i < data_elements.length - 1; i++) {

    if (data_elements[i].type === "radio" || data_elements[i].type === "checkbox") {
      data = data + `"${data_elements[i].getAttribute("id")}":"${data_elements[i].checked}"`;

    } else if (data_elements[i].type === "text" || reg_elements[i].type === "email" || reg_elements[i].type === "tel" || reg_elements[i].type === "password") {
      data = data + `"${data_elements[i].getAttribute("id")}":"${data_elements[i].value}"`;

    }

    if (i === data_elements.length - 2) { //The last question. The last element in the form will always be the submit button, hence -2.
      data = data + "}";
    } else {
      data = data + ",";
    }
  }

  //Creates JSON Object
  var data_JSON = JSON.parse(data);

  return data_JSON;
};

//
//This method takes form data and returns an array list of [key,value]
//
const get_jsonAsList = function (body) {

  var results = [];

  for (var key in body) {

    results.push([key, body[key]]);
  }


  return results;
};

//
//This method takes form data and returns an array list of [values] only
//
const get_jsonAsListOfValues = function (body) {

  var results = [];

  for (var key in body) {

    results.push(body[key]);
  }

  return results;
};


//
//This method takes form data and returns json string
//
const get_jsonAsString = function (body) {

  var data = JSON.stringify(body);

  return data;

};

//Validates login.
async function valdiateLogin(req, res) {

  let submittedEmail = req.body.email;
  let submittedPassword = req.body.password;
  let databaseLogin;
  let databasePassword;
  let databaseName;
  let databaseId;
  let databaseEmail;
  let isValid;

  try {

    databaseLogin = await sql_api.readLogin(submittedEmail);
    databasePassword = databaseLogin.password;
    databaseName = databaseLogin.name;
    databaseId = databaseLogin.customer_id;
    databaseEmail = databaseLogin.email;
    isValid = (submittedPassword === databasePassword);

  } catch (error) {
    console.log(error);
  }

  let loginObject = {
    valid: isValid,
    name: databaseName,
    email: databaseEmail,
    id: databaseId
  };


  return loginObject;
}

//Gets all images in the css folder and returns an array.
function getImages(){
  return new Promise((resolve, reject) => {
    fs.readdir(__dirname + "/css", (err, file) => {
      if(err){
        
        
        reject(err);
      } else {
        let images = [];
        file.forEach((file) => {
          
          if(file.toString().startsWith("perfume")){
            images.push(file);
          
          }
        });
        
        resolve(images);
      }
    });
  })
}

//Serves a different random image
async function serveImage(){
  try{
    let images = await getImages();
    let selectedImage = images[getRandomInt(images.length)];

    return selectedImage;
  } catch (err){
    console.log("Error: " + err);
  }
}

//Returns random number based on max value.
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

module.exports = { get_jsonAsList, get_jsonAsListOfValues, get_jsonAsString, get_results, valdiateLogin, serveImage };