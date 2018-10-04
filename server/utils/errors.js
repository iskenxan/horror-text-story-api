class ResourceNotFound extends Error {
  constructor(message, status) {
    super();
    this.message = message || 'Resource not found.';
    this.status = status || 404;
  }
}


class AuthenticationError extends Error {
  constructor(message, status) {
    super();
    this.message = message || 'Invalid auth credentials.';
    this.status = status || 401;
  }
}


class InvalidArguementError extends Error {
  constructor(message, status) {
    super();
    this.message = message || 'Invalid arguments';
    this.status = status || 400;
  }
}


module.exports = {
  ResourceNotFound,
  AuthenticationError,
  InvalidArguementError,
};
