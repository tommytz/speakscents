
/* 
 *  This function retrieves the results from HTML form when submitted and returns a JSON object.
 */
function get_results(){
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
    return quiz_JSON
}