import express from 'express';
import { getTimelineFeed, getNotificationFeed } from '../../stream';
import { getRankedFeed } from './ranking-feed';

const index = new express.Router();


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


index.post('/timeline/me', (req, res, next) => {
  const { username } = res.locals;
  let feed;
  getTimelineFeed(username).then((result) => {
    feed = formatFeed(result.results);
    return getRankedFeed();
  })
    .then((rankedFeed) => {
      feed.popular = rankedFeed;
      res.locals.result = feed;
      next();
    })
    .catch(error => next(error));
});


index.post('/notification/me', (req, res, next) => {
  const { username } = res.locals;
  getNotificationFeed(username).then((result) => {
    res.locals.result = result;
    next();
  })
    .catch(error => next(error));
});


index.post('/notification/count', (req, res, next) => {
  const { username } = res.locals;
  getNotificationFeed(username).then((result) => {
    res.locals.result = result;
    next();
  });
});

module.exports = index;
