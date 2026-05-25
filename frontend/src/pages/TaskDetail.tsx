import React, { useState, useEffect } from 'react';
import styles from './TaskDetail.module.css';
import type { TodoItem, TaskSource, TaskPriority, TaskStatus } from '../types/api.types';

// ─── supplementary mock detail data (Phase 1) ────────────────────────────────

interface Supplement {
  description: string;
  sourceExcerpt: string;
  assignee: string;
  createdAt: string;
  updatedAt: string;
  groupLabel?: string;
  groupNarrative?: string;
  relatedTasks?: { title: string; color: string }[];
  hasInvalidation?: boolean;
}

const SUPPLEMENTS: Record<string, Supplement> = {
  '1': {
    description:
      'The PR needs a second reviewer before merging into main. Please review the OAuth2 implementation and approve or leave inline comments. Pay attention to the token refresh logic.',
    sourceExcerpt:
      '[Jira — ALPHA-42] Assigned to Linh by TrungNT on 2026-05-20:\n"Please review this PR before EOD today. The auth module needs sign-off."',
    assignee: 'Nguyen T. Linh',
    createdAt: '2026-05-20',
    updatedAt: '2 hours ago',
    groupLabel: 'Project Alpha — Auth Module',
    groupNarrative:
      'Sprint 3 introduced OAuth2 authentication. This PR is the final review gate before the feature merges to main. Related tasks include bug #103 (blocking this) and documentation update (follow-up action).',
    relatedTasks: [
      { title: 'Fix bug #103', color: '#EF4444' },
      { title: 'Update auth docs', color: '#10B981' },
    ],
    hasInvalidation: true,
  },
  '2': {
    description:
      'The client has asked for a project delivery status update. Reply summarising completed milestones and the remaining timeline.',
    sourceExcerpt:
      '[Email — From: client@xyz.com, 2026-05-23]\n"Hi Linh, could you send a quick status update on the delivery? Need it by Friday. Thanks."',
    assignee: 'Nguyen T. Linh',
    createdAt: '2026-05-23',
    updatedAt: '1 day ago',
    groupLabel: 'Client XYZ — Delivery',
    groupNarrative: 'Client requested a delivery status update via email. Reply before end of Friday.',
  },
  '3': {
    description:
      'Update the Confluence authentication documentation to reflect the new OAuth2 flow introduced in Sprint 3.',
    sourceExcerpt:
      '[Meeting Minutes — Sprint 3 Retro, 2026-05-22]\nAction item: "Linh to update authentication docs before end of sprint."',
    assignee: 'Nguyen T. Linh',
    createdAt: '2026-05-22',
    updatedAt: '3 days ago',
    groupLabel: 'Project Alpha — Auth Module',
    groupNarrative:
      'Sprint 3 introduced OAuth2. Documentation needs to be updated to reflect the new flow.',
    relatedTasks: [
      { title: 'Review PR #42', color: '#EF4444' },
    ],
  },
};

const DEFAULT_SUPPLEMENT: Supplement = {
  description: '',
  sourceExcerpt: 'No source excerpt available.',
  assignee: 'Nguyen T. Linh',
  createdAt: '2026-05-20',
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

  // Editable fields
  const [title, setTitle]           = useState(task.title);
  const [description, setDesc]      = useState(supp.description);
  const [status, setStatus]         = useState<TaskStatus>(task.status);
  const [deadline, setDeadline]     = useState(task.deadline ?? '');

  // UI state
  const [savedMsg, setSavedMsg]           = useState(false);
  const [showInvalidation, setShowInvalid] = useState(supp.hasInvalidation ?? false);
  const [contextCollapsed, setCollapsed]   = useState(false);

  const isDirty =
    title !== task.title ||
    description !== supp.description ||
    status !== task.status ||
    deadline !== (task.deadline ?? '');

  // Reset local state when task changes (navigating between tasks)
  useEffect(() => {
    const s = SUPPLEMENTS[task.id] ?? DEFAULT_SUPPLEMENT;
    setTitle(task.title);
    setDesc(s.description);
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
    const s = SUPPLEMENTS[task.id] ?? DEFAULT_SUPPLEMENT;
    setTitle(task.title);
    setDesc(s.description);
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
          <span>Assigned to: {supp.assignee}</span>
          <span>Created: {supp.createdAt}</span>
          <span>Last updated: {supp.updatedAt}</span>
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
        <div className={styles.section}>
          <span className={styles.sectionLabel}>Source Excerpt</span>
          <div className={styles.sourceExcerpt}>{supp.sourceExcerpt}</div>
        </div>

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
        {supp.groupLabel && (
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
                <p className={styles.groupLabel}>📁 {supp.groupLabel}</p>
                {supp.groupNarrative && (
                  <p className={styles.groupNarrative}>{supp.groupNarrative}</p>
                )}
                {supp.relatedTasks && supp.relatedTasks.length > 0 && (
                  <div className={styles.relatedChips}>
                    {supp.relatedTasks.map((rt) => (
                      <span key={rt.title} className={styles.relatedChip}>
                        {rt.title}
                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: rt.color, display: 'inline-block' }} />
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
                This task may be outdated. A related requirement changed on 2026-05-19.
                Please confirm it is still relevant.
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
      </div>
    </div>
  );
}

export default TaskDetail;
