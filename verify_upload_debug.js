const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

// Test Config
const API_URL = 'http://localhost:5000/api';
const TEACHER_EMAIL = 'teacher@example.com'; // Replace with a valid teacher email
const TEACHER_PASSWORD = 'password';         // Replace with valid password
const TEST_FILE_PATH = 'test_upload.txt';   // Create a dummy file

// Create dummy file
fs.writeFileSync(TEST_FILE_PATH, 'This is a test document content.');

async function testUpload() {
    try {
        console.log('1. Logging in as Teacher...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: TEACHER_EMAIL,
            password: TEACHER_PASSWORD
        });
        const token = loginRes.data.token;
        console.log('   Login successful. Token obtained.');

        // Get a batch ID first (optional, or send without batch if allowed? Schema says target_batch is ref, might be required?)
        // Document Schema: target_batch: { type: ObjectId, ref: 'Batch' }
        // Let's assume we need a batch ID.
        // We can create a dummy batch or fetch one.
        // For now, let's try upload without batch ID or with a hardcoded one if we know it.
        // Or better, fetch batches first. But Teacher can't fetch batches? 
        // Wait, Teacher Dashboard fetches batches? 
        // Let's try to upload with NO batch ID first (if allowed).

        console.log('2. Uploading Document...');
        const formData = new FormData();
        formData.append('file', fs.createReadStream(TEST_FILE_PATH));
        // formData.append('target_batch_id', 'some_id');

        const uploadRes = await axios.post(`${API_URL}/documents/upload`, formData, {
            headers: {
                'x-auth-token': token,
                ...formData.getHeaders()
            }
        });

        console.log('   Upload successful:', uploadRes.data);

    } catch (err) {
        console.error('   Upload Failed:', err.response ? err.response.data : err.message);
    } finally {
        // Cleanup
        if (fs.existsSync(TEST_FILE_PATH)) fs.unlinkSync(TEST_FILE_PATH);
    }
}

testUpload();
