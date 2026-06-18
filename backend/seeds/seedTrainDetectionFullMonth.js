const mongoose = require('mongoose');
const dotenv = require('dotenv');
const TrainDetection = require('../models/TrainDetectionModel');

dotenv.config();

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const parseTime = (timeStr) => {
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return { hours, minutes };
};

const formatTime = ({ hours, minutes }) => {
  const period = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 === 0 ? 12 : hours % 12;
  return `${String(h).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
};

const addMinutes = (timeStr, offset) => {
  const { hours, minutes } = parseTime(timeStr);
  const total = hours * 60 + minutes + offset;
  const normalized = ((total % 1440) + 1440) % 1440;
  return formatTime({ hours: Math.floor(normalized / 60), minutes: normalized % 60 });
};

const getDayName = (year, month, day) => {
  const date = new Date(Date.UTC(year, month - 1, day));
  return daysOfWeek[date.getUTCDay()];
};

const trains = [
  {
    trainNumber: '992',
    trainName: 'Aluthgama',
    direction: 'UP',
    line: 'Coastal Line',
    station: 'Kollupitiya',
    nextStation: 'Kompannavidiya',
    trainType: 'Slow',
    scheduledKollupitiya: '6:00 AM',
    actualOffsets: [2, 10, 3, 1, 4, 2, 0, 3, 1, 35, 2, 20, 3, 4, -5, 3, 11, 14, 2, 51, 3, 21, 4, 2, 4, 8, 9, 14, 4, 4],
    nextOffsets: [4, 4, 5, 4, 5, 6, 6, 1, 7, 2, 6, 8, 6, 4, 10, 5, 7, 2, 2, 7, 2, 7, 4, 2, 0, 9, 6, 4, 4, 4]
  },
  {
    trainNumber: '16311',
    trainName: 'Wadduwa Passenger',
    direction: 'DOWN',
    line: 'Coastal Line',
    station: 'Kollupitiya',
    nextStation: 'Bambalapitiya',
    trainType: 'Slow',
    scheduledKollupitiya: '4:51 AM',
    actualOffsets: [1, 3, 0, 2, 4, 1, 3, 0, 2, 4, 3, 0, 2, 1, 0, 2, 4, 0, 3, 4, 1, 2, 0, 3, 4, 1, 2, 0, 4, 2],
    nextOffsets: [5, 5, 4, 5, 6, 9, 7, 10, 8, 6, 3, 2, 8, 8, 6, 7, 5, 6, 9, 7, 6, 5, 8, 9, 7, 10, 5, 4, 7, 6]
  },
  {
    trainNumber: '851',
    trainName: 'Galle Passenger',
    direction: 'DOWN',
    line: 'Coastal Line',
    station: 'Kollupitiya',
    nextStation: 'Bambalapitiya',
    trainType: 'Slow',
    scheduledKollupitiya: '6:06 PM',
    actualOffsets: [4, 2, 6, 0, 5, 0, 2, 6, 3, 5, 4, 0, 2, 3, 0, 6, 5, 9, 6, 7, 8, 0, 3, 2, 0, 1, 0, 0, 5, 4],
    nextOffsets: [4, 5, 4, 9, 5, 8, 5, 4, 6, 5, 5, 6, 5, 7, 8, 7, 6, 5, 6, 3, 4, 5, 4, 6, 7, 8, 5, 6, 7, 5]
  },
  {
    trainNumber: '827',
    trainName: 'Morning Fort Passenger',
    direction: 'UP',
    line: 'Coastal Line',
    station: 'Kollupitiya',
    nextStation: 'Kompannavidiya',
    trainType: 'Slow',
    scheduledKollupitiya: '8:28 AM',
    actualOffsets: [3, 1, 4, 2, 60, 3, 1, 24, 2, 0, 3, 1, 4, 2, 13, 1, 3, 2, 1, 20, 3, 1, 4, 2, 0, 3, 2, 1, 24, 2],
    nextOffsets: [7, 4, 5, 4, 3, 4, 5, 4, 7, 7, 2, 5, 3, 6, 16, 5, 3, 6, 3, 9, 2, 1, 7, 6, 2, 4, 2, 8, 2, 4]
  },
  {
    trainNumber: '854',
    trainName: 'Rajarata Rejini',
    direction: 'DOWN',
    line: 'Coastal Line',
    station: 'Kollupitiya',
    nextStation: 'Bambalapitiya',
    trainType: 'Express',
    scheduledKollupitiya: '10:36 AM',
    actualOffsets: [1, 0, 2, 1, 3, 1, 2, 2, 1, 3, 2, 0, 2, 1, 1, 2, 2, 0, 1, 2, 3, 1, 2, 1, 0, 1, 2, 1, 2, 1],
    nextOffsets: [4, 3, 4, 3, 3, 3, 2, 4, 3, 4, 3, 3, 4, 2, 3, 3, 2, 3, 3, 4, 3, 3, 4, 2, 3, 2, 3, 2, 3, 2]
  }
];

const buildRecord = (train, year, month, day, idx) => {
  const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const dayName = getDayName(year, month, day);
  const actualKollupitiya = addMinutes(train.scheduledKollupitiya, train.actualOffsets[idx]);
  const minutesDeviationKollupitiya = train.actualOffsets[idx];

  const actualNextStationTime = addMinutes(actualKollupitiya, train.nextOffsets[idx]);
  const minutesDeviationNextStation = train.nextOffsets[idx];
  const nextStationTime = addMinutes(train.scheduledKollupitiya, 5);

  return {
    date: dateString,
    day: dayName,
    trainNumber: train.trainNumber,
    trainName: train.trainName,
    direction: train.direction,
    line: train.line,
    nextStation: train.nextStation,
    trainType: train.trainType,
    scheduledKollupitiya: train.scheduledKollupitiya,
    actualKollupitiya,
    minutesDeviationKollupitiya,
    nextStationTime,
    actualNextStationTime,
    minutesDeviationNextStation,
    notes: 'Imported full month data'
  };
};

const generateRecords = () => {
  const records = [];
  trains.forEach((train) => {
    for (let day = 1; day <= 30; day++) {
      const idx = day - 1;
      records.push(buildRecord(train, 2026, 4, day, idx));
    }
  });
  return records;
};

const seedFullMonth = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await TrainDetection.deleteMany({ trainNumber: { $in: trains.map((t) => t.trainNumber) } });
    console.log('Cleared existing relevant detection records');

    const allRecords = generateRecords();
    const result = await TrainDetection.insertMany(allRecords);
    console.log(`Inserted ${result.length} train detection records`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding full month data:', error.message);
    process.exit(1);
  }
};

seedFullMonth();
