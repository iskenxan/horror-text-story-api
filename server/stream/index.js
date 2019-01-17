import stream from 'getstream';

const { STREAM_KEY, STREAM_SECRET } = process.env;
const client = stream.connect(STREAM_KEY, STREAM_SECRET, '46620', { location: 'us-east' });


const addPostActivity = (username, postId, postTitle, timestamp) => {
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


const removePostActivity = (username, postId) => {
  const userFeed = client.feed('user', username);
  return userFeed.removeActivity({ foreignId: `post:${postId}` });
};


const followUser = (username, following) => {
  const timelineFeed = client.feed('timeline', username);
  timelineFeed.follow('user', following);
};


const unfollowUser = (username, following) => {
  const timelinefeed = client.feed('timeline', username);
  timelinefeed.unfollow('user', following);
};


const addFollowerNotification = (username, followerUsername) => {
  const notificationFeed = client.feed('notifications', username);
  return notificationFeed.addActivity({
    actor: followerUsername,
    verb: 'follow',
    object: `${followerUsername}-follow-${username}`,
    timestamp: new Date().getTime(),
  });
};


const addFavoriteNotification = (username, authorUsername, postId) => {
  const userFeed = client.feed('user', username);
  return userFeed.addActivity({
    actor: username,
    verb: 'like',
    object: postId,
    foreign_id: `like:${postId}`,
    to: [`notifications:${authorUsername}`],
  });
};


const addCommentNotification = (username, authorUsername, postId) => {
  const userFeed = client.feed('user', username);
  return userFeed.addActivity({
    actor: username,
    verb: 'comment',
    object: postId,
    foreign_id: `comment:${postId}`,
    to: [`notifications:${authorUsername}`],
  });
};


const getTimelineFeed = (username) => {
  const timeLineFeed = client.feed('timeline', username);
  return timeLineFeed.get({ limit: 10 }).then((result) => {
    console.log(result);
  });
};


const getNotificationFeed = (username) => {
  const notificationFeed = client.feed('notifications', username);
  return notificationFeed.get({ limit: 100 }).then((result) => {
    console.log(result);
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
};
