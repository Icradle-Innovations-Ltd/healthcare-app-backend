require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Replace with a strong secret

module.exports = {
  JWT_SECRET,
};
