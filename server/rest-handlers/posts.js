import express from 'express';
import { InvalidArgumentError, ResourceNotFound } from '../utils/errors';
import User from '../firebase/user';
import Post from '../firebase/post';
import {
  addFavoriteNotification,
  addCommentNotification,
  removeFavoriteNotification,
} from '../stream';
import {
  addNewCommentToPostRank,
  addNewFavoriteToPostRank,
  removeFavoriteFromPostRank,
} from './feed/ranking-feed';
import { getRankFeedItem } from '../utils/formatter';


const posts = new express.Router();

posts.post('/get', (req, res, next) => {
  const { authorUsername, id } = req.body;

  if (!authorUsername || !id) throw new InvalidArgumentError('authorUsername and postId cannot be empty');

  User.getPublished(authorUsername, id).then((doc) => {
    if (doc.exists) {
      res.locals.result = { ...doc.data(), id: doc.id };
      next();
    } else throw new ResourceNotFound('Post not found', 404);
  }).catch(error => next(error));
});


posts.post('/add-favorite', (req, res, next) => {
  const { username } = res.locals;
  const {
    id, authorUsername, postTitle,
  } = req.body;

  if (!id || !authorUsername || !postTitle) throw new InvalidArgumentError('id, authorUsername and postTitle cannot be null');

  let published;
  User.getPublished(authorUsername, id)
    .then((doc) => {
      if (!doc.exists) next(new ResourceNotFound('Post not found', 404));
      published = doc.data();
      return User.addToFavorite(authorUsername, id, postTitle, username);
    })
    .then(() => {
      return addFavoriteNotification(username, authorUsername, id, published.postActivityId, true);
    })
    .then((result) => {
      const { id: reactionId } = result;
      const rankedFeedItem = getRankFeedItem(published, authorUsername, id);
      rankedFeedItem.favoriteCount += 1;
      addNewFavoriteToPostRank(rankedFeedItem);
      User.addFavoriteReactionId(authorUsername, id, username, reactionId);
      next();
    })
    .catch(error => next(error));
});


posts.post('/remove-favorite', (req, res, next) => {
  const { username } = res.locals;
  const { id, authorUsername } = req.body;

  let post = null;
  User.getPublished(authorUsername, id)
    .then((doc) => {
      if (!doc.exists) next(new ResourceNotFound('Post not found', 404));
      post = doc.data();
      return User.removeFromFavorite(authorUsername, id, username);
    })
    .then(() => {
      const favoriteObj = post.favorite[username];
      if (favoriteObj == null) {
        return next();
      }
      const { reactionId } = favoriteObj;
      removeFavoriteFromPostRank(id);
      removeFavoriteNotification(username, reactionId);
      next();
    })
    .catch(error => next(error));
});


posts.post('/add-comment', (req, res, next) => {
  const { username } = res.locals;
  const { id, authorUsername, comment } = req.body;

  if (!id || !authorUsername || !comment) throw new InvalidArgumentError('id, authorUsername and comment cannot be null');
  if (comment.username !== username) throw new InvalidArgumentError('comment does not belong to the user');

  let resultComment;
  let published;
  User.getPublished(authorUsername, id)
    .then((doc) => {
      if (!doc.exists) return next(new ResourceNotFound('Could not find the post', 404));
      published = doc.data();
      return Post.addComment(authorUsername, id, comment);
    })
    .then((result) => {
      resultComment = result;
      const rankedFeedItem = getRankFeedItem(published, authorUsername, id);
      rankedFeedItem.commentCount += 1;
      addNewCommentToPostRank(rankedFeedItem);
      const notifyMaker = authorUsername !== username;
      return addCommentNotification(username, authorUsername,
        id, published.postActivityId, notifyMaker);
    })
    .then(() => {
      res.locals.result = resultComment;
      next();
    })
    .catch(error => next(error));
});

module.exports = posts;
