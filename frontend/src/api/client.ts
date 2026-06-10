import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import type { TodoItem, DailyBriefingData, TaskStatus } from '../types/api.types';

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

function dl(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

const MOCK_TASKS: TodoItem[] = [
  { id: 'mock-1', title: 'Review PR #42 — OAuth2 refresh-token flow', source: 'jira',    priority: 'urgent', status: 'todo',        deadline: dl(0),  confidence: 92, reason: "Imperative assignment: 'please review before EOD'",          group_label: 'Project Alpha — Auth Module' },
  { id: 'mock-2', title: 'Reply to client XYZ — delivery status update',  source: 'email',   priority: 'normal', status: 'in_progress', deadline: dl(1),  confidence: 85, reason: "'Need update by Friday' detected in email body" },
  { id: 'mock-3', title: 'Update authentication documentation',            source: 'meeting', priority: 'low',    status: 'todo',        deadline: dl(3),  confidence: 74, reason: "Action item from sprint retro: 'Linh to update auth docs'",  group_label: 'Project Alpha — Auth Module' },
  { id: 'mock-4', title: 'Fix bug #103 — null pointer in session middleware', source: 'jira', priority: 'urgent', status: 'todo',       deadline: dl(0),  confidence: 91, reason: 'High-priority regression blocking 3 downstream PRs',         group_label: 'Project Alpha — Auth Module' },
  { id: 'mock-5', title: 'Review sprint 4 planning document',              source: 'teams',   priority: 'normal', status: 'done',        deadline: dl(-1), done_date: dl(-1), confidence: 79, reason: 'Review request with time constraint — standup at 10:00' },
  { id: 'mock-6', title: 'Prepare demo slides for May release',            source: 'email',   priority: 'urgent', status: 'in_progress', deadline: dl(0),  confidence: 93, reason: "'Demo by EOD Friday' request from stakeholder",              group_label: 'Client XYZ — May Release' },
  { id: 'mock-7', title: 'Update API versioning docs in Confluence',       source: 'jira',    priority: 'low',    status: 'done',        deadline: dl(-3), done_date: dl(-4), confidence: 68, reason: 'Linked to completed JIRA ticket ALPHA-38' },
  { id: 'mock-8', title: 'Schedule platform migration kickoff with infra', source: 'meeting', priority: 'normal', status: 'todo',        deadline: dl(5),  confidence: 83, reason: 'Explicit action item assigned to PM in architecture review' },
  { id: 'mock-9', title: 'Acknowledge high CPU alert on prod-worker-03',   source: 'slack',   priority: 'urgent', status: 'done',        deadline: dl(0),  done_date: dl(0), confidence: 99, reason: 'PagerDuty-level alert — unacknowledged 90 min' },
];

const MOCK_BRIEFING: DailyBriefingData = {
  total_tasks: 9,
  breakdown: { urgent: 4, normal: 3, low: 2 },
  overload_risk: 'high',
  estimated_effort_hours: 9,
  recommendation: 'Three urgent tasks due today — start with the PR review, then the session middleware bug before EOD.',
};

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
    if (USE_MOCK_MODE) {
      let result = MOCK_TASKS;
      if (filters?.priority) result = result.filter((t) => t.priority === filters.priority);
      if (filters?.source)   result = result.filter((t) => t.source   === filters.source);
      if (filters?.status)   result = result.filter((t) => t.status   === filters.status);
      return result;
    }
    const params = new URLSearchParams();
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.source)   params.append('source',   filters.source);
    if (filters?.status)   params.append('status',   filters.status);
    const queryString = params.toString();
    const response = await axiosInstance.get(queryString ? `/tasks?${queryString}` : '/tasks');
    return (response.data.data || []).map(normalizeTask);
  },

  async getDailyBriefing(): Promise<DailyBriefingData> {
    if (USE_MOCK_MODE) return MOCK_BRIEFING;
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
