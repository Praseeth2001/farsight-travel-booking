const jwt = require('jsonwebtoken');
const User = require('../models/User');

function extractToken(req) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return header.split(' ')[1];
  }
  return null;
}

/**
 * Requires a valid JWT. Attaches req.user = { id, role } on success.
 * Use on routes that must never be reached without auth (owner/admin actions).
 */
async function protect(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated. Please log in.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists.' });
    }

    req.user = { id: user._id.toString(), role: user.role, email: user.email, name: user.name };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

/**
 * Attaches req.user if a valid token is present, but never blocks the request
 * if it's missing or invalid. Used on routes like cart that support both
 * guests and logged-in users (see resolveOwner, which runs after this).
 */
async function optionalAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user) {
      req.user = { id: user._id.toString(), role: user.role, email: user.email, name: user.name };
    }
    next();
  } catch (err) {
    // Invalid/expired token on an optional route: proceed as guest rather than blocking
    next();
  }
}

/**
 * Restricts access to specific roles. Must be used after protect().
 * Usage: restrictTo('owner'), restrictTo('owner', 'admin')
 */
function restrictTo(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action.' });
    }
    next();
  };
}

module.exports = { protect, optionalAuth, restrictTo };
