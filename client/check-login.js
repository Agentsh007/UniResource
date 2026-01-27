import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const checkLogin = async () => {
    console.log('--- Checking Production Login ---');
    try {
        // 1. Health Check
        try {
            await axios.get('http://localhost:5000/');
            console.log('✅ Server is reachable');
        } catch (e) {
            console.error('❌ Server is NOT reachable. Please run "npm start" in server/');
            process.exit(1);
        }

        // 2. Attempt Login (Coordinator)
        // We'll try to login with the manual credentials we might have created, or register a new temp one.
        const testEmail = `login_check_${Date.now()}@test.com`;

        console.log('... Registering temp user for login check ...');
        await axios.post(`${API_URL}/auth/register-staff`, {
            full_name: 'Login Check',
            email: testEmail,
            password: 'password',
            role: 'COORDINATOR',
            secret_code: 'UNI2026'
        });

        console.log('... Attempting Login ...');
        const res = await axios.post(`${API_URL}/auth/login-staff`, {
            email: testEmail,
            password: 'password'
        });

        if (res.data.token) {
            console.log('✅ Login Successful! Token received.');
        } else {
            console.error('❌ Login Failed: No token returned');
        }

    } catch (err) {
        console.error('❌ Login Verification Failed:', err.response?.data?.msg || err.message);
    }
};

checkLogin();
