const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const verify = promisify(jwt.verify);
const { JWT_SECRET } = require('./auth');

// Route untuk mengambil data user dari Firestore
router.get('/', async (req, res) => {
  const token = req.headers.authorization; // Ambil token dari header

  try {
    // Decode token dan ambil email dari payload
    const decoded = await verify(token.split(" ")[1], JWT_SECRET);
    const email = decoded.email;

    // Cari data user di Firestore berdasarkan email
    const userDoc = await db.collection('users').doc(email).get();

    // Ambil data pengguna dan kirim sebagai respons
    const userData = userDoc.data();
    res.send({name: userData.name, email: userData.email});
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.sendStatus(500);
  }
});

module.exports = router;
