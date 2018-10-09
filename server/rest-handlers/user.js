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


router.post('/me', (req, res, next) => {
  const { token } = req.body;
  if (token) {
    User.findByToken(token).then((user) => {
      if (user) {
        res.locals.result = { ...user, hashedPassword: undefined, tokens: undefined };
        next();
      } else {
        throw new ResourceNotFound('User not found');
      }
    }).catch(error => next(error));
  } else {
    throw new InvalidArgumentError('No token was passed');
  }
});


router.post('/login', (req, res, next) => {
  let token = null;
  const { username, password } = req.body;
  let resultUser = null;
  User.findUserByUsername(username).then((user) => {
    if (user) {
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
  User.findUserByUsername(username).then((user) => {
    if (!user) {
      const newUser = new User(username, password, token);
      newUser.writeToDb();
      return { ...newUser, hashedPassword: undefined, tokens: undefined };
    }
    return Promise.reject(new InvalidArgumentError('User with the given username already exists'));
  }).then((user) => {
    res.locals.result = { user, token };
    next();
  }).catch(error => next(error));
});


router.post('/logout', (req, res, next) => {
  const { username, token } = req.body;
  User.deleteToken(username, token).then(() => {
    res.status(200).end();
    next();
  })
    .catch(error => next(error));
});


module.exports = router;
