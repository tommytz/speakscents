
const { start } = require("repl")

/* 
 *  This function retrieves the results from HTML form when submitted and returns a JSON object.
    Note: not useful for Express.js
 */
const get_results = function(body) {

    var quiz_data = "{"

    var quiz_elements = document.getElementById("quiz").elements

    for (var i = 0; i < quiz_elements.length - 1; i++) {
        
        if(quiz_elements[i].type === "radio" || quiz_elements[i].type === "checkbox"){
            quiz_data = quiz_data + `"${quiz_elements[i].getAttribute("id")}":"${quiz_elements[i].checked}"`
        
        } else if(quiz_elements[i].type === "text"){
            quiz_data = quiz_data + `"${quiz_elements[i].getAttribute("id")}":"${quiz_elements[i].value}"`
    
        }
        
       
        if(i === quiz_elements.length - 2){ //The last question. The last element in the form will always be the submit button, hence -2.
            quiz_data = quiz_data + "}"
        } else {
            quiz_data = quiz_data + ","
        }
    }

    var quiz_JSON = JSON.parse(quiz_data)
    console.log(quiz_JSON)
    return quiz_JSON
}


//This method returns string version of json file to parse for information, to be sent to the SQL db
const get_json = function(body){


    var quiz_string = JSON.stringify(body)
    // console.log(quiz_string)

 
    // this returns an array list
    // var results = []

    // for(var key in body){
    //     results.push([key, body[key]])
    // }

    // console.log(results)
    // console.log(results.length)

    // if(results[0].includes('night')){
    //     console.log(true)
    // } else {
    //     console.log(false)
    // }

    // another style depending on how sql gets populated with quiz results
    var results = []

    for(var key in body){
        results.push(body[key])
    }

    console.log(results)
}
    

const { start } = require("repl")

/* 
 *  This function retrieves the results from HTML form when submitted and returns a JSON object.
    Note: not useful for Express.js
 */
const get_results = function(body) {

    var quiz_data = "{"

    var quiz_elements = document.getElementById("quiz").elements

    for (var i = 0; i < quiz_elements.length - 1; i++) {
        
        if(quiz_elements[i].type === "radio" || quiz_elements[i].type === "checkbox"){
            quiz_data = quiz_data + `"${quiz_elements[i].getAttribute("id")}":"${quiz_elements[i].checked}"`
        
        } else if(quiz_elements[i].type === "text"){
            quiz_data = quiz_data + `"${quiz_elements[i].getAttribute("id")}":"${quiz_elements[i].value}"`
    
        }
        
       
        if(i === quiz_elements.length - 2){ //The last question. The last element in the form will always be the submit button, hence -2.
            quiz_data = quiz_data + "}"
        } else {
            quiz_data = quiz_data + ","
        }
    }

    var quiz_JSON = JSON.parse(quiz_data)
    console.log(quiz_JSON)
    
    return quiz_JSON
}


//This method returns string version of json file to parse for information, to be sent to the SQL db
const get_json = function(body){



    var quiz_string = JSON.stringify(body)
    console.log(quiz_string)
    return quiz_string
    // // console.log(quiz_string)

 
    // // this returns an array list
    // // var results = []

    // // for(var key in body){
    // //     results.push([key, body[key]])
    // // }

    // // console.log(results)
    // // console.log(results.length)

    // // if(results[0].includes('night')){
    // //     console.log(true)
    // // } else {
    // //     console.log(false)
    // // }

    // // another style depending on how sql gets populated with quiz results
    // var results = []

    // for(var key in body){
    //     results.push(body[key])
    // }

    // console.log(results)
}
    
module.exports = {get_json} 
