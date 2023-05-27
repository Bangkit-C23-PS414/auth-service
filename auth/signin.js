const express = require('express');
const auth = require('./auth');
const Joi = require('joi');
const admin = require('firebase-admin');
const userLog = require('../log/logger');

const router = express.Router();
const db = admin.firestore();

// Validasi input pengguna menggunakan Joi
const validateUserInput = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: true} })
      .trim()
      .required(),
    password: Joi.string().required()
  });

  return schema.validate(data);
};

// Route untuk Sign In
router.post('/', async (req, res) => {
  const { email, password } = req.body;

  // Validasi input pengguna
  const { error } = validateUserInput(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  // Ambil data pengguna dari Firestore
  try {
    const userDoc = await db.collection('users').doc(email).get();
    if (!userDoc.exists) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const userData = userDoc.data();

    // Verifikasi password menggunakan bcrypt
    const passwordMatch = await auth.verifyPassword(password, userData.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Buat token JWT
    const token = auth.generateToken(userData.email);

    // Mencatat pesan log menggunakan signinLogger
    userLog.info('SIGN IN', { email });

    res.json({ token });
  } catch (error) {
    console.error('Error signing in:', error);
    res.sendStatus(500);
  }
});

module.exports = router;