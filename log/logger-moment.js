const moment = require('moment');

const myLogger = function (req, res, next) {
  console.log('LOGGED');
  next();
};

const signedUp = function (req, res, next) {
  const currentDateTime = moment().format('DD-MM-YYYY HH:mm:ss');
  const email = req.body.email;

  // Menampilkan pesan log berhasil atau gagal berdasarkan status respons
  if (res.status(200)) {
    console.log(`[Sign Up - SUCCEED] - ${email} - ${currentDateTime}`);
  } else if (res.status(400)) {
    console.log(`[Sign Up - FAILED] - ${email} - ${currentDateTime}`);
  }

  next();
};

module.exports = { myLogger, signedUp };
