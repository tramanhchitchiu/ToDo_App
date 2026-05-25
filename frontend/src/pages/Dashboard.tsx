import React, { useMemo, useState } from 'react';
import styles from './Dashboard.module.css';
import type { TodoItem, TaskSource, TaskPriority, TaskStatus } from '../types/api.types';

// ─── mock data (Phase 1) ──────────────────────────────────────────────────────

const TODAY = '2026-05-25';

const MOCK_ITEMS: TodoItem[] = [
  {
    id: '1',
    title: 'Review PR #42 for authentication module',
    source: 'jira',
    priority: 'urgent',
    status: 'todo',
    deadline: '2026-05-25',
    confidence: 92,
    reason: "Imperative assignment: 'please review before EOD'",
    group_label: 'Project Alpha — Auth Module',
  },
  {
    id: '2',
    title: 'Reply to client delivery status email',
    source: 'email',
    priority: 'normal',
    status: 'in_progress',
    deadline: '2026-05-26',
    confidence: 85,
    reason: "'Need by Friday' deadline signal detected",
  },
  {
    id: '3',
    title: 'Update authentication documentation',
    source: 'meeting',
    priority: 'low',
    status: 'todo',
    deadline: '2026-05-27',
    confidence: 74,
    reason: "Action item in meeting transcript: 'Linh to update docs'",
    group_label: 'Project Alpha — Auth Module',
  },
  {
    id: '4',
    title: 'Fix bug #103 — null pointer exception',
    source: 'jira',
    priority: 'urgent',
    status: 'todo',
    deadline: '2026-05-25',
    confidence: 88,
    reason: 'High-priority bug blocking PR merge',
    group_label: 'Project Alpha — Auth Module',
  },
  {
    id: '5',
    title: 'Review sprint 4 planning document',
    source: 'teams',
    priority: 'normal',
    status: 'done',
    deadline: '2026-05-26',
    confidence: 79,
    reason: 'Meeting action item: review before planning session',
  },
  {
    id: '6',
    title: 'Prepare demo for client XYZ — May release',
    source: 'email',
    priority: 'urgent',
    status: 'in_progress',
    deadline: '2026-05-25',
    confidence: 91,
    reason: "'Demo by EOD Friday' request from stakeholder",
  },
  {
    id: '7',
    title: 'Update API versioning docs in Confluence',
    source: 'jira',
    priority: 'low',
    status: 'done',
    deadline: '2026-05-24',
    confidence: 68,
    reason: 'Linked to completed JIRA ticket ALPHA-38',
  },
];

// ─── color maps ───────────────────────────────────────────────────────────────

const SOURCE_STYLE: Record<TaskSource, { bg: string; color: string; label: string }> = {
  jira:    { bg: 'rgba(59,130,246,0.15)',  color: '#3B82F6', label: 'Jira'    },
  email:   { bg: 'rgba(139,92,246,0.15)', color: '#8B5CF6', label: 'Email'   },
  meeting: { bg: 'rgba(20,184,166,0.15)', color: '#14B8A6', label: 'Meeting' },
  teams:   { bg: 'rgba(99,102,241,0.15)', color: '#6366F1', label: 'Teams'   },
  slack:   { bg: 'rgba(16,185,129,0.15)', color: '#10B981', label: 'Slack'   },
};

const PRIORITY_STYLE: Record<TaskPriority, { bg: string; color: string; label: string }> = {
  urgent: { bg: 'rgba(239,68,68,0.12)',   color: '#EF4444', label: 'High' },
  normal: { bg: 'rgba(245,158,11,0.12)',  color: '#F59E0B', label: 'Med'  },
  low:    { bg: 'rgba(16,185,129,0.12)',  color: '#10B981', label: 'Low'  },
};

const STATUS_STYLE: Record<TaskStatus, { bg: string; color: string; label: string }> = {
  todo:        { bg: 'rgba(156,163,175,0.15)', color: '#9CA3AF', label: 'Todo'        },
  in_progress: { bg: 'rgba(59,130,246,0.15)',  color: '#3B82F6', label: 'In Progress' },
  done:        { bg: 'rgba(16,185,129,0.15)',  color: '#10B981', label: 'Done'        },
};

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatDeadline(deadline: string): { text: string; urgent: boolean } {
  if (deadline === TODAY) return { text: 'Today', urgent: true };
  const d = new Date(deadline + 'T00:00:00');
  const today = new Date(TODAY + 'T00:00:00');
  if (d < today) return { text: 'Overdue', urgent: true };
  const tomorrow = new Date(TODAY + 'T00:00:00');
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (deadline === tomorrow.toISOString().slice(0, 10)) return { text: 'Tomorrow', urgent: false };
  return {
    text: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    urgent: false,
  };
}

// ─── component ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

interface DashboardProps {
  onTaskClick?: (task: TodoItem) => void;
}

export function Dashboard({ onTaskClick }: DashboardProps) {
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<TaskSource | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return MOCK_ITEMS.filter((t) => {
      if (sourceFilter !== 'all' && t.source !== sourceFilter) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, sourceFilter, statusFilter, priorityFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // summary stats
  const total = MOCK_ITEMS.length;
  const dueToday = MOCK_ITEMS.filter((t) => t.deadline === TODAY && t.status !== 'done').length;
  const overdue = MOCK_ITEMS.filter((t) => {
    if (!t.deadline || t.status === 'done') return false;
    return new Date(t.deadline + 'T00:00:00') < new Date(TODAY + 'T00:00:00');
  }).length;
  const done = MOCK_ITEMS.filter((t) => t.status === 'done').length;

  return (
    <>
      {/* Summary cards */}
      <div className={styles.statsRow}>
        <StatCard value={total}    label="Total Tasks"  icon="📋" color="#F9FAFB" />
        <StatCard value={dueToday} label="Due Today"    icon="📅" color="#F59E0B" />
        <StatCard value={overdue}  label="Overdue"      icon="⚠️" color="#EF4444" />
        <StatCard value={done}     label="Completed"    icon="✅" color="#10B981" />
      </div>

      {/* Filter bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <select
          className={styles.filterSelect}
          value={sourceFilter}
          onChange={(e) => { setSourceFilter(e.target.value as TaskSource | 'all'); setPage(1); }}
        >
          <option value="all">Source</option>
          <option value="jira">Jira</option>
          <option value="email">Email</option>
          <option value="meeting">Meeting</option>
          <option value="teams">Teams</option>
          <option value="slack">Slack</option>
        </select>

        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as TaskStatus | 'all'); setPage(1); }}
        >
          <option value="all">Status</option>
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <select
          className={styles.filterSelect}
          value={priorityFilter}
          onChange={(e) => { setPriorityFilter(e.target.value as TaskPriority | 'all'); setPage(1); }}
        >
          <option value="all">Priority</option>
          <option value="urgent">High</option>
          <option value="normal">Med</option>
          <option value="low">Low</option>
        </select>

        <span className={styles.sortLabel}>Sort: Deadline ↑</span>
      </div>

      {/* Task table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Source</th>
              <th>Deadline</th>
              <th>Priority</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className={styles.emptyState}>No tasks match the current filters.</div>
                </td>
              </tr>
            ) : (
              pageItems.map((task, i) => {
                const src = SOURCE_STYLE[task.source];
                const pri = PRIORITY_STYLE[task.priority];
                const sta = STATUS_STYLE[task.status];
                const dl = task.deadline ? formatDeadline(task.deadline) : null;

                return (
                  <tr key={task.id} className={styles.tableRow} onClick={() => onTaskClick?.(task)}>
                    <td className={styles.colNum}>{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td className={styles.taskTitle} title={task.title}>{task.title}</td>
                    <td>
                      <span
                        className={styles.badge}
                        style={{ background: src.bg, color: src.color }}
                      >
                        {src.label}
                      </span>
                    </td>
                    <td>
                      {dl ? (
                        <span className={dl.urgent ? styles.deadlineUrgent : styles.deadlineNormal}>
                          {dl.text}
                        </span>
                      ) : (
                        <span className={styles.deadlineNormal}>—</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={styles.badge}
                        style={{ background: pri.bg, color: pri.color }}
                      >
                        <span
                          className={styles.priorityDot}
                          style={{ backgroundColor: pri.color }}
                        />
                        {pri.label}
                      </span>
                    </td>
                    <td>
                      <span
                        className={styles.badge}
                        style={{ background: sta.bg, color: sta.color }}
                      >
                        {sta.label}
                      </span>
                    </td>
                    <td>
                      <button className={styles.actionBtn} aria-label="Actions">⋯</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>
            Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className={styles.pageControls}>
            <button
              className={styles.pageBtn}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
              <button
                key={p}
                className={`${styles.pageBtn}${p === page ? ` ${styles.pageBtnActive}` : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              className={styles.pageBtn}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  value: number;
  label: string;
  icon: string;
  color: string;
}

function StatCard({ value, label, icon, color }: StatCardProps) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statIcon}>{icon}</span>
      <div className={styles.statValue} style={{ color }}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

export default Dashboard;
