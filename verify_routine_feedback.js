const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, 'server/.env') });

const API_URL = 'http://localhost:5000/api';

async function run() {
    try {
        console.log('--- STARTING ROUTINE FEEDBACK VERIFICATION ---');

        // 1. Create Two Teachers
        console.log('\n[1] Setup Teachers');
        // We assume 'teacher1@example.com' and 'teacher2@example.com' exist or we create them.
        // For simplicity, let's login as 'chairman' to create them if they don't exist?
        // Or assume seed data.
        // Let's iterate: register-public for teacher 1 and 2.

        const registerTeacher = async (name, email) => {
            // Try login first
            const login = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: 'password123' })
            });
            if (login.ok) return (await login.json()).token;

            // Register
            console.log(`    Registering ${name}...`);
            const reg = await fetch(`${API_URL}/auth/register-public`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: name,
                    email,
                    password: 'password123',
                    role: 'TEACHER',
                    secret_code: process.env.FACULTY_SECRET,
                    department: 'CSE'
                })
            });
            if (!reg.ok) throw new Error(`Failed to register ${name}: ${await reg.text()}`);
            const data = await reg.json();
            return data.token;
        };

        const t1Token = await registerTeacher('Teacher One', 't1@example.com');
        const t2Token = await registerTeacher('Teacher Two', 't2@example.com');
        console.log('    Teachers Ready');

        // 2. Teacher 1 Posts Routine
        console.log('\n[2] Teacher 1 Posts Routine');
        const postRes = await fetch(`${API_URL}/announcements`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': t1Token },
            body: JSON.stringify({
                title: 'Routine for Feedback',
                content: 'Please review this routine',
                type: 'ROUTINE',
                status: 'PENDING_FEEDBACK'
            })
        });
        if (!postRes.ok) throw new Error(await postRes.text());
        const routine = await postRes.json();
        console.log(`    Routine Posted: ${routine._id}`);

        // 3. Teacher 2 Views Peer Review & Submits Feedback
        console.log('\n[3] Teacher 2 Submits Feedback');
        const fbRes = await fetch(`${API_URL}/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': t2Token },
            body: JSON.stringify({
                message_content: 'Looks good but change Tuesday',
                target_announcement: routine._id,
                is_anonymous: false
            })
        });
        if (!fbRes.ok) throw new Error(await fbRes.text());
        console.log('    Feedback Submitted');

        // 4. Teacher 1 Fetches Feedback (Simulate Dashboard Load)
        console.log('\n[4] Teacher 1 Checks Feedback');
        // The dashboard calls: /feedback?target_announcement_id=...
        const checkRes = await fetch(`${API_URL}/feedback?target_announcement_id=${routine._id}`, {
            headers: { 'x-auth-token': t1Token }
        });
        if (!checkRes.ok) throw new Error(await checkRes.text());
        const feedbacks = await checkRes.json();

        const myFeedback = feedbacks.find(f => f.from_user.email === 't2@example.com' || f.message_content.includes('Tuesday'));

        if (myFeedback) {
            console.log('    PASS: Feedback retrieved successfully.');
            console.log(`    Content: "${myFeedback.message_content}" from ${myFeedback.from_user.full_name}`);
        } else {
            console.error('    FAIL: Feedback NOT found in response.');
            console.log('    Response:', JSON.stringify(feedbacks, null, 2));
        }

        console.log('\n--- VERIFICATION COMPLETE ---');
    } catch (err) {
        console.error('CRITICAL ERROR:', err);
    }
}

run();
