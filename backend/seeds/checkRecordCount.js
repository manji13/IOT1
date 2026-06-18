const mongoose = require('mongoose');
require('dotenv').config();
const TrainDetection = require('../models/TrainDetectionModel');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const count = await TrainDetection.countDocuments();
    console.log('Total records now:', count);
    const stats = await TrainDetection.aggregate([
      { $group: { _id: '$trainNumber', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    console.log(JSON.stringify(stats, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
