const Lost = require('../models/LostModel');
const Train = require('../models/TrainModel');

// @desc    Get all lost items
// @route   GET /api/lost
// @access  Public
exports.getLosts = async (req, res, next) => {
    try {
        const items = await Lost.find();
        res.status(200).json({ success: true, count: items.length, data: items });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single lost item
// @route   GET /api/lost/:id
// @access  Public
exports.getLost = async (req, res, next) => {
    try {
        const item = await Lost.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
};

// @desc    Create lost item
// @route   POST /api/lost
// @access  Public
exports.createLost = async (req, res, next) => {
    try {
        const { trainNumber } = req.body;

        if (trainNumber) {
            const train = await Train.findOne({ trainNumber: trainNumber.toString().trim() });
            if (!train) {
                return res.status(400).json({ success: false, message: 'Invalid train number' });
            }
        }

        const item = await Lost.create(req.body);
        res.status(201).json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
};

// @desc    Update lost item
// @route   PUT /api/lost/:id
// @access  Public
exports.updateLost = async (req, res, next) => {
    try {
        const item = await Lost.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

        const { trainNumber } = req.body;
        if (trainNumber) {
            const train = await Train.findOne({ trainNumber: trainNumber.toString().trim() });
            if (!train) return res.status(400).json({ success: false, message: 'Invalid train number' });
        }

        const updated = await Lost.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete lost item
// @route   DELETE /api/lost/:id
// @access  Public
exports.deleteLost = async (req, res, next) => {
    try {
        const item = await Lost.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

        await item.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};
