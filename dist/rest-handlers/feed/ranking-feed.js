'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _firebase = require('../../firebase');

var _user = require('../../firebase/user');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getFeed = function getFeed() {
  return _firebase.db.collection('ranking-feed').doc('feed').get().then(function (snapshot) {
    var _snapshot$data = snapshot.data(),
        posts = _snapshot$data.posts;

    return posts;
  });
};

var updateFeed = function updateFeed(posts) {
  return _firebase.db.collection('ranking-feed').doc('feed').update({
    posts: posts
  });
};

var getPost = function getPost(posts, postId) {
  var post = _lodash2.default.filter(posts, function (value, key) {
    return key === postId;
  });

  return post.length > 0 ? post[0] : null;
};

var addPostToRankingFeed = function addPostToRankingFeed(rankedFeedItem) {
  return getFeed().then(function (feedItems) {
    if (Object.keys(feedItems).length >= 1000) return;
    feedItems[rankedFeedItem.id] = rankedFeedItem;
    return updateFeed(feedItems);
  });
};

var removePostFromRankingFeed = function removePostFromRankingFeed(postId) {
  return getFeed().then(function (feedItems) {
    var post = getPost(feedItems, postId);
    if (!post) return;

    delete feedItems[postId];
    return updateFeed(feedItems);
  });
};

var addRanking = function addRanking(feedItem) {
  var favoritePoints = feedItem.favoriteCount || 0;
  // const commentPoints = feedItem.commentCount ? feedItem.commentCount * 2 : 0;
  // const ranking = favoritePoints + commentPoints;
  var ranking = favoritePoints;

  return _extends({}, feedItem, { ranking: ranking });
};

var orderRankedFeedItems = function orderRankedFeedItems(feedItems) {
  var array = Object.keys(feedItems).map(function (key) {
    return _extends({ id: key }, feedItems[key]);
  });
  array = array.map(function (post) {
    return addRanking(post);
  });
  array = _lodash2.default.sortBy(array, 'ranking');
  array = _lodash2.default.reverse(array);

  return array;
};

var convertArrayFeedItemsToObject = function convertArrayFeedItemsToObject(feedItems) {
  feedItems.forEach(function (post) {
    return delete post.ranking;
  });

  return _lodash2.default.keyBy(feedItems, 'id');
};

var addReactionToPostRank = function addReactionToPostRank(feedItem, reaction) {
  return getFeed().then(function (feedItems) {
    var extractedPost = getPost(feedItems, feedItem.id);
    if (extractedPost) {
      extractedPost[reaction] = extractedPost[reaction] ? extractedPost[reaction] + 1 : 1;
      return updateFeed(feedItems);
    }
    feedItem = addRanking(feedItem);
    feedItems = orderRankedFeedItems(feedItems);
    var lastIndex = feedItems.length - 1;
    var lowestRankingItem = feedItems[lastIndex];
    if (lowestRankingItem.ranking < feedItem.ranking) {
      feedItems[lastIndex] = feedItem;
      feedItems = convertArrayFeedItemsToObject(feedItems);

      return updateFeed(feedItems);
    }
  });
};

var removeFavoriteFromPostRank = function removeFavoriteFromPostRank(postId) {
  return getFeed().then(function (posts) {
    var post = getPost(posts, postId);
    if (!post) return;

    post.favoriteCount -= 1;

    updateFeed(posts);
  });
};

var addNewCommentToPostRank = function addNewCommentToPostRank(rankedFeedItem) {
  return addReactionToPostRank(rankedFeedItem, 'commentCount');
};

var addNewFavoriteToPostRank = function addNewFavoriteToPostRank(rankedFeedItem) {
  return addReactionToPostRank(rankedFeedItem, 'favoriteCount');
};

var fetchAndUpdateTimestamp = function fetchAndUpdateTimestamp(feedItem) {
  var author = feedItem.author,
      id = feedItem.id;


  return _user2.default.getPublished(author, id).then(function (doc) {
    if (!doc.exists) return;

    var _doc$data = doc.data(),
        lastUpdated = _doc$data.lastUpdated;

    feedItem.lastUpdated = lastUpdated;

    return feedItem;
  });
};

var checkAndFixTimestamp = function checkAndFixTimestamp(feedItems) {
  var fixItems = _lodash2.default.filter(feedItems, function (item) {
    return item.lastUpdated === 0;
  });
  var promises = fixItems.map(function (fixItem) {
    return fetchAndUpdateTimestamp(fixItem);
  });
  if (fixItems.length <= 0) return Promise.resolve();
  return Promise.all(promises).then(function () {
    return updateFeed(feedItems);
  });
};

var getRankedFeed = function getRankedFeed() {
  var feedItems = void 0;
  return getFeed().then(function (items) {
    feedItems = items;
    return checkAndFixTimestamp(feedItems);
  }).then(function () {
    return orderRankedFeedItems(feedItems);
  });
};

module.exports = {
  addPostToRankingFeed: addPostToRankingFeed,
  addNewCommentToPostRank: addNewCommentToPostRank,
  addNewFavoriteToPostRank: addNewFavoriteToPostRank,
  getRankedFeed: getRankedFeed,
  removePostFromRankingFeed: removePostFromRankingFeed,
  removeFavoriteFromPostRank: removeFavoriteFromPostRank
};
//# sourceMappingURL=ranking-feed.js.map