'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ResourceNotFound = function (_Error) {
  _inherits(ResourceNotFound, _Error);

  function ResourceNotFound(message, status) {
    _classCallCheck(this, ResourceNotFound);

    var _this = _possibleConstructorReturn(this, (ResourceNotFound.__proto__ || Object.getPrototypeOf(ResourceNotFound)).call(this));

    _this.message = message || 'Resource not found.';
    _this.status = status || 404;
    return _this;
  }

  return ResourceNotFound;
}(Error);

var AuthenticationError = function (_Error2) {
  _inherits(AuthenticationError, _Error2);

  function AuthenticationError(message, status) {
    _classCallCheck(this, AuthenticationError);

    var _this2 = _possibleConstructorReturn(this, (AuthenticationError.__proto__ || Object.getPrototypeOf(AuthenticationError)).call(this));

    _this2.message = message || 'Invalid auth credentials.';
    _this2.status = status || 401;
    return _this2;
  }

  return AuthenticationError;
}(Error);

var InvalidArgumentError = function (_Error3) {
  _inherits(InvalidArgumentError, _Error3);

  function InvalidArgumentError(message, status) {
    _classCallCheck(this, InvalidArgumentError);

    var _this3 = _possibleConstructorReturn(this, (InvalidArgumentError.__proto__ || Object.getPrototypeOf(InvalidArgumentError)).call(this));

    _this3.message = message || 'Invalid arguments';
    _this3.status = status || 400;
    return _this3;
  }

  return InvalidArgumentError;
}(Error);

module.exports = {
  ResourceNotFound: ResourceNotFound,
  AuthenticationError: AuthenticationError,
  InvalidArgumentError: InvalidArgumentError
};
//# sourceMappingURL=errors.js.map