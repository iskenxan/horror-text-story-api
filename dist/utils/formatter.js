"use strict";

var getRankFeedItem = function getRankFeedItem(postData, author, id) {
  var favorite = postData.favorite,
      comments = postData.comments;

  return {
    id: id,
    author: author,
    favoriteCount: favorite ? Object.keys(favorite).length : 0,
    commentCount: comments ? comments.length : 0,
    lastUpdated: postData.lastUpdated,
    title: postData.title
  };
};

module.exports = { getRankFeedItem: getRankFeedItem };
//# sourceMappingURL=formatter.js.map