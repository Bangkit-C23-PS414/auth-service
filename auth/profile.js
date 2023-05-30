const express = require('express');
const auth = require('./auth');
const Joi = require('joi');
const userLog = require('../log/logger');
const router = express.Router();
const admin = require('firebase-admin');

const db = admin.firestore();

// Route untuk mengambil data user dari Firestore
router.get('/', async (req, res) => {
    const { email } = req.body; // email didapat dari JWT yang di-decode

    try {
        const userDoc = await db.collection('users').doc(email).get();
        if (!userDoc.exists) {
            return res.status(404).send('User not found');
        }

        const userData = userDoc.data();
        res.status(200).send(userData);
    }
    catch (error) {
        console.error('Error fetching user data:', error);
        res.sendStatus(500);
    }
});

module.exports = router;