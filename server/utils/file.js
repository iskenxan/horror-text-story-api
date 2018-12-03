import sharp from 'sharp';

const compressImageBase64ToBuffer = (base64) => {
  return sharp(base64)
    .resize({
      width: 100,
      height: 100,
      fit: sharp.fit.fill,
      position: sharp.strategy.entropy,
    }).toBuffer();
};

module.exports = { compressImage: compressImageBase64ToBuffer };
