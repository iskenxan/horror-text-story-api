const { db } = require('./index');
const { ResourceNotFound } = require('../utils/errors');

class User {
  constructor(username, password) {
    this.username = username;
    this.password = password;
  }

  writeToDb = () => {

  };

  _

  static findUserByUsername(username) {
    return new Promise((resolve, reject) => {
      db.collection('users').doc(username).get().then((doc) => {
        if (doc.exists) {
          resolve(doc.data());
        } else {
          reject(new ResourceNotFound('User not found'));
        }
      });
    });
  }
}

module.exports = User;
