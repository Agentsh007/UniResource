const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'server/.env') });

const Announcement = require('./server/models/Announcement');
const Feedback = require('./server/models/Feedback');

const cleanData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Delete all routines
        const result = await Announcement.deleteMany({ type: 'ROUTINE' });
        console.log(`Deleted ${result.deletedCount} routines.`);

        // Delete all feedback potentially linked to them
        const fbResult = await Feedback.deleteMany({ target_announcement: { $ne: null } });
        console.log(`Deleted ${fbResult.deletedCount} peer review feedback items.`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

cleanData();
