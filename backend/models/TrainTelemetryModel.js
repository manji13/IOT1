const mongoose = require('mongoose');

const telemetrySchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: [true, 'Please provide a deviceId']
    },
    timestamp: {
        type: Date,
        required: [true, 'Please provide a timestamp']
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],    // [longitude, latitude]
            required: [true, 'Please provide coordinates']
        }
    },
    speed: {
        type: Number,
        default: null
    },
    heading: {
        type: Number,
        default: null
    },
    altitude: {
        type: Number,
        default: null
    },
    battery: {
        type: Number,
        default: null
    },
    accuracy: {
        type: Number,
        default: null
    },
    status: {
        type: String,
        trim: true,
        default: 'unknown'
    }
}, {
    timestamps: true
});

// 2dsphere index for geo queries if you plan to use them later
telemetrySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Telemetry', telemetrySchema);
