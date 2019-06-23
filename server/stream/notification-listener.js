import {
  getUsersWithNotificationToken,
} from '../firebase/search';
import {
  subscribeToNotification,
} from './index';
import {
  sendNotification,
} from '../firebase/fcm';

const store = {

};

const ACTIONS = {
  follow: 'followed you!',
  like: 'liked your story!',
  comment: 'commented on your story!',
};


const getBodyAndTitle = (data) => {
  const item = data[0];
  const { verb, actor } = item;
  if (!verb || !actor) return null;
  const action = ACTIONS[verb];

  const title = 'New update';
  const body = `${actor} ${action}`;

  return {
    title,
    body,
  };
};


const subscribeNotificationListener = (username, notificationToken) => {
  if (store[username]) return;


  store[username] = (data) => {
    console.log({ data });
    const notifData = getBodyAndTitle(data.new);
    sendNotification(notificationToken, notifData);
  };

  subscribeToNotification(username, store[username])
    .then(() => console.log(`listening to ${username} notifs`))
    .catch(e => console.log({ error: e }));
};

exports.subscribeNotificationListener = subscribeNotificationListener;


exports.startListeningToNotifications = () => {
  return getUsersWithNotificationToken().then((result) => {
    Object.keys(result).forEach((username) => {
      const { notificationToken } = result[username];
      if (!username || !notificationToken) return;
      subscribeNotificationListener(username, notificationToken);
    });
  });
};
