const fs = require('fs');
const path = require('path');
const TrainDetection = require('../models/TrainDetectionModel');
const Train = require('../models/TrainModel');

let validTrainNumbers = new Set();
let cachedFilterData = null;

const loadValidTrainNumbers = async () => {
    const trains = await Train.find({}, { trainNumber: 1 }).lean();
    validTrainNumbers = new Set(trains.map(t => t.trainNumber));
};

const loadCachedFilterData = () => {
    const outputPath = path.join(__dirname, '..', 'seeds', 'Filter_units.json');
    try {
        if (fs.existsSync(outputPath)) {
            const data = fs.readFileSync(outputPath, 'utf-8');
            cachedFilterData = JSON.parse(data);
            return cachedFilterData;
        }
    } catch (error) {
        console.error('Error loading cached filter data:', error.message);
    }
    return null;
};

const updateFilterUnitsIncremental = async (newRecords = []) => {
    await loadValidTrainNumbers();

    // Load existing filter data or start fresh
    cachedFilterData = loadCachedFilterData() || {
        totalDetectionRecords: 0,
        totalValidTrains: validTrainNumbers.size,
        matchingRecords: 0,
        unmatchedRecords: 0,
        matchingPercentage: '0.00%',
        lastUpdated: new Date().toISOString(),
        newRecordsInThisUpdate: 0,
        records: [],
        matchedRecords: [],
        unmatchedRecordsData: []
    };

    // Process only new records
    const newRecordsWithMatch = newRecords.map(detection => {
        const matched = validTrainNumbers.has(detection.trainNumber);
        return {
            ...detection,
            matched,
            matchedTrainName: matched ? detection.trainName : null
        };
    });

    const newMatched = newRecordsWithMatch.filter(r => r.matched);
    const newUnmatched = newRecordsWithMatch.filter(r => !r.matched);

    // Merge with existing data
    const existingRecordIds = new Set(cachedFilterData.records.map(r => r._id?.toString()));
    const mergedRecords = [
        ...cachedFilterData.records.filter(r => !newRecords.some(nr => nr._id?.toString() === r._id?.toString())),
        ...newRecordsWithMatch
    ];

    // Update statistics
    cachedFilterData.totalDetectionRecords = mergedRecords.length;
    cachedFilterData.totalValidTrains = validTrainNumbers.size;
    cachedFilterData.matchingRecords = mergedRecords.filter(r => r.matched).length;
    cachedFilterData.unmatchedRecords = mergedRecords.filter(r => !r.matched).length;
    cachedFilterData.matchingPercentage = mergedRecords.length > 0
        ? ((cachedFilterData.matchingRecords / mergedRecords.length) * 100).toFixed(2) + '%'
        : '0.00%';
    cachedFilterData.lastUpdated = new Date().toISOString();
    cachedFilterData.newRecordsInThisUpdate = newMatched.length;
    cachedFilterData.records = mergedRecords;
    cachedFilterData.matchedRecords = mergedRecords.filter(r => r.matched);
    cachedFilterData.unmatchedRecordsData = mergedRecords.filter(r => !r.matched);

    // Save to files
    const outputPath = path.join(__dirname, '..', 'seeds', 'Filter_units.json');
    const resultsPath = path.join(__dirname, '..', 'seeds', 'Filter_units_results.json');
    const groupedOutputPath = path.join(__dirname, '..', 'seeds', 'Filter_units_grouped.json');

    fs.writeFileSync(outputPath, JSON.stringify(cachedFilterData, null, 2));
    fs.writeFileSync(resultsPath, JSON.stringify(cachedFilterData, null, 2));

    // Build grouped data
    const groupedByTrain = {};
    cachedFilterData.matchedRecords.forEach(record => {
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

    fs.writeFileSync(groupedOutputPath, JSON.stringify(groupedByTrain, null, 2));

    console.log(`✓ Filter updated: +${newMatched.length} matched, +${newUnmatched.length} unmatched`);
    console.log(`  Total: ${cachedFilterData.totalDetectionRecords} records`);
    console.log(`  Matching: ${cachedFilterData.matchingRecords} (${cachedFilterData.matchingPercentage})`);
};

const saveFilterUnits = async (records = []) => {
    if (records.length === 0) return;
    await updateFilterUnitsIncremental(records);
};

module.exports = {
    saveFilterUnits
};
