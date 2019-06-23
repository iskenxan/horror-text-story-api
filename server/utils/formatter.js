const getRankFeedItem = (postData, author, id) => {
  const { favorite, comments } = postData;
  return {
    id,
    author,
    favoriteCount: favorite ? Object.keys(favorite).length : 0,
    commentCount: comments ? comments.length : 0,
    lastUpdated: postData.lastUpdated,
    title: postData.title,
    preface: postData.preface,
  };
};


const alphaNumeric = (text) => {
  const test = text.trim();
  if (test === '') return false;
  return !(new RegExp(/[^a-zA-Z0-9]/).test(text));
};

module.exports = { getRankFeedItem, alphaNumeric };
