const admin = require('firebase-admin');

const serviceAccount = require('../firebase-admin-sdk');

const getDbInstance = () => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://travelguide-bf6df.firebaseio.com',
  });

  const db = admin.firestore();
  db.settings({ timestampsInSnapshots: true });

  return db;
};

// const docRef = db.collection('users').doc('alovelace');
//
// const setAda = docRef.set({
//   first: 'Ada',
//   last: 'Lovelace',
//   born: 1815,
// });

module.exports = { db: getDbInstance() };
