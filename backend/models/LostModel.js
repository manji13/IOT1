const mongoose = require('mongoose');

const lostSchema = new mongoose.Schema({
    itemDescription: {
        type: String,
        required: [true, 'Please add an item description'],
        trim: true
    },
    lastSeenStation: {
        type: String,
        required: [true, 'Please add the last seen station'],
        trim: true
    },
    approximateTime: {
        type: String,
        required: [true, 'Please add an approximate time']
    },
    trainNumber: {
        type: String,
        trim: true,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Lost', lostSchema);
