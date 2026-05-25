export type TaskSource = 'jira' | 'email' | 'meeting' | 'teams' | 'slack';
export type TaskPriority = 'urgent' | 'normal' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  source: TaskSource;
  priority: TaskPriority;
  status: TaskStatus;
  confidence?: number;
  reason?: string;
  deadline?: string;
  done_date?: string;
  assignee?: string;
  group_label?: string;
}

export interface TaskCandidate {
  id: string;
  title: string;
  description?: string;
  source: TaskSource;
  priority: TaskPriority;
  confidence: number;
  reason: string;
  deadline?: string;
  group_id?: string;
  invalidation_flag?: boolean;
}

export interface TaskGroup {
  id: string;
  context_label: string;
  narrative_summary: string;
  candidates: TaskCandidate[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  source: 'jira' | 'email' | 'meeting' | 'teams' | 'slack';
  priority: 'urgent' | 'normal' | 'low';
  confidence: number;
  reason: string;
  deadline?: string;
  assignee?: string;
  group_label?: string;
}

export interface DailyBriefingData {
  total_tasks: number;
  breakdown: {
    urgent: number;
    normal: number;
    low: number;
  };
  overload_risk: 'low' | 'medium' | 'high';
  estimated_effort_hours: number;
  recommendation: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}
