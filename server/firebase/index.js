import * as admin from 'firebase-admin';
import serviceAccount from '../firebase-admin-sdk';

const getDbInstance = () => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://travelguide-bf6df.firebaseio.com',
  });

  const db = admin.firestore();
  db.settings({ timestampsInSnapshots: true });

  return db;
};


module.exports = { db: getDbInstance() };
