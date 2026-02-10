const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, 'server/.env') });

const API_URL = 'http://localhost:5000/api';

async function run() {
    try {
        console.log('--- STARTING APPROVAL WORKFLOW VERIFICATION ---');

        // 1. LOGIN as Chairman (to create Operator if needed)
        console.log('\n[1] Chairman Setup');
        const chairRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'chairman@example.com', password: 'password123' })
        });

        if (!chairRes.ok) {
            console.error('Chairman login failed. Please seed data first.');
            return;
        }

        const chairData = await chairRes.json();
        const chairToken = chairData.token;
        console.log('    Chairman Login: OK');

        // 2. Ensure COMPUTER_OPERATOR exists
        let operatorToken = null;
        console.log('\n[2] Operator Setup');

        // Try to login first
        const opLoginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'operator@example.com', password: 'password123' })
        });

        if (opLoginRes.ok) {
            const opData = await opLoginRes.json();
            operatorToken = opData.token;
            console.log('    Operator Login: OK');
        } else {
            console.log('    Operator not found. Creating one via Chairman...');

            const createRes = await fetch(`${API_URL}/auth/create-staff`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': chairToken },
                body: JSON.stringify({
                    full_name: 'Test Operator',
                    email: 'operator@example.com',
                    password: 'password123',
                    role: 'COMPUTER_OPERATOR',
                    department: 'CSE'
                })
            });

            if (createRes.ok) {
                console.log('    Operator Created: OK');
                // Login now
                const login2 = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: 'operator@example.com', password: 'password123' })
                });
                const opData2 = await login2.json();
                operatorToken = opData2.token;
                console.log('    Operator Login: OK');
            } else {
                console.error('    Failed to create operator:', await createRes.text());
                return;
            }
        }

        // 3. Operator Posts a Notice
        console.log('\n[3] Operator Posts Notice');
        const TIMESTAMP = Date.now();
        const noticeTitle = `Test Notice ${TIMESTAMP}`;

        const postRes = await fetch(`${API_URL}/announcements`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': operatorToken },
            body: JSON.stringify({
                title: noticeTitle,
                content: 'This is a test notice awaiting approval.',
                type: 'NOTICE'
            })
        });

        if (!postRes.ok) {
            console.error('    Failed to post notice:', await postRes.text());
            return;
        }

        const notice = await postRes.json();
        console.log(`    Notice Posted: ID ${notice._id}`);
        console.log(`    Status in DB: ${notice.status}`);

        if (notice.status !== 'PENDING_APPROVAL') {
            console.error('    FAIL: Status should be PENDING_APPROVAL');
        } else {
            console.log('    PASS: Status is PENDING_APPROVAL');
        }

        // 4. Verify Public Visibility (Should fail)
        console.log('\n[4] Public Visibility Check (Pre-Approval)');
        const publicRes1 = await fetch(`${API_URL}/announcements/public`);
        const publicNotices1 = await publicRes1.json();
        const found1 = publicNotices1.find(n => n._id === notice._id);

        if (found1) {
            console.error('    FAIL: Notice is visible to public before approval!');
        } else {
            console.log('    PASS: Notice is NOT visible to public.');
        }

        // 5. Chairman Approves Notice
        console.log('\n[5] Chairman Approves Notice');
        const approveRes = await fetch(`${API_URL}/announcements/${notice._id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': chairToken },
            body: JSON.stringify({ status: 'APPROVED' })
        });

        if (!approveRes.ok) {
            console.error('    Failed to approve:', await approveRes.text());
            return;
        }

        const approvedNotice = await approveRes.json();
        console.log(`    Approval Status: ${approvedNotice.status}`);

        // 6. Verify Public Visibility (Should succeed)
        console.log('\n[6] Public Visibility Check (Post-Approval)');
        const publicRes2 = await fetch(`${API_URL}/announcements/public`);
        const publicNotices2 = await publicRes2.json();
        const found2 = publicNotices2.find(n => n._id === notice._id);

        if (found2) {
            console.log('    PASS: Notice is now visible to public.');
        } else {
            console.error('    FAIL: Notice is STILL NOT visible to public!');
        }

        // 7. Cleanup
        console.log('\n[7] Cleanup');
        await fetch(`${API_URL}/announcements/${notice._id}`, {
            method: 'DELETE',
            headers: { 'x-auth-token': chairToken }
        });
        console.log('    Test notice deleted.');

        console.log('\n--- VERIFICATION COMPLETE ---');

    } catch (err) {
        console.error('CRITICAL ERROR:', err);
    }
}

run();
