import * as admin from 'firebase-admin';
import { db } from './index';
import { generateHashedPassword, verifyToken } from '../encrypt';
import { InvalidArgumentError } from '../utils/errors';


class User {
  constructor(username, password, token) {
    this.username = username;
    this.hashedPassword = generateHashedPassword(password);
    this.tokens = [];
    this.publishedRefs = [];
    this.draftRefs = [];
    this.followers = {};
    this.following = {};
    if (token) {
      this.tokens[0] = token;
    }
  }

  writeToDb = () => {
    return User.findUserByUsername(this.username).then((doc) => {
      if (doc.exists) {
        return Promise.reject(new InvalidArgumentError('User with the give username already exists'));
      }
      return db.collection('users').doc(this.username).set({
        username: this.username,
        hashedPassword: this.hashedPassword,
        tokens: this.tokens,
        publishedRefs: this.publishedRefs,
        draftRefs: this.draftRefs,
        followers: this.followers,
        following: this.following,
      });
    });
  };


  static saveToken = (username, token) => {
    return db.collection('users').doc(username).update({
      tokens: admin.firestore.FieldValue.arrayUnion(token),
    });
  };


  static deleteToken = (token) => {
    return verifyToken(token).then((username) => {
      return db.collection('users').doc(username).update({
        tokens: admin.firestore.FieldValue.arrayRemove(token),
      });
    });
  };


  static findUserByUsername(username) {
    return db.collection('users').doc(username).get();
  }


  static findByToken(token) {
    return verifyToken(token).then((username) => {
      return this.findUserByUsername(username);
    });
  }


  static getDraft = (username, draftId) => {
    if (!username || !draftId || username === '' || draftId === '') {
      throw new InvalidArgumentError('Username and draft id cannot be empty');
    }
    return db.collection('users').doc(username)
      .collection('drafts').doc(draftId)
      .get();
  };


  static saveDraft =(username, draft) => {
    if (!draft.title || draft.title === '') {
      throw new InvalidArgumentError('Title cannot be empty');
    }
    return User._saveInDraftsCollection(username, draft).then((ref) => {
      return User._saveDraftRef(username, draft, ref.id).then(() => {
        return ref.id;
      });
    });
  };


  static _saveInDraftsCollection = (username, draft) => {
    return db.collection('users').doc(username).collection('drafts').add({
      title: draft.title,
      characters: draft.characters,
      dialog: draft.dialog,
      dialogCount: draft.dialogCount,
    });
  };


  static _saveDraftRef = (username, draft, id) => {
    return db.collection('users').doc(username).update({
      draftRefs: admin.firestore.FieldValue.arrayUnion({
        title: draft.title,
        id,
      }),
    });
  }
}

module.exports = User;
