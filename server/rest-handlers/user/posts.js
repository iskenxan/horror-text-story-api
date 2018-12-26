import express from 'express';
import User from '../../firebase/user';
import {
  InvalidArgumentError,
} from '../../utils/errors';


const router = express.Router();


router.post('/published/unpublish', (req, res, next) => {
  const { id } = req.body;
  const { username } = res.locals;
  if (!id) {
    next(new InvalidArgumentError('Post id cannot be empty'));
  }

  User.unpublish(username, id).then((draft) => {
    res.locals.result = draft;
    next();
  }).catch(error => next(error));
});


router.post('/draft/publish', (req, res, next) => {
  const { draft } = req.body;
  const { username } = res.locals;
  if (!draft) {
    next(new InvalidArgumentError('Draft cannot be empty'));
  }
  if (draft.id) {
    User.deleteDraft(draft.id, username).catch(error => next(error));
  }
  User.savePublished(draft, username).then((published) => {
    res.locals.result = published;
    next();
  }).catch(error => next(error));
});


router.post('/draft/update', (req, res, next) => {
  const { draft } = req.body;
  const { username } = res.locals;
  if (!draft || !draft.id) {
    next(new InvalidArgumentError('Draft, draft id cannot be null'));
  }
  User.updateDraft(username, draft).then((resultDraft) => {
    res.locals.result = { ...resultDraft };
    next();
  }).catch(error => next(error));
});


router.post('/draft/save', (req, res, next) => {
  const { draft } = req.body;
  const { username } = res.locals;
  if (draft) {
    User.saveDraft(username, draft).then((savedDraft) => {
      res.locals.result = { ...savedDraft };
      next();
    }).catch(error => next(error));
  } else {
    next(new InvalidArgumentError('Draft cannot be empty'));
  }
});


router.post('/published/get', (req, res, next) => {
  const { id } = req.body;
  const { username } = res.locals;
  if (!id) {
    next(new InvalidArgumentError('Published id cannot be empty'));
  }
  User.getPublished(username, id).then((doc) => {
    if (doc.exists) {
      res.locals.result = { ...doc.data(), id: doc.id };
      next();
    }
  }).catch(error => next(error));
});


router.post('/draft/get', (req, res, next) => {
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


router.post('/draft/delete', (req, res, next) => {
  const { id } = req.body;
  const { username } = res.locals;
  if (!id) {
    next(new InvalidArgumentError('Draft id cannot be empty'));
  }
  User.deleteDraft(id, username).then(() => {
    res.locals.result = id;
    next();
  }).catch(error => next(error));
});


module.exports = router;
