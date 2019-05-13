'use strict';

var _getstream = require('getstream');

var _getstream2 = _interopRequireDefault(_getstream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _process$env = process.env,
    STREAM_KEY = _process$env.STREAM_KEY,
    STREAM_SECRET = _process$env.STREAM_SECRET;

var client = _getstream2.default.connect(STREAM_KEY, STREAM_SECRET, '46620', { location: 'us-east' });

var addPostActivity = function addPostActivity(username, postId, postTitle, timestamp) {
  var userFeed = client.feed('user', username);
  return userFeed.addActivity({
    actor: username,
    verb: 'post',
    object: postId,
    foreign_id: 'post:' + postId,
    postTitle: postTitle,
    timestamp: timestamp
  });
};

var removePostActivity = function removePostActivity(username, postId) {
  var userFeed = client.feed('user', username);
  return userFeed.removeActivity({ foreignId: 'post:' + postId });
};

var followUser = function followUser(username, following) {
  var timelineFeed = client.feed('timeline', username);
  timelineFeed.follow('user', following);
};

var unfollowUser = function unfollowUser(username, following) {
  var timelinefeed = client.feed('timeline', username);
  timelinefeed.unfollow('user', following);
};

var addNotification = function addNotification(username, actor, verb, foreignId, object) {
  var notificationFeed = client.feed('notifications', username);
  return notificationFeed.addActivity({
    actor: actor,
    verb: verb,
    object: object,
    foreign_id: foreignId,
    timestamp: new Date().getTime()
  });
};

var addFollowerNotification = function addFollowerNotification(username, followerUsername) {
  var foreignId = followerUsername + '-follow-' + username;
  return addNotification(username, followerUsername, 'follow', foreignId, foreignId);
};

var getUserClient = function getUserClient(username) {
  var userToken = client.createUserToken(username);
  return _getstream2.default.connect(STREAM_KEY, userToken, '46620');
};

var addReaction = function addReaction(username, authorUsername, type, postId, postActivityId) {
  var notifyMaker = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;

  var userClient = getUserClient(username);

  return userClient.reactions.add(type, postActivityId, {
    actor: username,
    timestamp: new Date().getTime()
  }).then(function (reactionResult) {
    if (notifyMaker) {
      addNotification(authorUsername, username, type, postId, postId);
    }
    return reactionResult;
  });
};

var removeFavoriteNotification = function removeFavoriteNotification(username, reactionId) {
  return client.reactions.delete(reactionId, function (secondResult) {
    console.log(secondResult);
  });
};

var addFavoriteNotification = function addFavoriteNotification(username, authorUsername, postId, postActivityId) {
  return addReaction(username, authorUsername, 'like', postId, postActivityId);
};

var addCommentNotification = function addCommentNotification(username, authorUsername, postId, postActivityId, notifyMaker) {
  return addReaction(username, authorUsername, 'comment', postId, postActivityId, notifyMaker);
};

var getTimelineFeed = function getTimelineFeed(username) {
  var timeLineFeed = client.feed('timeline', username);
  return timeLineFeed.get({
    limit: 25,
    enrich: true,
    reactions: {
      counts: true
    }
  }).then(function (result) {
    return result;
  });
};

var removePostNotifications = function removePostNotifications(author, postId) {
  var notificationFeed = client.feed('notifications', author);
  return notificationFeed.removeActivity({ foreignId: postId });
};

var getNotificationFeed = function getNotificationFeed(username) {
  var notificationFeed = client.feed('notifications', username);
  return notificationFeed.get({ limit: 100, mark_seen: true }).then(function (result) {
    return result;
  });
};

module.exports = {
  addPostActivity: addPostActivity,
  removePostActivity: removePostActivity,
  addFollowerNotification: addFollowerNotification,
  addFavoriteNotification: addFavoriteNotification,
  addCommentNotification: addCommentNotification,
  followUser: followUser,
  unfollowUser: unfollowUser,
  getTimelineFeed: getTimelineFeed,
  getNotificationFeed: getNotificationFeed,
  removeFavoriteNotification: removeFavoriteNotification,
  removePostNotifications: removePostNotifications
};
//# sourceMappingURL=index.js.map