import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

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


module.exports = { generateHashedPassword, generateToken };
