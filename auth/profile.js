const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

const db = admin.firestore();
// Route untuk mengambil data user dari Firestore
router.get('/', async (req, res) => {
    const { email } = req.body;

    try {
        const userDoc = await db.collection('users').doc(email).get();
        if (!userDoc.exists) {
            return res.status(404).send('User not found');
        }
        
        res.status(200).send('OK');

    }
    catch (error) {
        console.error('Error fetching user data:', error);
        res.sendStatus(500);
    }
});

module.exports = router;