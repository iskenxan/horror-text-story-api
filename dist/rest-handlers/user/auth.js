'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bcryptjs = require('bcryptjs');

var _bcryptjs2 = _interopRequireDefault(_bcryptjs);

var _encrypt = require('../../encrypt');

var _user = require('../../firebase/user');

var _user2 = _interopRequireDefault(_user);

var _errors = require('../../utils/errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

var checkPassword = function checkPassword(password, user) {
  return new Promise(function (resolve, reject) {
    var passwordsMatch = _bcryptjs2.default.compareSync(password, user.hashedPassword);
    if (passwordsMatch) {
      resolve();
    }
    reject(new _errors.AuthenticationError('Incorrect password'));
  });
};

router.post('/login', function (req, res, next) {
  var token = null;
  var _req$body = req.body,
      username = _req$body.username,
      password = _req$body.password;

  var resultUser = null;
  if (username && password) {
    _user2.default.findUserByUsername(username).then(function (doc) {
      if (doc.exists) {
        var user = doc.data();
        resultUser = _extends({}, user, { hashedPassword: undefined });
        return checkPassword(password, user);
      }
      return Promise.reject(new _errors.ResourceNotFound('User not found'));
    }).then(function () {
      token = (0, _encrypt.generateToken)(username);
    }).then(function () {
      res.locals.result = { user: resultUser, token: token };
      next();
    }).catch(function (error) {
      return next(error);
    });
  } else {
    next(new _errors.InvalidArgumentError('Username and password cannot be empty'));
  }
});

router.post('/signup', function (req, res, next) {
  var _req$body2 = req.body,
      username = _req$body2.username,
      password = _req$body2.password,
      repeatPassword = _req$body2.repeatPassword;

  if (!username || !password || !repeatPassword) {
    throw new _errors.InvalidArgumentError('username, password and repeat password cannot be empty');
  }
  if (password !== repeatPassword) {
    throw new _errors.InvalidArgumentError('Passwords don\'t match');
  }
  _user2.default.findUserByUsername(username).then(function (doc) {
    if (doc.exists) {
      throw new _errors.InvalidArgumentError('Username is taken');
    } else {
      var token = (0, _encrypt.generateToken)(username);
      var newUser = new _user2.default(username, password, token);
      newUser.writeToDb();
      res.locals.result = { user: _extends({}, newUser, { hashedPassword: undefined }), token: token };
      next();
    }
  }).catch(function (error) {
    return next(error);
  });
});

router.post('/logout', function (req, res, next) {
  res.status(200).end(); // just keeping here for future needs
  next();
});

module.exports = router;
//# sourceMappingURL=auth.js.map