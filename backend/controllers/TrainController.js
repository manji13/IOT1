const Train = require('../models/TrainModel');

// @desc    Get all trains
// @route   GET /api/trains
// @access  Public
exports.getTrains = async (req, res, next) => {
    try {
        const trains = await Train.find();
        
        res.status(200).json({
            success: true,
            count: trains.length,
            data: trains
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single train
// @route   GET /api/trains/:id
// @access  Public
exports.getTrain = async (req, res, next) => {
    try {
        const train = await Train.findById(req.params.id);

        if (!train) {
            return res.status(404).json({
                success: false,
                message: 'Train not found'
            });
        }

        res.status(200).json({
            success: true,
            data: train
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new train
// @route   POST /api/trains
// @access  Public
exports.createTrain = async (req, res, next) => {
    try {
        // This will now include 'departure' and 'destination' from the form
        const train = await Train.create(req.body);

        res.status(201).json({
            success: true,
            data: train
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Train Number already exists' });
        }
        next(error);
    }
};

// @desc    Update train
// @route   PUT /api/trains/:id
// @access  Public
exports.updateTrain = async (req, res, next) => {
    try {
        let train = await Train.findById(req.params.id);

        if (!train) {
            return res.status(404).json({
                success: false,
                message: 'Train not found'
            });
        }

        train = await Train.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: train
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete train
// @route   DELETE /api/trains/:id
// @access  Public
exports.deleteTrain = async (req, res, next) => {
    try {
        const train = await Train.findById(req.params.id);

        if (!train) {
            return res.status(404).json({
                success: false,
                message: 'Train not found'
            });
        }

        await train.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};