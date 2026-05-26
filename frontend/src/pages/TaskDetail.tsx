import React, { useState, useEffect } from 'react';
import styles from './TaskDetail.module.css';
import type { TodoItem, TaskSource, TaskPriority, TaskStatus } from '../types/api.types';

// ─── supplementary data not returned by the API ───────────────────────────────

interface Supplement {
  groupNarrative?: string;
  relatedTasks?: { title: string; color: string }[];
  hasInvalidation?: boolean;
  assignee?: string;
  createdAt?: string;
  updatedAt?: string;
}

const SUPPLEMENTS: Record<string, Supplement> = {
  'task-jira-001': {
    groupNarrative:
      'Sprint 3 introduced OAuth2. PR #42 is the final review gate before merging to main. A requirement conflict was detected — the OAuth spec was revised on May 19 and the implementation must be re-verified against it. Bug #103 is a blocking regression that must be resolved before this PR can ship.',
    relatedTasks: [
      { title: 'Fix bug #103 — null pointer', color: '#EF4444' },
      { title: 'Update authentication docs', color: '#10B981' },
      { title: 'Migrate legacy auth tokens', color: '#F59E0B' },
    ],
    hasInvalidation: true,
    assignee: 'TrungNT → Nguyen T. Linh',
    createdAt: '2026-05-20',
    updatedAt: '2 hours ago',
  },
  'task-jira-002': {
    groupNarrative:
      'Sprint 3 introduced OAuth2. Bug #103 is a critical regression in v2.4.1 — NullPointerException in SessionMiddleware when the token is expired. Currently blocking PRs #44, #45, and #46 from merging. Must be resolved before the auth release cut on Friday.',
    relatedTasks: [
      { title: 'Review PR #42 — OAuth2 flow', color: '#EF4444' },
    ],
    assignee: 'Auto-assigned → Nguyen T. Linh',
    createdAt: '2026-05-25',
    updatedAt: '4 hours ago',
  },
  'task-jira-003': {
    groupNarrative:
      'Ticket ALPHA-38 was completed but the Confluence API versioning docs still reference v1 endpoints. This follow-up doc update is needed before external partners notice the discrepancy. Low urgency but linked to the active auth sprint.',
    relatedTasks: [
      { title: 'Review PR #42 — OAuth2 flow', color: '#EF4444' },
      { title: 'Migrate legacy auth tokens', color: '#F59E0B' },
    ],
    assignee: 'Nguyen T. Linh',
    createdAt: '2026-05-26',
    updatedAt: '6 hours ago',
  },
  'task-jira-004': {
    groupNarrative:
      'Sprint 3 auth work left ~12,000 tokens in the legacy format. They must be migrated to JWT v2 before the deprecation deadline on May 31. A backfill script needs to be written and run against production with a dry-run first.',
    relatedTasks: [
      { title: 'Review PR #42 — OAuth2 flow', color: '#EF4444' },
      { title: 'Update API versioning docs', color: '#10B981' },
    ],
    assignee: 'Nguyen T. Linh',
    createdAt: '2026-05-26',
    updatedAt: '6 hours ago',
  },
  'task-email-001': {
    assignee: 'Nguyen T. Linh',
    createdAt: '2026-05-23',
    updatedAt: '3 days ago',
  },
  'task-email-002': {
    groupNarrative:
      'Client XYZ has a stakeholder review call on May 28. The demo deck must be ready by Thursday EOD (May 27) to allow the 1-day revision buffer. Cover Phase 2 milestones, delivery timeline, and the upcoming Q3 feature roadmap.',
    relatedTasks: [
      { title: 'Reply to client XYZ — status', color: '#F59E0B' },
    ],
    assignee: 'Nguyen T. Linh',
    createdAt: '2026-05-24',
    updatedAt: '2 days ago',
  },
  'task-email-003': {
    assignee: 'Nguyen T. Linh (PM approval)',
    createdAt: '2026-05-22',
    updatedAt: '4 days ago',
  },
  'task-email-004': {
    hasInvalidation: true,
    assignee: 'HR → Nguyen T. Linh',
    createdAt: '2026-05-24',
    updatedAt: '2 days ago',
  },
  'task-meeting-001': {
    groupNarrative:
      'Sprint 3 retro identified that the Confluence auth docs were not updated to reflect the new OAuth2 flow and token refresh logic. This action item was assigned to Linh and must be done before the next sprint starts.',
    relatedTasks: [
      { title: 'Review PR #42 — OAuth2 flow', color: '#EF4444' },
      { title: 'Update API versioning docs', color: '#3B82F6' },
    ],
    assignee: 'Nguyen T. Linh',
    createdAt: '2026-05-22',
    updatedAt: '4 days ago',
  },
  'task-meeting-002': {
    groupNarrative:
      'Architecture review on May 21 approved migrating all services to k8s by Q3 2026. PM must schedule the kickoff within 1 week of the approval. Sprint 4 planning should account for migration capacity to avoid blocking the infra team.',
    relatedTasks: [
      { title: 'Review Sprint 4 planning doc', color: '#6366F1' },
    ],
    assignee: 'Nguyen T. Linh (PM)',
    createdAt: '2026-05-21',
    updatedAt: '5 days ago',
  },
  'task-meeting-003': {
    groupNarrative:
      'Q2 missed three OKRs: Auth hardening, API latency SLOs, and onboarding time reduction. The owner committed in the Q2 review meeting to deliver a post-mortem doc covering root causes and corrective actions before next week\'s planning session.',
    assignee: 'Nguyen T. Linh',
    createdAt: '2026-05-19',
    updatedAt: '1 week ago',
  },
  'task-teams-001': {
    groupNarrative:
      'Two concurrent infra incidents are active. The CI pipeline on main has been red since 08:15 — blocking all deployments and the release cut scheduled for today. Root cause suspected: flaky Playwright test in the auth suite introduced by a recent dependency update.',
    relatedTasks: [
      { title: 'Acknowledge CPU alert — prod-worker-03', color: '#EF4444' },
    ],
    assignee: 'On-call engineer (escalated)',
    createdAt: '2026-05-26',
    updatedAt: '1 hour ago',
  },
  'task-teams-002': {
    groupNarrative:
      'Architecture review approved k8s migration for Q3. Sprint 4 planning doc must be reviewed before the 10:00 standup to ensure migration capacity is properly allocated and the infra track does not slip.',
    relatedTasks: [
      { title: 'Schedule migration kickoff', color: '#14B8A6' },
    ],
    assignee: 'Nguyen T. Linh',
    createdAt: '2026-05-26',
    updatedAt: '2 hours ago',
  },
  'task-teams-003': {
    assignee: 'Nguyen T. Linh (PM sign-off)',
    createdAt: '2026-05-26',
    updatedAt: '3 hours ago',
  },
  'task-slack-001': {
    groupNarrative:
      'Two concurrent infra incidents are active. prod-worker-03 has had 94% CPU utilisation for over 20 minutes — possible memory leak or runaway process. The PagerDuty alert was forwarded to #incidents at 07:45 and remains unacknowledged. Escalate to on-call if no response within 15 minutes.',
    relatedTasks: [
      { title: 'Resolve CI pipeline failure', color: '#EF4444' },
    ],
    assignee: 'On-call engineer (escalated)',
    createdAt: '2026-05-26',
    updatedAt: '3 hours ago',
  },
};

const DEFAULT_SUPPLEMENT: Supplement = {
  assignee: 'Nguyen T. Linh',
  createdAt: '2026-05-26',
  updatedAt: 'recently',
};

// ─── style maps ───────────────────────────────────────────────────────────────

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

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function fmtDeadline(d: string): { text: string; urgent: boolean } {
  const TODAY = getToday();
  if (d === TODAY) return { text: 'Today', urgent: true };
  const date = new Date(d + 'T00:00:00');
  const today = new Date(TODAY + 'T00:00:00');
  if (date < today) return { text: 'Overdue', urgent: true };
  const tomorrow = new Date(TODAY + 'T00:00:00');
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (d === tomorrow.toISOString().slice(0, 10)) return { text: 'Tomorrow', urgent: false };
  return { text: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), urgent: false };
}

// ─── component ────────────────────────────────────────────────────────────────

interface TaskDetailProps {
  task: TodoItem;
  onBack: () => void;
}

export function TaskDetail({ task, onBack }: TaskDetailProps) {
  const supp = SUPPLEMENTS[task.id] ?? DEFAULT_SUPPLEMENT;

  // Prefer API data; fall back to supplement
  const sourceExcerpt = task.source_excerpt || '';
  const groupLabel    = task.group_label    || '';
  const initialDesc   = task.description   || '';

  const [title, setTitle]           = useState(task.title);
  const [description, setDesc]      = useState(initialDesc);
  const [status, setStatus]         = useState<TaskStatus>(task.status);
  const [deadline, setDeadline]     = useState(task.deadline ?? '');

  const [savedMsg, setSavedMsg]           = useState(false);
  const [showInvalidation, setShowInvalid] = useState(supp.hasInvalidation ?? false);
  const [contextCollapsed, setCollapsed]   = useState(false);

  const isDirty =
    title !== task.title ||
    description !== initialDesc ||
    status !== task.status ||
    deadline !== (task.deadline ?? '');

  useEffect(() => {
    const s = SUPPLEMENTS[task.id] ?? DEFAULT_SUPPLEMENT;
    setTitle(task.title);
    setDesc(task.description || '');
    setStatus(task.status);
    setDeadline(task.deadline ?? '');
    setSavedMsg(false);
    setShowInvalid(s.hasInvalidation ?? false);
    setCollapsed(false);
  }, [task.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSave() {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  }

  function handleCancel() {
    setTitle(task.title);
    setDesc(task.description || '');
    setStatus(task.status);
    setDeadline(task.deadline ?? '');
  }

  const src = SOURCE_STYLE[task.source];
  const pri = PRIORITY_STYLE[task.priority];
  const dl  = deadline ? fmtDeadline(deadline) : null;

  return (
    <div className={styles.layout}>
      {/* ── Left column ── */}
      <div className={styles.leftCol}>
        <input
          className={styles.titleInput}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Task title"
        />

        {/* Metadata row */}
        <div className={styles.metaRow}>
          <span className={styles.metaBadge} style={{ background: src.bg, color: src.color }}>
            {src.label}
          </span>

          {dl && (
            <span className={`${styles.deadlineMeta} ${dl.urgent ? styles.deadlineUrgent : styles.deadlineNormal}`}>
              📅 Due: {dl.text}
            </span>
          )}

          <span className={styles.metaBadge} style={{ background: pri.bg, color: pri.color }}>
            <span className={styles.priorityDot} style={{ backgroundColor: pri.color }} />
            {pri.label}
            {task.confidence && task.confidence >= 70 && (
              <span className={styles.aiTag}>AI Suggested</span>
            )}
          </span>

          <select
            className={styles.statusSelect}
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
          >
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        {/* Secondary metadata */}
        <div className={styles.metaSecondary}>
          <span>Assigned to: {supp.assignee ?? 'Nguyen T. Linh'}</span>
          <span>Created: {supp.createdAt ?? '2026-05-26'}</span>
          <span>Last updated: {supp.updatedAt ?? 'recently'}</span>
        </div>

        {/* Description */}
        <div className={styles.section}>
          <span className={styles.sectionLabel}>Description</span>
          <textarea
            className={styles.textarea}
            value={description}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Add a description…"
          />
        </div>

        {/* Source Excerpt */}
        {sourceExcerpt && (
          <div className={styles.section}>
            <span className={styles.sectionLabel}>Source Excerpt</span>
            <div className={styles.sourceExcerpt}>{sourceExcerpt}</div>
          </div>
        )}

        {/* Save / Cancel */}
        <div className={styles.formActions}>
          {savedMsg && <span className={styles.savedMsg}>✓ Changes saved</span>}
          <button className={styles.cancelBtn} onClick={handleCancel} disabled={!isDirty}>
            Cancel
          </button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={!isDirty}>
            Save Changes
          </button>
        </div>
      </div>

      {/* ── Right column ── */}
      <div className={styles.rightCol}>
        {/* Thread Context */}
        {groupLabel && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <p className={styles.cardTitle}>Thread Context</p>
              <button
                className={styles.collapseBtn}
                onClick={() => setCollapsed((c) => !c)}
                aria-label={contextCollapsed ? 'Expand' : 'Collapse'}
              >
                {contextCollapsed ? '▸' : '▾'}
              </button>
            </div>
            {!contextCollapsed && (
              <>
                <p className={styles.groupLabel}>📁 {groupLabel}</p>
                {supp.groupNarrative && (
                  <p className={styles.groupNarrative}>{supp.groupNarrative}</p>
                )}
                {supp.relatedTasks && supp.relatedTasks.length > 0 && (
                  <div className={styles.relatedChips}>
                    {supp.relatedTasks.map((rt) => (
                      <span key={rt.title} className={styles.relatedChip}>
                        {rt.title}
                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: rt.color, display: 'inline-block', marginLeft: 4 }} />
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Invalidation warning */}
        {showInvalidation && (
          <div className={styles.invalidCard}>
            <div className={styles.invalidHeader}>
              <span className={styles.invalidIcon}>⚠️</span>
              <p className={styles.invalidText}>
                This task may be outdated. A related requirement or context changed recently.
                Please confirm it is still relevant before acting on it.
              </p>
            </div>
            <div className={styles.invalidActions}>
              <button className={styles.confirmValidBtn} onClick={() => setShowInvalid(false)}>
                Confirm Still Valid
              </button>
              <button className={styles.dismissBtn} onClick={() => setShowInvalid(false)}>
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* AI confidence */}
        {task.confidence !== undefined && (
          <div className={styles.card}>
            <p className={styles.cardTitle}>AI Confidence</p>
            <div className={styles.confidenceRow}>
              <div className={styles.confidenceBar}>
                <div
                  className={styles.confidenceFill}
                  style={{
                    width: `${task.confidence}%`,
                    background: task.confidence >= 80 ? '#10B981' : task.confidence >= 50 ? '#F59E0B' : '#EF4444',
                  }}
                />
              </div>
              <span
                className={styles.confidenceScore}
                style={{ color: task.confidence >= 80 ? '#10B981' : task.confidence >= 50 ? '#F59E0B' : '#EF4444' }}
              >
                {task.confidence}/100
              </span>
            </div>
            {task.reason && <p className={styles.confidenceReason}>{task.reason}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskDetail;
