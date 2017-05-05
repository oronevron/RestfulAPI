'use strict';

var mysql = require("mysql");
var connection = require('../../dbConnection');

exports.get_all_measurements = function(req, res) {

    var records_num = 3;

    // If parameter called "all" is sent with "true" value - Get all measurements
    if (req.query.all == "true") {
        var query = "SELECT measurements.*, sources.type AS source_type FROM measurements JOIN sources ON measurements.source_id = sources.id";

    // Otherwise - Get the most three new measurements for each source
    } else {

        // If parameter called "records_num" is sent - fetch records_num records for each source (The default value is 3)
        if (req.query.records_num != null) {
            records_num = req.query.records_num;
        }

        var query = "SELECT id, source_id, datetime, x_coordinate, y_coordinate, rain_power, temperature, humidity, sea_level, air_pollution, source_type FROM" +
                " (SELECT measurements.*, sources.type AS source_type," +
                " @source_id_rank := IF(@current_source_id = measurements.source_id, @source_id_rank + 1, 1) AS source_id_rank," +
                " @current_source_id := measurements.source_id" +
                " FROM measurements" +
                " LEFT OUTER JOIN sources ON measurements.source_id = sources.id" +
                " ORDER BY measurements.source_id, measurements.datetime DESC" +
                " ) ranked" +
                " WHERE source_id_rank <= ?";
        var table = [records_num];
        query = mysql.format(query,table);
        console.log("query: ", query);
    }

    connection.query(query, function (err, rows) {
        if (err) {
            res.json({"Error": true, "Message": "Error executing MySQL query"});
        } else {
            res.json({"Error": false, "Message": "Success", "Measurements": rows});
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
  connection.query(query,function(err,rows) {
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
              "HAVING distance < ? " +
              "ORDER BY rain_power DESC " +
              "LIMIT 1";

  // Set default value to maximum distance (For requests from the kit)
  var maximum_distance = 1.5;

  // Set request parameter to maximum distance value (For requests from the mobile application)
  if (req.query.radius != null) {
      maximum_distance = parseFloat(req.query.radius);
  }

  var table = [req.query.lat, req.query.long, req.query.lat, "measurements", maximum_distance];
  query = mysql.format(query,table);
  console.log("maximum_distance: ", maximum_distance);
  console.log(query);
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