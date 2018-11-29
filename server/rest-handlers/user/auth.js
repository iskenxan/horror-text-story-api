import express from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from '../../encrypt';
import User from '../../firebase/user';
import {
  AuthenticationError,
  InvalidArgumentError,
  ResourceNotFound,
} from '../../utils/errors';


const router = express.Router();

const checkPassword = (password, user) => {
  return new Promise((resolve, reject) => {
    const passwordsMatch = bcrypt.compareSync(password, user.hashedPassword);
    if (passwordsMatch) {
      resolve();
    }
    reject(new AuthenticationError('Incorrect password'));
  });
};


router.post('/login', (req, res, next) => {
  let token = null;
  const { username, password } = req.body;
  let resultUser = null;
  if (username && password) {
    User.findUserByUsername(username).then((doc) => {
      if (doc.exists) {
        const user = doc.data();
        resultUser = { ...user, hashedPassword: undefined };
        return checkPassword(password, user);
      }
      return Promise.reject(new ResourceNotFound('User not found'));
    }).then(() => {
      token = generateToken(username);
    }).then(() => {
      res.locals.result = { user: resultUser, token };
      next();
    })
      .catch(error => next(error));
  } else {
    next(new InvalidArgumentError('Username and password cannot be empty'));
  }
});


router.post('/signup', (req, res, next) => {
  const { username, password, repeatPassword } = req.body;
  if (!username || !password || !repeatPassword) {
    throw new InvalidArgumentError('username, password and repeat password cannot be empty');
  }
  if (password !== repeatPassword) {
    throw new InvalidArgumentError('Passwords don\'t match');
  }
  User.findUserByUsername(username).then((doc) => {
    if (doc.exists) {
      throw new InvalidArgumentError('Username is taken');
    } else {
      const token = generateToken(username);
      const newUser = new User(username, password, token);
      newUser.writeToDb();
      res.locals.result = { user: { ...newUser, hashedPassword: undefined }, token };
      next();
    }
  }).catch(error => next(error));
});


router.post('/logout', (req, res, next) => {
  res.status(200).end();// just keeping here for future needs
  next();
});


module.exports = router;
