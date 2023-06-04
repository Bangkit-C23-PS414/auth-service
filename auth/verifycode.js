const express = require('express');
const router = express.Router();
const { JWT_SECRET } = require('./auth');
const admin = require('firebase-admin');
const db = admin.firestore();
const jwt = require('jsonwebtoken');

// Route untuk Verify Code
router.post('/', async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
    const userDoc = await db.collection('users').doc(email).get();
    if (!userDoc.exists) {
      return res.status(404).send('User not found');
    }

    const userData = userDoc.data();
    if (userData.verificationCode !== verificationCode) {
      return res.status(401).send('Invalid verification code');
    }

    const currentTimestamp = Date.now();
    const expirationTimestamp = userData.verificationCodeExpiration;
    if (expirationTimestamp && currentTimestamp > expirationTimestamp) {
      return res.status(401).send('Verification code has expired');
    }

    // Generate token for password reset
    const token = jwt.sign({ email: email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Error verifying code:', error);
    res.sendStatus(500);
  }
});

module.exports = router;