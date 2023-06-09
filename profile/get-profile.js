const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Route untuk mengambil data user dari Firestore
router.get('/', async (req, res) => {
  try {
    // Get user input
    const { email } = req.auth

    // Cari data user di Firestore berdasarkan email
    const userDoc = await db.collection('users').doc(email).get();

    // Ambil data pengguna dan kirim sebagai respons
    const userData = userDoc.data();

    // Send response
    res.send({
      name: userData.name,
      email: userData.email,
      avatarUrl: userData.avatarUrl,
      blurHash: userData.blurHash
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.sendStatus(500);
  }
});

module.exports = router;
