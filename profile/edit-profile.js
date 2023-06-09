const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();
const Joi = require('joi');

const validateUserInput = (data) => {
    const schema = Joi.object({
        name: Joi.string().required()
    });

    return schema.validate(data);
};

router.post('/', async (req, res) => {
    try {
        // Validate form
        const { error } = validateUserInput(req.body)
        if (error) {
            return res.status(400).send({ message: "Form validation failed" })
        }

        // Get user input
        const { email } = req.auth;
        const { name } = req.body;

        //update data in firestore
        await db.collection('users').doc(email).update({ name });

        // Return response
        res.status(200).json({
            message: 'Data updated',
            data: { name }
        });
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Cannot update profile" });
    }
});

module.exports = router;