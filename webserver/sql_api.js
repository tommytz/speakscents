// https://docs.microsoft.com/en-us/azure/azure-sql/database/connect-query-nodejs?tabs=windows

const { reject } = require("lodash");
const { charset } = require("mime-types");
const { resolve } = require("path/posix");
const { Connection, Request, TYPES } = require("tedious");
const { callbackify } = require("util");
const username = "Morgan";
const password = "TestDB0001928";
const server_name = "speakscents-test-server.database.windows.net";
const db_name = "test_database";
var connection;

// Config required for database connection
const config = {
  authentication: {
    options: {
      userName: username,
      password: password
    },
    type: "default"
  },
  server: server_name,
  options: {
    database: db_name,
    encrypt: true,
    charset: 'utf8'
  }
};

//Opens the connection to the server
const connect2DB = function () {
  connection = new Connection(config);

  connection.on("connect", err => {
    if (err) {
   
      console.error(err.message);
    } else {
      console.log("successful connection");
    }
  });

  connection.connect();
};

//This uploads data from the webserver to the customer database
const insertToDatabase = function (unparsedJSON) {
  console.log("Inserting into Table...");
  // var parsedJSON = JSON.parse(unparsedJSON);
  var answer_array = [];
  for (data in unparsedJSON) {
    let temp = unparsedJSON[data];
    if (temp instanceof Array) {
      temp = JSON.stringify(temp);
    }
    answer_array.push(temp);
  }

  console.log(answer_array);

  //Saving json fields into list
  // var q1 = answer_array[0];
  // var q2 = answer_array[1];
  // var q3 = answer_array[2];
  // var q4 = answer_array[3];
  // var q5 = answer_array[4];
  // var q6 = answer_array[5];

  // console.log(q1);

  // Constructing the request for the insert query
  var query = `INSERT INTO quiz_results (customer_id, answer_path, cluster, quiz_version, question_1, question_2, question_3, question_4, question_5, question_6) `;
  var values = `VALUES ('123', 'answer', 'cluster', '1', @q1, @q2, @q3, @q4, @q5, @q6)`;
  const request = new Request(query + values
    , (err) => {
      if (err) {
        console.log("Unable to insert data");
        console.error(err.message);
      } else {
        console.log("Data inserted");
      }
    });
  // request.addParameter('q1', TYPES.VarChar, q1);
  // request.addParameter('q2', TYPES.VarChar, q2);
  // request.addParameter('q3', TYPES.VarChar, q3);
  // request.addParameter('q4', TYPES.VarChar, q4);
  // request.addParameter('q5', TYPES.VarChar, q5);
  // request.addParameter('q6', TYPES.VarChar, q6);
  for (let i = 0; i < 6; i++) {
    let qi = answer_array[i];
    console.log("i: " + i + ", answer " + (i + 1) + ": " + qi + " ==> " + `q${i + 1}`);
    request.addParameter(`q${i + 1}`, TYPES.VarChar, qi);
  }
  console.log("Done: " + answer_array.length);
  connection.execSql(request);
};

// Retrieves final row from customer DB (sorted descending by quiz_id) and returns quiz answers to webserver caller
function readLastEntry() {

  return queryPromise = new Promise((resolve, reject) => {

    var result = [];
    let sql = `SELECT TOP 1 question_1, question_2, question_3, question_4, question_5, question_6 FROM quiz_results ORDER BY quiz_results.quiz_id DESC`

    const request = new Request(sql, (err) => {
      if (err){

        reject();
      } else {
      
        resolve(result);
      }
    });

    request.on("row", function(columns) { //on the returned row(s)
      columns.forEach(function(column) { //for each of the columns in the row(s)
        // console.log(`${column.metadata.colName}: ${column.value}`); //Print the columnname : value
        let temp = (`${column.value}`);
        result.push(temp);
      });
    });

    connection.execSql(request);

  }).then((result) => {

    return result;
  }).catch((err) => {

    console.log( err + "error in catch")
  });




}






module.exports = { connect2DB, insertToDatabase, readLastEntry };
