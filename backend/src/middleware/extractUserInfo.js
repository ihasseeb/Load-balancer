const jwt = require('jsonwebtoken');
const { findUserByEmail } = require('../config/sqlite');

// Middleware to extract user info from JWT token (optional - doesn't block if no token)
exports.extractUserInfo = (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user in SQLite by ID
      const user = findUserByEmail(decoded.email || decoded.id);

      if (user) {
        req.user = user;
        req.user_email = user.email;
        req.user_id = user.id;
      }
    }

    next();
  } catch (error) {
    // Token invalid or expired - continue without user info
    console.log('[Middleware] No valid token, request will be anonymous');
    next();
  }
};

module.exports = exports;
