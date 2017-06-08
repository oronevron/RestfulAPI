var mysql = require("mysql");
var connection = mysql.createConnection({
  host     : '',
  user     : '',
  password : '',
  database : '',
  timezone: 'utc'
});

connection.connect(function(err){
  if(!err) {
      console.log("Database is connected ...");
  } else {
      console.log("Error connecting database ...");
  }
});

module.exports = connection;
