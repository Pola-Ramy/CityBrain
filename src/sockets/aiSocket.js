const signalService = require('../services/signalService');

// ─── Module-level state ───────────────────────────────────────────────────────
// Only one AI connection is permitted at a time.
let aiClient = null;

/**
 * Handle a new AI WebSocket connection.
 * - Enforces the single-AI constraint.
 * - Parses incoming JSON messages.
 * - Delegates all business logic to signalService.
 * - Broadcasts the processed payload to all dashboard clients.
 * - Cleans up stale dashboard clients that can no longer receive messages.
 *
 * @param {import('ws').WebSocket} ws        - The AI WebSocket connection.
 * @param {http.IncomingMessage}   req       - Upgrade request (has req.user from wsAuth).
 * @param {Set<import('ws').WebSocket>} dashboardClients - Set of connected dashboards.
 */
const handleAiSocket = (ws, req, dashboardClients) => {
    // ── Enforce single-AI constraint ─────────────────────────────────────────
    if (aiClient !== null) {
        const msg = JSON.stringify({ event: 'error', message: 'AI already connected' });
        ws.send(msg);
        ws.terminate();
        console.warn('[WS][AI] Rejected: another AI is already connected');
        return;
    }

    aiClient = ws;
    console.log(`[WS][AI] Connected — user id: ${req.user.id}`);

    // ── Incoming message handler ─────────────────────────────────────────────
    ws.on('message', async (raw) => {
        let parsed;

        // Parse JSON — reject non-JSON messages immediately
        try {
            parsed = JSON.parse(raw.toString());
        } catch {
            const errMsg = JSON.stringify({ event: 'error', message: 'Invalid JSON' });
            ws.send(errMsg);
            return;
        }

        // Delegate to service layer (validation + normalization + DB + payload)
        try {
            const broadcastPayload = await signalService.processSignal(parsed);
            const encoded = JSON.stringify(broadcastPayload);

            // Broadcast to all connected dashboard clients.
            // If a send fails, remove the client from the Set to prevent memory leaks.
            for (const dashWs of dashboardClients) {
                if (dashWs.readyState === dashWs.OPEN) {
                    try {
                        dashWs.send(encoded);
                    } catch (sendErr) {
                        console.warn('[WS][AI] Dashboard send failed — removing stale client:', sendErr.message);
                        dashboardClients.delete(dashWs);
                    }
                } else {
                    // Socket is not open — remove it proactively
                    dashboardClients.delete(dashWs);
                    console.warn('[WS][AI] Removed non-open dashboard client from Set');
                }
            }

            console.log(`[WS][AI] Signal broadcast to ${dashboardClients.size} dashboard(s) — type: ${broadcastPayload.data.type}`);
        } catch (err) {
            const errMsg = JSON.stringify({ event: 'error', message: err.message });
            ws.send(errMsg);
            console.error('[WS][AI] processSignal error:', err.message);
        }
    });

    // ── Disconnect handler ───────────────────────────────────────────────────
    ws.on('close', () => {
        aiClient = null;
        console.log('[WS][AI] Disconnected — slot is now free');
    });

    ws.on('error', (err) => {
        console.error('[WS][AI] Socket error:', err.message);
        aiClient = null;
    });
};

module.exports = { handleAiSocket };
