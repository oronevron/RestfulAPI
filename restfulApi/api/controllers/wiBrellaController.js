'use strict';

var mysql = require("mysql");
var connection = require('../../dbConnection');

exports.get_all_measurements = function(req, res) {
  var query = "SELECT measurements.*, sources.type AS source_type FROM measurements JOIN sources ON measurements.source_id = sources.id";
  connection.query(query,function(err,rows){
    if(err) {
        res.json({"Error" : true, "Message" : "Error executing MySQL query"});
    } else {
        res.json({"Error" : false, "Message" : "Success", "Measurements" : rows});
    }
  });
};

exports.create_a_measurement = function(req, res) {
    var find_query = "SELECT id " +
        "FROM ?? " +
        "WHERE source_id = ?" +
        " AND x_coordinate = ?" +
        " AND y_coordinate = ?" +
        " AND rain_power = ?" +
        " AND temperature = ?";
    var find_table = ["measurements", req.body.source_id, req.body.x_coordinate, req.body.y_coordinate, req.body.rain_power, req.body.temperature];

    find_query += " AND humidity ";
    if (req.body.humidity == null) {
        find_query += 'IS NULL';
    } else {
        find_query += '= ?';
        find_table.push(req.body.humidity);
    }

    find_query += " AND sea_level ";
    if (req.body.sea_level == null) {
        find_query += 'IS NULL';
    } else {
        find_query += '= ?';
        find_table.push(req.body.sea_level);
    }

    find_query += " AND air_pollution ";
    if (req.body.air_pollution == null) {
        find_query += 'IS NULL';
    } else {
        find_query += '= ?';
        find_table.push(req.body.air_pollution);
    }

    find_query += " LIMIT 1";
    find_query = mysql.format(find_query,find_table);
    console.log("find query: ", find_query);
    connection.query(find_query,function(err,rows){
        if(err) {
            res.json({"Error" : true, "Message" : "Error executing MySQL query"});
        } else if (rows.length > 0) {
            console.log("TO UPDATE");
            var query = "UPDATE ?? SET datetime = NOW() WHERE id = ?";
            var table = ["measurements", rows[0].id];
            query = mysql.format(query,table);
            console.log("query: ", query);
            connection.query(query,function(err,rows){
                if(err) {
                    res.json({"Error" : true, "Message" : err});
                } else {
                    res.json({"Error" : false, "Message" : "Success", "Updated measurement" : rows});
                }
            });
        } else {
            console.log("TO INSERT");
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