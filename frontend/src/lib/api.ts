import axios from 'axios';

// Setup guide sets VITE_API_BASE_URL=http://localhost:3000/api
// Fallback also includes /api so there is never a double-append
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api').replace(/\/+$/, '');

// Single shared axios instance — import this everywhere, delete config/api.ts
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),

  register: (data: {
    email: string;
    businessName: string;
    phone: string;
    password: string;
    gstNumber?: string;
  }) => apiClient.post('/auth/register', data),

  me: () => apiClient.get('/auth/me'),
};

// Admin API
export const adminApi = {
  getDashboard: () => apiClient.get('/admin/dashboard'),

  getUsers: (params?: { status?: string; plan?: string; search?: string }) =>
    apiClient.get('/admin/users', { params }),

  getUserDetail: (id: string) => apiClient.get(`/admin/users/${id}`),

  approveUser: (id: string) => apiClient.post(`/admin/users/${id}/approve`),
  rejectUser: (id: string) => apiClient.post(`/admin/users/${id}/reject`),
  suspendUser: (id: string) => apiClient.post(`/admin/users/${id}/suspend`),

  changeUserPlan: (id: string, planType: string) =>
    apiClient.post(`/admin/users/${id}/plan`, { planType }),

  getLogs: (params?: {
    userId?: string;
    apiKeyId?: string;     // backend patch recommended below
    endpoint?: string;
    statusCode?: number;
    startDate?: string;    // ISO string recommended
    endDate?: string;      // ISO string recommended
    page?: number;
    limit?: number;
  }) => apiClient.get('/admin/logs', { params }),
};


// B2B API
export const b2bApi = {
  getDashboard: () => apiClient.get('/b2b/dashboard'),
  getApiKeys: () => apiClient.get('/b2b/keys'),
  createApiKey: (name: string) => apiClient.post('/b2b/keys', { name }),
  revokeApiKey: (id: string) => apiClient.post(`/b2b/keys/${id}/revoke`),
  getUsage: (days?: number) => apiClient.get('/b2b/usage', { params: { days } }),
  getProfile: () => apiClient.get('/b2b/profile'),
  updateProfile: (data: {
    businessName?: string;
    phone?: string;
    gstNumber?: string;
  }) => apiClient.put('/b2b/profile', data),
};