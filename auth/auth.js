const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Konfigurasi JWT
const JWT_SECRET = crypto.randomBytes(64).toString('hex');

// Fungsi untuk membuat token JWT
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
  verifyPassword
};