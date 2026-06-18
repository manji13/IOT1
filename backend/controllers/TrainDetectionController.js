const TrainDetection = require('../models/TrainDetectionModel');
const Train          = require('../models/TrainModel');
const Timetable      = require('../models/TimetableModel');
const { saveFilterUnits } = require('../utils/filterUnits');

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Abbreviated day names — matches the format in existing seed data
const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Parse "6:00 AM" / "10:36 AM" / "6:06 PM" → minutes since midnight
function timeStrToMins(t) {
    if (!t) return null;
    const m = t.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return null;
    let h = parseInt(m[1]);
    const min = parseInt(m[2]);
    const pm  = m[3].toUpperCase() === 'PM';
    if (pm && h !== 12) h += 12;
    if (!pm && h === 12) h = 0;
    return h * 60 + min;
}

// Minutes since midnight → "6:02 AM"
function minsToTimeStr(total) {
    if (total == null) return 'N/A';
    total = ((total % 1440) + 1440) % 1440;
    const h   = Math.floor(total / 60);
    const m   = total % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12  = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

// ─── GET all ──────────────────────────────────────────────────────────────────
exports.getAllDetections = async (req, res) => {
    try {
        const detections = await TrainDetection.find().sort({ date: -1 });
        res.status(200).json({
            success: true,
            count: detections.length,
            data: detections
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ─── GET by train number ──────────────────────────────────────────────────────
exports.getDetectionsByTrainNumber = async (req, res) => {
    try {
        const { trainNumber } = req.params;
        const detections = await TrainDetection.find({ trainNumber });
        res.status(200).json({
            success: true,
            count: detections.length,
            data: detections
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ─── GET by date range ────────────────────────────────────────────────────────
exports.getDetectionsByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const detections = await TrainDetection.find({
            date: { $gte: new Date(startDate), $lte: new Date(endDate) }
        });
        res.status(200).json({
            success: true,
            count: detections.length,
            data: detections
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ─── CREATE — enriched from timetable ─────────────────────────────────────────
/*
  Accepts minimal payload from the Locoid Pi unit:
    { trainNumber, timestamp, deviceId, doa, notes? }

  Enriches by:
    1. Train master  → trainName, line, trainType
    2. Timetable     → direction, scheduledKollupitiya, nextStation, nextStationTime
    3. Calculated    → actualKollupitiya, deviations, day, date
*/
exports.createDetection = async (req, res) => {
    try {
        const { trainNumber, timestamp, deviceId, doa, notes } = req.body;

        if (!trainNumber) {
            return res.status(400).json({
                success: false,
                error: 'trainNumber is required'
            });
        }

        // ── Detection time ──────────────────────────────────────────────────
        const detectionTime = timestamp ? new Date(timestamp) : new Date();
        const dayAbbr       = DAY_ABBR[detectionTime.getUTCDay()];   // e.g. 'Thu'

        // Actual time at Kollupitiya as a formatted string
        const actualH    = detectionTime.getUTCHours();
        const actualM    = detectionTime.getUTCMinutes();
        const actualMins = actualH * 60 + actualM;
        const actualKollupitiya = minsToTimeStr(actualMins);

        // ── 1. Train master lookup ──────────────────────────────────────────
        const train = await Train.findOne({ trainNumber });
        // Graceful fallback if train not in DB yet
        const trainName = train ? (train.trainName || trainNumber) : trainNumber;
        const line      = train ? (train.line      || 'Unknown Line') : 'Unknown Line';
        const trainType = train ? (train.trainType || 'Slow') : 'Slow';

        // ── 2. Timetable lookup — Kollupitiya entry ─────────────────────────
        // runningDays is stored as an array e.g. ['Mon','Tue','Wed',...]
        const ttKoll = await Timetable.findOne({
            trainNumber,
            station     : 'Kollupitiya',
            activeStatus: 'Active',
            runningDays : dayAbbr          // Mongoose checks if array contains value
        });

        let scheduledKollupitiya    = 'N/A';
        let direction               = 'UP';
        let minutesDeviationKollupitiya = 0;

        if (ttKoll) {
            scheduledKollupitiya = ttKoll.timeAtStation || 'N/A';
            direction            = ttKoll.direction     || 'UP';
            const scheduledMins  = timeStrToMins(scheduledKollupitiya);
            if (scheduledMins !== null) {
                minutesDeviationKollupitiya = actualMins - scheduledMins;
            }
        }

        // ── 3. Next station lookup ──────────────────────────────────────────
        // Find the timetable entry for this train on this day whose time
        // comes immediately after Kollupitiya (smallest time > scheduled).
        let nextStation     = 'N/A';
        let nextStationTime = 'N/A';
        let actualNextStationTime       = 'N/A';
        let minutesDeviationNextStation = 0;

        if (ttKoll) {
            const scheduledMins = timeStrToMins(ttKoll.timeAtStation);
            if (scheduledMins !== null) {
                // Get all entries for this train on this day, sorted by time
                const allEntries = await Timetable.find({
                    trainNumber,
                    activeStatus: 'Active',
                    runningDays : dayAbbr
                });

                // Convert to minutes and find the first one after Kollupitiya
                const nextEntry = allEntries
                    .map(e => ({
                        ...e.toObject(),
                        _mins: timeStrToMins(e.timeAtStation)
                    }))
                    .filter(e => e._mins !== null && e._mins > scheduledMins)
                    .sort((a, b) => a._mins - b._mins)[0];

                if (nextEntry) {
                    nextStation     = nextEntry.station;
                    nextStationTime = nextEntry.timeAtStation;
                    const nextScheduledMins = nextEntry._mins;
                    const nextActualMins    = nextScheduledMins + minutesDeviationKollupitiya;
                    actualNextStationTime       = minsToTimeStr(nextActualMins);
                    minutesDeviationNextStation = minutesDeviationKollupitiya;
                }
            }
        }

        // ── 4. Build and save ───────────────────────────────────────────────
        const noteStr = [
            notes || '',
            deviceId ? `device=${deviceId}` : '',
            doa      ? `doa=${doa}°`         : ''
        ].filter(Boolean).join(' | ');

        const detection = await TrainDetection.create({
            date                        : detectionTime,
            day                         : dayAbbr,
            trainNumber                 : trainNumber,
            trainName                   : trainName,
            direction                   : direction,
            line                        : line,
            nextStation                 : nextStation,
            trainType                   : trainType,
            scheduledKollupitiya        : scheduledKollupitiya,
            actualKollupitiya           : actualKollupitiya,
            minutesDeviationKollupitiya : minutesDeviationKollupitiya,
            nextStationTime             : nextStationTime,
            actualNextStationTime       : actualNextStationTime,
            minutesDeviationNextStation : minutesDeviationNextStation,
            notes                       : noteStr || 'Locoid detection'
        });

        await saveFilterUnits([detection]);

        res.status(201).json({ success: true, data: detection });

    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// ─── CREATE multiple ──────────────────────────────────────────────────────────
exports.createMultipleDetections = async (req, res) => {
    try {
        const detections = await TrainDetection.insertMany(req.body);
        await saveFilterUnits(detections);
        res.status(201).json({
            success: true,
            count: detections.length,
            data: detections
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────
exports.updateDetection = async (req, res) => {
    try {
        const detection = await TrainDetection.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        res.status(200).json({ success: true, data: detection });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
exports.deleteDetection = async (req, res) => {
    try {
        await TrainDetection.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Detection record deleted' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// ─── STATISTICS ───────────────────────────────────────────────────────────────
exports.getStatistics = async (req, res) => {
    try {
        const stats = await TrainDetection.aggregate([
            {
                $group: {
                    _id                    : '$trainNumber',
                    trainName              : { $first: '$trainName' },
                    totalRecords           : { $sum: 1 },
                    avgDeviationKollupitiya: { $avg: '$minutesDeviationKollupitiya' },
                    avgDeviationNextStation: { $avg: '$minutesDeviationNextStation' }
                }
            },
            { $sort: { totalRecords: -1 } }
        ]);
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};