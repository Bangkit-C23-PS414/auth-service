const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const admin = require('firebase-admin');
const {JWT_SECRET} = require('./auth');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const verify = promisify(jwt.verify);

const db = admin.firestore();

// Route untuk Reset Password
router.post('/', async (req, res) => {
  const { token, newPassword } = req.body;
    try {
      const decoded = await verify(token, JWT_SECRET);
  
      const email = decoded.email;
  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Update the password in Firestore
      await db.collection('users').doc(email).update({
        password: hashedPassword
      });
  
      res.sendStatus(200);
    } catch (error) {
      console.error('Error resetting password:', error);
      res.sendStatus(500);
    }
});
  
module.exports = router;