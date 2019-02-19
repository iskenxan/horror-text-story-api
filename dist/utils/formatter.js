'use strict';

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

var alphaNumeric = function alphaNumeric(text) {
  var test = text.trim();
  if (test === '') return false;
  return !new RegExp(/[^a-zA-Z0-9]/).test(text);
};

module.exports = { getRankFeedItem: getRankFeedItem, alphaNumeric: alphaNumeric };
//# sourceMappingURL=formatter.js.map