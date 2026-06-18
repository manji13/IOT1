# Train Detection Records - Setup Guide

## Created Files

✅ **Model**: `models/TrainDetectionModel.js` - MongoDB schema for train detection records
✅ **Controller**: `controllers/TrainDetectionController.js` - CRUD operations & statistics
✅ **Routes**: `routes/TrainDetectionRoute.js` - API endpoints
✅ **Seeds**: `seeds/trainDetectionSeeds.js` - 50 sample records from spreadsheet
✅ **Seeder Script**: `seeds/seedTrainDetections.js` - Script to insert data into DB
✅ **Updated**: `server.js` - Routes mounted at `/api/detections`

## How to Insert Data into Database

### Step 1: Make sure you're in the backend directory
```bash
cd backend
```

### Step 2: Run the seeding script
```bash
node seeds/seedTrainDetections.js
```

You should see output like:
```
MongoDB Connected
✓ Successfully inserted 50 train detection records

📊 Total records: 50

📋 Records by Train:
   Train 992 (Aluthgama): 10 records
   Train 16311 (Wadduwa Passenger): 10 records
   Train 851 (Galle Passenger): 10 records
   Train 827 (Morning Fort Passenger): 10 records
   Train 854 (Rajarata Rejini): 10 records
```

## API Endpoints Available

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/detections/` | Get all detection records |
| GET | `/api/detections/statistics` | Get statistics by train |
| GET | `/api/detections/train/:trainNumber` | Get records for specific train |
| GET | `/api/detections/daterange?startDate=2025-04-01&endDate=2025-04-10` | Get records by date range |
| POST | `/api/detections/` | Create single record |
| POST | `/api/detections/bulk` | Create multiple records |
| PUT | `/api/detections/:id` | Update a record |
| DELETE | `/api/detections/:id` | Delete a record |

## Example API Calls

### Get all records
```bash
curl http://localhost:5000/api/detections/
```

### Get records for Train 992
```bash
curl http://localhost:5000/api/detections/train/992
```

### Get statistics
```bash
curl http://localhost:5000/api/detections/statistics
```

### Get records in date range
```bash
curl "http://localhost:5000/api/detections/daterange?startDate=2025-04-01&endDate=2025-04-10"
```

## Data Fields

Each detection record contains:
- `date` - Detection date (format: YYYY-MM-DD)
- `day` - Day of week (Mon, Tue, Wed, etc.)
- `trainNumber` - Train identification number
- `trainName` - Train name
- `direction` - UP or DOWN
- `line` - Railway line (Coastal Line)
- `nextStation` - Next station name
- `trainType` - Train type (Slow, Express, etc.)
- `scheduledKollupitiya` - Scheduled arrival time at Kollupitiya
- `actualKollupitiya` - Actual arrival time at Kollupitiya
- `minutesDeviationKollupitiya` - Delay/advance in minutes
- `nextStationTime` - Next station name or scheduled time
- `actualNextStationTime` - Actual time at next station
- `minutesDeviationNextStation` - Deviation at next station
- `notes` - Additional notes

## Sample Data Included

The seeding script includes data for 5 trains across April 1-10, 2025:
- **Train 992** (Aluthgama) - UP direction - 10 records
- **Train 16311** (Wadduwa Passenger) - DOWN direction - 10 records
- **Train 851** (Galle Passenger) - DOWN direction - 10 records
- **Train 827** (Morning Fort Passenger) - UP direction - 10 records
- **Train 854** (Rajarata Rejini) - DOWN direction - 10 records

**Total: 50 detection records**
