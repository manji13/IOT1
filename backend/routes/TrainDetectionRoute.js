const express = require('express');
const router = express.Router();
const {
    getAllDetections,
    getDetectionsByTrainNumber,
    getDetectionsByDateRange,
    createDetection,
    createMultipleDetections,
    updateDetection,
    deleteDetection,
    getStatistics
} = require('../controllers/TrainDetectionController');

// Get all detections
router.get('/', getAllDetections);

// Get statistics
router.get('/statistics', getStatistics);

// Get detections by train number
router.get('/train/:trainNumber', getDetectionsByTrainNumber);

// Get detections by date range
router.get('/daterange', getDetectionsByDateRange);

// Create single detection
router.post('/', createDetection);

// Create multiple detections
router.post('/bulk', createMultipleDetections);

// Update detection
router.put('/:id', updateDetection);

// Delete detection
router.delete('/:id', deleteDetection);

module.exports = router;
