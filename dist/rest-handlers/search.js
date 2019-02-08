'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _errors = require('../utils/errors');

var _search = require('../firebase/search');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var search = _express2.default.Router();

search.post('/users', function (req, res, next) {
  var query = req.body.query;


  if (!query) {
    return next(new _errors.InvalidArgumentError('\'query\' cannot be empty', 401));
  }

  (0, _search.searchForUsers)(query).then(function (resultArray) {
    var result = {};
    resultArray.forEach(function (user) {
      result[user.username] = user;
    });

    res.locals.result = result;
    return next();
  }).catch(function (error) {
    return next(error);
  });
});

search.post('/suggested', function (req, res, next) {
  (0, _search.searchSuggested)().then(function (result) {
    res.locals.result = result;
    return next();
  });
});

module.exports = search;
//# sourceMappingURL=search.js.map