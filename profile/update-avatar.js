const express = require('express');
const admin = require('firebase-admin');
const multer = require('multer');
const fs = require('fs');
const sharp = require('sharp');
const { encode } = require("blurhash");
const { randomUUID } = require('crypto');

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
      return res.status(400).send({ message: "Image not uploaded properly" })
    }

    // Crop image
    const filepath = `${req.file.path}-resized`
    await sharp(req.file.path).resize(300, 300).jpeg().toFile(filepath)

    // Calculate blurhash
    const { data: pixels, info: metadata } = await sharp(filepath)
      .raw().ensureAlpha()
      .resize(32, 32)
      .toBuffer({ resolveWithObject: true })
    const clamped = new Uint8ClampedArray(pixels)
    const blurHash = encode(clamped, metadata.width, metadata.height, 4, 4)

    // Upload filename
    const avatarFile = randomUUID() + ".jpg"
    const avatarUrl = "https://storage.googleapis.com/c23-ps414-statics/users/" + avatarFile
    await storage.bucket('c23-ps414-statics').upload(filepath, { destination: 'users/' + avatarFile })

    // Get user data
    const userDoc = await db.collection('users').doc(email).get();
    const userData = userDoc.data();

    // Delete previously uploaded avatar
    if (userData.avatarFile) {
      // Let run async
      storage.bucket('c23-ps414-statics').file('users/' + userData.avatarFile).delete().catch({})
    }

    // Update data firestore
    await db.collection('users').doc(email).update({ avatarFile, avatarUrl, blurHash });

    // Send response
    res.status(200).json({
      message: 'Data updated',
      data: { avatarUrl, blurHash }
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({ message: "Cannot update avatar" })
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