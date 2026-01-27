import axios from 'axios';

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

// Set the AUTH token for any request
instance.interceptors.request.use(function (config) {
    const token = localStorage.getItem('token');
    config.headers['x-auth-token'] = token ? token : '';
    return config;
});

export default instance;
