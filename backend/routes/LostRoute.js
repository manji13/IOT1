const express = require('express');
const router = express.Router();
const {
    getLosts,
    getLost,
    createLost,
    updateLost,
    deleteLost
} = require('../controllers/LostController');

// Routes for /api/lost
router.route('/')
    .get(getLosts)
    .post(createLost);

router.route('/:id')
    .get(getLost)
    .put(updateLost)
    .delete(deleteLost);

module.exports = router;
