import express from 'express';
import { InvalidArgumentError, ResourceNotFound } from '../utils/errors';
import User from '../firebase/user';
import Post from '../firebase/post';


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
    id, authorUsername, postTitle, userProfileImgUrl: profileImgUrl,
  } = req.body;

  if (!id || !authorUsername || !postTitle) throw new InvalidArgumentError('id, authorUsername and postTitle cannot be null');

  User.getPublished(authorUsername, id)
    .then((doc) => {
      if (!doc.exists) next(new ResourceNotFound('Post not found', 404));
      return User.addToFavorite(authorUsername, id, postTitle, username, profileImgUrl);
    })
    .then(() => next())
    .catch(error => next(error));
});


posts.post('/remove-favorite', (req, res, next) => {
  const { username } = res.locals;
  const { id, authorUsername } = req.body;

  User.getPublished(authorUsername, id)
    .then((doc) => {
      if (!doc.exists) next(new ResourceNotFound('Post not found', 404));
      return User.removeFromFavorite(authorUsername, id, username);
    })
    .then(() => next())
    .catch(error => next(error));
});


posts.post('/add-comment', (req, res, next) => {
  const { username } = res.locals;
  const { id, authorUsername, comment } = req.body;

  if (!id || !authorUsername || !comment) throw new InvalidArgumentError('id, authorUsername and comment cannot be null');
  if (comment.username !== username) throw new InvalidArgumentError('comment does not belong to the user');

  User.getPublished(authorUsername, id)
    .then((doc) => {
      if (!doc.exists) return next(new ResourceNotFound('Could not find the post', 404));
      Post.addComment(authorUsername, id, comment).then((resultComment) => {
        res.locals.result = resultComment;
        next();
      });
    })
    .catch(error => next(error));
});

module.exports = posts;
