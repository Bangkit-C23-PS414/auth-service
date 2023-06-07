const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const verify = promisify(jwt.verify);
const { JWT_SECRET } = require('./auth');

router.post('/', async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = await verify(token, JWT_SECRET);
        const email = decoded.email;
        const {name} = req.body;

        //update data in firestore
        await db.collection('users').doc(email).update({name});
        res.status(200).json({ message: 'Data updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
);

module.exports = router;