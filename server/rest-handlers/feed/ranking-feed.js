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


const addPostToRankingFeed = (post) => {
  return getFeed()
    .then((posts) => {
      if (Object.keys(posts).length >= 2) return;
      posts[post.id] = post;
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
  const favoritePoints = post.favoriteCount || 0;
  const commentPoints = post.commentCount ? post.commentCount * 2 : 0;

  const ranking = favoritePoints + commentPoints;

  return { ...post, ranking };
};


const orderPosts = (posts) => {
  let array = Object.keys(posts).map(key => ({ id: key, ...posts[key] }));
  array = array.map(post => addRanking(post));
  array = _.sortBy(array, 'ranking');
  array = _.reverse(array);

  return array;
};


const convertArrayPostsToObject = (posts) => {
  posts.forEach(post => delete post.ranking);

  return _.keyBy(posts, 'id');
};


const addReactionToPostRank = (post, reaction) => {
  return getFeed()
    .then((posts) => {
      const extractedPost = getPost(posts, post.id);
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
        posts = convertArrayPostsToObject(posts);

        return updateFeed(posts);
      }
    });
};


const addNewCommentToPostRank = (post) => {
  return addReactionToPostRank(post, 'commentCount');
};


const addNewFavoriteToPostRank = (post) => {
  return addReactionToPostRank(post, 'favoriteCount');
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
