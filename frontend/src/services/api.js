import axios from 'axios';

const API_BASE = '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('strokecare_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
}, (error) => Promise.reject(error));

// Auth Endpoints
export const login = async (email, password) => {
  const response = await apiClient.post('/auth/login/json', { email, password });
  return response.data;
};

export const register = async (userData) => {
  const response = await apiClient.post('/auth/register', userData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await apiClient.put('/auth/profile', profileData);
  return response.data;
};

// Screening Endpoints (Sections 30 & 31)
export const analyzeScreeningImage = async (formData) => {
  const response = await apiClient.post('/screening/image', formData);
  return response.data;
};

export const analyzeScreeningVideo = async (formData) => {
  const response = await apiClient.post('/screening/video', formData);
  return response.data;
};

export const getSampleCases = async () => {
  const response = await apiClient.get('/screening/sample-cases');
  return response.data;
};

export const getAssessments = async (patientId = null, limit = 50) => {
  const params = {};
  if (patientId) params.patient_id = patientId;
  if (limit) params.limit = limit;
  const response = await apiClient.get('/assessments', { params });
  return response.data;
};

export const getAssessmentDetails = async (assessmentId) => {
  const response = await apiClient.get(`/assessments/${assessmentId}`);
  return response.data;
};

export const deleteAssessment = async (assessmentId) => {
  const response = await apiClient.delete(`/assessments/${assessmentId}`);
  return response.data;
};

// Personal Baseline Endpoints (Section 23 & 30)
export const setPersonalBaseline = async (assessmentId, notes = '') => {
  const formData = new FormData();
  formData.append('assessment_id', assessmentId);
  if (notes) formData.append('notes', notes);
  const response = await apiClient.post('/baseline', formData);
  return response.data;
};

export const getPersonalBaseline = async (patientId = null) => {
  const params = patientId ? { patient_id: patientId } : {};
  const response = await apiClient.get('/baseline', { params });
  return response.data;
};

// Comparison Endpoints (Section 26 & 30)
export const getAssessmentComparison = async (assessmentAId = null, assessmentBId = null, useBaseline = false) => {
  const params = { use_baseline: useBaseline };
  if (assessmentAId) params.assessment_a_id = assessmentAId;
  if (assessmentBId) params.assessment_b_id = assessmentBId;
  const response = await apiClient.get('/comparison', { params });
  return response.data;
};

// Monitoring Endpoints (Section 25 & 30)
export const getLongitudinalMonitoring = async (patientId = null) => {
  const params = patientId ? { patient_id: patientId } : {};
  const response = await apiClient.get('/monitoring', { params });
  return response.data;
};

// Reports Endpoints (Section 28 & 30)
export const listReports = async () => {
  const response = await apiClient.get('/reports');
  return response.data;
};

export const generatePdfReport = async (assessmentId) => {
  const response = await apiClient.post('/reports', null, { params: { assessment_id: assessmentId } });
  return response.data;
};

// Risk Factor Assessment Endpoints (Cardiovascular / AHA Guidelines)
export const submitRiskAssessment = async (riskData) => {
  const response = await apiClient.post('/risk-factors/assess', riskData);
  return response.data;
};

export const getLatestRiskAssessment = async () => {
  const response = await apiClient.get('/risk-factors/latest');
  return response.data;
};

export const getRiskHistory = async () => {
  const response = await apiClient.get('/risk-factors/history');
  return response.data;
};

// Post-Stroke Recovery Support Endpoints
export const logRecovery = async (recoveryData) => {
  const response = await apiClient.post('/recovery/log', recoveryData);
  return response.data;
};

export const getRecoverySummary = async () => {
  const response = await apiClient.get('/recovery/summary');
  return response.data;
};

export const getScreeningHistory = async (limit = 50) => {
  const res = await getAssessments(null, limit);
  return res.assessments || [];
};

// Doctor Portal Endpoints (Section 27 & 30)
export const getDoctorPatients = async () => {
  const response = await apiClient.get('/doctor/patients');
  return response.data;
};

export const getDoctorPatientDetail = async (patientId) => {
  const response = await apiClient.get(`/doctor/patients/${patientId}`);
  return response.data;
};

// Admin Portal Endpoints (Section 3, 28-32)
export const getAdminDashboard = async () => {
  const response = await apiClient.get('/admin/dashboard');
  return response.data;
};

export const getAdminUsers = async (role = null) => {
  const params = role ? { role } : {};
  const response = await apiClient.get('/admin/users', { params });
  return response.data;
};

export const updateAdminUser = async (userId, payload) => {
  const response = await apiClient.put(`/admin/users/${userId}`, payload);
  return response.data;
};

export const getAdminDoctors = async () => {
  const response = await apiClient.get('/admin/doctors');
  return response.data;
};

export const getAdminModels = async () => {
  const response = await apiClient.get('/admin/models');
  return response.data;
};

export const setAdminActiveModel = async (algorithm) => {
  const response = await apiClient.post('/admin/models/active', { algorithm });
  return response.data;
};

export const getAdminAuditLogs = async (limit = 50) => {
  const response = await apiClient.get('/admin/audit-logs', { params: { limit } });
  return response.data;
};

export default apiClient;
