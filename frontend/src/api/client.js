import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/v1` 
  : '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('placement_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired/invalid and not already on auth page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('placement_token');
        localStorage.removeItem('placement_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API modules
export const authApi = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  getMe: () => apiClient.get('/auth/me'),
  changePassword: (data) => apiClient.post('/auth/change-password', data),
};

export const studentsApi = {
  getAll: (params) => apiClient.get('/students', { params }),
  getMyProfile: () => apiClient.get('/students/me'),
  updateMyProfile: (data) => apiClient.put('/students/me', data),
  uploadResume: (formData) => apiClient.post('/students/me/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getById: (id) => apiClient.get(`/students/${id}`),
  updateByAdmin: (id, data) => apiClient.put(`/students/${id}`, data),
  delete: (id) => apiClient.delete(`/students/${id}`),
  getResumeUrl: (filename) => `${API_BASE_URL}/students/resume/${filename}`,
};

export const companiesApi = {
  getAll: (params) => apiClient.get('/companies', { params }),
  getById: (id) => apiClient.get(`/companies/${id}`),
  create: (data) => apiClient.post('/companies', data),
  update: (id, data) => apiClient.put(`/companies/${id}`, data),
  delete: (id) => apiClient.delete(`/companies/${id}`),
};

export const drivesApi = {
  getAll: (params) => apiClient.get('/drives', { params }),
  getEligible: () => apiClient.get('/drives/eligible'),
  getById: (id) => apiClient.get(`/drives/${id}`),
  create: (data) => apiClient.post('/drives', data),
  update: (id, data) => apiClient.put(`/drives/${id}`, data),
  delete: (id) => apiClient.delete(`/drives/${id}`),
};

export const applicationsApi = {
  apply: (driveId) => apiClient.post(`/applications/apply/${driveId}`),
  getMyApplications: () => apiClient.get('/applications/my-applications'),
  getByDrive: (driveId, params) => apiClient.get(`/applications/drive/${driveId}`, { params }),
  getAll: (params) => apiClient.get('/applications', { params }),
  updateStatus: (id, data) => apiClient.patch(`/applications/${id}/status`, data),
  batchUpdateStatus: (data) => apiClient.post('/applications/batch-status-update', data),
};

export const analyticsApi = {
  getAdminSummary: () => apiClient.get('/analytics/admin-summary'),
  getStudentSummary: () => apiClient.get('/analytics/student-summary'),
};
