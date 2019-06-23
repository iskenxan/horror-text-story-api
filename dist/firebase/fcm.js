'use strict';

var _firebaseAdmin = require('firebase-admin');

var _firebaseAdmin2 = _interopRequireDefault(_firebaseAdmin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.sendNotification = function (registrationToken, notificationData) {
  var message = {
    notification: notificationData
  };

  return _firebaseAdmin2.default.messaging().sendToDevice(registrationToken, message);
};
//# sourceMappingURL=fcm.js.map