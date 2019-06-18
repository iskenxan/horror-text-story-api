import express from 'express';
import User from '../../firebase/user';
import {
  InvalidArgumentError,
  ResourceNotFound,
} from '../../utils/errors';
import { addPostActivity, removePostActivity, removePostNotifications } from '../../stream';
import { addPostToRankingFeed, removePostFromRankingFeed } from '../feed/ranking-feed';
import { getRankFeedItem } from '../../utils/formatter';


const router = express.Router();


router.post('/published/unpublish', (req, res, next) => {
  const { id } = req.body;
  const { username } = res.locals;
  if (!id) {
    next(new InvalidArgumentError('Post id cannot be empty'));
  }

  User.unpublish(username, id)
    .then((draft) => {
      removePostFromRankingFeed(id);
      removePostActivity(username, id);
      removePostNotifications(username, id);
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
  let published = null;
  User.savePublished(draft, username)
    .then((result) => {
      published = result;
      const rankedFeedItem = getRankFeedItem(published, username, published.id);
      addPostToRankingFeed(rankedFeedItem);
      return addPostActivity(username, published.id, published.title, published.lastUpdated);
    })
    .then((result) => {
      const { id: activityId } = result;
      User.updatePublished(username, published.id, 'postActivityId', activityId);
      res.locals.result = { ...published, postActivityId: activityId };
      next();
    })
    .catch(error => next(error));
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
    } else {
      next(new ResourceNotFound('Post not found', 404));
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
