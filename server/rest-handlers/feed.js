import express from 'express';
import { getTimelineFeed, getNotificationFeed } from '../stream';


const feed = new express.Router();


const formatFeed = (results) => {
  const formatted = {};
  const timeline = results.map(activity => ({
    author: activity.actor,
    id: activity.object,
    title: activity.postTitle,
    lastUpdated: activity.timestamp,
    favoriteCount: activity.reaction_counts.like,
    commentCount: activity.reaction_counts.comment,
  }));
  formatted.timeline = timeline;

  return formatted;
};


feed.post('/timeline/me', (req, res, next) => {
  const { username } = res.locals;
  getTimelineFeed(username).then((result) => {
    res.locals.result = formatFeed(result.results);
    next();
  })
    .catch(error => next(error));
});


feed.post('/notification/me', (req, res, next) => {
  const { username } = res.locals;
  getNotificationFeed(username).then((result) => {
    res.locals.result = result;
    next();
  })
    .catch(error => next(error));
});

module.exports = feed;
