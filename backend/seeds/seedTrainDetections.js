const mongoose = require('mongoose');
const dotenv = require('dotenv');
const TrainDetection = require('../models/TrainDetectionModel');
const trainDetectionData = require('./trainDetectionSeeds');

dotenv.config();

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clear existing data (optional - comment out if you want to keep existing data)
        // await TrainDetection.deleteMany({});
        // console.log('Cleared existing data');

        // Insert seed data
        const result = await TrainDetection.insertMany(trainDetectionData);
        console.log(`✓ Successfully inserted ${result.length} train detection records`);

        // Show statistics
        const count = await TrainDetection.countDocuments();
        const trainStats = await TrainDetection.aggregate([
            {
                $group: {
                    _id: '$trainNumber',
                    trainName: { $first: '$trainName' },
                    count: { $sum: 1 }
                }
            }
        ]);

        console.log(`\n📊 Total records: ${count}`);
        console.log('\n📋 Records by Train:');
        trainStats.forEach(stat => {
            console.log(`   Train ${stat._id} (${stat.trainName}): ${stat.count} records`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        process.exit(1);
    }
};

seedDatabase();
