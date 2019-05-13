'use strict';

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

var _firebase = require('../firebase');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var getAccessToken = function getAccessToken() {
  return (0, _axios2.default)({
    method: 'post',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    url: 'https://www.reddit.com/api/v1/access_token',
    data: _qs2.default.stringify({
      grant_type: 'password',
      username: 'iskenxan',
      password: 'ms11d23'

    }),
    auth: {
      username: 'qt4pdhEqHtuwJQ',
      password: 'OuGRujmXVdykJcUd78w5_kRoOtQ'
    }
  });
};

var getListings = function getListings(accessToken, after) {
  return (0, _axios2.default)({
    method: 'get',
    headers: { Authorization: 'Bearer ' + accessToken, 'User-Agent': 'ChangeMeClient/0.1 by iskenxan' },
    url: 'https://oauth.reddit.com/r/nosleep/new/?after=' + after + '&limit=100'
  });
};

var getUsers = function getUsers(accessToken, array, max, after) {
  return getListings(accessToken, after).then(function (response) {
    var data = response.data.data;
    var newAfter = data.after,
        children = data.children;

    var usernames = children.map(function (item) {
      var author = item.data.author;

      return author;
    });
    if (array.length <= max - 101) {
      return getUsers(accessToken, [].concat(_toConsumableArray(array), _toConsumableArray(usernames)), max, newAfter);
    }
    return Promise.resolve({ users: array, after: newAfter });
  });
};

var getAllUsers = function getAllUsers() {
  var array = [];
  return getAccessToken().then(function (response) {
    var accessToken = response.data.access_token;

    return getUsers(accessToken, array, 1000, null);
  }).then(function (result) {
    return result;
  }).catch(function (error) {
    console.log(error);
  });
};

var fetchRedditUsers = function fetchRedditUsers() {
  getAllUsers().then(function (_ref) {
    var users = _ref.users,
        after = _ref.after;

    var newArray = users.map(function (user) {
      return { username: user, sent: false };
    });
    _firebase.db.collection('reddit').doc('users').update({
      users: newArray,
      after: after
    });
  });
};

var sendMessage = function sendMessage(accessToken, to) {
  return (0, _axios2.default)({
    method: 'post',
    headers: { 'content-type': 'application/x-www-form-urlencoded', Authorization: 'Bearer ' + accessToken, 'User-Agent': 'ChangeMeClient/0.1 by iskenxan' },
    url: 'https://oauth.reddit.com/api/compose',
    data: _qs2.default.stringify({
      api_type: 'json',
      subject: 'Friendly requests',
      text: 'Hey there!\nYou got this message because I saw your post on `nosleep` subreddit so I assume you like sharing your scary stories with others!\n' + '\nDo not feel obligated to response!' + '\nI recently wrote this Android app called Spookies: https://play.google.com/store/apps/details?id=samatov.space.spookies&hl=en\n' + 'It\'s made for writing scary stories in a chat room format. You a probably familiar with Hooked, it\'s a similar concept, except my app actually let\'s you write your own story and share it with others. You can get followers, like and comment on other stories.\n' + 'The app is free and doesn\'t have any limit on it.\n' + 'The app is currently at its early stage so any content is very welcome!\n' + 'So check it out and let me know what you think, maybe even leave a review if you feel like itxw. Thank you!',
      to: to
    })
  });
};

var trySendMessage = function trySendMessage() {
  var token = void 0;
  getAccessToken().then(function (response) {
    var accessToken = response.data.access_token;

    token = accessToken;
    return _firebase.db.collection('reddit').doc('users').get();
  }).then(function (snapshot) {
    var promise = Promise.resolve();
    var array = snapshot.data().users.slice(201, 900);
    array.forEach(function (user) {
      promise = promise.then(function () {
        return sendMessage(token, user.username);
      });
    });
    return promise;
  }).then(function () {
    console.log('sent');
  }).catch(function (error) {
    console.log(error);
  });
};

module.exports = { trySendMessage: trySendMessage };
//# sourceMappingURL=reddit.js.map