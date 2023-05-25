const express = require('express');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const admin = require('firebase-admin');
const userLog = require('./../log/logger');

const router = express.Router();
const db = admin.firestore();

// Validasi input pengguna menggunakan Joi
const validateUserInput = (data) => {
  const schema = Joi.object({
    name: Joi.string()
    .required(),
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
      .trim()
      .required(),
    password: Joi.string()
      .min(8)
      .pattern(/^\S*$/)
      .message('Password should not contain spaces')
      .required(),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .trim()
      .required()
      .strict()
  });

  return schema.validate(data);
};

// Route untuk Sign Up
router.post('/', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  // Validasi input pengguna
  const { error } = validateUserInput(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    // Cek apakah pengguna dengan email yang sama sudah terdaftar
    const userSnapshot = await db.collection('users').doc(email).get();
    if (userSnapshot.exists) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password menggunakan bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Mencatat pesan log menggunakan signupLogger
    userLog.info('SIGN UP', { email });

    // Simpan data pengguna ke Firestore
    await db.collection('users').doc(email).set({
      name: name,
      email: email,
      password: hashedPassword
    });

    res.sendStatus(200);
  } catch (error) {
    console.error('Error creating user:', error);
    res.sendStatus(500);
  }
});

module.exports = router;
