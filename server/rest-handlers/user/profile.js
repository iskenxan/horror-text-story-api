import express from 'express';
import busboy from 'connect-busboy';
import User from '../../firebase/user';
import { saveImageToBucket } from '../../firebase/storage';
import { verifyToken } from '../../encrypt';
import {
  InvalidArgumentError,
  ResourceNotFound,
} from '../../utils/errors';
import {
  compressImage,
} from '../../utils/file';
import {
  addFollowerNotification,
  followUser,
  unfollowUser,
} from '../../stream';
import {
  subscribeNotificationListener,
} from '../../stream/notification-listener';


const router = express.Router();


router.post('/other', (req, res, next) => {
  const { username } = req.body;
  if (!username) throw new InvalidArgumentError('Username cannot be empty');

  User.findUserByUsername(username).then((doc) => {
    if (!doc.exists) {
      return next(new ResourceNotFound('User not found', 404));
    }

    res.locals.result = { ...doc.data(), hashedPassword: undefined, draftRefs: undefined };
    return next();
  })
    .catch(error => next(error));
});


router.post('/me', (req, res, next) => {
  const { username } = res.locals;
  if (username) {
    User.findUserByUsername(username).then((doc) => {
      if (doc.exists) {
        res.locals.result = { ...doc.data(), hashedPassword: undefined };
        return next();
      }
      next(new ResourceNotFound('User not found'));
    });
  } else {
    next(new InvalidArgumentError('Username cannot be empty'));
  }
});


router.post('/follow', (req, res, next) => {
  const { username } = res.locals;
  const { user, followingUsername } = req.body;
  if (username !== user.username) throw new InvalidArgumentError('user does not match the security token', 401);
  if (!followingUsername) throw new InvalidArgumentError('follower username cannot be empty');
  User.follow(followingUsername, user).then(() => {
    followUser(username, followingUsername);
    addFollowerNotification(followingUsername, username);
    user.following.push(followingUsername);
    res.locals.result = user;
    return next();
  })
    .catch(error => next(error));
});


router.post('/unfollow', (req, res, next) => {
  const { username } = res.locals;
  const { user, followingUsername } = req.body;
  if (username !== user.username) throw new InvalidArgumentError('user does not match the security token', 401);
  if (!followingUsername) throw new InvalidArgumentError('invalid following');

  User.unfollow(followingUsername, user).then(() => {
    unfollowUser(username, followingUsername);
    user.following = user.following.filter(e => e !== followingUsername);
    res.locals.result = user;
    return next();
  });
});


router.post('/notification-token/set', (req, res, next) => {
  const { username } = res.locals;
  const { notif_token: notificationToken } = req.body;
  if (!notificationToken) throw new InvalidArgumentError('notif_token cannot be null');

  User.setNotificationToken(username, notificationToken)
    .then(() => {
      subscribeNotificationListener(username, notificationToken);
      res.status(204).send();
    })
    .catch(error => next(error));
});


const busboyMiddleWare = () => busboy({
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  immediate: true,
});


const compressAndSaveImage = (data, username) => {
  return compressImage(data)
    .then((buffer) => {
      return saveImageToBucket(buffer, `${username}.jpg`);
    })
    .then(imageUrl => imageUrl);
};


const verifyTokenAndSave = (res, next, fileData, token) => {
  verifyToken(token)
    .then((username) => {
      res.locals.result = `https://firebasestorage.googleapis.com/v0/b/travelguide-bf6df.appspot.com/o/${username}.jpg?alt=media`;
      next();
      return compressAndSaveImage(fileData, username);
    });
};

router.post('/profile-image/save', busboyMiddleWare(), (req, res, next) => {
  if (!req.busboy) throw new InvalidArgumentError('file binary data cannot be null');
  let fileData = null;
  let token = null;
  req.busboy.on('file', (fieldName, file) => {
    file.on('data', (data) => {
      if (fileData === null) {
        fileData = data;
      } else {
        fileData = Buffer.concat([fileData, data]);
      }
    });
  });
  req.busboy.on('field', (fieldName, value) => {
    if (fieldName === 'token') {
      token = value;
    }
  });
  req.busboy.on('finish', () => {
    if (!fileData) next(new InvalidArgumentError('file binary data cannot be null'));
    if (!token) next(new InvalidArgumentError('No security token was passed'));
    verifyTokenAndSave(res, next, fileData, token);
  });
});


module.exports = router;
