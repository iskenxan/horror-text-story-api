'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* eslint-disable prefer-destructuring */


var _firebaseAdmin = require('firebase-admin');

var _firebaseAdmin2 = _interopRequireDefault(_firebaseAdmin);

var _index = require('./index');

var _encrypt = require('../encrypt');

var _errors = require('../utils/errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var User = function () {
  function User(username, password) {
    _classCallCheck(this, User);

    _initialiseProps.call(this);

    this.username = username;
    this.hashedPassword = (0, _encrypt.generateHashedPassword)(password);
    this.publishedRefs = {};
    this.draftRefs = {};
    this.followers = [];
    this.following = [];
  }

  _createClass(User, null, [{
    key: 'findUserByUsername',
    value: function findUserByUsername(username) {
      return _index.db.collection('users').doc(username).get();
    }
  }]);

  return User;
}();

User.removeFromFavorite = function (authorUsername, postId, username) {
  var FieldValue = _firebaseAdmin2.default.firestore.FieldValue;

  return _index.db.collection('users').doc(authorUsername).collection('published').doc(postId).update(_defineProperty({}, 'favorite.' + username, FieldValue.delete())).then(function () {
    return _index.db.collection('users').doc(authorUsername).update(_defineProperty({}, 'publishedRefs.' + postId + '.favorite', FieldValue.arrayRemove(username)));
  }).then(function () {
    return _index.db.collection('users').doc(username).update(_defineProperty({}, 'favorite.' + postId, FieldValue.delete()));
  });
};

User.addFavoriteReactionId = function (authorUsername, postId, username, reactionId) {
  return _index.db.collection('users').doc(authorUsername).collection('published').doc(postId).update(_defineProperty({}, 'favorite.' + username + '.reactionId', reactionId));
};

User.addToFavorite = function (authorUsername, postId, title, username) {
  return _index.db.collection('users').doc(authorUsername).collection('published').doc(postId).update(_defineProperty({}, 'favorite.' + username, { username: username })).then(function () {
    return _index.db.collection('users').doc(authorUsername).update(_defineProperty({}, 'publishedRefs.' + postId + '.favorite', _firebaseAdmin2.default.firestore.FieldValue.arrayUnion(username)));
  }).then(function () {
    return _index.db.collection('users').doc(username).update(_defineProperty({}, 'favorite.' + postId, {
      author: authorUsername,
      title: title
    }));
  });
};

User.follow = function (followingUsername, follower) {
  return _index.db.collection('users').doc(follower.username).update({
    following: _firebaseAdmin2.default.firestore.FieldValue.arrayUnion(followingUsername)
  }).then(function () {
    return _index.db.collection('users').doc(followingUsername).update({
      followers: _firebaseAdmin2.default.firestore.FieldValue.arrayUnion(follower.username)
    });
  });
};

User.unfollow = function (followingUsername, follower) {
  return _index.db.collection('users').doc(follower.username).update({
    following: _firebaseAdmin2.default.firestore.FieldValue.arrayRemove(followingUsername)
  }).then(function () {
    return _index.db.collection('users').doc(followingUsername).update({
      followers: _firebaseAdmin2.default.firestore.FieldValue.arrayRemove(follower.username)
    });
  });
};

User.unpublish = function (username, postId) {
  if (!username || !postId || username === '' || postId === '') {
    throw new _errors.InvalidArgumentError('Username and post id cannot be empty');
  }
  var post = null;
  var lastUpdated = new Date().getTime();
  return User.getPublished(username, postId).then(function (doc) {
    if (!doc.exists) {
      throw new _errors.ResourceNotFound('Post was not found');
    }
    post = doc.data();
    delete post.postActivityId;
    delete post.favorite;
    delete post.comments;
    post.lastUpdated = lastUpdated;
    return _index.db.collection('users').doc(username).collection('drafts').doc(postId).set(_extends({}, post));
  }).then(function () {
    post.id = postId;
    return User._saveDraftRef(username, _extends({}, post), lastUpdated);
  }).then(function () {
    return User.deletePost(postId, username);
  }).then(function () {
    return post;
  });
};

User.getPublished = function (username, postId) {
  if (!username || !postId || username === '' || postId === '') {
    throw new _errors.InvalidArgumentError('Username and draft id cannot be empty');
  }
  return _index.db.collection('users').doc(username).collection('published').doc(postId).get();
};

User.savePublished = function (post, username) {
  if (!post.title || post.title === '') {
    throw new _errors.InvalidArgumentError('Title cannot be empty');
  }
  if (post.dialogCount <= 2) {
    throw new _errors.InvalidArgumentError('Post must have at least 3 dialog messages');
  }
  var lastUpdated = new Date().getTime();
  var postCopy = _extends({}, post);

  return User._saveInCollection(username, post, 'published', lastUpdated).then(function (snapshot) {
    postCopy.id = snapshot.id;
    return User._savePublishedRef(username, _extends({}, postCopy), lastUpdated);
  }).then(function () {
    return postCopy;
  });
};

User._savePublishedRef = function (username, post, lastUpdated) {
  var created = post.created ? post.created : lastUpdated;

  return _index.db.collection('users').doc(username).update(_defineProperty({}, 'publishedRefs.' + post.id, {
    title: post.title,
    created: created,
    lastUpdated: lastUpdated,
    author: username,
    id: post.id,
    favorite: []
  }));
};

User.updatePublished = function (username, postId, updateKey, updateValue) {
  return _index.db.collection('users').doc(username).collection('published').doc(postId).update(_defineProperty({}, updateKey, updateValue));
};

User.getDraft = function (username, draftId) {
  if (!username || !draftId || username === '' || draftId === '') {
    throw new _errors.InvalidArgumentError('Username and draft id cannot be empty');
  }
  return _index.db.collection('users').doc(username).collection('drafts').doc(draftId).get();
};

User.updateDraft = function (username, draft) {
  if (!draft.title || draft.title === '' || !draft.id || draft.id === '') {
    throw new _errors.InvalidArgumentError('Title and id cannot be empty');
  }
  var lastUpdated = new Date().getTime();
  return User._updateInDraftsCollection(username, draft, lastUpdated).then(function () {
    return User._saveDraftRef(username, draft, lastUpdated).then(function () {
      draft.lastUpdated = lastUpdated;
      return draft;
    });
  });
};

User._updateInDraftsCollection = function (username, draft, lastUpdated) {
  var draftCopy = _extends({}, draft);
  delete draftCopy.id;
  draftCopy.lastUpdated = lastUpdated;

  return _index.db.collection('users').doc(username).collection('drafts').doc(draft.id).update(draftCopy);
};

User.deletePost = function (postId, username) {
  return _index.db.collection('users').doc(username).collection('published').doc(postId).delete().then(function () {
    return _index.db.collection('users').doc(username).update(_defineProperty({}, 'publishedRefs.' + postId, _firebaseAdmin2.default.firestore.FieldValue.delete()));
  });
};

User.deleteDraft = function (draftId, username) {
  return _index.db.collection('users').doc(username).collection('drafts').doc(draftId).delete().then(function () {
    return _index.db.collection('users').doc(username).update(_defineProperty({}, 'draftRefs.' + draftId, _firebaseAdmin2.default.firestore.FieldValue.delete()));
  });
};

User.saveDraft = function (username, draft) {
  if (!draft.title || draft.title === '') {
    throw new _errors.InvalidArgumentError('Title cannot be empty');
  }
  var lastUpdated = new Date().getTime();
  return User._saveInCollection(username, draft, 'drafts', lastUpdated).then(function (ref) {
    var id = ref.id;

    return User._saveDraftRef(username, _extends({}, draft, { id: ref.id }), lastUpdated).then(function () {
      return _extends({}, draft, { id: id, lastUpdated: lastUpdated, author: username
      });
    });
  });
};

User._saveInCollection = function (username, post, collection, lastUpdated) {
  var created = post.created ? post.created : lastUpdated;
  var ref = _index.db.collection('users').doc(username).collection(collection).doc();
  var id = ref.id;

  return ref.set({
    title: post.title,
    characters: post.characters,
    dialog: post.dialog,
    dialogCount: post.dialogCount,
    created: created,
    lastUpdated: lastUpdated,
    author: username,
    favorite: {},
    id: id
  }).then(function () {
    return ref;
  });
};

User._saveDraftRef = function (username, draft, lastUpdated) {
  var created = draft.created ? draft.created : lastUpdated;

  return _index.db.collection('users').doc(username).update(_defineProperty({}, 'draftRefs.' + draft.id, {
    title: draft.title,
    created: created,
    lastUpdated: lastUpdated,
    author: username,
    favorite: [],
    id: draft.id
  }));
};

var _initialiseProps = function _initialiseProps() {
  var _this = this;

  this.writeToDb = function () {
    return User.findUserByUsername(_this.username).then(function (doc) {
      if (doc.exists) {
        return Promise.reject(new _errors.InvalidArgumentError('User with the give username already exists'));
      }
      return _index.db.collection('users').doc(_this.username).set({
        username: _this.username,
        hashedPassword: _this.hashedPassword,
        publishedRefs: _this.publishedRefs,
        draftRefs: _this.draftRefs,
        followers: _this.followers,
        following: _this.following
      });
    });
  };
};

module.exports = User;
//# sourceMappingURL=user.js.map