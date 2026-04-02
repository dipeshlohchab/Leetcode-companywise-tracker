import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach JWT
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('dsa_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('dsa_token');
      localStorage.removeItem('dsa_user');
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Questions
export const questionsAPI = {
  getAll: (params?: { company?: string; difficulty?: string; search?: string; page?: number; limit?: number }) =>
    api.get('/questions', { params }),
  getById: (id: string) => api.get(`/questions/${id}`),
  getCompanies: () => api.get('/companies'),
};

// Progress
export const progressAPI = {
  update: (data: { questionId: string; status: string; notes?: string }) =>
    api.post('/progress', data),
  getStats: (params?: { company?: string }) =>
    api.get('/progress/stats', { params }),
  getCompanyProgress: () => api.get('/progress/companies'),
  getActivity: () => api.get('/progress/activity'),
  getDailyStats: () => api.get('/progress/daily'),
  toggleBookmark: (questionId: string) =>
    api.post('/progress/bookmark', { questionId }),
  getBookmarks: () => api.get('/progress/bookmarks'),
};

// Users
export const userAPI = {
  updateProfile: (data: { name?: string; avatar?: string }) =>
    api.patch('/users/profile', data),
  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch('/users/password', data),
};

export default api;
