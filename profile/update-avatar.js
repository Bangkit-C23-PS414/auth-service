const express = require('express');
const admin = require('firebase-admin');
const multer = require('multer');
const fs = require('fs');
const sharp = require('sharp');
const { encode } = require("blurhash");
const { randomUUID } = require('crypto');
require('dotenv').config({ path: 'SECRET_KEY.env' });
const STORAGE_LINK = process.env.STORAGE_LINK;

const router = express.Router();
const db = admin.firestore();
const storage = admin.storage();

// Multer buffer config
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  }
});

// Upload file to gcs async
const uploadFile = async (bucketFile, buffer, mimetype) => new Promise((resolve, reject) => {
  const stream = bucketFile.createWriteStream({
    resumable: false,
    metadata: { contentType: mimetype }
  })

  stream.on('error', (err) => reject(err))
  stream.on('finish', (res) => resolve(res))
  stream.end(buffer)
})

router.post('/', upload.single('avatar'), async (req, res) => {
  try {
    const { email } = req.auth

    // Check file
    if (!req.file) {
      return res.status(400).send({ message: "Image not uploaded properly" })
    }

    // Crop image
    const resizedImage = await sharp(req.file.buffer).resize(300, 300).jpeg().toBuffer()

    // Calculate blurhash
    const { data: pixels, info: metadata } = await sharp(req.file.buffer)
      .raw().ensureAlpha()
      .resize(32, 32)
      .toBuffer({ resolveWithObject: true })
    const clamped = new Uint8ClampedArray(pixels)
    const blurHash = encode(clamped, metadata.width, metadata.height, 4, 4)

    // Upload file
    const avatarFile = randomUUID() + ".jpg"
    const avatarUrl = "https://storage.googleapis.com/c23-ps414-statics/users/" + avatarFile
    const bucketFile = storage.bucket('c23-ps414-statics').file('users/' + avatarFile)
    await uploadFile(bucketFile, resizedImage, req.file.mimetype)
    const avatarUrl = STORAGE_LINK + avatarFile
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
  }
});

module.exports = router;