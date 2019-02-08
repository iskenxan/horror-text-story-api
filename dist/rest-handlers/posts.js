'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _errors = require('../utils/errors');

var _user = require('../firebase/user');

var _user2 = _interopRequireDefault(_user);

var _post = require('../firebase/post');

var _post2 = _interopRequireDefault(_post);

var _stream = require('../stream');

var _rankingFeed = require('./feed/ranking-feed');

var _formatter = require('../utils/formatter');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var posts = new _express2.default.Router();

posts.post('/get', function (req, res, next) {
  var _req$body = req.body,
      authorUsername = _req$body.authorUsername,
      id = _req$body.id;


  if (!authorUsername || !id) throw new _errors.InvalidArgumentError('authorUsername and postId cannot be empty');

  _user2.default.getPublished(authorUsername, id).then(function (doc) {
    if (doc.exists) {
      res.locals.result = _extends({}, doc.data(), { id: doc.id });
      next();
    } else throw new _errors.ResourceNotFound('Post not found', 404);
  }).catch(function (error) {
    return next(error);
  });
});

posts.post('/add-favorite', function (req, res, next) {
  var username = res.locals.username;
  var _req$body2 = req.body,
      id = _req$body2.id,
      authorUsername = _req$body2.authorUsername,
      postTitle = _req$body2.postTitle;


  if (!id || !authorUsername || !postTitle) throw new _errors.InvalidArgumentError('id, authorUsername and postTitle cannot be null');

  var published = void 0;
  _user2.default.getPublished(authorUsername, id).then(function (doc) {
    if (!doc.exists) next(new _errors.ResourceNotFound('Post not found', 404));
    published = doc.data();
    return _user2.default.addToFavorite(authorUsername, id, postTitle, username);
  }).then(function () {
    return (0, _stream.addFavoriteNotification)(username, authorUsername, id, published.postActivityId);
  }).then(function (result) {
    var reactionId = result.id;

    var rankedFeedItem = (0, _formatter.getRankFeedItem)(published, authorUsername, id);
    rankedFeedItem.favoriteCount += 1;
    (0, _rankingFeed.addNewFavoriteToPostRank)(rankedFeedItem);
    _user2.default.addFavoriteReactionId(authorUsername, id, username, reactionId);
    next();
  }).catch(function (error) {
    return next(error);
  });
});

posts.post('/remove-favorite', function (req, res, next) {
  var username = res.locals.username;
  var _req$body3 = req.body,
      id = _req$body3.id,
      authorUsername = _req$body3.authorUsername;


  var post = null;
  _user2.default.getPublished(authorUsername, id).then(function (doc) {
    if (!doc.exists) next(new _errors.ResourceNotFound('Post not found', 404));
    post = doc.data();
    return _user2.default.removeFromFavorite(authorUsername, id, username);
  }).then(function () {
    var favoriteObj = post.favorite[username];
    if (favoriteObj == null) {
      return next();
    }
    var reactionId = favoriteObj.reactionId;

    (0, _rankingFeed.removeFavoriteFromPostRank)(id);
    (0, _stream.removeFavoriteNotification)(username, reactionId);
    next();
  }).catch(function (error) {
    return next(error);
  });
});

posts.post('/add-comment', function (req, res, next) {
  var username = res.locals.username;
  var _req$body4 = req.body,
      id = _req$body4.id,
      authorUsername = _req$body4.authorUsername,
      comment = _req$body4.comment;


  if (!id || !authorUsername || !comment) throw new _errors.InvalidArgumentError('id, authorUsername and comment cannot be null');
  if (comment.username !== username) throw new _errors.InvalidArgumentError('comment does not belong to the user');

  var resultComment = void 0;
  var published = void 0;
  _user2.default.getPublished(authorUsername, id).then(function (doc) {
    if (!doc.exists) return next(new _errors.ResourceNotFound('Could not find the post', 404));
    published = doc.data();
    return _post2.default.addComment(authorUsername, id, comment);
  }).then(function (result) {
    resultComment = result;
    var rankedFeedItem = (0, _formatter.getRankFeedItem)(published, authorUsername, id);
    rankedFeedItem.commentCount += 1;
    (0, _rankingFeed.addNewCommentToPostRank)(rankedFeedItem);
    if (authorUsername !== username) {
      return (0, _stream.addCommentNotification)(username, authorUsername, id, published.postActivityId);
    }
  }).then(function () {
    res.locals.result = resultComment;
    next();
  }).catch(function (error) {
    return next(error);
  });
});

module.exports = posts;
//# sourceMappingURL=posts.js.map