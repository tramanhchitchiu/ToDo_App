import React, { useState, useEffect } from 'react';
import styles from './Briefing.module.css';
import { DailyBriefing } from '../components/DailyBriefing';
import { apiClient } from '../api/client';
import type { TaskSource, TaskPriority, TaskStatus, TodoItem } from '../types/api.types';

// ─── types ────────────────────────────────────────────────────────────────────

interface BriefingTask {
  id: string;
  title: string;
  source: TaskSource;
  priority: TaskPriority;
  status: TaskStatus;
  deadlineLabel: string;
  deadlineUrgent: boolean;
}

// ─── mock data (Phase 1) ──────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MOCK_TODAY: BriefingTask[] = [
  {
    id: 'b1',
    title: 'Review PR #42 for authentication module',
    source: 'jira',
    priority: 'urgent',
    status: 'todo',
    deadlineLabel: 'Today 18:00',
    deadlineUrgent: true,
  },
  {
    id: 'b2',
    title: 'Reply to client delivery status email',
    source: 'email',
    priority: 'normal',
    status: 'in_progress',
    deadlineLabel: 'Today EOD',
    deadlineUrgent: false,
  },
  {
    id: 'b3',
    title: 'Record team standup notes',
    source: 'teams',
    priority: 'low',
    status: 'done',
    deadlineLabel: 'Today 10:00',
    deadlineUrgent: false,
  },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MOCK_TOMORROW: BriefingTask[] = [
  {
    id: 'b4',
    title: 'Fix null pointer bug #103',
    source: 'jira',
    priority: 'urgent',
    status: 'todo',
    deadlineLabel: 'Tomorrow',
    deadlineUrgent: false,
  },
  {
    id: 'b5',
    title: 'Update authentication documentation',
    source: 'meeting',
    priority: 'low',
    status: 'todo',
    deadlineLabel: 'Fri 27 May',
    deadlineUrgent: false,
  },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const BRIEFING_TEXT =
  'You have 3 tasks due today and 2 tasks due tomorrow. Your top priority is reviewing PR #42 before 18:00 — the auth module release depends on it. Don\'t forget to reply to the client email for Project XYZ before end of day. You\'ve got this!';

// ─── style maps ───────────────────────────────────────────────────────────────

const SOURCE_STYLE: Record<TaskSource, { bg: string; color: string; label: string }> = {
  jira:    { bg: 'rgba(59,130,246,0.15)',  color: '#3B82F6', label: 'Jira'    },
  email:   { bg: 'rgba(139,92,246,0.15)', color: '#8B5CF6', label: 'Email'   },
  meeting: { bg: 'rgba(20,184,166,0.15)', color: '#14B8A6', label: 'Meeting' },
  teams:   { bg: 'rgba(99,102,241,0.15)', color: '#6366F1', label: 'Teams'   },
  slack:   { bg: 'rgba(16,185,129,0.15)', color: '#10B981', label: 'Slack'   },
};

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  urgent: '#EF4444',
  normal: '#F59E0B',
  low:    '#10B981',
};

const STATUS_STYLE: Record<TaskStatus, { bg: string; color: string; label: string }> = {
  todo:        { bg: 'rgba(156,163,175,0.15)', color: '#9CA3AF', label: 'Todo'        },
  in_progress: { bg: 'rgba(59,130,246,0.15)',  color: '#3B82F6', label: 'In Progress' },
  done:        { bg: 'rgba(16,185,129,0.15)',  color: '#10B981', label: 'Done'        },
};

// ─── component ────────────────────────────────────────────────────────────────

export function Briefing() {
  const [briefing, setBriefing] = useState<any>(null);
  const [tasks, setTasks] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const TODAY = new Date().toISOString().slice(0, 10);
  const TOMORROW = new Date(new Date(TODAY + 'T00:00:00').getTime() + 86400000).toISOString().slice(0, 10);

  function formatDeadlineLabel(deadline?: string): string {
    if (!deadline) return 'No deadline';
    if (deadline === TODAY) return 'Today';
    if (deadline === TOMORROW) return 'Tomorrow';
    const d = new Date(deadline + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [briefingData, tasksData] = await Promise.all([
          apiClient.getDailyBriefing(),
          apiClient.getTasks(),
        ]);
        setBriefing(briefingData);
        setTasks(tasksData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load briefing');
        setBriefing(null);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  async function handleRegenerate() {
    setLoading(true);
    try {
      const briefingData = await apiClient.getDailyBriefing();
      setBriefing(briefingData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate briefing');
    } finally {
      setLoading(false);
    }
  }

  const todayTasks: BriefingTask[] = tasks
    .filter((t) => t.deadline === TODAY)
    .map((t) => ({
      id: t.id,
      title: t.title,
      source: t.source,
      priority: t.priority,
      status: t.status,
      deadlineLabel: formatDeadlineLabel(t.deadline),
      deadlineUrgent: true,
    }));

  const tomorrowTasks: BriefingTask[] = tasks
    .filter((t) => t.deadline === TOMORROW)
    .map((t) => ({
      id: t.id,
      title: t.title,
      source: t.source,
      priority: t.priority,
      status: t.status,
      deadlineLabel: formatDeadlineLabel(t.deadline),
      deadlineUrgent: false,
    }));

  const generatedAt = briefing?.timestamp
    ? new Date(briefing.timestamp).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Now';

  if (error) {
    return (
      <div style={{ padding: '20px', color: '#EF4444', textAlign: 'center' }}>
        <p>❌ {error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '12px',
            padding: '8px 16px',
            background: '#F26522',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <DailyBriefing
        name="Linh"
        text={briefing?.recommendation || BRIEFING_TEXT}
        generatedAt={generatedAt}
        onRegenerate={handleRegenerate}
        loading={loading}
      />

      {!loading && <TaskSection title="Today's Tasks" tasks={todayTasks} />}
      {!loading && <TaskSection title="Tomorrow's Tasks" tasks={tomorrowTasks} />}
    </>
  );
}

// ─── TaskSection ─────────────────────────────────────────────────────────────

function TaskSection({ title, tasks }: { title: string; tasks: BriefingTask[] }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        <span className={styles.countBadge}>{tasks.length}</span>
      </div>
      <div className={styles.taskList}>
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

// ─── TaskRow ─────────────────────────────────────────────────────────────────

function TaskRow({ task }: { task: BriefingTask }) {
  const src = SOURCE_STYLE[task.source] || { bg: 'rgba(156,163,175,0.15)', color: '#9CA3AF', label: 'Unknown' };
  const sta = STATUS_STYLE[task.status] || { bg: 'rgba(156,163,175,0.15)', color: '#9CA3AF', label: 'Unknown' };
  const priColor = PRIORITY_COLOR[task.priority] || '#9CA3AF';
  const isDone = task.status === 'done';

  return (
    <div className={styles.taskRow}>
      <span
        className={styles.priorityDot}
        style={{ backgroundColor: priColor }}
      />
      <span className={`${styles.taskTitle}${isDone ? ` ${styles.taskTitleDone}` : ''}`}>
        {task.title}
      </span>
      <span
        className={styles.sourceBadge}
        style={{ background: src.bg, color: src.color }}
      >
        {src.label}
      </span>
      <span
        className={`${styles.deadline} ${task.deadlineUrgent ? styles.deadlineUrgent : styles.deadlineNormal}`}
      >
        {task.deadlineLabel}
      </span>
      <span
        className={styles.statusChip}
        style={{ background: sta.bg, color: sta.color }}
      >
        {sta.label}
      </span>
      <span className={styles.arrowIcon}>→</span>
    </div>
  );
}

export default Briefing;
