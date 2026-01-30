const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, 'server/.env') });

const API_URL = 'http://localhost:5000/api';

async function verify() {
    try {
        console.log('1. Login as Chairman...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'chairman@example.com', password: 'password123' })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.statusText}`);
        const { token } = await loginRes.json();
        console.log('   Success.');

        // 2. Fetch Teachers
        console.log('2. Fetching Teachers...');
        const teachersRes = await fetch(`${API_URL}/auth/teachers`, { headers: { 'x-auth-token': token } });
        const teachers = await teachersRes.json();
        const teacher = teachers.find(t => t.role === 'TEACHER');

        if (!teacher) {
            console.log('   No available teacher found to promote.');
            // Check if we can demote a CC to test?
            return;
        }
        console.log(`   Found Teacher: ${teacher.full_name} (${teacher.email})`);

        // 3. Fetch Batches
        console.log('3. Fetching Batches...');
        const batchesRes = await fetch(`${API_URL}/batches`, { headers: { 'x-auth-token': token } });
        const batches = await batchesRes.json();
        if (batches.length === 0) {
            console.log('   No batches found.');
            return;
        }
        const batch = batches[0];
        console.log(`   Found Batch: ${batch.batch_name}`);

        // 4. Assign CC
        console.log('4. Promoting Teacher to CC...');
        const assignRes = await fetch(`${API_URL}/auth/assign-cc`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
            body: JSON.stringify({ teacher_id: teacher._id, batch_id: batch._id })
        });
        if (!assignRes.ok) throw new Error('Assign Failed');
        console.log('   Promoted.');

        // 5. Verify Role Change
        console.log('5. Verifying Role Change...');
        const verifyRes = await fetch(`${API_URL}/auth/teachers`, { headers: { 'x-auth-token': token } });
        const updatedTeachers = await verifyRes.json();
        const upgraded = updatedTeachers.find(t => t._id === teacher._id);

        if (upgraded.role === 'CC' && upgraded.assigned_batch._id === batch._id) {
            console.log('   ✔ Role is CC. Batch assigned.');
        } else {
            console.error('   ❌ Failed: Role is ' + upgraded.role);
        }

        // 6. Remove CC
        console.log('6. Revoking CC Access...');
        const removeRes = await fetch(`${API_URL}/auth/remove-cc`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
            body: JSON.stringify({ teacher_id: teacher._id })
        });
        if (!removeRes.ok) throw new Error('Remove Failed');
        console.log('   Revoked.');

        // 7. Verify Reversion
        console.log('7. Verifying Reversion...');
        const revertRes = await fetch(`${API_URL}/auth/teachers`, { headers: { 'x-auth-token': token } });
        const finalTeachers = await revertRes.json();
        const reverted = finalTeachers.find(t => t._id === teacher._id);

        if (reverted.role === 'TEACHER' && !reverted.assigned_batch) {
            console.log('   ✔ Role is TEACHER. Batch unassigned.');
        } else {
            console.error('   ❌ Failed: Role is ' + reverted.role);
        }

    } catch (err) {
        console.error('Error:', err);
    }
}

verify();
