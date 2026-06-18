const express = require('express');
const router = express.Router();

// Import all functions from controller
const {
    getAllNews,
    createNews,
    updateNews,
    deleteNews
} = require('../controllers/NewsController');

// Routes for /api/news
router.route('/')
    .get(getAllNews)
    .post(createNews);

// Routes for /api/news/:id
router.route('/:id')
    .put(updateNews)
    .delete(deleteNews);

module.exports = router;