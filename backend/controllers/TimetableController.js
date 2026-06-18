const Timetable = require('../models/TimetableModel');

// @desc    Get all timetables
// @route   GET /api/timetables
// @access  Public
exports.getTimetables = async (req, res, next) => {
    try {
        const timetables = await Timetable.find();

        res.status(200).json({
            success: true,
            count: timetables.length,
            data: timetables
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single timetable
// @route   GET /api/timetables/:id
// @access  Public
exports.getTimetable = async (req, res, next) => {
    try {
        const timetable = await Timetable.findById(req.params.id);

        if (!timetable) {
            return res.status(404).json({
                success: false,
                message: 'Timetable not found'
            });
        }

        res.status(200).json({
            success: true,
            data: timetable
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new timetable
// @route   POST /api/timetables
// @access  Public
exports.createTimetable = async (req, res, next) => {
    try {
        const timetable = await Timetable.create(req.body);

        res.status(201).json({
            success: true,
            data: timetable
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Timetable already exists' });
        }
        next(error);
    }
};

// @desc    Update timetable
// @route   PUT /api/timetables/:id
// @access  Public
exports.updateTimetable = async (req, res, next) => {
    try {
        let timetable = await Timetable.findById(req.params.id);

        if (!timetable) {
            return res.status(404).json({
                success: false,
                message: 'Timetable not found'
            });
        }

        timetable = await Timetable.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: timetable
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete timetable
// @route   DELETE /api/timetables/:id
// @access  Public
exports.deleteTimetable = async (req, res, next) => {
    try {
        const timetable = await Timetable.findById(req.params.id);

        if (!timetable) {
            return res.status(404).json({
                success: false,
                message: 'Timetable not found'
            });
        }

        await timetable.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};