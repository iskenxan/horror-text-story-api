'use strict';

var _sharp = require('sharp');

var _sharp2 = _interopRequireDefault(_sharp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var compressImageBase64ToBuffer = function compressImageBase64ToBuffer(base64) {
  return (0, _sharp2.default)(base64).resize({
    width: 100,
    height: 100,
    fit: _sharp2.default.fit.fill,
    position: _sharp2.default.strategy.entropy
  }).toBuffer();
};

module.exports = { compressImage: compressImageBase64ToBuffer };
//# sourceMappingURL=file.js.map