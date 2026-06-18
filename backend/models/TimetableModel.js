const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
    trainNumber: {
        type: String,
        required: [true, 'Please add a Train Number'],
        trim: true
    },
    line: {
        type: String,
        required: [true, 'Please add a Line'],
        trim: true
    },
    station: {
        type: String,
        required: [true, 'Please add a Station'],
        trim: true
    },
    stopStatus: {
        type: String,
        enum: ['Stop', 'Pass Only', 'No Stop'],
        default: 'Stop'
    },
    timeAtStation: {
        type: String,
        required: [true, 'Please add Time at Station']
    },
    arrivalTime: {
        type: String,
        required: [true, 'Please add Arrival Time']
    },
    departureTime: {
        type: String,
        required: [true, 'Please add Departure Time']
    },
    direction: {
        type: String,
        enum: ['UP', 'DOWN'],
        default: 'UP'
    },
    runningDays: {
        type: [String],
        default: []
    },
    trainType: {
        type: String,
        enum: ['Slow', 'Express', 'Intercity', 'Night Mail'],
        default: 'Slow'
    },
    activeStatus: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Timetable', timetableSchema);