const express = require('express');
const protect = require('../middleware/protect');

const router = express.Router();

const dashboardClients = [];

router.get('/dashboard', protect, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    res.write(`event: connected\ndata: ${JSON.stringify({ message: 'SSE Connected' })}\n\n`);

    dashboardClients.push(res);

    req.on('close', () => {
        const index = dashboardClients.indexOf(res);
        if (index !== -1) {
            dashboardClients.splice(index, 1);
        }
    });
});

module.exports = { router, dashboardClients };
