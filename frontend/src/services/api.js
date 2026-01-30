import axios from 'axios';

// Get API URL from environment variables or use default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK === 'true' || false; // Using real backend

// Create axios instance with defaults
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication Service
export const authService = {
  login: async (username, password) => {
    try {
      const response = await api.post('/api/auth/login', { username, password });
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/api/auth/logout');
      localStorage.removeItem('authToken');
    } catch (error) {
      // Still clear token even if request fails
      localStorage.removeItem('authToken');
      throw error;
    }
  },

  refreshToken: async () => {
    try {
      const response = await api.post('/api/auth/refresh');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Issue Service
export const issueService = {
  getIssues: async (filters = {}) => {
    try {
      if (USE_MOCK_DATA) {
        // Return empty for now - will be populated by Redux slice with mock data
        return { issues: [], total: 0 };
      }
      
      const response = await api.get('/issues', { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getIssueById: async (id) => {
    try {
      const response = await api.get(`/issues/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createIssue: async (issueData) => {
    try {
      const response = await api.post('/issues', issueData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateIssue: async (id, data) => {
    try {
      const response = await api.put(`/issues/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteIssue: async (id) => {
    try {
      const response = await api.delete(`/issues/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  acceptIssue: async (id) => {
    try {
      const response = await api.post(`/issues/${id}/accept`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  resolveIssue: async (id, resolutionData) => {
    try {
      const response = await api.post(`/issues/${id}/resolve`, resolutionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  addComment: async (issueId, comment) => {
    try {
      const response = await api.post(`/issues/${issueId}/comments`, comment);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  uploadImage: async (issueId, image, imageType = 'resolution') => {
    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('imageType', imageType);
      const response = await api.post(`/issues/${issueId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// User Service
export const userService = {
  getUsers: async (filters = {}) => {
    try {
      const response = await api.get('/users', { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUserById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Ward Service
export const wardService = {
  getWards: async () => {
    try {
      const response = await api.get('/wards');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getWardById: async (id) => {
    try {
      const response = await api.get(`/wards/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  locateWard: async (latitude, longitude) => {
    try {
      const response = await api.post('/wards/locate', { latitude, longitude });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Analytics Service
export const analyticsService = {
  getDashboardStats: async () => {
    try {
      const response = await api.get('/dashboard/admin/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getHeatmapData: async (filters = {}) => {
    try {
      const response = await api.get('/dashboard/admin/heatmap', { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getEngineerPerformance: async (engineerId) => {
    try {
      const response = await api.get(`/analytics/engineer/${engineerId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getWardStatistics: async (wardId) => {
    try {
      const response = await api.get(`/analytics/ward/${wardId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  exportReport: async (reportType, filters = {}) => {
    try {
      const response = await api.get('/analytics/export', {
        params: { reportType, ...filters },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Export default api instance for custom requests
export default api;

