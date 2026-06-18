const mongoose = require('mongoose');

const trainDetectionSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: [true, 'Please add a date'],
        index: true
    },
    day: {
        type: String,
        required: [true, 'Please add day of week']
    },
    trainNumber: {
        type: String,
        required: [true, 'Please add a train number'],
        index: true
    },
    originalTrainNumber: {
        type: String,
        default: null
    },
    trainName: {
        type: String,
        required: [true, 'Please add a train name']
    },
    direction: {
        type: String,
        required: [true, 'Please add direction'],
        enum: ['UP', 'DOWN']
    },
    line: {
        type: String,
        required: [true, 'Please add line']
    },
    nextStation: {
        type: String,
        required: [true, 'Please add next station']
    },
    trainType: {
        type: String,
        required: [true, 'Please add train type'],
        enum: ['Slow', 'Express', 'Intercity', 'Night Mail']
    },
    scheduledKollupitiya: {
        type: String,
        required: [true, 'Please add scheduled time at Kollupitiya']
    },
    actualKollupitiya: {
        type: String,
        required: [true, 'Please add actual time at Kollupitiya']
    },
    minutesDeviationKollupitiya: {
        type: Number,
        default: 0
    },
    nextStationTime: {
        type: String,
        required: [true, 'Please add next station time']
    },
    actualNextStationTime: {
        type: String,
        required: [true, 'Please add actual next station time']
    },
    minutesDeviationNextStation: {
        type: Number,
        default: 0
    },
    notes: {
        type: String,
        default: 'Sample record'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('TrainDetection', trainDetectionSchema, 'train_detection_records');
