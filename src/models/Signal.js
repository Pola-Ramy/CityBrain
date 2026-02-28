const mongoose = require('mongoose');

/**
 * Signal schema — Option A: single 3-phase electrical snapshot.
 * Each document represents one reading with currents (Ia, Ib, Ic)
 * and voltages (Va, Vb, Vc) captured at a specific timestamp.
 */
const signalSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
            default: 'three_phase_reading',
            trim: true
        },
        currents: {
            Ia: { type: Number, required: true },
            Ib: { type: Number, required: true },
            Ic: { type: Number, required: true }
        },
        voltages: {
            Va: { type: Number, required: true },
            Vb: { type: Number, required: true },
            Vc: { type: Number, required: true }
        },
        timestamp: {
            type: Date,
            required: true
        },
        source: {
            type: String,
            default: 'AI',
            trim: true
        }
    },
    { timestamps: true } // keeps createdAt / updatedAt for audit purposes
);

module.exports = mongoose.model('Signal', signalSchema);
