const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
const db = admin.firestore();
require('dotenv').config({ path: 'SECRET_KEY.env' });
const PASS = process.env.PASS;

// Konfigurasi Nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'recoffeeryapp@gmail.com',
    pass: PASS
  }
});

// Fungsi helper untuk mengirim email
const sendEmail = async (email, subject, message) => {
  const mailOptions = {
    from: 'recoffeeryapp@gmail.com',
    to: email,
    subject: subject,
    html: message
  };
  await transporter.sendMail(mailOptions);
};

// Route untuk Forget Password
router.post('/', async (req, res) => {
  const { email } = req.body; // Destructuring assignment

  try {
    const userDoc = await db.collection('users').doc(email).get();
    if (!userDoc.exists) {
      return res.status(404).send('User not found');
    }

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    // Calculate verification code expiration time
    const expirationTime = Date.now() + 3600000; // 1 hour

    // Save verification code and expiration time to Firestore
    await db.collection('users').doc(email).update({
      verificationCode: verificationCode.toString(),
      verificationCodeExpiration: expirationTime
    });

    // Send verification code via email
    const emailSubject = 'Verification Code';
    const emailMessage = `<p>Your verification code is: ${verificationCode}
                          <br/><b>Verification code is valid for 1 hour.</b>
                          <br/><i>If you didn't request this code, ignore this email.</i></p>`;

    await sendEmail(email, emailSubject, emailMessage);

    res.status(200).send('Verification code sent');
  } catch (error) {
    console.error('Error sending verification code:', error);
    res.sendStatus(500);
  }
});

module.exports = router;
