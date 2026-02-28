/**
 * Handle a new dashboard WebSocket connection.
 * - Adds the client to the shared dashboardClients Set.
 * - Sends a welcome event upon connection.
 * - Removes the client from the Set on disconnect.
 * - Zero business logic.
 *
 * @param {import('ws').WebSocket} ws          - The dashboard WebSocket connection.
 * @param {http.IncomingMessage}   req         - Upgrade request (has req.user from wsAuth).
 * @param {Set<import('ws').WebSocket>} dashboardClients - Shared in-memory Set.
 */
const handleDashboardSocket = (ws, req, dashboardClients) => {
    // Register this client
    dashboardClients.add(ws);
    console.log(`[WS][Dashboard] Connected — user id: ${req.user.id} | total: ${dashboardClients.size}`);

    // Send a welcome message
    ws.send(JSON.stringify({ event: 'connected', message: 'Dashboard connected' }));

    // ── Disconnect handler ───────────────────────────────────────────────────
    ws.on('close', () => {
        dashboardClients.delete(ws);
        console.log(`[WS][Dashboard] Disconnected | remaining: ${dashboardClients.size}`);
    });

    ws.on('error', (err) => {
        console.error('[WS][Dashboard] Socket error:', err.message);
        dashboardClients.delete(ws);
    });
};

module.exports = { handleDashboardSocket };
