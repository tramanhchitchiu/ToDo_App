import React, { useState } from 'react';
import styles from './Briefing.module.css';
import { DailyBriefing } from '../components/DailyBriefing';
import type { TaskSource, TaskPriority, TaskStatus } from '../types/api.types';

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
  const [loading, setLoading] = useState(false);

  function handleRegenerate() {
    setLoading(true);
    setTimeout(() => setLoading(false), 1400);
  }

  return (
    <>
      <DailyBriefing
        name="Linh"
        text={BRIEFING_TEXT}
        generatedAt="Monday, 25 May 2026, 08:00"
        onRegenerate={handleRegenerate}
        loading={loading}
      />

      <TaskSection title="Today's Tasks" tasks={MOCK_TODAY} />
      <TaskSection title="Tomorrow's Tasks" tasks={MOCK_TOMORROW} />
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
  const src = SOURCE_STYLE[task.source];
  const sta = STATUS_STYLE[task.status];
  const priColor = PRIORITY_COLOR[task.priority];
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
