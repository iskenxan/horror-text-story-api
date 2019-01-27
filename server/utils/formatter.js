const getRankFeedItem = (postData, author, id) => {
  const { favorite, comments } = postData;
  return {
    id,
    author,
    favoriteCount: favorite ? Object.keys(favorite).length : 0,
    commentCount: comments ? comments.length : 0,
    lastUpdated: postData.lastUpdated,
    title: postData.title,
  };
};

module.exports = { getRankFeedItem };
