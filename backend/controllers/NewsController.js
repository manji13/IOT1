const News = require('../models/NewsModel');
const Train = require('../models/TrainModel');

// @desc    Get all news
// @route   GET /api/news
// @access  Public
exports.getAllNews = async (req, res, next) => {
    try {
        const newsList = await News.find().sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: newsList.length,
            data: newsList
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new news
// @route   POST /api/news
// @access  Public
exports.createNews = async (req, res, next) => {
    try {
        const { trainNumber, departure, destination, time, news } = req.body;

        // Validation: Check if train number exists
        const trainExists = await Train.findOne({ trainNumber: trainNumber });

        if (!trainExists) {
            return res.status(400).json({
                success: false,
                message: 'type valid Train number' 
            });
        }

        const newNews = await News.create({
            trainNumber,
            departure,
            destination,
            time,
            news
        });

        res.status(201).json({
            success: true,
            data: newNews
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update news
// @route   PUT /api/news/:id
// @access  Public
exports.updateNews = async (req, res, next) => {
    try {
        let newsItem = await News.findById(req.params.id);

        if (!newsItem) {
            return res.status(404).json({ success: false, message: 'News not found' });
        }

        // Validation: If updating train number, check if valid
        if (req.body.trainNumber) {
            const trainExists = await Train.findOne({ trainNumber: req.body.trainNumber });

            if (!trainExists) {
                return res.status(400).json({
                    success: false,
                    message: 'type valid Train number' 
                });
            }
        }

        // Update using findByIdAndUpdate directly for efficiency
        newsItem = await News.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // returns the updated document
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: newsItem
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete news
// @route   DELETE /api/news/:id
// @access  Public
exports.deleteNews = async (req, res, next) => {
    try {
        // Use findByIdAndDelete directly
        const newsItem = await News.findByIdAndDelete(req.params.id);

        if (!newsItem) {
            return res.status(404).json({
                success: false,
                message: 'News not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'News deleted successfully',
            data: {}
        });
    } catch (error) {
        next(error);
    }
};