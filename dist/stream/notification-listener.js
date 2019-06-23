'use strict';

var _search = require('../firebase/search');

var _index = require('./index');

var _fcm = require('../firebase/fcm');

var store = {};

var ACTIONS = {
  follow: 'followed you!',
  like: 'liked your story!',
  comment: 'commented on your story!'
};

var getBodyAndTitle = function getBodyAndTitle(data) {
  var item = data[0];
  var verb = item.verb,
      actor = item.actor;

  if (!verb || !actor) return null;
  var action = ACTIONS[verb];

  var title = 'New update';
  var body = actor + ' ' + action;

  return {
    title: title,
    body: body
  };
};

var subscribeNotificationListener = function subscribeNotificationListener(username, notificationToken) {
  if (store[username]) return;

  store[username] = function (data) {
    console.log({ data: data });
    var notifData = getBodyAndTitle(data.new);
    (0, _fcm.sendNotification)(notificationToken, notifData);
  };

  (0, _index.subscribeToNotification)(username, store[username]).then(function () {
    return console.log('listening to ' + username + ' notifs');
  }).catch(function (e) {
    return console.log({ error: e });
  });
};

exports.subscribeNotificationListener = subscribeNotificationListener;

exports.startListeningToNotifications = function () {
  return (0, _search.getUsersWithNotificationToken)().then(function (result) {
    Object.keys(result).forEach(function (username) {
      var notificationToken = result[username].notificationToken;

      if (!username || !notificationToken) return;
      subscribeNotificationListener(username, notificationToken);
    });
  });
};
//# sourceMappingURL=notification-listener.js.map