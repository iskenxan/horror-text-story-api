import _ from 'lodash';
import { db } from '../../firebase';


const getFeed = () => {
  return db.collection('ranking-feed').doc('feed').get()
    .then((snapshot) => {
      const { posts } = snapshot.data();
      return posts;
    });
};


const updateFeed = (posts) => {
  return db.collection('ranking-feed').doc('feed').update({
    posts,
  });
};


const getPost = (posts, postId) => {
  const post = _.filter(posts, (value, key) => {
    return key === postId;
  });

  return post.length > 0 ? post[0] : null;
};


const addPostToRankingFeed = (rankedFeedItem) => {
  return getFeed()
    .then((feedItems) => {
      if (Object.keys(feedItems).length >= 3) return;
      feedItems[rankedFeedItem.id] = rankedFeedItem;
      return updateFeed(feedItems);
    });
};


const removePostFromRankingFeed = (postId) => {
  return getFeed()
    .then((feedItems) => {
      const post = getPost(feedItems, postId);
      if (!post) return;

      delete feedItems[postId];
      return updateFeed(feedItems);
    });
};


const addRanking = (feedItem) => {
  const favoritePoints = feedItem.favoriteCount || 0;
  // const commentPoints = feedItem.commentCount ? feedItem.commentCount * 2 : 0;
  // const ranking = favoritePoints + commentPoints;
  const ranking = favoritePoints;

  return { ...feedItem, ranking };
};


const orderRankedFeedItems = (feedItems) => {
  let array = Object.keys(feedItems).map(key => ({ id: key, ...feedItems[key] }));
  array = array.map(post => addRanking(post));
  array = _.sortBy(array, 'ranking');
  array = _.reverse(array);

  return array;
};


const convertArrayFeedItemsToObject = (feedItems) => {
  feedItems.forEach(post => delete post.ranking);

  return _.keyBy(feedItems, 'id');
};


const addReactionToPostRank = (feedItem, reaction) => {
  return getFeed()
    .then((feedItems) => {
      const extractedPost = getPost(feedItems, feedItem.id);
      if (extractedPost) {
        extractedPost[reaction] = extractedPost[reaction]
          ? extractedPost[reaction] + 1 : 1;
        return updateFeed(feedItems);
      }
      feedItem = addRanking(feedItem);
      feedItems = orderRankedFeedItems(feedItems);
      const lastIndex = feedItems.length - 1;
      const lowestRankingItem = feedItems[lastIndex];
      if (lowestRankingItem.ranking < feedItem.ranking) {
        feedItems[lastIndex] = feedItem;
        feedItems = convertArrayFeedItemsToObject(feedItems);

        return updateFeed(feedItems);
      }
    });
};


const removeFavoriteFromPostRank = (postId) => {
  return getFeed()
    .then((posts) => {
      const post = getPost(posts, postId);
      if (!post) return;

      post.favoriteCount -= 1;

      updateFeed(posts);
    });
};


const addNewCommentToPostRank = (rankedFeedItem) => {
  return addReactionToPostRank(rankedFeedItem, 'commentCount');
};


const addNewFavoriteToPostRank = (rankedFeedItem) => {
  return addReactionToPostRank(rankedFeedItem, 'favoriteCount');
};


const getRankedFeed = () => {
  return getFeed()
    .then((feedItems) => {
      return orderRankedFeedItems(feedItems);
    });
};


module.exports = {
  addPostToRankingFeed,
  addNewCommentToPostRank,
  addNewFavoriteToPostRank,
  getRankedFeed,
  removePostFromRankingFeed,
  removeFavoriteFromPostRank,
};
