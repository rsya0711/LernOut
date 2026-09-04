import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('learnout_access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for unified error formatting
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    let message = 'Terjadi kesalahan pada server';

    if (data?.message) {
      if (Array.isArray(data.message)) {
        message = data.message.join(', ');
      } else {
        message = data.message;
      }
    } else if (error.message) {
      message = error.message;
    }

    // Auto cleanup if token expired
    if (error.response?.status === 401) {
      localStorage.removeItem('learnout_access_token');
      localStorage.removeItem('learnout_refresh_token');
    }

    return Promise.reject(new Error(message));
  },
);
