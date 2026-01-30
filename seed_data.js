const mongoose = require('./server/node_modules/mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, 'server/.env') });

// Load Models
const User = require('./server/models/User');
const Batch = require('./server/models/Batch');

const seedData = async () => {
    try {
        console.log('🌱 Seeding Dummy Data...');
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected.');

        // 1. Create Chairman
        const salt = await bcrypt.genSalt(10);
        const hashedChairmanPassword = await bcrypt.hash('password123', salt);

        const chairman = await User.create({
            full_name: 'Chairman User',
            email: 'chairman@example.com',
            password: hashedChairmanPassword,
            role: 'CHAIRMAN',
            department: 'CSE'
        });
        console.log('✔ Created Chairman: chairman@example.com / password123');

        // 2. Create Batch (by Chairman)
        // Batch passwords are usually plain text in this specific app based on previous context 
        // (or hashed? Model ref says just String. Let's assume plain or handle consistently.
        // Wait, verifying Batch.js: batch_password is required. 
        // In verify_chairman.js or similar, checking if it is hashed usually.
        // Let's hash it to be safe as it authentication related, or check logic.
        // Actually, let's look at how batch is created in routes usually. 
        // Assuming plain for now to ensure simplicity or hashing if auth uses bcrypt compare.
        // Let's hash it standardly.)
        const hashedBatchPassword = await bcrypt.hash('batch123', salt);

        const batch1 = await Batch.create({
            batch_name: 'CSE-21-TEST',
            batch_username: 'cse21test',
            batch_password: hashedBatchPassword,
            created_by: chairman._id
        });
        console.log('✔ Created Batch: CSE-24-TEST (user: cse24test / pass: batch123)');
        const batch2 = await Batch.create({
            batch_name: 'ICE-21-TEST',
            batch_username: 'ice21test',
            batch_password: hashedBatchPassword,
            created_by: chairman._id
        });
        console.log('✔ Created Batch: CSE-24-TEST (user: ice21test / pass: batch123)');

        // 3. Create Teacher
        const hashedTeacherPassword = await bcrypt.hash('password123', salt);
        const teacher = await User.create({
            full_name: 'Teacher User',
            email: 'teacher@example.com',
            password: hashedTeacherPassword,
            role: 'TEACHER',
            department: 'CSE'
        });
        console.log('✔ Created Teacher: teacher@example.com / password123');

        // 4. Create another Teacher (Acting as CC) ? 
        // Optional, but user asked for "some dummy...". Let's update `seed_data` to be robust.

        console.log('\nSeed Complete! 🚀');
        console.log('------------------------------------------------');
        console.log('Chairman Login: chairman@example.com / password123');
        console.log('Teacher Login:  teacher@example.com / password123');
        console.log('Batch Login:    cse24test            / batch123');
        console.log('------------------------------------------------');

        process.exit(0);
    } catch (err) {
        if (err.code === 11000) {
            console.log('⚠ Data already exists! (Duplicate Key Error)');
            console.log('Run `npm run reset-system` first if you want a fresh start.');
            process.exit(0);
        }
        console.error('Seeding Failed:', err);
        process.exit(1);
    }
};

seedData();
