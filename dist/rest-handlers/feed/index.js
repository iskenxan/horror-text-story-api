'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _stream = require('../../stream');

var _rankingFeed = require('./ranking-feed');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var index = new _express2.default.Router();

var formatFeed = function formatFeed(results) {
  var formatted = {};
  var timeline = results.map(function (activity) {
    return {
      author: activity.actor,
      id: activity.object,
      title: activity.postTitle,
      lastUpdated: activity.timestamp,
      favoriteCount: activity.reaction_counts.like,
      commentCount: activity.reaction_counts.comment
    };
  });
  formatted.timeline = timeline;

  return formatted;
};

index.post('/timeline/me', function (req, res, next) {
  var username = res.locals.username;

  var feed = void 0;
  (0, _stream.getTimelineFeed)(username).then(function (result) {
    feed = formatFeed(result.results);
    return (0, _rankingFeed.getRankedFeed)();
  }).then(function (rankedFeed) {
    feed.popular = rankedFeed;
    res.locals.result = feed;
    next();
  }).catch(function (error) {
    return next(error);
  });
});

var formatResult = function formatResult(result) {
  result.results.forEach(function (type) {
    type.activities.forEach(function (activity) {
      var activityObject = activity.object;
      delete activity.object;
      activity.activityObject = activityObject;
    });
  });
};

index.post('/notification/me', function (req, res, next) {
  var username = res.locals.username;

  (0, _stream.getNotificationFeed)(username).then(function (result) {
    formatResult(result);
    res.locals.result = result;
    next();
  }).catch(function (error) {
    return next(error);
  });
});

module.exports = index;
//# sourceMappingURL=index.js.map