const LocalNews = require('../models/LocalNewsModel');

// @desc    Get all local news
// @route   GET /api/localnews
// @access  Public
exports.getAllLocalNews = async (req, res, next) => {
    try {
        const newsList = await LocalNews.find().sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: newsList.length,
            data: newsList
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new local news
// @route   POST /api/localnews
// @access  Public
exports.createLocalNews = async (req, res, next) => {
    try {
        const { description } = req.body;

        const newLocalNews = await LocalNews.create({
            description
        });

        res.status(201).json({
            success: true,
            data: newLocalNews
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update local news
// @route   PUT /api/localnews/:id
// @access  Public
exports.updateLocalNews = async (req, res, next) => {
    try {
        let newsItem = await LocalNews.findById(req.params.id);

        if (!newsItem) {
            return res.status(404).json({ success: false, message: 'Local News not found' });
        }

        newsItem = await LocalNews.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
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


// @desc    Delete local news
// @route   DELETE /api/localnews/:id
// @access  Public
exports.deleteLocalNews = async (req, res, next) => {
    try {
        const newsItem = await LocalNews.findByIdAndDelete(req.params.id);

        if (!newsItem) {
            return res.status(404).json({
                success: false,
                message: 'Local News not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Local News deleted successfully',
            data: {}
        });
    } catch (error) {
        next(error);
    }
};