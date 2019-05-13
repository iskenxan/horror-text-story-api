'use strict';

var _firebaseAdmin = require('firebase-admin');

var _firebaseAdmin2 = _interopRequireDefault(_firebaseAdmin);

var _index = require('./index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var searchForUsers = function searchForUsers(queryItem) {
  return _index.db.collection('users').orderBy(_firebaseAdmin2.default.firestore.FieldPath.documentId()).startAt(queryItem).endAt(queryItem + '\uF8FF').limit(10).get().then(function (snapshot) {
    if (snapshot.isEmpty) return [];

    var resultArray = [];

    snapshot.forEach(function (doc) {
      var userData = doc.data();
      delete userData.hashedPassword;

      resultArray.push(userData);
    });

    return resultArray;
  });
};

var searchSuggested = function searchSuggested() {
  return _index.db.collection('users').limit(50).get().then(function (snapshot) {
    var result = {};
    snapshot.forEach(function (doc) {
      var userData = doc.data();
      delete userData.hashedPassword;

      result[userData.username] = userData;
    });

    return result;
  });
};

module.exports = { searchForUsers: searchForUsers, searchSuggested: searchSuggested };
//# sourceMappingURL=search.js.map