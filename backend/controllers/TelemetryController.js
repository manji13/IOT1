const Telemetry = require('../models/TrainTelemetryModel');

// @desc    Store incoming telemetry data
// @route   POST /api/telemetry
// @access  Public
exports.createTelemetry = async (req, res, next) => {
    try {
        const data = { ...req.body };

        // convert a unix timestamp (seconds) to JS Date if necessary
        if (data.timestamp && typeof data.timestamp === 'number') {
            data.timestamp = new Date(data.timestamp * 1000);
        }

        const telemetry = await Telemetry.create(data);

        res.status(201).json({
            success: true,
            data: telemetry
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all telemetry entries
// @route   GET /api/telemetry
// @access  Public
exports.getAllTelemetry = async (req, res, next) => {
    try {
        const entries = await Telemetry.find().sort({ timestamp: -1 });

        res.status(200).json({
            success: true,
            count: entries.length,
            data: entries
        });
    } catch (error) {
        next(error);
    }
};
