const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require('dotenv').config({ path: 'SECRET_KEY.env'});
// Konfigurasi JWT
const JWT_SECRET = process.env.SECRET_KEY;
// Create JWToken
const generateToken = (email) => {
  return jwt.sign({ email: email }, JWT_SECRET);
};

// Fungsi untuk memverifikasi password
const verifyPassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

module.exports = {
  JWT_SECRET,
  generateToken,
  verifyPassword,
};
