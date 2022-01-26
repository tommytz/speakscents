
/* 
 *  This function retrieves the results from HTML form when submitted and returns a JSON object.
 *
 */

function get_results(){
    var quiz_data = "{"
    var quote_marks = "\""
    var semi = ":"

    var quiz_elements = document.getElementById("quiz").elements

    for (var i = 0; i < quiz_elements.length - 1; i++) {

        if(quiz_elements[i].type === "radio" || quiz_elements[i].type === "checkbox"){

            // console.log(quiz_elements[i].getAttribute("id") +" : "+ quiz_elements[i].checked)
            quiz_data = quiz_data + quote_marks + quiz_elements[i].getAttribute("id") + quote_marks + semi + quote_marks + quiz_elements[i].checked + quote_marks
        } else if(quiz_elements[i].type === "text"){
            quiz_data = quiz_data + quote_marks + quiz_elements[i].getAttribute("id") + quote_marks + semi + quote_marks + quiz_elements[i].value + quote_marks
            // console.log(quiz_elements[i].getAttribute("id") +" : "+ quiz_elements[i].value)
        }
        
       
        if(i === quiz_elements.length - 2){
            quiz_data = quiz_data + "}"
        } else {
            quiz_data = quiz_data + ","
        }
    }

    var quiz_JSON = JSON.parse(quiz_data)
    return quiz_JSON
}