const WebSocket = require('ws');
const { verifyWsToken } = require('../middleware/wsAuth.middleware');
const { handleAiSocket } = require('./aiSocket');
const { handleDashboardSocket } = require('./dashboardSocket');

// ─── Shared in-memory state ───────────────────────────────────────────────────
// All connected dashboard clients. Exported so aiSocket can broadcast to them.
const dashboardClients = new Set();

/**
 * Attach a WebSocket server to an existing HTTP server.
 * Routes upgrade requests based on URL path:
 *   /ws/ai        → AI connection (role: "AI")
 *   /ws/dashboard → Dashboard connection (role: "admin")
 *
 * @param {http.Server} httpServer - The existing Express HTTP server instance.
 */
const initWsServer = (httpServer) => {
    const wss = new WebSocket.Server({
        server: httpServer,
        // verifyClient runs BEFORE the WebSocket handshake completes.
        // We use it only to validate the JWT and extract the path.
        // Role enforcement is path-specific, done below.
        verifyClient: ({ req }, done) => {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const pathname = url.pathname;

            let requiredRole;
            if (pathname === '/ws/ai') {
                requiredRole = 'AI';
            } else if (pathname === '/ws/dashboard') {
                requiredRole = 'admin';
            } else {
                return done(false, 404, 'Not Found');
            }

            const result = verifyWsToken(req, requiredRole);
            if (!result.ok) {
                return done(false, result.code, result.message);
            }

            return done(true);
        }
    });

    // ── Route connections to the correct handler ──────────────────────────────
    wss.on('connection', (ws, req) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const pathname = url.pathname;

        if (pathname === '/ws/ai') {
            handleAiSocket(ws, req, dashboardClients);
        } else if (pathname === '/ws/dashboard') {
            handleDashboardSocket(ws, req, dashboardClients);
        }
    });

    console.log('[WS] WebSocket server initialized — routes: /ws/ai, /ws/dashboard');
};

module.exports = { initWsServer, dashboardClients };
