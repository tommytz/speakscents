// https://docs.microsoft.com/en-us/azure/azure-sql/database/connect-query-nodejs?tabs=windows

const { Connection, Request } = require("tedious");
const username = "Morgan"
const password = "TestDB0001928"
const server_name = "speakscents-test-server.database.windows.net"
const db_name = "test_database"

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
    encrypt: true
  }
};

/* 
    //Use Azure VM Managed Identity to connect to the SQL database
    const config = {
        server: process.env["db_server"],
        authentication: {
            type: 'azure-active-directory-msi-vm',
        },
        options: {
            database: process.env["db_database"],
            encrypt: true,
            port: 1433
        }
    };

    //Use Azure App Service Managed Identity to connect to the SQL database
    const config = {
        server: process.env["db_server"],
        authentication: {
            type: 'azure-active-directory-msi-app-service',
        },
        options: {
            database: process.env["db_database"],
            encrypt: true,
            port: 1433
        }
    });

*/

const connection = new Connection(config);

// Attempt to connect and execute queries if connection goes through
connection.on("connect", err => {
  if (err) {
    console.log("error flag")
    console.error(err.message);
  } else {
      console.log("successful connection")
      //insertToDatabase();
      queryFromDatabase();
  }
});

connection.connect();
//insertToDatabase();
//queryFromDatabase();

function insertToDatabase() {
  console.log("Inserting into Table...");

  // Insert dummy data
  const request = new Request(
    `INSERT INTO quiz_results (customer_id, answer_path, cluster, quiz_id, quiz_version, question_1, question_2, question_3, question_4, question_5, question_6) VALUES ('123', 'answer', 'cluster', '123e4567-e89b-12d3-a456-426614174000', '1', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6')`, (err) => {
      if (err) {
        console.log("Unable to insert data")
        console.error(err.message);
      } else {
        console.log("Data inserted");
      }
    });
  connection.execSql(request);
}

function queryFromDatabase() {
  console.log("Reading from Table...");

  // read all data
  const request = new Request(
    `SELECT * FROM quiz_results`, (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log("Successfully requested");
      }
    });
      request.on("row", columns => {
    columns.forEach(column => {
      console.log("%s\t%s", column.metadata.colName, column.value);
    });
  });
  console.log(connection.execSql(request));
}

// function queryDatabase() {
//   console.log("Reading rows from the Table...");

//   // Read all rows from table
//   const request = new Request(
//     `SELECT TOP 20 pc.Name as CategoryName,
//                    p.name as ProductName
//      FROM [SalesLT].[ProductCategory] pc
//      JOIN [SalesLT].[Product] p ON pc.productcategoryid = p.productcategoryid`,
//     (err, rowCount) => {
//       if (err) {
//         console.error(err.message);
//       } else {
//         console.log(`${rowCount} row(s) returned`);
//       }
//     }
//   );

//   request.on("row", columns => {
//     columns.forEach(column => {
//       console.log("%s\t%s", column.metadata.colName, column.value);
//     });
//   });

//   connection.execSql(request);
// }

function consoleTest(){
  console.log("hello123")
}

