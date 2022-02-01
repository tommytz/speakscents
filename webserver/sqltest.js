// https://docs.microsoft.com/en-us/azure/azure-sql/database/connect-query-nodejs?tabs=windows

const { charset } = require("mime-types");
const { Connection, Request, TYPES } = require("tedious");
const username = "Morgan";
const password = "TestDB0001928";
const server_name = "speakscents-test-server.database.windows.net";
const db_name = "test_database";
var connection


var trialJsonString = { "scent_suggestions": "asdfasdfasd", "day_or_night": "day", "season": "summer", "gender": "masculine", "moods": ["classic", "fresh"], "scent_styles": ["woody", "fruity", "spicy"] };

// Create connection to database
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

// const connection = new Connection(config)

//Opens the connection to the server
const connect2DB = function(){
 connection = new Connection(config)
 
 connection.on("connect", err => {
    if (err) {
      console.log("error flag");
      console.error(err.message);
    } else {
      console.log("successful connection");
    }
  });

  connection.connect()
}


// connection.connect();
// runQuery("{\"scent_suggestions\":\"asdfasdfasd\",\"day_or_night\":\"day\",\"season\":\"summer\",\"gender\":\"masculine\",\"moods\":[\"classic\",\"fresh\"],\"scent_styles\":[\"woody\",\"fruity\",\"spicy\"]}");
//insertToDatabase();
//queryFromDatabase();

//This uploads data from the webserver to the customer database
const insertToDatabase = function (unparsedJSON) {
    console.log("Inserting into Table...");
    // var parsedJSON = JSON.parse(unparsedJSON);
    var list = [];
    for (data in unparsedJSON) {
      let temp = unparsedJSON[data];
      if (temp instanceof Array) {
        temp = JSON.stringify(temp);
      }
      list.push(temp);
  }

  // console.log(list);

  //Saving json fields into list
  var q1 = list[0];
  var q2 = list[1];
  var q3 = list[2];
  var q4 = list[3];
  var q5 = list[4];
  var q6 = list[5];

  console.log(q1)

  //Actual query into db
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
  request.addParameter('q1', TYPES.VarChar, q1);
  request.addParameter('q2', TYPES.VarChar, q2);
  request.addParameter('q3', TYPES.VarChar, q3);
  request.addParameter('q4', TYPES.VarChar, q4);
  request.addParameter('q5', TYPES.VarChar, q5);
  request.addParameter('q6', TYPES.VarChar, q6);
  connection.execSql(request);
}

// function insertDummyIntoDatabase() {
//   console.log("Inserting into Table...");

//   // Insert dummy data
//   const request = new Request(
//     `INSERT INTO quiz_results (customer_id, answer_path, cluster, quiz_id, quiz_version, question_1, question_2, question_3, question_4, question_5, question_6) VALUES ('123', 'answer', 'cluster', '123e4567-e89b-12d3-a456-426614174000', '1', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6')`, (err) => {
//       if (err) {
//         console.log("Unable to insert data");
//         console.error(err.message);
//       } else {
//         console.log("Data inserted");
//       }
//     });
//   connection.execSql(request);
// }

function queryFromDatabase() {
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
  return result_list;
}

module.exports = { connect2DB, insertToDatabase };
