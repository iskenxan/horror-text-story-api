'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('./index'),
    db = _require.db;

var _require2 = require('../utils/errors'),
    ResourceNotFound = _require2.ResourceNotFound;

var User = function () {
  function User(username, password) {
    _classCallCheck(this, User);

    this.writeToDb = function () {};

    this.username = username;
    this.password = password;
  }

  _createClass(User, null, [{
    key: 'findUserByUsername',
    value: function findUserByUsername(username) {
      return new Promise(function (resolve, reject) {
        db.collection('users').doc(username).get().then(function (doc) {
          if (doc.exists) {
            resolve(doc.data());
          } else {
            reject(new ResourceNotFound('User not found'));
          }
        });
      });
    }
  }]);

  return User;
}();

module.exports = User;
//# sourceMappingURL=user.js.map