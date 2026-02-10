const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Batch = require('./models/Batch');
const Announcement = require('./models/Announcement');

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clear existing data (optional, but good for clean state)
        // await User.deleteMany({});
        // await Batch.deleteMany({});
        // await Announcement.deleteMany({});
        // console.log('Cleared existing data');

        // 1. Create Chairman
        let chairman = await User.findOne({ email: 'chairman@test.com' });
        if (!chairman) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password', salt);
            chairman = new User({
                full_name: 'Chairman User',
                email: 'chairman@test.com',
                password: hashedPassword,
                role: 'CHAIRMAN',
                department: 'CSE'
            });
            await chairman.save();
            console.log('Created Chairman');
        } else {
            console.log('Chairman already exists');
        }

        // 2. Create Teacher
        let teacher = await User.findOne({ email: 'teacher@test.com' });
        if (!teacher) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password', salt);
            teacher = new User({
                full_name: 'Teacher User',
                email: 'teacher@test.com',
                password: hashedPassword,
                role: 'TEACHER',
                department: 'CSE'
            });
            await teacher.save();
            console.log('Created Teacher');
        } else {
            console.log('Teacher already exists');
        }

        // 3. Create Batch
        let batch = await Batch.findOne({ batch_username: 'CSE-24' });
        if (!batch) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password', salt);
            batch = new Batch({
                batch_name: 'CSE-24',
                batch_username: 'CSE-24',
                batch_password: hashedPassword,
                created_by: chairman._id
            });
            await batch.save();
            console.log('Created Batch CSE-24');
        } else {
            console.log('Batch CSE-24 already exists');
        }

        // 4. Create Announcements

        // a. Routine Pending Approval (Teacher -> Chairman)
        const routinePending = new Announcement({
            title: 'Routine for Final Approval',
            content: 'Please approve this routine.',
            author: teacher._id,
            type: 'ROUTINE',
            status: 'PENDING_APPROVAL',
            file_url: 'https://res.cloudinary.com/demo/image/upload/v1/sample.pdf' // Dummy URL
        });
        await routinePending.save();
        console.log('Created Routine Pending Approval');

        // b. Routine Approved (Teacher -> All/Batch)
        const routineApproved = new Announcement({
            title: 'Approved Routine',
            content: 'This routine is approved and visible.',
            author: teacher._id,
            type: 'ROUTINE',
            status: 'APPROVED',
            file_url: 'https://res.cloudinary.com/demo/image/upload/v1/sample.pdf'
        });
        await routineApproved.save();
        console.log('Created Approved Routine');

        // c. Class Update (Teacher -> Batch)
        const classUpdate = new Announcement({
            title: 'Test Update: Class Cancelled',
            content: 'No class tomorrow.',
            author: teacher._id,
            type: 'ANNOUNCEMENT',
            status: 'APPROVED', // Auto-approved
            target_batch: batch._id
        });
        await classUpdate.save();
        console.log('Created Class Update');

        console.log('Seeding complete');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
