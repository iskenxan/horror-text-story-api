'use strict';

var _firebaseAdmin = require('firebase-admin');

var admin = _interopRequireWildcard(_firebaseAdmin);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var initializeFirebaseConnection = function initializeFirebaseConnection() {
  var _process$env = process.env,
      CLIENT_EMAIL = _process$env.CLIENT_EMAIL,
      PRIVATE_KEY = _process$env.PRIVATE_KEY,
      PROJECT_ID = _process$env.PROJECT_ID;

  if (CLIENT_EMAIL && PRIVATE_KEY && PROJECT_ID) {
    var privateKey = PRIVATE_KEY.replace(/\\n/g, '\n');
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: PROJECT_ID,
        clientEmail: CLIENT_EMAIL,
        privateKey: privateKey
      }),
      databaseURL: 'https://travelguide-bf6df.firebaseio.com',
      storageBucket: 'travelguide-bf6df.appspot.com'
    });
  }
};

initializeFirebaseConnection();

var getDbInstance = function getDbInstance() {
  var db = admin.firestore();
  db.settings({ timestampsInSnapshots: true });

  return db;
};

var getBucketInstance = function getBucketInstance() {
  return admin.storage().bucket();
};

module.exports = { db: getDbInstance(), bucket: getBucketInstance() };
//# sourceMappingURL=index.js.map