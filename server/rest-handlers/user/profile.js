import express from 'express';
import User from '../../firebase/user';
import {
  InvalidArgumentError,
  ResourceNotFound,
} from '../../utils/errors';


const router = express.Router();

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


router.post('profile-image/save', (req, res, next) => {
  const { username } = res.locals;
  const { base64 } = req.body;
  if (!base64) throw new InvalidArgumentError('base64 parameter cannot be null');

});


module.exports = router;
