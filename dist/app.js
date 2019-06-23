'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _user = require('./rest-handlers/user');

var _user2 = _interopRequireDefault(_user);

var _search = require('./rest-handlers/search');

var _search2 = _interopRequireDefault(_search);

var _posts = require('./rest-handlers/posts');

var _posts2 = _interopRequireDefault(_posts);

var _feed = require('./rest-handlers/feed');

var _feed2 = _interopRequireDefault(_feed);

var _encrypt = require('./encrypt');

var _errors = require('./utils/errors');

var _notificationListener = require('./stream/notification-listener');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NON_SECURE_PATHS = ['/user/auth', '/user/profile/profile-image/save'];

var app = (0, _express2.default)();
app.use(_bodyParser2.default.json());

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Security token check
app.post('*', function (req, res, next) {
  var token = req.body.token;

  var notSecure = false;
  NON_SECURE_PATHS.filter(function (path) {
    if (req.path.includes(path)) notSecure = true;
  });

  if (notSecure) return next();

  if (token) {
    return (0, _encrypt.verifyToken)(token).then(function (username) {
      res.locals.username = username;
      next();
    }).catch(function (error) {
      return next(error);
    });
  }
  return next(new _errors.AuthenticationError('No security token was passed'));
});

app.use('/user', _user2.default);
app.use('/search', _search2.default);
app.use('/posts', _posts2.default);
app.use('/feed', _feed2.default);

var resultHandling = function resultHandling(req, res, next) {
  if (res.locals.result) {
    res.status(200).send({ ok: true, result: res.locals.result });
  } else {
    res.status(200).send({ ok: true });
  }
  next();
};

app.use(resultHandling);

// eslint-disable-next-line no-unused-vars
var errorHandling = function errorHandling(err, req, res, next) {
  var status = err.status || 500;
  if (err.code === 5) {
    status = 404;
  }
  console.log(err.stack);
  var message = status === 500 ? 'Internal server error' : err.message;
  var stackTrace = null;
  if (process.env && (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production')) {
    stackTrace = err.stack;
  }
  res.status(status).send({
    ok: false,
    error: {
      status: status,
      message: message,
      stackTrace: stackTrace
    }
  });
};

app.use(errorHandling);

var port = process.env.PORT || 3001;

(0, _notificationListener.startListeningToNotifications)();

app.listen(port, function () {
  console.log('Listening on port ' + port);
});
//# sourceMappingURL=app.js.map