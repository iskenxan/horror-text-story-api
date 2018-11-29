import sharp from 'sharp';

const compressImageBase64ToBuffer = (base64) => {
  return sharp(base64)
    .resize(100, 100, {
      fit: sharp.fit.cover,
    }).toBuffer();
};

module.exports = { compressImage: compressImageBase64ToBuffer };
