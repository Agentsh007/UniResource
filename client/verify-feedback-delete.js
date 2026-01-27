import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const EMAIL = 'coord_1769359784043@test.com'; // Existing coord
const PASSWORD = 'password';

const runTest = async () => {
    console.log('--- Feedback Delete Verification ---');

    try {
        // 1. Login
        console.log('1. Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login-staff`, {
            email: EMAIL,
            password: PASSWORD
        });
        const token = loginRes.data.token;
        console.log('   [PASS] Logged in as Coordinator');

        // 2. Mock a Student (Batch) to send feedback
        // checking if we can create a batch or use existing
        // We will just read existing feedback and try to delete one?
        // Risky if empty. Let's create a feedback first?
        // But we need a BATCH token to send feedback.
        // Let's list batches, pick one, login as batch, send feedback.

        // Simpler: Just Fetch Feedback. If any exist, delete the first one.
        // If none, warn user.

        console.log('2. Fetching Feedback...');
        const feedRes = await axios.get(`${API_URL}/feedback`, {
            headers: { 'x-auth-token': token }
        });
        const feedbacks = feedRes.data;
        console.log(`   Found ${feedbacks.length} messages.`);

        if (feedbacks.length === 0) {
            console.log('   [WARN] No feedback to test delete. Please send one first.');
            return;
        }

        const targetId = feedbacks[0]._id;
        console.log(`3. Deleting Feedback ID: ${targetId}...`);

        try {
            await axios.delete(`${API_URL}/feedback/${targetId}`, {
                headers: { 'x-auth-token': token }
            });
            console.log('   [PASS] API returned 200 OK');
        } catch (delErr) {
            console.error('   [FAIL] Delete API Error:', delErr.response?.data || delErr.message);
        }

        // Verify it's gone
        const verifyRes = await axios.get(`${API_URL}/feedback`, {
            headers: { 'x-auth-token': token }
        });
        const stillExists = verifyRes.data.find(f => f._id === targetId);
        if (!stillExists) {
            console.log('   [PASS] Confirmed deleted from DB');
        } else {
            console.error('   [FAIL] Item still exists in DB');
        }

    } catch (err) {
        console.error('❌ TEST FAILED:', err.response?.data || err.message);
    }
};

runTest();
