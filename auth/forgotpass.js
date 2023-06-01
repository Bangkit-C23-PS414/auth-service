const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
const db = admin.firestore();
require('dotenv').config({ path: 'SECRET_KEY.env'});
const PASS=process.env.PASS;

// Konfigurasi Nodemailer
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "wancikhaimah@gmail.com", 
    pass: PASS
  }
});


// Fungsi helper untuk mengirim email
const sendEmail = async (email, subject, message) => {
  const mailOptions = {
    to: email,
    subject: subject,
    text: message,
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

    // Save verification code to Firestore
    await db.collection('users').doc(email).update({
      verificationCode: verificationCode.toString()
    });

    // Send verification code via email
    const emailSubject = 'Verification Code';
    const emailMessage = `Your verification code is: ${verificationCode}`;
    
    await sendEmail(email, emailSubject, emailMessage);

    res.sendStatus(200);
  } catch (error) {
    console.error('Error sending verification code:', error);
    res.sendStatus(500);
  }
});

module.exports = router;