const mongoose = require('mongoose');

const trainSchema = new mongoose.Schema({
    trainNumber: {
        type: String,
        required: [true, 'Please add a Train Number'],
        unique: true,
        trim: true
    },
    trainName: {
        type: String,
        trim: true
    },
    line: {
        type: String,
        required: [true, 'Please add a Line'],
        trim: true
    },
    fromStation: {
        type: String,
        required: [true, 'Please add a From Station'],
        trim: true
    },
    toStation: {
        type: String,
        required: [true, 'Please add a To Station'],
        trim: true
    },
    originDepartureTime: {
        type: String,
        required: [true, 'Please add a Origin Departure Time']
    },
    destinationArrivalTime: {
        type: String,
        required: [true, 'Please add a Destination Arrival Time']
    },
    trainType: {
        type: String,
        enum: ['Slow', 'Express', 'Intercity', 'Night Mail'],
        default: 'Slow'
    },
    expectedSeries: {
        type: String,
        enum: ['M', 'S', 'Unknown'],
        default: 'Unknown'
    },
    expectedClass: {
        type: String,
        enum: ['M8', 'M10', 'S11', 'S13', 'Unknown'],
        default: 'Unknown'
    },
    activeStatus: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    remarks: {
        type: String,
        trim: true
    }
}, {
    timestamps: true 
});

module.exports = mongoose.model('Train', trainSchema);