import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const EMAIL = 'coord_1769359784043@test.com';
const PASSWORD = 'password';

const checkSpecificUser = async () => {
    console.log(`--- Checking User: ${EMAIL} ---`);
    try {
        console.log('... Attempting Login ...');
        const res = await axios.post(`${API_URL}/auth/login-staff`, {
            email: EMAIL,
            password: PASSWORD
        });

        if (res.data.token) {
            console.log('✅ Login Successful!');
            console.log('User Role:', 'COORDINATOR'); // Assuming based on email prefix
            console.log('Token received.');
        } else {
            console.error('❌ Login Failed: No token returned');
        }

    } catch (err) {
        console.error('❌ Login Failed:', err.response?.data?.msg || err.message);
        if (err.response?.status === 400) {
            console.log('Hint: The user might not exist anymore if the DB was cleared, or the password might be different.');
        }
    }
};

checkSpecificUser();
