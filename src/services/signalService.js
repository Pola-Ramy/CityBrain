const Joi = require('joi');
const signalRepository = require('../repositories/signalRepository');

// ─── Joi validation schema ────────────────────────────────────────────────────
// Expects a flat object from the AI with six numeric fields.
// Old format { type, value, unit, meta } is deliberately rejected.
const signalSchema = Joi.object({
    Ia: Joi.number().required(),
    Ib: Joi.number().required(),
    Ic: Joi.number().required(),
    Va: Joi.number().required(),
    Vb: Joi.number().required(),
    Vc: Joi.number().required(),
    // Optional timestamp: ISO string or Unix ms integer.
    // If absent, defaults to now.
    timestamp: Joi.alternatives()
        .try(Joi.string().isoDate(), Joi.number().integer().positive())
        .optional()
}).options({ allowUnknown: false }); // reject any extra keys

/**
 * Validate, normalize, persist, and build the broadcast payload for a raw
 * three-phase reading received from the AI WebSocket.
 *
 * @param {Object} raw - Parsed JSON from the AI WebSocket message.
 * @returns {Promise<Object>} Broadcast-safe payload to send to dashboards.
 * @throws {Error} With a descriptive message if validation fails.
 */
const processSignal = async (raw) => {
    // 1. Validate with Joi — unknown keys are rejected (allowUnknown: false)
    const { error, value } = signalSchema.validate(raw, { abortEarly: false });
    if (error) {
        const detail = error.details.map(d => d.message).join('; ');
        const err = new Error(
            `Expected three_phase_reading payload with Ia, Ib, Ic, Va, Vb, Vc. Validation failed: ${detail}`
        );
        err.status = 400;
        throw err;
    }

    // 2. Resolve timestamp: prefer provided value, fall back to now
    const resolvedTimestamp = value.timestamp
        ? new Date(value.timestamp)
        : new Date();

    // 3. Normalize into the document shape
    const normalized = {
        type: 'three_phase_reading',
        currents: { Ia: value.Ia, Ib: value.Ib, Ic: value.Ic },
        voltages: { Va: value.Va, Vb: value.Vb, Vc: value.Vc },
        timestamp: resolvedTimestamp,
        source: 'AI'
    };

    // 4. Persist to MongoDB via repository layer
    const saved = await signalRepository.saveSignal(normalized);

    // 5. Build broadcast payload (safe subset — no internal Mongoose fields)
    const broadcastPayload = {
        event: 'signal',
        data: {
            id: saved._id,
            type: saved.type,
            currents: saved.currents,
            voltages: saved.voltages,
            timestamp: saved.timestamp,
            source: saved.source
        }
    };

    return broadcastPayload;
};

module.exports = { processSignal };
