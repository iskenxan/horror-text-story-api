'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _auth = require('./auth');

var _auth2 = _interopRequireDefault(_auth);

var _posts = require('./posts');

var _posts2 = _interopRequireDefault(_posts);

var _profile = require('./profile');

var _profile2 = _interopRequireDefault(_profile);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var user = _express2.default.Router();

user.use('/auth', _auth2.default);
user.use('/posts', _posts2.default);
user.use('/profile', _profile2.default);

module.exports = user;
//# sourceMappingURL=index.js.map