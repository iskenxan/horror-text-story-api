'use strict';

var _firebaseAdmin = require('firebase-admin');

var admin = _interopRequireWildcard(_firebaseAdmin);

var _firebaseAdminSdk = require('../firebase-admin-sdk');

var _firebaseAdminSdk2 = _interopRequireDefault(_firebaseAdminSdk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var _process$env = process.env,
    PROJECT_ID = _process$env.PROJECT_ID,
    CLIENT_EMAIL = _process$env.CLIENT_EMAIL,
    PRIVATE_KEY = _process$env.PRIVATE_KEY;


var initializeFirebaseConnection = function initializeFirebaseConnection() {
  if (PROJECT_ID && CLIENT_EMAIL && PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: PROJECT_ID,
        clientEmail: CLIENT_EMAIL,
        privateKey: PRIVATE_KEY
      }),
      databaseURL: 'https://travelguide-bf6df.firebaseio.com',
      storageBucket: 'travelguide-bf6df.appspot.com'
    });
  } else {
    admin.initializeApp({
      credential: admin.credential.cert(_firebaseAdminSdk2.default),
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