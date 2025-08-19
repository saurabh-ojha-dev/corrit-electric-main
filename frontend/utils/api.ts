// API configuration utility
const getApiBaseUrl = () => {
  // Check for environment variable first
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Check if we're in production on Vercel
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    // If no env var is set in production, you can hardcode your Render URL here as fallback
    // Replace this with your actual Render backend URL
    const renderUrl = 'https://corrit-electric-main.onrender.com';
    console.warn('NEXT_PUBLIC_API_URL not found, using hardcoded Render URL:', renderUrl);
    return renderUrl;
  }
  
  // Development fallback
  return 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();

// Enhanced debugging
console.log('=== API Configuration Debug ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_API_URL env var:', process.env.NEXT_PUBLIC_API_URL);
console.log('Final API_BASE_URL:', API_BASE_URL);
console.log('Window object available:', typeof window !== 'undefined');
console.log('================================');

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    PROFILE: `${API_BASE_URL}/api/auth/profile`,
  },
  BIKES: {
    LIST: `${API_BASE_URL}/api/bikes`,
    CREATE: `${API_BASE_URL}/api/bikes`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/bikes/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/api/bikes/${id}`,
  },
  RENTALS: {
    LIST: `${API_BASE_URL}/api/rentals`,
    CREATE: `${API_BASE_URL}/api/rentals`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/rentals/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/api/rentals/${id}`,
  },
}

// Axios instance with default configuration
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminProfile')
      window.location.href = '/admin/auth/login'
    }
    return Promise.reject(error)
  }
)
