import axios, { AxiosInstance } from 'axios';
import type { TodoItem, TaskCandidate, TaskGroup, DailyBriefingData } from '../types/api.types';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle standard envelope
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API Client
export const apiClient = {
  /**
   * Health check
   */
  async getHealth() {
    const response = await axiosInstance.get('/health');
    return response.data;
  },

  /**
   * Run agent pipeline
   */
  async runAgent(traceEnabled = true) {
    const response = await axiosInstance.post('/run-agent', {
      trace_enabled: traceEnabled,
    });
    return response.data;
  },

  /**
   * Get all accepted tasks
   */
  async getTasks(filters?: { priority?: string; source?: string; status?: string }) {
    const params = new URLSearchParams();
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.source) params.append('source', filters.source);
    if (filters?.status) params.append('status', filters.status);

    const queryString = params.toString();
    const url = queryString ? `/tasks?${queryString}` : '/tasks';

    const response = await axiosInstance.get(url);
    return response.data.data || [];
  },

  /**
   * Get daily briefing
   */
  async getDailyBriefing(): Promise<DailyBriefingData> {
    const response = await axiosInstance.get('/daily-briefing');
    return response.data.data;
  },

  /**
   * Accept a task
   */
  async acceptTask(taskId: string, reason: string, notes = '') {
    const response = await axiosInstance.post(`/tasks/${taskId}/accept`, {
      reason,
      notes,
    });
    return response.data;
  },

  /**
   * Reject a task
   */
  async rejectTask(taskId: string, reason: string, notes = '') {
    const response = await axiosInstance.post(`/tasks/${taskId}/reject`, {
      reason,
      notes,
    });
    return response.data;
  },

  /**
   * Get decision statistics
   */
  async getStats() {
    const response = await axiosInstance.get('/stats');
    return response.data;
  },

  /**
   * Get reasoning trace
   */
  async getTrace() {
    const response = await axiosInstance.get('/trace');
    return response.data;
  },
};

export default apiClient;
