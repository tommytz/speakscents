
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
const get_results = function (body) {

  var data = "{";

  var data_elements = document.getElementById("quiz").elements;

  for (var i = 0; i < data_elements.length - 1; i++) {

    if (data_elements[i].type === "radio" || data_elements[i].type === "checkbox") {
      data = data + `"${data_elements[i].getAttribute("id")}":"${data_elements[i].checked}"`;

    } else if (data_elements[i].type === "text") {
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
//Returning straight JSON file of the form data.
//
const get_json = function (body) {

  return body
};



//
//This method takes form data and returns an array list of [key,value]
//
const get_jsonAsList = function (body) {

  var results = []

  for(var key in body){
      results.push([key, body[key]])
  }


  return results
};

//
//This method takes form data and returns an array list of [values] only
//
const get_jsonAsListOfValues = function (body) {

  var results = []
  
  for(var key in body){
      results.push(body[key])
  }

  return results
};


//
//This method takes form data and returns json string
//
const get_jsonAsString = function (body) {

  var data = JSON.stringify(body);

  return data;

};

module.exports = { get_json, get_jsonAsList, get_jsonAsListOfValues, get_jsonAsString, get_results };
