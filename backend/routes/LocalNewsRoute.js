const express = require('express');
const router = express.Router();

// Import all functions from controller
const {
    getAllLocalNews,
    createLocalNews,
    updateLocalNews,
    deleteLocalNews
} = require('../controllers/LocalNewsController');

// Routes for /api/localnews
router.route('/')
    .get(getAllLocalNews)
    .post(createLocalNews);

// Routes for /api/localnews/:id
router.route('/:id')
    .put(updateLocalNews)
    .delete(deleteLocalNews);

module.exports = router;