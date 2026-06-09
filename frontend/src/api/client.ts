import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import type { TodoItem, TaskCandidate, TaskGroup, DailyBriefingData, TaskStatus } from '../types/api.types';

const STATUS_MAP: Record<string, TaskStatus> = {
  pending:     'todo',
  accepted:    'in_progress',
  rejected:    'done',
  todo:        'todo',
  in_progress: 'in_progress',
  done:        'done',
};

const REVERSE_STATUS_MAP: Record<string, string> = {
  todo:        'pending',
  in_progress: 'accepted',
  done:        'rejected',
};

function normalizeTask(raw: any): TodoItem {
  return {
    ...raw,
    deadline: raw.deadline ? raw.deadline.slice(0, 10) : undefined,
    status: STATUS_MAP[raw.status] ?? 'todo',
  };
}

const API_BASE_URL = 'http://localhost:8000';

// Use mock mode by default (for testing and when API token is exhausted)
// To use real API: localStorage.setItem('useMockMode', 'false')
const USE_MOCK_MODE = localStorage.getItem('useMockMode') !== 'false';

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000, // 3 minutes default timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle standard envelope
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
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
   * Run agent pipeline (or mock for testing)
   */
  async runAgent(traceEnabled = true) {
    const endpoint = USE_MOCK_MODE ? '/run-agent-mock' : '/run-agent';
    const timeout = USE_MOCK_MODE ? 30000 : 300000; // 30s for mock, 5min for real
    const response = await axiosInstance.post(endpoint, {
      trace_enabled: traceEnabled,
    }, { timeout });
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
    return (response.data.data || []).map(normalizeTask);
  },

  /**
   * Get daily briefing
   */
  async getDailyBriefing(): Promise<DailyBriefingData> {
    const response = await axiosInstance.get('/daily-briefing');
    return response.data.data;
  },

  /**
   * Update task fields (title, description, status, deadline)
   */
  async patchTask(taskId: string, data: { title?: string; description?: string; status?: TaskStatus; deadline?: string }) {
    const body: Record<string, string> = {};
    if (data.title      !== undefined) body.title       = data.title;
    if (data.description !== undefined) body.description = data.description;
    if (data.status     !== undefined) body.status      = REVERSE_STATUS_MAP[data.status] ?? data.status;
    if (data.deadline   !== undefined) body.deadline    = data.deadline;
    const response = await axiosInstance.patch(`/tasks/${taskId}`, body);
    return normalizeTask(response.data.data);
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
