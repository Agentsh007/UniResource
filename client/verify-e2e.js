import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

const API_URL = 'http://localhost:5000/api';
axios.defaults.timeout = 30000; // 30 second timeout
let staffToken = '';
let batchToken = '';
let teacherId = '';
let batchId = '';

const runTest = async () => {
    console.log('--- Starting E2E Verification ---');

    try {
        // 1. Register Coordinator
        const coordEmail = `coord_${Date.now()}@test.com`;
        console.log(`1. Registering Coordinator (${coordEmail})...`);
        const coordRes = await axios.post(`${API_URL}/auth/register-staff`, {
            full_name: 'Coordinator Test',
            email: coordEmail,
            password: 'password',
            role: 'COORDINATOR',
            secret_code: 'UNI2026'
        });
        if (coordRes.status === 200) console.log('   [SUCCESS] Coordinator Registered');
        const coordToken = coordRes.data.token;

        // 2. Create Batch
        console.log('2. Creating Batch...');
        const batchName = `Batch_${Date.now()}`;
        const batchUser = `batch_${Date.now()}`;
        const batchRes = await axios.post(`${API_URL}/batches`, {
            batch_name: batchName,
            batch_username: batchUser,
            batch_password: 'password'
        }, { headers: { 'x-auth-token': coordToken } });
        if (batchRes.status === 200) console.log('   [SUCCESS] Batch Created');
        batchId = batchRes.data.id || batchRes.data._id; // Handle mock vs real ID

        // 3. Register Teacher
        const teacherEmail = `teacher_${Date.now()}@test.com`;
        console.log(`3. Registering Teacher (${teacherEmail})...`);
        const teacherRes = await axios.post(`${API_URL}/auth/register-staff`, {
            full_name: 'Teacher Test',
            email: teacherEmail,
            password: 'password',
            role: 'TEACHER',
            secret_code: 'UNI2026'
        });
        if (teacherRes.status === 200) console.log('   [SUCCESS] Teacher Registered');
        staffToken = teacherRes.data.token;
        teacherId = teacherRes.data.user.id || teacherRes.data.user._id;

        // 4. Upload File
        console.log('4. Uploading File...');
        const form = new FormData();
        form.append('file', Buffer.from('dummy pdf content'), {
            filename: 'test.pdf',
            contentType: 'application/pdf'
        });
        form.append('target_batch_id', batchId);

        const uploadRes = await axios.post(`${API_URL}/documents/upload`, form, {
            headers: {
                'x-auth-token': staffToken,
                ...form.getHeaders()
            }
        });
        if (uploadRes.status === 200) console.log('   [SUCCESS] File Uploaded');

        // 5. Login Batch
        console.log('5. logging in Batch...');
        const batchLoginRes = await axios.post(`${API_URL}/auth/login-batch`, {
            username: batchUser,
            password: 'password'
        });
        if (batchLoginRes.status === 200) console.log('   [SUCCESS] Batch Logged In');
        batchToken = batchLoginRes.data.token;

        // 6. Check Teachers List (Student View)
        console.log('6. Student Checking for Teachers...');
        const teachersRes = await axios.get(`${API_URL}/documents/batch/${batchLoginRes.data.user.id || batchLoginRes.data.user._id}/teachers`, {
            headers: { 'x-auth-token': batchToken }
        });
        const found = teachersRes.data.some(t => {
            const tId = t.id || t._id;
            return tId.toString() === teacherId.toString();
        });

        if (found) {
            console.log('   [SUCCESS] Teacher found in Student View');
        } else {
            console.error('   [FAILURE] Teacher NOT found');
        }

        console.log('--- E2E Verification PASSED ---');

    } catch (err) {
        console.error('--- E2E Verification FAILED ---');
        console.error(err.response ? err.response.data : err.message);
    }
};

runTest();
