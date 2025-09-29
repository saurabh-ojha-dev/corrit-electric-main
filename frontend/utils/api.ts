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

const getPhonePeBaseUrl = () => {
  // Use a custom environment variable to control PhonePe environment
  // Set NEXT_PUBLIC_PHONEPE_ENV=production in your .env file for production
  if (process.env.NEXT_PUBLIC_PHONEPE_ENV === 'production') {
    return 'https://api.phonepe.com/apis/identity-manager';
  }

  // Default to sandbox for development/testing
  return 'https://api-preprod.phonepe.com/apis/pg-sandbox';
};

export const API_BASE_URL = getApiBaseUrl();
export const PHONEPE_BASE_URL = getPhonePeBaseUrl();
console.log("check agya h :", PHONEPE_BASE_URL);

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
  VEHICLES: {
    LIST: `${API_BASE_URL}/api/vehicles`,
    CREATE: `${API_BASE_URL}/api/vehicles`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/vehicles/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/api/vehicles/${id}`,
    ASSIGN: (id: string) => `${API_BASE_URL}/api/vehicles/${id}/assign`,
    UNASSIGN: (id: string) => `${API_BASE_URL}/api/vehicles/${id}/unassign`,
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
    MANDATE_STATUS: (id: string) => `${API_BASE_URL}/api/riders/${id}/mandate-status`,
    CHECK_MANDATE: (id: string) => `${API_BASE_URL}/api/riders/${id}/check-mandate`,
    CANCEL_MANDATE: (id: string) => `${API_BASE_URL}/api/riders/${id}/cancel-mandate`,
    DOCUMENTS: (id: string) => `${API_BASE_URL}/api/riders/${id}/documents`,
    STATS: `${API_BASE_URL}/api/riders/stats/overview`,
  },
  PHONEPE: {
    // Authorization (using backend proxy)
    AUTHORIZATION: `${API_BASE_URL}/api/riders/phonepe-auth`,

    // Subscription Management (using backend proxy)
    SUBSCRIPTION_SETUP: `${API_BASE_URL}/api/riders/phonepe-subscription-setup`,
    SUBSCRIPTION_ORDER_STATUS: (merchantOrderId: string) => `${PHONEPE_BASE_URL}/subscriptions/v2/order/${merchantOrderId}/status`,
    SUBSCRIPTION_STATUS: (merchantSubscriptionId: string) => `${PHONEPE_BASE_URL}/subscriptions/v2/${merchantSubscriptionId}/status`,
    SUBSCRIPTION_CANCEL: (merchantSubscriptionId: string) => `${PHONEPE_BASE_URL}/subscriptions/v2/${merchantSubscriptionId}/cancel`,

    // Redemption Management
    REDEMPTION_NOTIFY: `${PHONEPE_BASE_URL}/subscriptions/v2/notify`,
    REDEMPTION_EXECUTE: `${PHONEPE_BASE_URL}/subscriptions/v2/redeem`,
    REDEMPTION_ORDER_STATUS: (merchantOrderId: string) => `${PHONEPE_BASE_URL}/subscriptions/v2/order/${merchantOrderId}/status`,

    // Refund Management
    REFUND: `${PHONEPE_BASE_URL}/payments/v2/refund`,
    REFUND_STATUS: (merchantRefundId: string) => `${PHONEPE_BASE_URL}/payments/v2/refund/${merchantRefundId}/status`,
  },
  AUTOPAY: {
    LIST: `${API_BASE_URL}/api/payments`,
    STATS: `${API_BASE_URL}/api/payments/stats`,
  },
  NOTIFICATIONS: {
    LIST: `${API_BASE_URL}/api/notifications`,
    UNREAD_COUNT: `${API_BASE_URL}/api/notifications/unread-count`,
    DASHBOARD: `${API_BASE_URL}/api/notifications/dashboard`,
    MARK_READ: (id: string) => `${API_BASE_URL}/api/notifications/${id}/read`,
    MARK_UNREAD: (id: string) => `${API_BASE_URL}/api/notifications/${id}/unread`,
    MARK_ALL_READ: `${API_BASE_URL}/api/notifications/mark-all-read`,
    DELETE: (id: string) => `${API_BASE_URL}/api/notifications/${id}`,
    TYPES: `${API_BASE_URL}/api/notifications/types`,
    CREATE_TEST: `${API_BASE_URL}/api/notifications/create-test`,
  }
}

// Axios instance with default configuration
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const phonepeClient = axios.create({
  baseURL: PHONEPE_BASE_URL,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'X-VERIFY': '', // This will be set dynamically for each request
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
