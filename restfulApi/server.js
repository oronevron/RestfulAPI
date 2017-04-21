var express = require('express'),
  app = express(),
  port = process.env.PORT || 5000;

bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./api/routes/wiBrellaRoutes');
routes(app);

app.listen(port);
// app.listen(port, ip);

console.log('Wi-Brella RESTful API server started on: ' + port);

// connection.end();
