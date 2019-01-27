const getRankFeedItem = (postData, author, id) => {
  const { favorite, comments } = postData;
  return {
    id,
    author,
    favoriteCount: favorite ? Object.keys(favorite).length : 0,
    commentsCount: comments ? comments.length : 0,
    timestamp: postData.lastUpdated,
    title: postData.title,
  };
};

module.exports = { getRankFeedItem };
