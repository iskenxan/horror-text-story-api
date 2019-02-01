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


const formatResult = (result) => {
  result.results.forEach((type) => {
    type.activities.forEach((activity) => {
      const activityObject = activity.object;
      delete activity.object;
      activity.activityObject = activityObject;
    });
  });
};


index.post('/notification/me', (req, res, next) => {
  const { username } = res.locals;
  getNotificationFeed(username).then((result) => {
    formatResult(result);
    res.locals.result = result;
    next();
  })
    .catch(error => next(error));
});

module.exports = index;
