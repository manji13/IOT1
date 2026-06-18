const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Import Models
const TrainDetection = require('../models/TrainDetectionModel');
const Train = require('../models/TrainModel');

let validTrainNumbers = new Set();
let lastProcessedId = null;

// Function to get valid train numbers
const loadValidTrainNumbers = async () => {
    try {
        console.log('Loading valid train numbers from trains database...');
        const allTrains = await Train.find({}, { trainNumber: 1, trainName: 1, line: 1 }).lean();
        validTrainNumbers = new Set(allTrains.map(train => train.trainNumber));
        console.log(`✓ Loaded ${validTrainNumbers.size} valid train numbers\n`);
    } catch (error) {
        console.error('✗ Error loading train numbers:', error.message);
    }
};

// Function to filter and update records
const filterAndUpdateRecords = async (isInitial = false) => {
    try {
        let query = {};
        
        // If not initial run, only fetch new records since last processed
        if (!isInitial && lastProcessedId) {
            query = { _id: { $gt: lastProcessedId } };
        }

        // Fetch detection records
        const detections = await TrainDetection.find(query).sort({ _id: 1 }).lean();
        
        if (detections.length === 0) {
            if (isInitial) {
                console.log('No detection records found in database.');
            }
            return;
        }

        // Update last processed ID even if there are no matching records,
        // so we don't reprocess the same records repeatedly.
        lastProcessedId = detections[detections.length - 1]._id;

        // Fetch all detection records for statistics
        const allDetections = await TrainDetection.find({}).sort({ _id: 1 }).lean();
        const recordsWithMatch = allDetections.map(detection => {
            const matched = validTrainNumbers.has(detection.trainNumber);
            return {
                ...detection,
                matched,
                matchedTrainName: matched ? detection.trainName : null
            };
        });

        const allMatchingRecords = recordsWithMatch.filter(record => record.matched);
        const unmatchedRecords = recordsWithMatch.filter(record => !record.matched);

        const statistics = {
            totalDetectionRecords: allDetections.length,
            totalValidTrains: validTrainNumbers.size,
            matchingRecords: allMatchingRecords.length,
            unmatchedRecords: unmatchedRecords.length,
            matchingPercentage: allDetections.length > 0
                ? ((allMatchingRecords.length / allDetections.length) * 100).toFixed(2) + '%'
                : '0.00%',
            lastUpdated: new Date().toISOString(),
            newRecordsInThisUpdate: detections.filter(detection => validTrainNumbers.has(detection.trainNumber)).length,
            records: recordsWithMatch,
            matchedRecords: allMatchingRecords,
            unmatchedRecordsData: unmatchedRecords
        };

        // Save full filter output to main Filter_units JSON
        const outputPath = path.join(__dirname, 'Filter_units.json');
        fs.writeFileSync(outputPath, JSON.stringify(statistics, null, 2));

        // Keep the previous result file too for compatibility
        const resultsPath = path.join(__dirname, 'Filter_units_results.json');
        fs.writeFileSync(resultsPath, JSON.stringify(statistics, null, 2));

        // Group matched records by train number
        const groupedByTrain = {};
        allMatchingRecords.forEach(record => {
            if (!groupedByTrain[record.trainNumber]) {
                groupedByTrain[record.trainNumber] = {
                    trainName: record.trainName,
                    count: 0,
                    records: []
                };
            }
            groupedByTrain[record.trainNumber].count++;
            groupedByTrain[record.trainNumber].records.push(record);
        });

        const groupedOutputPath = path.join(__dirname, 'Filter_units_grouped.json');
        fs.writeFileSync(groupedOutputPath, JSON.stringify(groupedByTrain, null, 2));

        console.log(`✓ Updated Filter_units files`);
        console.log(`  Total Records: ${statistics.totalDetectionRecords}`);
        console.log(`  Matching Records: ${statistics.matchingRecords}`);
        console.log(`  Unmatched Records: ${statistics.unmatchedRecords}`);
        console.log(`  Match Percentage: ${statistics.matchingPercentage}\n`);

    } catch (error) {
        console.error(`✗ Error during filtering: ${error.message}`);
    }
};

// Function to watch for changes using MongoDB Change Streams (Real-time)
const watchTrainDetectionChanges = async () => {
    try {
        console.log('Setting up real-time monitoring of train_detection_records...');
        
        // Initial load of all records
        console.log('\n=== INITIAL FILTERING ===');
        await filterAndUpdateRecords(true);

        // Set up change stream for real-time updates
        const changeStream = TrainDetection.collection.watch([
            {
                $match: {
                    'operationType': { $in: ['insert', 'update'] }
                }
            }
        ]);

        console.log('✓ Real-time monitoring active (Change Streams)\n');
        console.log('Listening for new train detection records...\n');
        console.log('------- REAL-TIME UPDATES -------\n');

        changeStream.on('change', async (change) => {
            // Process new/updated records
            await filterAndUpdateRecords(false);
        });

        // Also poll periodically (every 5 seconds) as a fallback
        setInterval(async () => {
            await filterAndUpdateRecords(false);
        }, 5000);

    } catch (error) {
        console.error('✗ Error setting up change stream:', error.message);
        console.log('Falling back to polling mode...\n');
        
        // Fallback: Poll every 5 seconds
        console.log('Setting up polling monitoring...');
        await filterAndUpdateRecords(true);
        
        setInterval(async () => {
            await filterAndUpdateRecords(false);
        }, 5000);
    }
};

// Initialize and start monitoring
const startMonitoring = async () => {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✓ MongoDB Connected\n');

        // Load valid train numbers
        await loadValidTrainNumbers();

        // Start watching for changes
        await watchTrainDetectionChanges();

    } catch (error) {
        console.error('\n✗ Critical Error:', error.message);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n✓ Monitoring stopped gracefully');
    process.exit(0);
});

// Start the monitoring
startMonitoring();
