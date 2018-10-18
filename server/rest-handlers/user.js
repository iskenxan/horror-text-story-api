import express from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from '../encrypt';
import User from '../firebase/user';
import {
  AuthenticationError,
  InvalidArgumentError,
  ResourceNotFound,
} from '../utils/errors';


const router = express.Router();


const checkPassword = (password, user) => {
  return new Promise((resolve, reject) => {
    const passwordsMatch = bcrypt.compareSync(password, user.hashedPassword);
    if (passwordsMatch) {
      resolve();
    }
    reject(new AuthenticationError());
  });
};


router.post('/posts/draft/save', (req, res, next) => {
  const { draft } = req.body;
  const { user } = res.locals;
  User.saveDraft(user.username, draft).then((id) => {
    res.locals.result = id;
    next();
  }).catch(error => next(error));
});


router.post('/posts/draft/get', (req, res, next) => {
  const { id } = req.body;
  const { user } = res.locals;
  User.getDraft(user.username, id).then((doc) => {
    if (doc.exists) {
      res.locals.result = doc.data();
      next();
    }
  }).catch(error => next(error));
});


router.post('/me', (req, res, next) => {
  const { user } = res.locals;
  res.locals.result = { ...user, hashedPassword: undefined, tokens: undefined };
  next();
});


router.post('/login', (req, res, next) => {
  let token = null;
  const { username, password } = req.body;
  let resultUser = null;
  User.findUserByUsername(username).then((doc) => {
    if (doc.exists) {
      const user = doc.data();
      resultUser = { ...user, hashedPassword: undefined, tokens: undefined };
      return checkPassword(password, user);
    }
    return Promise.reject(new ResourceNotFound('User not found'));
  }).then(() => {
    token = generateToken(username);
    return User.saveToken(username, token);
  }).then(() => {
    res.locals.result = { user: resultUser, token };
    next();
  })
    .catch(error => next(error));
});


router.post('/signup', (req, res, next) => {
  const { username, password, repeatPassword } = req.body;
  if (password !== repeatPassword) {
    throw new InvalidArgumentError('Passwords don\'t match');
  }
  const token = generateToken(username);
  const newUser = new User(username, password, token);
  newUser.writeToDb();
  res.locals.result = { user: { ...newUser, hashedPassword: undefined, tokens: undefined }, token };
  next();
});


router.post('/logout', (req, res, next) => {
  const { token } = req.body;
  User.deleteToken(token).then(() => {
    res.status(200).end();
    next();
  })
    .catch(error => next(error));
});


module.exports = router;
