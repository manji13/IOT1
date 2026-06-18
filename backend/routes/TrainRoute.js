const express = require('express');
const router = express.Router();
const {
    getTrains,
    getTrain,
    createTrain,
    updateTrain,
    deleteTrain
} = require('../controllers/TrainController');

// Routes for /api/trains
router.route('/')
    .get(getTrains)
    .post(createTrain);

// Routes for /api/trains/:id
router.route('/:id')
    .get(getTrain)
    .put(updateTrain)
    .delete(deleteTrain);

    
module.exports = router;