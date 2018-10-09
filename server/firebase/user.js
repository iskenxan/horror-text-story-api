import * as admin from 'firebase-admin';
import { db } from './index';
import { generateHashedPassword } from '../encrypt';
import { InvalidArgumentError } from '../utils/errors';


class User {
  constructor(username, password, token) {
    this.username = username;
    this.hashedPassword = generateHashedPassword(password);
    this.tokens = [];
    this.postRefs = {};
    this.followers = {};
    this.following = {};
    if (token) {
      this.tokens[0] = token;
    }
  }

  writeToDb = () => {
    return User.findUserByUsername(this.username).then((user) => {
      if (user) {
        return Promise.reject(new InvalidArgumentError('User with the give username already exists'));
      }
      return db.collection('users').doc(this.username).set({
        username: this.username,
        hashedPassword: this.hashedPassword,
        tokens: this.tokens,
        postRefs: this.postRefs,
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


  static deleteToken = (username, token) => {
    return db.collection('users').doc(username).update({
      tokens: admin.firestore.FieldValue.arrayRemove(token),
    });
  };


  static findUserByUsername(username) {
    return new Promise((resolve) => {
      db.collection('users').doc(username).get().then((doc) => {
        if (doc.exists) {
          resolve(doc.data());
        } else {
          resolve(null);
        }
      });
    });
  }


  static findByToken(token) {
    return new Promise((resolve) => {
      db.collection('users').where('tokens', 'array-contains', token)
        .get().then((snapShot) => {
          if (!snapShot.empty) {
            snapShot.forEach((doc) => {
              resolve(doc.data());
            });
          } else {
            resolve(null);
          }
        });
    });
  }
}

module.exports = User;
