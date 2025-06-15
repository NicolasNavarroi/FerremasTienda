const jwt = require('jsonwebtoken');

const generateToken = (userData) => {
  return jwt.sign(
    {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      role: userData.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

module.exports = { generateToken };