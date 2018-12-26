import adminFirestore from 'firebase-admin';
import { db } from './index';

const searchForUsers = (queryItem) => {
  return db.collection('users').orderBy(adminFirestore.firestore.FieldPath.documentId())
    .startAt(queryItem)
    .endAt(`${queryItem}\uf8ff`)
    .limit(10)
    .get()
    .then((snapshot) => {
      if (snapshot.isEmpty) return [];

      const resultArray = [];

      snapshot.forEach((doc) => {
        const userData = doc.data();
        delete userData.hashedPassword;

        resultArray.push(userData);
      });

      return resultArray;
    });
};


module.exports = { searchForUsers };
