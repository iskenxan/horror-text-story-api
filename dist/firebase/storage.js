'use strict';

var _index = require('./index');

var saveImageToBucket = function saveImageToBucket(buffer, imagePath) {
  return _index.bucket.file(imagePath).save(buffer, { contentType: 'image/jpeg' }).then(function () {
    return 'https://firebasestorage.googleapis.com/v0/b/travelguide-bf6df.appspot.com/o/' + imagePath + '?alt=media';
  });
};

module.exports = { saveImageToBucket: saveImageToBucket };
//# sourceMappingURL=storage.js.map