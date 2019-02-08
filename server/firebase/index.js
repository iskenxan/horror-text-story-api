import * as admin from 'firebase-admin';
import serviceAccount from '../firebase-admin-sdk';

const { PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY } = process.env;


const initializeFirebaseConnection = () => {
  if (PROJECT_ID && CLIENT_EMAIL && PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: PROJECT_ID,
        clientEmail: CLIENT_EMAIL,
        privateKey: PRIVATE_KEY,
      }),
      databaseURL: 'https://travelguide-bf6df.firebaseio.com',
      storageBucket: 'travelguide-bf6df.appspot.com',
    });
  } else {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: 'https://travelguide-bf6df.firebaseio.com',
      storageBucket: 'travelguide-bf6df.appspot.com',
    });
  }
};

initializeFirebaseConnection();


const getDbInstance = () => {
  const db = admin.firestore();
  db.settings({ timestampsInSnapshots: true });

  return db;
};


const getBucketInstance = () => admin.storage().bucket();

module.exports = { db: getDbInstance(), bucket: getBucketInstance() };
