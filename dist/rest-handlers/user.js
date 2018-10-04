'use strict';

var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var _require = require('../firebase/user'),
    findUserByUsername = _require.findUserByUsername;

var _require2 = require('../utils/errors'),
    AuthenticationError = _require2.AuthenticationError,
    InvalidArguementError = _require2.InvalidArguementError;

var TOKEN_SALT = 'Gn@L=Uys>_v(z}Nu"~~kVUCg^B\\T<A[eGhTp&v8@';
var router = express.Router();

var verifyPasswordAndCreateToken = function verifyPasswordAndCreateToken(password, user) {
  return new Promise(function (resolve, reject) {
    var passwordsMatch = bcrypt.compareSync(password, user.hashedPassword);
    if (passwordsMatch) {
      var token = jwt.sign({
        user: user.username
      }, TOKEN_SALT);
      resolve(token);
    } else {
      reject(new AuthenticationError());
    }
  });
};

router.post('/login', function (req, res, next) {
  var _req$body = req.body,
      username = _req$body.username,
      password = _req$body.password;

  findUserByUsername(username).then(function (user) {
    return verifyPasswordAndCreateToken(password, user);
  }).then(function (token) {
    res.status(200).send({ token: token });
  }).catch(function (error) {
    return next(error);
  });
});

router.post('/signup', function (req, res, next) {
  var _req$body2 = req.body,
      username = _req$body2.username,
      password = _req$body2.password,
      repeatPassword = _req$body2.repeatPassword;

  if (password !== repeatPassword) {
    next(new InvalidArguementError('Passwords don\'t match'));
  }
});

module.exports = router;
//# sourceMappingURL=user.js.map