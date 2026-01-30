const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'server/.env') });

const API_URL = 'http://localhost:5000/api';

async function run() {
    try {
        console.log('Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'teacher@example.com',
                password: 'password123'
            })
        });

        if (!loginRes.ok) {
            throw new Error(`Login failed: ${loginRes.statusText}`);
        }

        const { token } = await loginRes.json();
        console.log('Login successful.');

        console.log('Fetching uploads...');
        const docsRes = await fetch(`${API_URL}/documents/my-uploads`, {
            headers: { 'x-auth-token': token }
        });

        const docs = await docsRes.json();
        console.log('--- Document Data ---');
        console.log(JSON.stringify(docs, null, 2));

        console.log('\nFetching Batches...');
        const batchesRes = await fetch(`${API_URL}/batches`, {
            headers: { 'x-auth-token': token }
        });
        const batches = await batchesRes.json();
        console.log('--- Active Batches ---');
        console.log(JSON.stringify(batches, null, 2));

    } catch (err) {
        console.error('Error:', err);
    }
}

run();
