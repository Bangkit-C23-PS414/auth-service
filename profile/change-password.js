const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const auth = require('../auth/auth');

const db = admin.firestore();
const validateUserInput = (data) => {
  const schema = Joi.object({
    oldPassword: Joi.string().min(6).required(),
    newPassword: Joi.string().min(6).required(),
    confirmNewPassword: Joi.ref('newPassword'),
  })

  return schema.validate(data)
}

router.post('/', async (req, res) => {
  try {
    // Validate form
    const { error } = validateUserInput(req.body)
    if (error) {
      return res.status(400).send({
        status: "Error",
        message: "Form validation failed"
      })
    }

    // Get user input
    const { email } = req.auth
    const { oldPassword, newPassword, confirmNewPassword } = req.body

    // Get user data
    const userDoc = await db.collection('users').doc(email).get()
    const userData = userDoc.data()

    // Check password
    const passwordMatch = await auth.verifyPassword(oldPassword, userData.password);
    if (!passwordMatch) {
      return res.status(400).send({
        status: "Error",
        message: "Old password is incorrect"
      })
    }

    // Update user password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.collection('users').doc(email).update({
      password: hashedPassword
    })

    // Send response
    res.status(200).json({ message: 'Data updated' })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      status: "Error",
      message: "Cannot update avatar"
    })
  }
});

module.exports = router;