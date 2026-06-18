const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    trainNumber: {
        type: String,
        required: [true, 'Please add a Train Number'],
        trim: true
    },
    departure: {
        type: String,
        required: [true, 'Please add a Departure Station'],
        trim: true
    },
    destination: {
        type: String,
        required: [true, 'Please add a Destination Station'],
        trim: true
    },
    time: {
        type: String,
        required: [true, 'Please add a Time']
    },
    news: {
        type: String,
        required: [true, 'Please add the News content']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('News', newsSchema);