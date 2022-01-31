const { start } = require("repl")

/* 
 *  This function retrieves the results from HTML form when submitted and returns a JSON object.
    Note: not useful for Express.js
 */
const get_results = function(body) {

    var reg_data = "{"

    var reg_elements = document.getElementById("registration").elements

    for (var i = 0; i < reg_elements.length - 1; i++) {
        
       
            reg_data = reg_data + `"${reg_elements[i].getAttribute("id")}":"${reg_elements[i].value}"`
    
        
        
       
        if(i === reg_elements.length - 2){ //The last question. The last element in the form will always be the submit button, hence -2.
            reg_data = reg_data + "}"
        } else {
            reg_data = reg_data + ","
        }
    }

    var reg_JSON = JSON.parse(reg_data)
    console.log(reg_JSON)
    return reg_JSON
}


//This method returns string version of json file to parse for information, to be sent to the SQL db
const get_json = function(body){


    var reg_string = JSON.stringify(body)
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
    

module.exports = {get_json} 