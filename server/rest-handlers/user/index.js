import express from 'express';
import auth from './auth';
import posts from './posts';
import profile from './profile';

const user = express.Router();

user.use('/auth', auth);
user.use('/posts', posts);
user.use('/profile', profile);

module.exports = user;
