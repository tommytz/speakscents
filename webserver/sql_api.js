/* This module is responsible for querying the database.
 * This module handles the following:
 * - Connection configuration
 * - Execute SQL request (CRUD functions)
 * 
 * Configuration details: // https://docs.microsoft.com/en-us/azure/azure-sql/database/connect-query-nodejs?tabs=windows
 * ============================================================================================
 *  No validation of data should happen here. Should be done serverside in the form-reader.js
 * ============================================================================================
 */

const { Console } = require("console");
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
const insertToDatabase = function (jsonData, custID) {
  console.log("Inserting into Table...");
  let answer_array = validateJSONPost(jsonData);
  console.log(answer_array);

  // Constructing the request for the insert query
  var query = `INSERT INTO quiz_results (customer_id, answer_path, cluster, quiz_version, `;

  var values = `VALUES (@customer_id, 'answer', 'cluster', '1', `;

  query += generateQuizCols(answer_array) + values + generateQuizParams(answer_array);

  const request = new Request(query, (err) => {
    if (err) {
      console.log("Unable to insert data");
      console.error(err.message);
    } else {
      console.log("Data inserted");
    }
  });

  for (var i = 0; i < answer_array.length; i++) {
    request.addParameter(`q${i + 1}`, TYPES.VarChar, answer_array[i]);
  }

  request.addParameter('customer_id', TYPES.Int, custID);

  connection.execSql(request);
};

// Retrieves final row from customer DB (sorted descending by quiz_id) and returns quiz answers to webserver caller
const queryFromDatabase = function () {
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

// Retrieves final row from customer DB and returns to quiz results page
function readQuizEntry() {
  var result = [];
  let sql = `SELECT TOP 1 question_1, question_2, question_3, question_4, question_5, question_6 FROM quiz_results ORDER BY quiz_results.quiz_id DESC`;

  return new Promise((resolve, reject) => {
    const request = new Request(sql, (err) => {
      if (err) {
        reject();
      }
      resolve(result);
    });

    request.on("row", function (columns) { //on the returned row(s)
      columns.forEach(function (column) { //for each of the columns in the row(s)
        // console.log(`${column.metadata.colName}: ${column.value}`); //Print the columnname : value
        let temp = (`${column.value}`);
        result.push(temp);
      });
    });

    connection.execSql(request);
  });
}

// Retrieves final row from customer DB for sepcific user and returns to quiz results page
function readUserQuizEntry(userID) {
  var result = [];

  let sql = `SELECT TOP 1 question_1, question_2, question_3, question_4, question_5, question_6 FROM [dbo].[quiz_results] 

  WHERE customer_id=@customer_id ORDER BY quiz_results.quiz_id DESC;`;



  return new Promise((resolve, reject) => {
    const request = new Request(sql, (err) => {
      if (err) {
        console.log(err);
        reject();
      }
      resolve(result);
    });

    request.on("row", function (columns) { //on the returned row(s)
      columns.forEach(function (column) { //for each of the columns in the row(s)
        // console.log(`${column.metadata.colName}: ${column.value}`); //Print the columnname : value
        let temp = (`${column.value}`);
        result.push(temp);
      });
    });

    request.addParameter('customer_id', TYPES.Int, userID);

    connection.execSql(request);
  });
}

//register a user and store their data into the database
const insertToDatabaseRegistration = function (unparsedJSON) {
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

  // Constructing the request for the insert query
  var query = `INSERT INTO user_accounts (name, password, email) `;
  var values = ` VALUES ( @name, @password, @email) `;

  const request = new Request(query + values
    , (err) => {
      if (err) {
        console.log("Unable to insert data");
        console.error(err.message);
      } else {
        console.log("Data inserted");
      }
    });

  request.addParameter('name', TYPES.VarChar, answer_array[0] + " " + answer_array[1]);
  request.addParameter('password', TYPES.VarChar, answer_array[4]);
  request.addParameter('email', TYPES.VarChar, answer_array[2]);

  console.log("Done: " + answer_array.length);
  connection.execSql(request);
};

// Dynamically constructing the columns to insert into for SQL query string
function generateQuizCols(quiz_answers) {
  let cols = [];
  for (var i = 0; i < quiz_answers.length; i++) {
    cols.push(`question_${i + 1}`);
  }
  let cols_string = cols.join(", ");
  cols_string += ") ";
  return cols_string;
};

// Dynamically constructing the parameterised values for the SQL query
function generateQuizParams(quiz_answers) {
  let params = [];
  for (var i = 0; i < quiz_answers.length; i++) {
    params.push(`@q${i + 1}`);
  }
  let params_string = params.join(", ");
  params_string += ")";
  return params_string;
};

function validateJSONPost(unparsedJSON) {
  let key_array = ["scent_suggestions", "day_or_night", "season", "gender", "moods", "scent_styles"];
  let json_array = [];

  // Add null values to any missing keys
  key_array.forEach(key => {
    if (!unparsedJSON.hasOwnProperty(key)) {
      unparsedJSON[key] = "NULL";
    }
  });

  // Add JSON data to array in correct key order
  key_array.forEach(key => {
    let temp = unparsedJSON[key];
    if (temp instanceof Array) {
      temp = JSON.stringify(temp);
    }
    json_array.push(temp);
  });

  return json_array;
}

//Retrieves final row from customer DB and returns to profile page
function getUserName(userid) {
  let account_values = {};
  let sql = `SELECT *  FROM [dbo].[user_accounts]
  WHERE customer_id=@customer_id;`;
  return new Promise((resolve, reject) => {
    const request = new Request(sql, (err) => {
      if (err) {
        reject(err);
      }
      resolve(account_values);
    });

    request.on("row", function (columns) { //on the returned row(s)
      columns.forEach(function (column) { //for each of the columns in the row(s)
        account_values[column.metadata.colName] = column.value;
      });
    });

    request.addParameter('customer_id', TYPES.Int, userid);

    connection.execSql(request);
  });
}

//Retrieves final row from customer DB and returns to profile page
function readLogin(email) {
  let account_values = {};
  let sql = `SELECT *  FROM [dbo].[user_accounts]
  WHERE email=@email;`;

  return new Promise((resolve, reject) => {
    const request = new Request(sql, (err) => {
      if (err) {
        reject(err);
      }
      resolve(account_values);
    });

    request.on("row", function (columns) { //on the returned row(s)
      columns.forEach(function (column) { //for each of the columns in the row(s)
        account_values[column.metadata.colName] = column.value;
      });
    });

    request.addParameter('email', TYPES.VarChar, email);

    connection.execSql(request);
  });
}

module.exports = { connect2DB, readUserQuizEntry, insertToDatabase, queryFromDatabase, readQuizEntry, insertToDatabaseRegistration, readLogin, getUserName, connection };
