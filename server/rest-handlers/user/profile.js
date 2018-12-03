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


const router = express.Router();

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


const busboyMiddleWare = () => busboy({
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  immediate: true,
});


const compressAndSaveImage = (data, username) => {
  let profileUrl = null;
  return compressImage(data)
    .then((buffer) => {
      return saveImageToBucket(buffer, `${username}.jpg`);
    })
    .then((imageUrl) => {
      profileUrl = imageUrl;
      return User.saveProfileImageUrl(imageUrl, username);
    }).then(() => profileUrl);
};


const verifyTokenAndSave = (res, next, fileData, token) => {
  verifyToken(token)
    .then((username) => {
      return compressAndSaveImage(fileData, username);
    })
    .then((profileUrl) => {
      res.locals.result = profileUrl;
      next();
    })
    .catch(error => next(error));
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
