import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const runSeed = async () => {
    try {
        // 1. Need a Batch Token to send feedback
        // Let's create a temp batch or login to existing
        console.log('--- Seeding Feedback ---');

        // Register/Login a batch
        const batchName = `FeedbackGen_${Date.now()}`;
        const batchUser = `fb_gen_${Date.now()}`;

        // Need Coordinator to create batch first (ironic)
        // Login default coord
        const coordRes = await axios.post(`${API_URL}/auth/login-staff`, {
            email: 'coord_1769359784043@test.com',
            password: 'password'
        });
        const coordToken = coordRes.data.token;

        const createRes = await axios.post(`${API_URL}/batches`, {
            batch_name: batchName,
            batch_username: batchUser,
            batch_password: '123'
        }, { headers: { 'x-auth-token': coordToken } });

        const batchId = createRes.data._id;
        console.log('Batch Created:', batchUser);

        // Login as Batch
        const batchLogin = await axios.post(`${API_URL}/auth/login-batch`, {
            username: batchUser,
            password: '123'
        });
        const batchToken = batchLogin.data.token;

        // Send Feedback
        await axios.post(`${API_URL}/feedback`, {
            message_content: "This is a TEST feedback to checking delete button."
        }, { headers: { 'x-auth-token': batchToken } });

        console.log('✅ Feedback Seeding Complete');

    } catch (err) {
        console.error('Seed Failed:', err.message);
    }
};

runSeed();
