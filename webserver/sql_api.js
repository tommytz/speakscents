// https://docs.microsoft.com/en-us/azure/azure-sql/database/connect-query-nodejs?tabs=windows

const { charset } = require("mime-types");
const { Connection, Request, TYPES } = require("tedious");
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
      console.log("error flag");
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

  // Dynamically constructing the columns to insert into for SQL query
  let cols = [];
  for (var i = 0; i < answer_array.length; i++) {
    cols.push(`question_${i + 1}`);
  }
  let cols_string = cols.join(", ");
  cols_string += ") ";

  // Dynamically constructing the parameterised values for the SQL query
  let params = [];
  for (var i = 0; i < answer_array.length; i++) {
    params.push(`@q${i + 1}`);
  }
  let params_string = params.join(", ");
  params_string += ")";

  // Constructing the request for the insert query
  // var query = `INSERT INTO quiz_results (customer_id, answer_path, cluster, quiz_version, question_1, question_2, question_3, question_4, question_5, question_6) `;
  var query = `INSERT INTO quiz_results (customer_id, answer_path, cluster, quiz_version, `;
  query += cols_string;

  // var values = `VALUES ('123', 'answer', 'cluster', '1', @q1, @q2, @q3, @q4, @q5, @q6)`;
  var values = `VALUES ('123', 'answer', 'cluster', '1', `;
  values += params_string;

  console.log("\n" + query + values + "\n");

  const request = new Request(query + values
    , (err) => {
      if (err) {
        console.log("Unable to insert data");
        console.error(err.message);
      } else {
        console.log("Data inserted");
      }
    });

  for (var i = 0; i < answer_array.length; i++) {
    let qi = answer_array[i];
    request.addParameter(`q${i + 1}`, TYPES.VarChar, qi);
    console.log("answer " + (i + 1) + ": " + qi + " ==> " + `q${i + 1}`);
  }
  connection.execSql(request);
};

// Retrieves final row from customer DB (sorted descending by quiz_id) and returns quiz answers to webserver caller
let queryFromDatabase = function () {
  console.log("Reading from Table...");
  let result_list = [];

  // read all data
  const request = new Request(
    `SELECT TOP 1 question_1, question_2, question_3, question_4, question_5, question_6 FROM quiz_results ORDER BY quiz_results.quiz_id DESC`, (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log("Successfully requested");
        console.log(result_list);
        return JSON.stringify(result_list);
      }
    });
  request.on("row", columns => {
    columns.forEach(column => {
      //console.log("%s\t%s", column.metadata.colName, column.value);
      let temp = `${column.metadata.colName}: ${column.value}`;
      result_list.push(temp);
    });
  });
  connection.execSql(request);
};

module.exports = { connect2DB, insertToDatabase, queryFromDatabase };
