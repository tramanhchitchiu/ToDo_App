import React, { useState } from 'react';
import styles from './TaskCard.module.css';
import type { TaskCandidate, TaskSource, TaskPriority } from '../types/api.types';

// ─── types ────────────────────────────────────────────────────────────────────

export type Decision =
  | { action: 'accepted' }
  | { action: 'rejected'; reason: string }
  | { action: 'edited'; title: string; deadline?: string };

interface TaskCardProps {
  candidate: TaskCandidate;
  decision?: Decision;
  onAccept: (id: string) => void;
  onRequestReject: (id: string) => void;
  onEdit: (id: string, data: { title: string; deadline?: string }) => void;
}

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

function formatDeadline(deadline: string): { text: string; urgent: boolean } {
  const TODAY = getToday();
  if (deadline === TODAY) return { text: 'Today', urgent: true };
  const d = new Date(deadline + 'T00:00:00');
  const today = new Date(TODAY + 'T00:00:00');
  if (d < today) return { text: 'Overdue', urgent: true };
  const tomorrow = new Date(TODAY + 'T00:00:00');
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (deadline === tomorrow.toISOString().slice(0, 10)) return { text: 'Tomorrow', urgent: false };
  return { text: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), urgent: false };
}

function confidenceStyle(score: number): { bg: string; color: string } {
  if (score >= 80) return { bg: 'rgba(16,185,129,0.12)', color: '#10B981' };
  if (score >= 50) return { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B' };
  return { bg: 'rgba(239,68,68,0.12)', color: '#EF4444' };
}

// ─── component ────────────────────────────────────────────────────────────────

export function TaskCard({ candidate, decision, onAccept, onRequestReject, onEdit }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(candidate.title);
  const [editDeadline, setEditDeadline] = useState(candidate.deadline ?? '');

  const src = SOURCE_STYLE[candidate.source];
  const pri = PRIORITY_STYLE[candidate.priority];
  const conf = confidenceStyle(candidate.confidence);
  const dl = candidate.deadline ? formatDeadline(candidate.deadline) : null;

  const cardCls = [
    styles.card,
    decision?.action === 'accepted' ? styles.cardAccepted : '',
    decision?.action === 'rejected' ? styles.cardRejected : '',
    decision?.action === 'edited'   ? styles.cardEdited   : '',
  ].filter(Boolean).join(' ');

  function handleConfirmEdit() {
    if (!editTitle.trim()) return;
    onEdit(candidate.id, { title: editTitle.trim(), deadline: editDeadline || undefined });
    setIsEditing(false);
  }

  function handleCancelEdit() {
    setEditTitle(candidate.title);
    setEditDeadline(candidate.deadline ?? '');
    setIsEditing(false);
  }

  return (
    <div className={cardCls}>
      {/* Top row */}
      <div className={styles.topRow}>
        <input type="checkbox" className={styles.checkbox} readOnly checked={!!decision} />
        <span className={decision ? styles.titleDecided : styles.title}>
          {decision?.action === 'edited' ? decision.title : candidate.title}
        </span>
        <span className={styles.confidenceBadge} style={{ background: conf.bg, color: conf.color }}>
          {candidate.confidence}/100
        </span>
      </div>

      {/* Reason */}
      <p className={styles.reason}>{candidate.reason}</p>

      {/* Chips */}
      <div className={styles.chipsRow}>
        <span className={styles.chip} style={{ background: src.bg, color: src.color }}>{src.label}</span>
        <span className={styles.chip} style={{ background: pri.bg, color: pri.color }}>{pri.label}</span>
        {dl && (
          <span className={`${styles.deadlineChip} ${dl.urgent ? styles.deadlineUrgent : styles.deadlineNormal}`}>
            Due: {dl.text}
          </span>
        )}
        {candidate.invalidation_flag && (
          <span className={styles.invalidChip}>⚠ May be invalidated</span>
        )}
      </div>

      {/* Actions or decision state */}
      {decision ? (
        <div className={[
          styles.decisionBadge,
          decision.action === 'accepted' ? styles.decisionAccepted : '',
          decision.action === 'rejected' ? styles.decisionRejected : '',
          decision.action === 'edited'   ? styles.decisionEdited   : '',
        ].filter(Boolean).join(' ')}>
          {decision.action === 'accepted' && '✓ Accepted'}
          {decision.action === 'rejected' && '✗ Rejected'}
          {decision.action === 'edited'   && '✏ Saved with edits'}
        </div>
      ) : isEditing ? (
        <div className={styles.editForm}>
          <div>
            <label className={styles.editLabel}>Title</label>
            <input
              className={styles.editInput}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className={styles.editLabel}>Deadline</label>
            <input
              className={styles.editInput}
              type="date"
              value={editDeadline}
              onChange={(e) => setEditDeadline(e.target.value)}
              style={{ colorScheme: 'dark' }}
            />
          </div>
          <div className={styles.editActions}>
            <button className={styles.cancelEditBtn} onClick={handleCancelEdit}>Cancel</button>
            <button className={styles.confirmBtn} onClick={handleConfirmEdit} disabled={!editTitle.trim()}>
              Confirm
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.actions}>
          <button className={`${styles.actionBtn} ${styles.acceptBtn}`} onClick={() => onAccept(candidate.id)}>✓ Accept</button>
          <button className={`${styles.actionBtn} ${styles.editBtn}`}   onClick={() => setIsEditing(true)}>✏ Edit</button>
          <button className={`${styles.actionBtn} ${styles.rejectBtn}`} onClick={() => onRequestReject(candidate.id)}>✗ Reject</button>
        </div>
      )}
    </div>
  );
}

export default TaskCard;
