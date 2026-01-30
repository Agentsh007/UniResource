const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, 'server/.env') });

const API_URL = 'http://localhost:5000/api';

async function run() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'teacher@example.com', password: 'password123' })
        });
        const { token } = await loginRes.json();
        console.log('Login successful.');

        // 2. Get Batches
        const batchesRes = await fetch(`${API_URL}/batches`, { headers: { 'x-auth-token': token } });
        const batches = await batchesRes.json();
        const validBatchId = batches[0]._id;
        console.log(`Using valid Batch ID: ${validBatchId} (${batches[0].batch_name})`);

        // 3. Create dummy file
        const filePath = path.join(__dirname, 'test.txt');
        fs.writeFileSync(filePath, 'Hello World');

        // 4. Upload Function
        const uploadFile = async (batchId, label) => {
            const formData = new FormData();
            const blob = new Blob([fs.readFileSync(filePath)], { type: 'text/plain' });
            formData.append('file', blob, 'test.txt');
            if (batchId) formData.append('target_batch_id', batchId);

            console.log(`Uploading (${label})... to ID: ${batchId}`);
            // Note: client uses query param ?target_batch_id=... but formData should work too as route checks both
            const res = await fetch(`${API_URL}/documents/upload`, {
                method: 'POST',
                headers: { 'x-auth-token': token }, // FormData sets boundary automatically, don't set Content-Type
                body: formData
            });
            const data = await res.json();
            console.log(`Upload (${label}) result:`, res.status, data.target_batch);
        };

        // 5. Test Case A: Valid Batch
        await uploadFile(validBatchId, 'VALID');

        // 6. Test Case B: Stale/Invalid Batch (Simulating frontend bug)
        // Using a fake mongo object ID
        await uploadFile('507f1f77bcf86cd799439011', 'INVALID/STALE');

        // 7. Check My Uploads
        console.log('\nFetching My Uploads...');
        const docsRes = await fetch(`${API_URL}/documents/my-uploads`, { headers: { 'x-auth-token': token } });
        const docs = await docsRes.json();

        docs.forEach(d => {
            const batchName = d.target_batch ? d.target_batch.batch_name : 'NULL';
            console.log(`File: ${d.original_filename} | Batch: ${batchName} | Group: ${d.target_batch ? d.target_batch.batch_name : 'Uncategorized'}`);
        });

        // Cleanup
        fs.unlinkSync(filePath);

    } catch (err) {
        console.error('Error:', err);
    }
}

run();
