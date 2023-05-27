require('dotenv').config();
const secret = process.env.SECRET;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Konfigurasi JWT
const JWT_SECRET =secret;

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
