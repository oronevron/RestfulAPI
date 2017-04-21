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

exports.check_rain_power_within_point_radius = function (req, res) {
  var query = "SELECT id, rain_power, " +
              "( 6371 * acos( " +
              "cos( radians(?) ) " +
              "* cos( radians( y_coordinate ) ) " +
              "* cos( radians( x_coordinate ) - radians(?) ) " +
              "+ sin( radians(?) ) " +
              "* sin( radians( y_coordinate ) ) ) ) AS distance " +
              "FROM ?? " +
              "WHERE datetime >= NOW() - INTERVAL 15 MINUTE " +
              "HAVING distance < 1.5 " +
              "ORDER BY rain_power DESC " +
              "LIMIT 1";
  var table = [req.query.lat, req.query.long, req.query.lat, "measurements"];
  query = mysql.format(query,table);
  connection.query(query,function(err,rows){
    if(err) {
        res.json({"Error" : true, "Message" : "Error executing MySQL query"});
    } else if (rows.length > 0) {
        res.json(rows[0].rain_power);
    } else {
        res.json(-1);
    }
  });
};