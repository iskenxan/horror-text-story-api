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


const addPostToRankingFeed = (post, authorUsername) => {
  return getFeed()
    .then((posts) => {
      if (Object.keys(posts).length >= 3) return;
      posts[post.id] = {
        title: post.title,
        author: authorUsername,
        timestamp: post.lastUpdated,
        favoriteCount: 0,
        commentCount: 0,
      };
      return updateFeed(posts);
    });
};


const removePostFromRankingFeed = (postId) => {
  return getFeed()
    .then((posts) => {
      const post = getPost(posts, postId);
      if (!post) return;

      delete posts[postId];
      return updateFeed(posts);
    });
};


const addRanking = (post) => {
  let favoritePoints = post.favoriteCount ? post.favoriteCount : 0;
  favoritePoints = favoritePoints === 0 && post.favorite
    ? Object.keys(post.favorite).length : favoritePoints;

  let commentPoints = post.commentCount ? post.commentCount * 2 : 0;
  commentPoints = commentPoints === 0 && post.comments
    ? Object.keys(post.comments).length : commentPoints;

  const ranking = favoritePoints + commentPoints;

  post.favoriteCount = favoritePoints;
  post.commentCount = commentPoints / 2;

  return { ...post, ranking };
};


const orderPosts = (posts) => {
  let array = Object.keys(posts).map(key => ({ id: key, ...posts[key] }));
  array = array.map(post => addRanking(post));
  array = _.sortBy(array, 'ranking');
  array = _.reverse(array);

  return array;
};


const addReactionToPostRank = (post, postId, reaction) => {
  return getFeed()
    .then((posts) => {
      const extractedPost = getPost(posts, postId);
      if (extractedPost) {
        extractedPost[reaction] = extractedPost[reaction]
          ? extractedPost[reaction] + 1 : 1;
        return updateFeed(posts);
      }
      post = addRanking(post);
      posts = orderPosts(posts);
      const lastIndex = posts.length - 1;
      const lowestRankingPost = posts[lastIndex];
      if (lowestRankingPost.ranking < post.ranking) {
        posts[lastIndex] = post;
        return updateFeed(posts);
      }
    });
};


const addNewCommentToPostRank = (post, postId) => {
  return addReactionToPostRank(post, postId, 'commentCount');
};


const addNewFavoriteToPostRank = (post, postId) => {
  return addReactionToPostRank(post, postId, 'favoriteCount');
};


const getRankedFeed = () => {
  return getFeed()
    .then((posts) => {
      return orderPosts(posts);
    });
};


module.exports = {
  addPostToRankingFeed,
  addNewCommentToPostRank,
  addNewFavoriteToPostRank,
  getRankedFeed,
  removePostFromRankingFeed,
};
