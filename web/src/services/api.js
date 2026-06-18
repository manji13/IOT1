import axios from 'axios';

// Use environment variable for API base URL, fallback to production URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://final-project-backend-psi.vercel.app/api';

const API = axios.create({
    baseURL: API_BASE_URL,
});

// Interceptor to attach token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor for better error handling
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear token if unauthorized
            localStorage.removeItem('token');
        }
        return Promise.reject(error);
    }
);

export default API;
