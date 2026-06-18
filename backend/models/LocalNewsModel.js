const mongoose = require('mongoose');

const localNewsSchema = new mongoose.Schema({
    description: {
        type: String,
        required: [true, 'Please add a description'],
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('LocalNews', localNewsSchema);