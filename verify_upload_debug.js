const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api';
let token = '';

async function login() {
    try {
        const res = await axios.post(`${API_URL}/auth/login`, {
            email: 'teacher@example.com', // Assuming this user exists from previous context
            password: 'password123'
        });
        token = res.data.token;
        console.log('Login successful');
        return true;
    } catch (err) {
        console.error('Login failed:', err.response?.data || err.message);
        return false;
    }
}

async function uploadFile() {
    try {
        // Create a dummy PDF file
        const filePath = path.join(__dirname, 'test_debug.pdf');
        fs.writeFileSync(filePath, 'This is a test PDF content');

        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));
        // We'll skip target_batch_id for now or fetch one if needed, 
        // but the route allows it to be optional or handles it.
        // Actually the route tries to fetch batch if ID is present.
        // Let's see if we can get a batch first.

        let batchId = '';
        try {
            const batches = await axios.get(`${API_URL}/batches`, { headers: { 'x-auth-token': token } });
            if (batches.data.length > 0) {
                batchId = batches.data[0]._id;
                formData.append('target_batch_id', batchId);
                console.log('Using batch:', batches.data[0].batch_name);
            }
        } catch (e) {
            console.log('Could not fetch batches, proceeding without batch ID');
        }

        const res = await axios.post(`${API_URL}/documents/upload`, formData, {
            headers: {
                ...formData.getHeaders(),
                'x-auth-token': token
            },
            params: { target_batch_id: batchId }
        });

        console.log('Upload Result Status:', res.status);
        console.log('File Path:', res.data.file_path);
        console.log('Cloudinary ID:', res.data.cloudinary_id);

        // Cleanup
        fs.unlinkSync(filePath);

    } catch (err) {
        console.error('Upload failed:', err.response?.data || err.message);
    }
}

async function run() {
    if (await login()) {
        await uploadFile();
    }
}

run();
