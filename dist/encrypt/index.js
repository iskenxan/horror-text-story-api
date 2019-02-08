'use strict';

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _bcryptjs = require('bcryptjs');

var _bcryptjs2 = _interopRequireDefault(_bcryptjs);

var _errors = require('../utils/errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TOKEN_SALT = 'Gn@L=Uys>_v(z}Nu"~~kVUCg^B\\T<A[eGhTp&v8@';

var generateHashedPassword = function generateHashedPassword(password) {
  var salt = _bcryptjs2.default.genSaltSync(10);
  return _bcryptjs2.default.hashSync(password, salt);
};

var generateToken = function generateToken(username) {
  return _jsonwebtoken2.default.sign({
    username: username
  }, TOKEN_SALT);
};

var verifyToken = function verifyToken(token) {
  return new Promise(function (resolve, reject) {
    try {
      var decoded = _jsonwebtoken2.default.verify(token, TOKEN_SALT);
      resolve(decoded.username);
    } catch (e) {
      reject(new _errors.AuthenticationError('Invalid security token'));
    }
  });
};

module.exports = { generateHashedPassword: generateHashedPassword, generateToken: generateToken, verifyToken: verifyToken };
//# sourceMappingURL=index.js.map