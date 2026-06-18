require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import Routes
const authRoutes = require('./routes/authRoutes'); // Handles Auth AND User CRUD
const trainRoutes = require('./routes/TrainRoute'); 
const newsRoutes = require('./routes/NewsRoute'); 
const localNewsRoutes = require('./routes/LocalNewsRoute'); 
const lostRoutes = require('./routes/LostRoute');
const telemetryRoutes = require('./routes/TelemetryRoute');
const timetableRoutes = require('./routes/TimetableRoute');
const trainDetectionRoutes = require('./routes/TrainDetectionRoute');
const filterUnitsRoutes = require('./routes/FilterUnitsRoute');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.get("/", (req,res)=>{
    res.send("Backend Running 🚀");
});

// Mount Routes
app.use('/api/auth', authRoutes); // All user logic is now under /api/auth
app.use('/api/trains', trainRoutes);
app.use('/api/news', newsRoutes); 
app.use('/api/localnews', localNewsRoutes); 
app.use('/api/lost', lostRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/timetables', timetableRoutes);
app.use('/api/detections', trainDetectionRoutes);
app.use('/api/filter-units', filterUnitsRoutes);

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Connect Database
connectDB();

// --- VERCEL SPECIFIC TWEAKS BELOW ---

// 1. Only run app.listen locally. Vercel automatically sets NODE_ENV to 'production'
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
        console.log(`Error: ${err.message}`);
        // Close server & exit process
        server.close(() => process.exit(1));
    }); 
}

// 2. Export the app so Vercel's serverless functions can use it
module.exports = app;