const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, 'server/.env') });

const API_URL = 'http://localhost:5000/api';

async function run() {
    try {
        console.log('--- STARTING VERIFICATION ---');

        // 1. LOGIN as Chairman
        console.log('\n[1] Chairman Actions');
        const chairRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'chairman@example.com', password: 'password123' })
        });
        const chairData = await chairRes.json();
        const chairToken = chairData.token;
        console.log('    Login: OK');

        // Post Notice (Global)
        const noticeRes = await fetch(`${API_URL}/announcements`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': chairToken },
            body: JSON.stringify({ title: 'System Maint', content: 'Server restart imminent', type: 'NOTICE' })
        });
        const notice = await noticeRes.json();
        console.log(`    Post Notice: ${noticeRes.ok ? 'OK' : 'FAIL'} (${notice.title})`);

        // Get Teachers to promote
        const teachersRes = await fetch(`${API_URL}/auth/teachers`, { headers: { 'x-auth-token': chairToken } });
        const teachers = await teachersRes.json();
        const teacher = teachers.find(t => t.role === 'TEACHER');

        // Get Batch
        const batchesRes = await fetch(`${API_URL}/batches`, { headers: { 'x-auth-token': chairToken } });
        const batches = await batchesRes.json();
        const batch = batches[0];

        if (teacher && batch) {
            console.log(`    Promoting ${teacher.full_name} to CC for ${batch.batch_name}`);
            const promoteRes = await fetch(`${API_URL}/auth/assign-cc`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': chairToken },
                body: JSON.stringify({ teacher_id: teacher._id, batch_id: batch._id })
            });
            console.log(`    Promotion: ${promoteRes.ok ? 'OK' : 'FAIL'}`);
        } else {
            console.log('    Skipping promotion (Missing teacher or batch)');
        }

        // 2. LOGIN as Teacher
        console.log('\n[2] Teacher/CC Actions');
        const teachRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'teacher@example.com', password: 'password123' })
        });
        const teachData = await teachRes.json();
        const teachToken = teachData.token;
        console.log(`    Login: OK (Role: ${teachData.user.role})`);

        if (teachData.user.role === 'CC') {
            // Post Announcement (Batch Specific)
            const annRes = await fetch(`${API_URL}/announcements`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': teachToken },
                body: JSON.stringify({
                    title: 'Class Cancelled',
                    content: 'No class today',
                    type: 'ANNOUNCEMENT',
                    target_batch: batch._id
                })
            });
            console.log(`    Post Announcement: ${annRes.ok ? 'OK' : 'FAIL'}`);
        } else {
            console.log('    Skipping Announcement (User is not CC yet? Ensure server restarted)');
        }

        // 3. CLEANUP (Revoke CC and Delete Notice)
        console.log('\n[3] Cleanup');
        if (teacher && batch) {
            const revokeRes = await fetch(`${API_URL}/auth/remove-cc`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': chairToken },
                body: JSON.stringify({ teacher_id: teacher._id })
            });
            console.log(`    Revoke CC: ${revokeRes.ok ? 'OK' : 'FAIL'}`);
        }

        if (notice._id) {
            const delRes = await fetch(`${API_URL}/announcements/${notice._id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': chairToken }
            });
            console.log(`    Delete Notice: ${delRes.ok ? 'OK' : 'FAIL'}`);
        }

        console.log('\n--- VERIFICATION COMPLETE ---');

    } catch (err) {
        console.error('CRITICAL ERROR:', err);
    }
}

run();
