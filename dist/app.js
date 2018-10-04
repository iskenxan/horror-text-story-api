'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var userRoute = require('./rest-handlers/user');

var app = express();
app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use('/user', userRoute);

// eslint-disable-next-line no-unused-vars
var errorHandling = function errorHandling(err, req, res, next) {
  var status = err.status || 500;
  var message = status === 500 ? 'Internal server error' : err.message;
  var stackTrace = null;
  if (!process.env.NODE_ENV || !process.evn.NODE_ENV === 'production') {
    stackTrace = err.stack;
  }
  res.status(status).send({
    error: {
      status: status,
      message: message,
      stackTrace: stackTrace
    }
  });
};

app.use(errorHandling);

var port = process.env.PORT || 3001;

app.listen(port, function () {
  console.log('Listening on port ' + port);
});
//# sourceMappingURL=app.js.map