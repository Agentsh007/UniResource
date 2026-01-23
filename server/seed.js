require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Teacher = require('./models/Teacher');
const Batch = require('./models/Batch');
const Resource = require('./models/Resource');
const Message = require('./models/Message');

const teachersData = [
    { name: "Prof. Charles Xavier", email: "xavier@xmen.edu", password: "mind", department: "Mutant Studies" },
    { name: "Tony Stark", email: "tony@stark.com", password: "iron", department: "Engineering" },
    { name: "Bruce Wayne", email: "bruce@wayne.com", password: "bat", department: "Criminal Justice" },
    { name: "Albus Dumbledore", email: "headmaster@hogwarts.edu", password: "magic", department: "Magic" },
    { name: "Walter White", email: "heisenberg@chemistry.com", password: "cook", department: "Chemistry" }
];

const batchesData = [
    { name: "Mutants Class 2024", username: "mutants24", password: "xmen" },
    { name: "Avengers Trainees", username: "avengers", password: "assemble" },
    { name: "Justice League Juniors", username: "jlj", password: "justice" },
    { name: "Gryffindor 1st Year", username: "gryffindor", password: "lion" },
    { name: "Chemistry 101", username: "chem101", password: "blue" }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding...');

        // Clear existing data (Optional, but good for clean testing)
        await Teacher.deleteMany({});
        await Batch.deleteMany({});
        await Resource.deleteMany({});
        await Message.deleteMany({});
        console.log('Old data cleared.');

        // Create Teachers
        const createdTeachers = [];
        for (const t of teachersData) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(t.password, salt);
            const teacher = await Teacher.create({ ...t, password: hashedPassword });
            createdTeachers.push(teacher);
            console.log(`Created Teacher: ${t.name}`);
        }

        // Create Batches (Assigning each batch to a corresponding teacher for simplicity)
        const createdBatches = [];
        for (let i = 0; i < batchesData.length; i++) {
            const b = batchesData[i];
            const teacher = createdTeachers[i];
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(b.password, salt);

            const batch = await Batch.create({
                ...b,
                password: hashedPassword,
                createdBy: teacher._id
            });
            createdBatches.push(batch);
            console.log(`Created Batch: ${b.name} (by ${teacher.name})`);
        }

        // Create Resources
        // 1. Global Resource by Xavier
        await Resource.create({
            title: "School Rules & Safety",
            description: "Standard protocols for the semester.",
            type: "PDF",
            visibility: "GLOBAL",
            uploadedBy: createdTeachers[0]._id
        });

        // 2. Private Resource for Mutants by Xavier
        await Resource.create({
            title: "Cerebro Manual",
            description: "How to operate the machine safely.",
            type: "TEXT",
            visibility: "BATCH",
            targetBatch: createdBatches[0]._id,
            uploadedBy: createdTeachers[0]._id
        });

        // 3. Private Resource for Avengers by Tony
        await Resource.create({
            title: "Mark 85 Schematics",
            description: "Top secret blueprints.",
            type: "CODE",
            visibility: "BATCH",
            targetBatch: createdBatches[1]._id,
            uploadedBy: createdTeachers[1]._id
        });

        console.log('Sample Resources Created.');

        // Create Messages
        // Tony messages Bruce
        await Message.create({
            sender: createdTeachers[1]._id,
            recipient: createdTeachers[2]._id,
            content: "Hey Bruce, funding secure?",
            isRead: false
        });
        console.log('Sample Messages Created.');

        console.log('SEEDING COMPLETE! 🚀');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
