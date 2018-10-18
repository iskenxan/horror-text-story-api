import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthenticationError } from '../utils/errors';

const TOKEN_SALT = 'Gn@L=Uys>_v(z}Nu"~~kVUCg^B\\T<A[eGhTp&v8@';

const generateHashedPassword = (password) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};


const generateToken = (username) => {
  return jwt.sign({
    username,
  }, TOKEN_SALT);
};


const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    try {
      const decoded = jwt.verify(token, TOKEN_SALT);
      resolve(decoded.username);
    } catch (e) {
      reject(new AuthenticationError('Invalid security token'));
    }
  });
};


module.exports = { generateHashedPassword, generateToken, verifyToken };
