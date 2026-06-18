const express = require('express');
const router = express.Router();
const {
    getTimetables,
    getTimetable,
    createTimetable,
    updateTimetable,
    deleteTimetable
} = require('../controllers/TimetableController');

// Routes for /api/timetables
router.route('/')
    .get(getTimetables)
    .post(createTimetable);

// Routes for /api/timetables/:id
router.route('/:id')
    .get(getTimetable)
    .put(updateTimetable)
    .delete(deleteTimetable);


module.exports = router;