const Signal = require('../models/Signal');

/**
 * Persist a three-phase signal snapshot to MongoDB.
 *
 * @param {Object} data - Normalized signal data from signalService.
 * @param {string} data.type       - Always "three_phase_reading".
 * @param {{ Ia, Ib, Ic }} data.currents  - Phase currents in amps.
 * @param {{ Va, Vb, Vc }} data.voltages  - Phase voltages in volts.
 * @param {Date}   data.timestamp  - Time of the reading.
 * @param {string} data.source     - Always "AI".
 * @returns {Promise<Document>} Saved Mongoose document.
 */
const saveSignal = async (data) => {
    const signal = new Signal(data);
    await signal.save();
    return signal;
};

/**
 * Retrieve the most recent signal snapshots, ordered newest-first.
 *
 * @param {number} limit - Max number of documents to return (default 50).
 * @returns {Promise<Document[]>}
 */
const getRecentSignals = (limit = 50) =>
    Signal.find().sort({ timestamp: -1 }).limit(limit);

module.exports = { saveSignal, getRecentSignals };
