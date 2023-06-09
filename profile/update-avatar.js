const express = require('express');
const admin = require('firebase-admin');
const multer = require('multer');
const fs = require('fs');
const sharp = require('sharp');
const { encode } = require("blurhash");
const crypto = require('crypto')

const router = express.Router();
const db = admin.firestore();
const storage = admin.storage();
const upload = multer({
  dest: 'uploads',
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  }
});

router.post('/', upload.single('avatar'), async (req, res) => {
  try {
    const { email } = req.auth

    // Check file
    if (!req.file) {
      return res.status(400).send({
        status: "Error",
        message: "Image not uploaded properly"
      })
    }

    // Crop image
    const filepath = `${req.file.path}-resized`
    await sharp(req.file.path).resize(300).jpeg().toFile(filepath)

    // Calculate blurhash
    const { data: pixels, info: metadata } = await sharp(filepath).raw().ensureAlpha().resize(32).toBuffer({ resolveWithObject: true })
    const clamped = new Uint8ClampedArray(pixels)
    const blurHash = encode(clamped, metadata.width, metadata.height, 4, 4)

    // Upload filename
    const filename = crypto.createHash('md5').update(email).digest('hex') + ".jpg"
    const avatarUrl = "https://storage.googleapis.com/c23-ps414-statics/users/" + filename
    await storage.bucket('c23-ps414-statics').upload(filepath, { destination: 'users/' + filename })

    // Update data firestore
    await db.collection('users').doc(email).update({ avatarUrl, blurHash });

    // Send response
    res.status(200).json({ message: 'Data updated' })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      status: "Error",
      message: "Cannot update avatar"
    })
  } finally {
    // Clean up
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }

    if (req.file && fs.existsSync(req.file.path + "-resized")) {
      fs.unlinkSync(req.file.path + "-resized")
    }
  }
});

module.exports = router;