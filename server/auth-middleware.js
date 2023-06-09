const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const verify = promisify(jwt.verify);
const { JWT_SECRET } = require('../auth/auth');

const authMiddleware = async (req, res, next) => {
  // Get token
  const token = req.headers.authorization

  if (!token) {
    return res.status(403).json({ message: "Token is required" })
  }

  try {
    const decoded = await verify(token.split(' ')[1], JWT_SECRET)
    req.auth = { email: decoded.email }

    return next()
  } catch (err) {
    return res.status(401).json({ message: "Token is invalid" })
  }
}

module.exports = authMiddleware