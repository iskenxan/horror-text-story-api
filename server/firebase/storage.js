import { bucket } from './index';

const saveImageToBucket = (buffer, imagePath) => {
  return bucket.file(imagePath).save(buffer, { contentType: 'image/jpeg' })
    .then(() => {
      return `https://firebasestorage.googleapis.com/v0/b/travelguide-bf6df.appspot.com/o/${imagePath}?alt=media`;
    });
};


module.exports = { saveImageToBucket };
