const express = require('express');
const router = express.Router();
const { createTelemetry, getAllTelemetry } = require('../controllers/TelemetryController');

router.route('/')
    .get(getAllTelemetry)
    .post(createTelemetry);

module.exports = router;
