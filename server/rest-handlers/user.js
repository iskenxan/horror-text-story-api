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


router.post('/posts/draft/publish', (req, res, next) => {
  const { draft } = req.body;
  const { username } = res.locals;
  if (!draft) {
    next(new InvalidArgumentError('Draft cannot be empty'));
  }
  if (draft.id) {
    User.deleteDraft(draft.id, username).catch(error => next(error));
  }
  User.savePublished(draft, username).then((id) => {
    res.locals.result = { published: id, oldDraft: draft.id };
    next();
  }).catch(error => next(error));
});

router.post('/posts/draft/update', (req, res, next) => {
  const { draft } = req.body;
  const { username } = res.locals;
  if (!draft || !draft.id) {
    next(new InvalidArgumentError('Draft, draft id cannot be null'));
  }
  User.updateDraft(username, draft).then(() => {
    res.locals.result = draft.id;
    next();
  }).catch(error => next(error));
});


router.post('/posts/draft/save', (req, res, next) => {
  const { draft } = req.body;
  const { username } = res.locals;
  if (draft) {
    User.saveDraft(username, draft).then((id) => {
      res.locals.result = id;
      next();
    }).catch(error => next(error));
  } else {
    next(new InvalidArgumentError('Draft cannot be empty'));
  }
});


router.post('/posts/draft/get', (req, res, next) => {
  const { id } = req.body;
  const { username } = res.locals;
  if (id) {
    User.getDraft(username, id).then((doc) => {
      if (doc.exists) {
        res.locals.result = { ...doc.data(), id: doc.id };
        next();
      }
    }).catch(error => next(error));
  } else {
    next(new InvalidArgumentError('Draft id cannot be empty'));
  }
});


router.post('/posts/draft/delete', (req, res, next) => {
  const { id } = req.body;
  const { username } = res.locals;
  if (!id) {
    next(new InvalidArgumentError('Draft id and username cannot be empty'));
  }
  User.deleteDraft(id, username).then(() => {
    res.locals.result = id;
    next();
  }).catch(error => next(error));
});


router.post('/me', (req, res, next) => {
  const { username } = res.locals;
  if (username) {
    User.findUserByUsername(username).then((doc) => {
      if (doc.exists) {
        res.locals.result = { ...doc.data(), hashedPassword: undefined };
        next();
      }
      next(new ResourceNotFound('User not found'));
    });
  } else {
    next(new InvalidArgumentError('Username cannot be empty'));
  }
});


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
  if (username && password && repeatPassword) {
    if (password !== repeatPassword) {
      throw new InvalidArgumentError('Passwords don\'t match');
    }
    const token = generateToken(username);
    const newUser = new User(username, password, token);
    newUser.writeToDb();
    res.locals.result = { user: { ...newUser, hashedPassword: undefined }, token };
    next();
  } else {
    next(new InvalidArgumentError('username, password and repeat password cannot be empty'));
  }
});


router.post('/logout', (req, res, next) => {
  res.status(200).end();// just keeping here for future needs
  next();
});


module.exports = router;
