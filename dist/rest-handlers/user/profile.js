'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _connectBusboy = require('connect-busboy');

var _connectBusboy2 = _interopRequireDefault(_connectBusboy);

var _user = require('../../firebase/user');

var _user2 = _interopRequireDefault(_user);

var _storage = require('../../firebase/storage');

var _encrypt = require('../../encrypt');

var _errors = require('../../utils/errors');

var _file = require('../../utils/file');

var _stream = require('../../stream');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

router.post('/other', function (req, res, next) {
  var username = req.body.username;

  if (!username) throw new _errors.InvalidArgumentError('Username cannot be empty');

  _user2.default.findUserByUsername(username).then(function (doc) {
    if (!doc.exists) {
      return next(new _errors.ResourceNotFound('User not found', 404));
    }

    res.locals.result = _extends({}, doc.data(), { hashedPassword: undefined, draftRefs: undefined });
    return next();
  }).catch(function (error) {
    return next(error);
  });
});

router.post('/me', function (req, res, next) {
  var username = res.locals.username;

  if (username) {
    _user2.default.findUserByUsername(username).then(function (doc) {
      if (doc.exists) {
        res.locals.result = _extends({}, doc.data(), { hashedPassword: undefined });
        return next();
      }
      next(new _errors.ResourceNotFound('User not found'));
    });
  } else {
    next(new _errors.InvalidArgumentError('Username cannot be empty'));
  }
});

router.post('/follow', function (req, res, next) {
  var username = res.locals.username;
  var _req$body = req.body,
      user = _req$body.user,
      followingUsername = _req$body.followingUsername;

  if (username !== user.username) throw new _errors.InvalidArgumentError('user does not match the security token', 401);
  if (!followingUsername) throw new _errors.InvalidArgumentError('follower username cannot be empty');
  _user2.default.follow(followingUsername, user).then(function () {
    (0, _stream.followUser)(username, followingUsername);
    (0, _stream.addFollowerNotification)(followingUsername, username);
    user.following.push(followingUsername);
    res.locals.result = user;
    return next();
  }).catch(function (error) {
    return next(error);
  });
});

router.post('/unfollow', function (req, res, next) {
  var username = res.locals.username;
  var _req$body2 = req.body,
      user = _req$body2.user,
      followingUsername = _req$body2.followingUsername;

  if (username !== user.username) throw new _errors.InvalidArgumentError('user does not match the security token', 401);
  if (!followingUsername) throw new _errors.InvalidArgumentError('invalid following');

  _user2.default.unfollow(followingUsername, user).then(function () {
    (0, _stream.unfollowUser)(username, followingUsername);
    user.following = user.following.filter(function (e) {
      return e !== followingUsername;
    });
    res.locals.result = user;
    return next();
  });
});

var busboyMiddleWare = function busboyMiddleWare() {
  return (0, _connectBusboy2.default)({
    limits: {
      fileSize: 10 * 1024 * 1024
    },
    immediate: true
  });
};

var compressAndSaveImage = function compressAndSaveImage(data, username) {
  return (0, _file.compressImage)(data).then(function (buffer) {
    return (0, _storage.saveImageToBucket)(buffer, username + '.jpg');
  }).then(function (imageUrl) {
    return imageUrl;
  });
};

var verifyTokenAndSave = function verifyTokenAndSave(res, next, fileData, token) {
  (0, _encrypt.verifyToken)(token).then(function (username) {
    return compressAndSaveImage(fileData, username);
  });
};

router.post('/profile-image/save', busboyMiddleWare(), function (req, res, next) {
  if (!req.busboy) throw new _errors.InvalidArgumentError('file binary data cannot be null');
  var fileData = null;
  var token = null;
  req.busboy.on('file', function (fieldName, file) {
    file.on('data', function (data) {
      if (fileData === null) {
        fileData = data;
      } else {
        fileData = Buffer.concat([fileData, data]);
      }
    });
  });
  req.busboy.on('field', function (fieldName, value) {
    if (fieldName === 'token') {
      token = value;
    }
  });
  req.busboy.on('finish', function () {
    if (!fileData) next(new _errors.InvalidArgumentError('file binary data cannot be null'));
    if (!token) next(new _errors.InvalidArgumentError('No security token was passed'));
    verifyTokenAndSave(res, next, fileData, token);
    next();
  });
});

module.exports = router;
//# sourceMappingURL=profile.js.map