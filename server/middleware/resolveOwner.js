const { v4: uuidv4 } = require('uuid');

/**
 * Resolves an ownerId for cart association.
 * - If a JWT/user is attached (req.user), use that userId.
 * - Otherwise, fall back to a guest sessionId stored in a cookie.
 *   If no cookie exists yet, generate one and set it.
 * This lets guests have a working cart + live socket sync before logging in.
 */
function resolveOwner(req, res, next) {
  if (req.user && req.user.id) {
    req.ownerId = req.user.id;
    return next();
  }

  let sessionId = req.cookies?.sessionId;

  if (!sessionId) {
    sessionId = uuidv4();
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
    });
  }

  req.ownerId = sessionId;
  next();
}

module.exports = resolveOwner;
