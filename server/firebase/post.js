import adminFirestore from 'firebase-admin';
import { db } from './index';

class Post {
  static addComment = (authorUsername, postId, comment) => {
    comment.timestamp = new Date().getTime();
    return db.collection('users').doc(authorUsername)
      .collection('published').doc(postId)
      .update({
        comments: adminFirestore.firestore.FieldValue.arrayUnion(comment),
      })
      .then(() => {
        return comment;
      });
  };
}

module.exports = Post;
