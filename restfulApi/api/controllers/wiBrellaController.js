'use strict';

var mysql = require("mysql");
var connection = require('../../dbConnection');

exports.get_all_measurements = function(req, res) {
  var query = "SELECT * FROM ??";
  var table = ["measurements"];
  query = mysql.format(query,table);
  connection.query(query,function(err,rows){
    if(err) {
        res.json({"Error" : true, "Message" : "Error executing MySQL query"});
    } else {
        res.json({"Error" : false, "Message" : "Success", "Measurements" : rows});
    }
  });
};

exports.create_a_measurement = function(req, res) {
  var query = "INSERT INTO ?? VALUES (default,?,now(),?,?,?,?,?,?,?)";
  var table = ["measurements", req.body.source_id, req.body.x_coordinate, req.body.y_coordinate, req.body.rain_power, req.body.temperature, req.body.humidity, req.body.sea_level, req.body.air_pollution];
  query = mysql.format(query,table);
  console.log("query: ", query);
  connection.query(query,function(err,rows){
    if(err) {
        res.json({"Error" : true, "Message" : err});
    } else {
        res.json({"Error" : false, "Message" : "Success", "Added measurement" : rows});
    }
  });
};

exports.create_a_source = function(req, res) {
  var query = "INSERT INTO ?? VALUES (default,?,curdate())";
  var table = ["sources", req.body.type];
  query = mysql.format(query,table);
  console.log("query: ", query);
  connection.query(query,function(err,rows){
    if(err) {
        res.json({"Error" : true, "Message" : err});
    } else {
        res.json({"Error" : false, "Message" : "Success", "Added source" : rows});
    }
  });
};
