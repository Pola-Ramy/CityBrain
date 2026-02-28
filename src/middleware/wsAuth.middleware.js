const jwt = require('jsonwebtoken');

/**
 * Extract a JWT from a WebSocket upgrade request.
 * Checks query string (?token=) first, then Authorization header.
 *
 * @param {http.IncomingMessage} req
 * @returns {string|null} Raw token string or null if not found.
 */
const extractToken = (req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const queryToken = url.searchParams.get('token');
    if (queryToken) return queryToken;

    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1];
    }

    return null;
};

/**
 * Verify JWT and attach decoded payload to request.
 * Returns { ok: true } or { ok: false, code, message }.
 *
 * @param {http.IncomingMessage} req
 * @param {string} requiredRole - Expected role value in JWT payload.
 * @returns {{ ok: boolean, code?: number, message?: string }}
 */
const verifyWsToken = (req, requiredRole) => {
    const token = extractToken(req);

    if (!token) {
        return { ok: false, code: 401, message: 'No token provided' };
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== requiredRole) {
            return { ok: false, code: 403, message: `Forbidden: requires role "${requiredRole}"` };
        }

        // Attach decoded payload so socket handlers can read it
        req.user = decoded;
        return { ok: true };
    } catch (err) {
        return { ok: false, code: 401, message: 'Invalid or expired token' };
    }
};

module.exports = { verifyWsToken };
