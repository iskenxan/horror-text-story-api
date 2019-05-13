import axios from 'axios';
import qs from 'qs';
import { db } from '../firebase';


const getAccessToken = () => {
  return axios({
    method: 'post',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    url: 'https://www.reddit.com/api/v1/access_token',
    data: qs.stringify({
      grant_type: 'password',
      username: 'iskenxan',
      password: 'ms11d23',

    }),
    auth: {
      username: 'qt4pdhEqHtuwJQ',
      password: 'OuGRujmXVdykJcUd78w5_kRoOtQ',
    },
  });
};


const getListings = (accessToken, after) => {
  return axios({
    method: 'get',
    headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'ChangeMeClient/0.1 by iskenxan' },
    url: `https://oauth.reddit.com/r/nosleep/new/?after=${after}&limit=100`,
  });
};


const getUsers = (accessToken, array, max, after) => {
  return getListings(accessToken, after).then((response) => {
    const { data } = response.data;
    const { after: newAfter, children } = data;
    const usernames = children.map((item) => {
      const { author } = item.data;
      return author;
    });
    if (array.length <= max - 101) {
      return getUsers(accessToken, [...array, ...usernames], max, newAfter);
    }
    return Promise.resolve({ users: array, after: newAfter });
  });
};


const getAllUsers = () => {
  const array = [];
  return getAccessToken().then((response) => {
    const { access_token: accessToken } = response.data;
    return getUsers(accessToken, array, 1000, null);
  }).then((result) => {
    return result;
  })
    .catch((error) => {
      console.log(error);
    });
};


const fetchRedditUsers = () => {
  getAllUsers().then(({ users, after }) => {
    const newArray = users.map((user) => {
      return { username: user, sent: false };
    });
    db.collection('reddit').doc('users').update({
      users: newArray,
      after,
    });
  });
};


const sendMessage = (accessToken, to) => {
  return axios({
    method: 'post',
    headers: { 'content-type': 'application/x-www-form-urlencoded', Authorization: `Bearer ${accessToken}`, 'User-Agent': 'ChangeMeClient/0.1 by iskenxan' },
    url: 'https://oauth.reddit.com/api/compose',
    data: qs.stringify({
      api_type: 'json',
      subject: 'Friendly requests',
      text: 'Hey there!\nYou got this message because I saw your post on `nosleep` subreddit so I assume you like sharing your scary stories with others!\n'
      + '\nDo not feel obligated to response!'
      + '\nI recently wrote this Android app called Spookies: https://play.google.com/store/apps/details?id=samatov.space.spookies&hl=en\n'
      + 'It\'s made for writing scary stories in a chat room format. You a probably familiar with Hooked, it\'s a similar concept, except my app actually let\'s you write your own story and share it with others. You can get followers, like and comment on other stories.\n'
      + 'The app is free and doesn\'t have any limit on it.\n'
      + 'The app is currently at its early stage so any content is very welcome!\n'
      + 'So check it out and let me know what you think, maybe even leave a review if you feel like itxw. Thank you!',
      to,
    }),
  });
};

const trySendMessage = () => {
  let token;
  getAccessToken().then((response) => {
    const { access_token: accessToken } = response.data;
    token = accessToken;
    return db.collection('reddit').doc('users').get();
  })
    .then((snapshot) => {
      let promise = Promise.resolve();
      const array = snapshot.data().users.slice(201, 900);
      array.forEach((user) => {
        promise = promise.then(() => sendMessage(token, user.username));
      });
      return promise;
    })
    .then(() => {
      console.log('sent');
    })
    .catch((error) => {
      console.log(error);
    });
};

trySendMessage();


module.exports = { trySendMessage };
