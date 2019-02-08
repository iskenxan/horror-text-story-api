import * as admin from 'firebase-admin';


const initializeFirebaseConnection = () => {
  const { CLIENT_EMAIL, PRIVATE_KEY, PROJECT_ID } = process.env;
  if (CLIENT_EMAIL && PRIVATE_KEY && PROJECT_ID) {
    const privateKey = PRIVATE_KEY.replace(/\\n/g, '\n');
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: PROJECT_ID,
        clientEmail: CLIENT_EMAIL,
        privateKey,
      }),
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
