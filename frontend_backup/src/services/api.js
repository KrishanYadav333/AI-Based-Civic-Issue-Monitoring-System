import axios from 'axios';
import { config } from '../config/config';

// Create axios instance
const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: config.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      message: 'An unexpected error occurred',
      status: 500,
      originalError: error
    };

    if (error.response) {
      // Server responded with a status code outside 2xx
      customError.message = error.response.data.message || 'Server error';
      customError.status = error.response.status;

      // Handle 401 Unauthorized globally if needed (e.g., redirect to login)
      if (error.response.status === 401) {
        // Optional: Dispatch logout action or emit event
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // window.location.href = '/login'; // Use with caution in SPA
      }
    } else if (error.request) {
      // Request was made but no response received
      customError.message = 'Network error. Please check your connection.';
      customError.status = 0;
    }

    return Promise.reject(customError);
  }
);

export default api;
