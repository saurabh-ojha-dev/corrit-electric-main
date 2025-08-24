// API configuration utility
const getApiBaseUrl = () => {
  // Force localhost for development regardless of env var
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000';
  }
  
  // Check for environment variable for production
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Production fallback
  return 'https://corrit-electric-main.onrender.com';
};

export const API_BASE_URL = getApiBaseUrl();

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    PROFILE: `${API_BASE_URL}/api/auth/profile`,
    UPDATE_PROFILE: `${API_BASE_URL}/api/auth/profile`,
    CHANGE_PASSWORD: `${API_BASE_URL}/api/auth/change-password`,
  },
  ADMIN: {
    LIST: `${API_BASE_URL}/api/admin`,
    CREATE: `${API_BASE_URL}/api/admin`,
    GET: (id: string) => `${API_BASE_URL}/api/admin/${id}`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/admin/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/api/admin/${id}`,
    SUSPEND: (id: string) => `${API_BASE_URL}/api/admin/${id}`,
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
  RIDERS: {
    LIST: `${API_BASE_URL}/api/riders`,
    CREATE: `${API_BASE_URL}/api/riders`,
    GET: (id: string) => `${API_BASE_URL}/api/riders/${id}`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/riders/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/api/riders/${id}`,
    VERIFY: (id: string) => `${API_BASE_URL}/api/riders/${id}/verify`,
    MANDATE: (id: string) => `${API_BASE_URL}/api/riders/${id}/mandate`,
    DOCUMENTS: (id: string) => `${API_BASE_URL}/api/riders/${id}/documents`,
    STATS: `${API_BASE_URL}/api/riders/stats/overview`,
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
