const express = require('express');
const router = express.Router();
const {
    getFilterUnits,
    getFilterUnitsGrouped
} = require('../controllers/FilterUnitsController');

// Get standard filter units data
router.get('/', getFilterUnits);

// Get grouped filter units data
router.get('/grouped', getFilterUnitsGrouped);

module.exports = router;
