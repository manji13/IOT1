const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const transferRecords = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;

        const targetCount = await db.collection('train_detection_records').countDocuments();
        if (targetCount > 0) {
            console.log(`Target collection already contains ${targetCount} records. Nothing to transfer.`);
            process.exit(0);
        }

        const sourceDocs = await db.collection('traindetections').find().toArray();
        if (!sourceDocs.length) {
            console.log('No source documents found in traindetections.');
            process.exit(0);
        }

        const docsToInsert = sourceDocs.map(({ _id, ...rest }) => rest);
        const result = await db.collection('train_detection_records').insertMany(docsToInsert);

        console.log(`Copied ${result.insertedCount} records to train_detection_records.`);
        process.exit(0);
    } catch (error) {
        console.error('Error transferring records:', error.message);
        process.exit(1);
    }
};

transferRecords();
