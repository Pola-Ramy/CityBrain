const express = require('express');
const protect = require('../middleware/protect');
const signalService = require('../services/signalService');
const { dashboardClients } = require('./sseRoutes');

const router = express.Router();

router.post('/signal', protect, async (req, res) => {
    if (req.user.role !== 'AI') {
        return res.status(403).json({ message: 'Forbidden' });
    }

    try {
        const broadcastPayload = await signalService.processSignal(req.body);

        for (const client of dashboardClients) {
            try {
                client.write(`event: signal\ndata: ${JSON.stringify(broadcastPayload.data)}\n\n`);
            } catch (err) {
                console.error('SSE send error:', err.message);
            }
        }

        res.json({ status: 'sent' });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
});

module.exports = router;
