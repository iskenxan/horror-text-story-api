import * as admin from 'firebase-admin';
import serviceAccount from '../firebase-admin-sdk';


const initializeFirebaseConnection = () => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://travelguide-bf6df.firebaseio.com',
    storageBucket: 'travelguide-bf6df.appspot.com',
  });
};

initializeFirebaseConnection();


const getDbInstance = () => {
  const db = admin.firestore();
  db.settings({ timestampsInSnapshots: true });

  return db;
};


const getBucketInstance = () => admin.storage().bucket();

module.exports = { db: getDbInstance(), bucket: getBucketInstance() };
