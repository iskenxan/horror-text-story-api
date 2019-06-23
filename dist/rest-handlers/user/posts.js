'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _user = require('../../firebase/user');

var _user2 = _interopRequireDefault(_user);

var _errors = require('../../utils/errors');

var _stream = require('../../stream');

var _rankingFeed = require('../feed/ranking-feed');

var _formatter = require('../../utils/formatter');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

router.post('/published/unpublish', function (req, res, next) {
  var id = req.body.id;
  var username = res.locals.username;

  if (!id) {
    next(new _errors.InvalidArgumentError('Post id cannot be empty'));
  }

  _user2.default.unpublish(username, id).then(function (draft) {
    (0, _rankingFeed.removePostFromRankingFeed)(id);
    (0, _stream.removePostActivity)(username, id);
    (0, _stream.removePostNotifications)(username, id);
    res.locals.result = draft;
    next();
  }).catch(function (error) {
    return next(error);
  });
});

router.post('/draft/publish', function (req, res, next) {
  var draft = req.body.draft;
  var username = res.locals.username;

  if (!draft) {
    next(new _errors.InvalidArgumentError('Draft cannot be empty'));
  }
  if (draft.id) {
    _user2.default.deleteDraft(draft.id, username).catch(function (error) {
      return next(error);
    });
  }
  var published = null;
  _user2.default.savePublished(draft, username).then(function (result) {
    published = result;
    var rankedFeedItem = (0, _formatter.getRankFeedItem)(published, username, published.id);
    (0, _rankingFeed.addPostToRankingFeed)(rankedFeedItem);
    return (0, _stream.addPostActivity)(username, published.id, published.title, published.lastUpdated, published.preface);
  }).then(function (result) {
    var activityId = result.id;

    _user2.default.updatePublished(username, published.id, 'postActivityId', activityId);
    res.locals.result = _extends({}, published, { author: username, postActivityId: activityId });
    next();
  }).catch(function (error) {
    return next(error);
  });
});

router.post('/draft/update', function (req, res, next) {
  var draft = req.body.draft;
  var username = res.locals.username;

  if (!draft || !draft.id) {
    next(new _errors.InvalidArgumentError('Draft, draft id cannot be null'));
  }
  _user2.default.updateDraft(username, draft).then(function (resultDraft) {
    res.locals.result = _extends({}, resultDraft);
    next();
  }).catch(function (error) {
    return next(error);
  });
});

router.post('/draft/save', function (req, res, next) {
  var draft = req.body.draft;
  var username = res.locals.username;

  if (draft) {
    _user2.default.saveDraft(username, draft).then(function (savedDraft) {
      res.locals.result = _extends({}, savedDraft);
      next();
    }).catch(function (error) {
      return next(error);
    });
  } else {
    next(new _errors.InvalidArgumentError('Draft cannot be empty'));
  }
});

router.post('/published/get', function (req, res, next) {
  var id = req.body.id;
  var username = res.locals.username;

  if (!id) {
    next(new _errors.InvalidArgumentError('Published id cannot be empty'));
  }
  _user2.default.getPublished(username, id).then(function (doc) {
    if (doc.exists) {
      res.locals.result = _extends({}, doc.data(), { id: doc.id });
      next();
    } else {
      next(new _errors.ResourceNotFound('Post not found', 404));
    }
  }).catch(function (error) {
    return next(error);
  });
});

router.post('/draft/get', function (req, res, next) {
  var id = req.body.id;
  var username = res.locals.username;

  if (id) {
    _user2.default.getDraft(username, id).then(function (doc) {
      if (doc.exists) {
        res.locals.result = _extends({}, doc.data(), { id: doc.id });
        next();
      }
    }).catch(function (error) {
      return next(error);
    });
  } else {
    next(new _errors.InvalidArgumentError('Draft id cannot be empty'));
  }
});

router.post('/draft/delete', function (req, res, next) {
  var id = req.body.id;
  var username = res.locals.username;

  if (!id) {
    next(new _errors.InvalidArgumentError('Draft id cannot be empty'));
  }
  _user2.default.deleteDraft(id, username).then(function () {
    res.locals.result = id;
    next();
  }).catch(function (error) {
    return next(error);
  });
});

module.exports = router;
//# sourceMappingURL=posts.js.map