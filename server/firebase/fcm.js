import admin from 'firebase-admin';


exports.sendNotification = (registrationToken, notificationData) => {
  const message = {
    notification: notificationData,
  };

  return admin.messaging().sendToDevice(registrationToken, message);
};
