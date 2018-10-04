const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUserByUsername } = require('../firebase/user');
const { AuthenticationError, InvalidArguementError } = require('../utils/errors');

const TOKEN_SALT = 'Gn@L=Uys>_v(z}Nu"~~kVUCg^B\\T<A[eGhTp&v8@';
const router = express.Router();


const verifyPasswordAndCreateToken = (password, user) => {
  return new Promise((resolve, reject) => {
    const passwordsMatch = bcrypt.compareSync(password, user.hashedPassword);
    if (passwordsMatch) {
      const token = jwt.sign({
        user: user.username,
      }, TOKEN_SALT);
      resolve(token);
    } else {
      reject(new AuthenticationError());
    }
  });
};


router.post('/login', (req, res, next) => {
  const { username, password } = req.body;
  findUserByUsername(username).then((user) => {
    return verifyPasswordAndCreateToken(password, user);
  }).then((token) => {
    res.status(200).send({ token });
  }).catch(error => next(error));
});


router.post('/signup', (req, res, next) => {
  const { username, password, repeatPassword } = req.body;
  if (password !== repeatPassword) {
    next(new InvalidArguementError('Passwords don\'t match'));
  }


});


module.exports = router;
