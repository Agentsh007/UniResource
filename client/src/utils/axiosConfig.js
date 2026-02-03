import axios from 'axios';

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api'
});

// Set the AUTH token for any request
instance.interceptors.request.use(function (config) {
    const token = localStorage.getItem('token');
    config.headers['x-auth-token'] = token ? token : '';
    return config;
});

// Response Interceptor for Caching
instance.interceptors.response.use(
    (response) => {
        // Cache successful GET requests
        if (response.config.method === 'get') {
            const cacheKey = response.config.url;
            try {
                localStorage.setItem(`cache_${cacheKey}`, JSON.stringify({
                    data: response.data,
                    timestamp: Date.now()
                }));
            } catch (e) {
                console.warn('LocalStorage Cache Failed', e);
            }
        }
        return response;
    },
    (error) => {
        // If network error (no response), try to serve from cache
        if (!error.response && error.config.method === 'get') {
            const cacheKey = error.config.url;
            const cached = localStorage.getItem(`cache_${cacheKey}`);
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    // Return cached data as if it were a successful response
                    console.log('Serving from cache:', cacheKey);
                    return Promise.resolve({
                        data: parsed.data,
                        status: 200,
                        statusText: 'OK (Cached)',
                        headers: {},
                        config: error.config,
                        isCached: true
                    });
                } catch (e) {
                    console.error('Cache parse error', e);
                }
            }
        }
        return Promise.reject(error);
    }
);

export default instance;
