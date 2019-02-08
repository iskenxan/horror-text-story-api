'use strict';

var _firebaseAdmin = require('firebase-admin');

var _firebaseAdmin2 = _interopRequireDefault(_firebaseAdmin);

var _index = require('./index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Post = function Post() {
  _classCallCheck(this, Post);
};

Post.addComment = function (authorUsername, postId, comment) {
  comment.timestamp = new Date().getTime();
  return _index.db.collection('users').doc(authorUsername).collection('published').doc(postId).update({
    comments: _firebaseAdmin2.default.firestore.FieldValue.arrayUnion(comment)
  }).then(function () {
    return comment;
  });
};

module.exports = Post;
//# sourceMappingURL=post.js.map