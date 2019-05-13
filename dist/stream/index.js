

const _getstream = require('getstream');

const _getstream2 = _interopRequireDefault(_getstream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const _process$env = process.env;


const STREAM_KEY = _process$env.STREAM_KEY;


const STREAM_SECRET = _process$env.STREAM_SECRET;

const client = _getstream2.default.connect(STREAM_KEY, STREAM_SECRET, '46620', { location: 'us-east' });

const addPostActivity = function addPostActivity(username, postId, postTitle, timestamp) {
  const userFeed = client.feed('user', username);
  return userFeed.addActivity({
    actor: username,
    verb: 'post',
    object: postId,
    foreign_id: `post:${postId}`,
    postTitle,
    timestamp,
  });
};

const removePostActivity = function removePostActivity(username, postId) {
  const userFeed = client.feed('user', username);
  return userFeed.removeActivity({ foreignId: `post:${postId}` });
};

const followUser = function followUser(username, following) {
  const timelineFeed = client.feed('timeline', username);
  timelineFeed.follow('user', following);
};

const unfollowUser = function unfollowUser(username, following) {
  const timelinefeed = client.feed('timeline', username);
  timelinefeed.unfollow('user', following);
};

const addNotification = function addNotification(username, actor, verb, foreignId, object) {
  const notificationFeed = client.feed('notifications', username);
  return notificationFeed.addActivity({
    actor,
    verb,
    object,
    foreign_id: foreignId,
    timestamp: new Date().getTime(),
  });
};

const addFollowerNotification = function addFollowerNotification(username, followerUsername) {
  const foreignId = `${followerUsername}-follow-${username}`;
  return addNotification(username, followerUsername, 'follow', foreignId, foreignId);
};

const getUserClient = function getUserClient(username) {
  const userToken = client.createUserToken(username);
  return _getstream2.default.connect(STREAM_KEY, userToken, '46620');
};

const addReaction = function addReaction(username, authorUsername, type, postId, postActivityId) {
  const notifyMaker = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;

  const userClient = getUserClient(username);

  return userClient.reactions.add(type, postActivityId, {
    actor: username,
    timestamp: new Date().getTime(),
  }).then((reactionResult) => {
    if (notifyMaker) {
      addNotification(authorUsername, username, type, postId, postId);
    }
    return reactionResult;
  });
};

const removeFavoriteNotification = function removeFavoriteNotification(username, reactionId) {
  return client.reactions.delete(reactionId, (secondResult) => {
    console.log(secondResult);
  });
};

const addFavoriteNotification = function addFavoriteNotification(username,
  authorUsername, postId, postActivityId) {
  return addReaction(username, authorUsername, 'like', postId, postActivityId);
};

const addCommentNotification = function addCommentNotification(username, authorUsername,
  postId, postActivityId, notifyMaker) {
  return addReaction(username, authorUsername, 'comment', postId, postActivityId, notifyMaker);
};

const getTimelineFeed = function getTimelineFeed(username) {
  const timeLineFeed = client.feed('timeline', username);
  return timeLineFeed.get({
    limit: 25,
    enrich: true,
    reactions: {
      counts: true,
    },
  }).then((result) => {
    return result;
  });
};

const removePostNotifications = function removePostNotifications(author, postId) {
  const notificationFeed = client.feed('notifications', author);
  return notificationFeed.removeActivity({ foreignId: postId });
};

const getNotificationFeed = function getNotificationFeed(username) {
  const notificationFeed = client.feed('notifications', username);
  return notificationFeed.get({ limit: 100, mark_seen: true }).then((result) => {
    return result;
  });
};

module.exports = {
  addPostActivity,
  removePostActivity,
  addFollowerNotification,
  addFavoriteNotification,
  addCommentNotification,
  followUser,
  unfollowUser,
  getTimelineFeed,
  getNotificationFeed,
  removeFavoriteNotification,
  removePostNotifications,
};
// # sourceMappingURL=index.js.map
