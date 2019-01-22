/* eslint-disable prefer-destructuring */
import adminFirestore from 'firebase-admin';
import { db } from './index';
import { generateHashedPassword, verifyToken } from '../encrypt';
import { InvalidArgumentError, ResourceNotFound } from '../utils/errors';

class User {
  constructor(username, password) {
    this.username = username;
    this.hashedPassword = generateHashedPassword(password);
    this.publishedRefs = {};
    this.draftRefs = {};
    this.followers = {};
    this.following = {};
  }


  writeToDb = () => {
    return User.findUserByUsername(this.username).then((doc) => {
      if (doc.exists) {
        return Promise.reject(new InvalidArgumentError('User with the give username already exists'));
      }
      return db.collection('users').doc(this.username).set({
        username: this.username,
        hashedPassword: this.hashedPassword,
        profileUrl: null,
        publishedRefs: this.publishedRefs,
        draftRefs: this.draftRefs,
        followers: this.followers,
        following: this.following,
      });
    });
  };


  static removeFromFavorite = (authorUsername, postId, username) => {
    const { FieldValue } = adminFirestore.firestore;
    return db.collection('users').doc(authorUsername).collection('published').doc(postId)
      .update({
        [`favorite.${username}`]: adminFirestore.firestore.FieldValue.delete(),
      })
      .then(() => {
        return db.collection('users').doc(authorUsername).update({
          [`publishedRefs.${postId}.favorite.${username}`]: adminFirestore.firestore.FieldValue.delete(),
        });
      })
      .then(() => {
        return db.collection('users').doc(username).update({
          [`favorite.${postId}`]: FieldValue.delete(),
        });
      });
  };


  static addToFavorite = (authorUsername, postId, title, username, profileUrl) => {
    profileUrl = profileUrl || null;
    return db.collection('users').doc(authorUsername).collection('published').doc(postId)
      .update({
        [`favorite.${username}`]: {
          profileUrl,
        },
      })
      .then(() => {
        return db.collection('users').doc(authorUsername).update({
          [`publishedRefs.${postId}.favorite.${username}`]: profileUrl,
        });
      })
      .then(() => {
        return db.collection('users').doc(username).update({
          [`favorite.${postId}`]: {
            author: authorUsername,
            title,
          },
        });
      });
  };


  static follow = (followingUsername, followingProfileUrl, follower) => {
    let profileUrl = followingProfileUrl || '';
    return db.collection('users').doc(follower.username).update({
      [`following.${followingUsername}`]: {
        profileUrl,
      },
    })
      .then(() => {
        profileUrl = follower.profileUrl || '';
        return db.collection('users').doc(followingUsername).update({
          [`followers.${follower.username}`]: {
            profileUrl,
          },
        });
      });
  };


  static unfollow = (followingUsername, follower) => {
    return db.collection('users').doc(follower.username).update({
      [`following.${followingUsername}`]: adminFirestore.firestore.FieldValue.delete(),
    })
      .then(() => {
        return db.collection('users').doc(followingUsername).update({
          [`followers.${follower.username}`]: adminFirestore.firestore.FieldValue.delete(),
        });
      });
  };


  static findUserByUsername(username) {
    return db.collection('users').doc(username).get();
  }


  static unpublish = (username, postId) => {
    if (!username || !postId || username === '' || postId === '') {
      throw new InvalidArgumentError('Username and post id cannot be empty');
    }
    let post = null;
    const lastUpdated = new Date().getTime();
    return User.getPublished(username, postId)
      .then((doc) => {
        if (!doc.exists) {
          throw new ResourceNotFound('Post was not found');
        }
        post = doc.data();
        delete post.postActivityId;
        delete post.favorite;
        post.lastUpdated = lastUpdated;
        return db.collection('users').doc(username).collection('drafts').doc(postId)
          .set({ ...post });
      })
      .then(() => {
        post.id = postId;
        return User._saveDraftRef(username, { ...post }, lastUpdated);
      })
      .then(() => {
        return User.deletePost(postId, username);
      })
      .then(() => post);
  };


  static getPublished = (username, postId) => {
    if (!username || !postId || username === '' || postId === '') {
      throw new InvalidArgumentError('Username and draft id cannot be empty');
    }
    return db.collection('users').doc(username).collection('published').doc(postId)
      .get();
  };


  static savePublished = (post, username) => {
    if (!post.title || post.title === '') {
      throw new InvalidArgumentError('Title cannot be empty');
    }
    if (post.dialogCount <= 2) {
      throw new InvalidArgumentError('Post must have at least 3 dialog messages');
    }
    const lastUpdated = new Date().getTime();
    const postCopy = { ...post };

    return User._saveInCollection(username, post, 'published', lastUpdated).then((snapshot) => {
      postCopy.id = snapshot.id;
      return User._savePublishedRef(username, { ...postCopy }, lastUpdated);
    }).then(() => postCopy);
  };


  static _savePublishedRef = (username, post, lastUpdated) => {
    const created = post.created ? post.created : lastUpdated;

    return db.collection('users').doc(username).update({
      [`publishedRefs.${post.id}`]: {
        title: post.title,
        created,
        lastUpdated,
      },
    });
  };


  static updatePublished = (username, postId, updateKey, updateValue) => {
    return db.collection('users').doc(username)
      .collection('published').doc(postId)
      .update({
        [updateKey]: updateValue,
      });
  };

  static getDraft = (username, draftId) => {
    if (!username || !draftId || username === '' || draftId === '') {
      throw new InvalidArgumentError('Username and draft id cannot be empty');
    }
    return db.collection('users').doc(username)
      .collection('drafts').doc(draftId)
      .get();
  };


  static updateDraft = (username, draft) => {
    if (!draft.title || draft.title === '' || !draft.id || draft.id === '') {
      throw new InvalidArgumentError('Title and id cannot be empty');
    }
    const lastUpdated = new Date().getTime();
    return User._updateInDraftsCollection(username, draft, lastUpdated).then(() => {
      return User._saveDraftRef(username, draft, lastUpdated).then(() => {
        draft.lastUpdated = lastUpdated;
        return draft;
      });
    });
  };


  static _updateInDraftsCollection = (username, draft, lastUpdated) => {
    const draftCopy = { ...draft };
    delete draftCopy.id;
    draftCopy.lastUpdated = lastUpdated;

    return db.collection('users').doc(username).collection('drafts').doc(draft.id)
      .update(draftCopy);
  };


  static deletePost = (postId, username) => {
    return db.collection('users').doc(username).collection('published').doc(postId)
      .delete()
      .then(() => {
        return db.collection('users').doc(username).update({
          [`publishedRefs.${postId}`]: adminFirestore.firestore.FieldValue.delete(),
        });
      });
  };


  static deleteDraft = (draftId, username) => {
    return db.collection('users').doc(username).collection('drafts').doc(draftId)
      .delete()
      .then(() => {
        return db.collection('users').doc(username).update({
          [`draftRefs.${draftId}`]: adminFirestore.firestore.FieldValue.delete(),
        });
      });
  };


  static saveDraft = (username, draft) => {
    if (!draft.title || draft.title === '') {
      throw new InvalidArgumentError('Title cannot be empty');
    }
    const lastUpdated = new Date().getTime();
    return User._saveInCollection(username, draft, 'drafts', lastUpdated).then((ref) => {
      return User._saveDraftRef(username, { ...draft, id: ref.id }, lastUpdated).then(() => {
        return { ...draft, id: ref.id, lastUpdated };
      });
    });
  };


  static _saveInCollection = (username, post, collection, lastUpdated) => {
    const created = post.created ? post.created : lastUpdated;

    return db.collection('users').doc(username).collection(collection).add({
      title: post.title,
      characters: post.characters,
      dialog: post.dialog,
      dialogCount: post.dialogCount,
      created,
      lastUpdated,
    });
  };


  static _saveDraftRef = (username, draft, lastUpdated) => {
    const created = draft.created ? draft.created : lastUpdated;

    return db.collection('users').doc(username).update({
      [`draftRefs.${draft.id}`]: {
        title: draft.title,
        created,
        lastUpdated,
      },
    });
  };


  static saveProfileImageUrl = (imageUrl, username) => {
    return db.collection('users').doc(username).update({
      profileUrl: imageUrl,
    });
  };
}

module.exports = User;
