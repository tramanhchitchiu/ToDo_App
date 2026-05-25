import React, { useState, useMemo } from 'react';
import styles from './ConfirmTasks.module.css';
import { TaskCard, type Decision } from '../components/TaskCard';
import { apiClient } from '../api/client';
import type { TaskCandidate, TaskGroup } from '../types/api.types';

// ─── mock data (Phase 1) ──────────────────────────────────────────────────────

const MOCK_GROUPS: TaskGroup[] = [
  {
    id: 'g1',
    context_label: 'Project Alpha — Auth Module',
    narrative_summary:
      'Sprint 3 introduced OAuth2. Two tasks share this context. One may be invalidated by a recent requirement change.',
    candidates: [
      {
        id: 'c1',
        title: 'Review PR #42 for authentication module',
        source: 'jira',
        priority: 'urgent',
        confidence: 92,
        reason: "Imperative assignment detected: 'please review before EOD'",
        deadline: '2026-05-25',
        group_id: 'g1',
        invalidation_flag: true,
      },
      {
        id: 'c2',
        title: 'Update authentication documentation',
        source: 'meeting',
        priority: 'low',
        confidence: 74,
        reason: "'Linh to update docs' — action item in meeting transcript",
        deadline: '2026-05-27',
        group_id: 'g1',
      },
    ],
  },
  {
    id: 'g2',
    context_label: 'Client XYZ — Delivery',
    narrative_summary: 'Client requested a status update via email. One task detected.',
    candidates: [
      {
        id: 'c3',
        title: 'Reply to client delivery status email',
        source: 'email',
        priority: 'normal',
        confidence: 85,
        reason: "'Need by Friday' deadline signal detected",
        deadline: '2026-05-26',
        group_id: 'g2',
      },
    ],
  },
  {
    id: 'g3',
    context_label: 'Sprint 4 Planning',
    narrative_summary: 'Two action items captured from the sprint planning session.',
    candidates: [
      {
        id: 'c4',
        title: 'Review sprint 4 planning document',
        source: 'teams',
        priority: 'normal',
        confidence: 79,
        reason: 'Action item from sprint planning meeting',
        deadline: '2026-05-26',
        group_id: 'g3',
      },
      {
        id: 'c5',
        title: 'Prepare demo slides for client XYZ — May release',
        source: 'email',
        priority: 'urgent',
        confidence: 91,
        reason: "'Demo by EOD Friday' request from stakeholder",
        deadline: '2026-05-25',
        group_id: 'g3',
      },
    ],
  },
];

const ALL_CANDIDATES: TaskCandidate[] = MOCK_GROUPS.flatMap((g) => g.candidates);

// ─── component ────────────────────────────────────────────────────────────────

interface ConfirmTasksProps {
  groups?: TaskGroup[];
  onSubmit?: () => void;
}

export function ConfirmTasks({ groups = MOCK_GROUPS, onSubmit }: ConfirmTasksProps) {
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [rejectModal, setRejectModal] = useState<{ candidateId: string; reason: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const allCandidates = groups.flatMap((g) => g.candidates);
  const total = allCandidates.length;
  const decided = Object.keys(decisions).length;
  const remaining = total - decided;
  const allDecided = remaining === 0;

  const undecidedIds = useMemo(
    () => allCandidates.filter((c) => !decisions[c.id]).map((c) => c.id),
    [decisions, allCandidates],
  );

  async function handleAccept(id: string) {
    try {
      await apiClient.acceptTask(id, 'User confirmed', '');
      setDecisions((prev) => ({ ...prev, [id]: { action: 'accepted' } }));
    } catch (error) {
      console.error('Failed to accept task:', error);
      alert('Failed to accept task. Please try again.');
    }
  }

  function handleEdit(id: string, data: { title: string; deadline?: string }) {
    setDecisions((prev) => ({ ...prev, [id]: { action: 'edited', ...data } }));
  }

  function handleRequestReject(id: string) {
    setRejectModal({ candidateId: id, reason: '' });
  }

  async function handleRejectConfirm() {
    if (!rejectModal) return;
    try {
      await apiClient.rejectTask(rejectModal.candidateId, rejectModal.reason || 'No reason provided', '');
      setDecisions((prev) => ({
        ...prev,
        [rejectModal.candidateId]: { action: 'rejected', reason: rejectModal.reason },
      }));
      setRejectModal(null);
    } catch (error) {
      console.error('Failed to reject task:', error);
      alert('Failed to reject task. Please try again.');
    }
  }

  function handleAcceptAll() {
    const batch: Record<string, Decision> = {};
    undecidedIds.forEach((id) => {
      const c = allCandidates.find((x) => x.id === id);
      if (c && c.confidence >= 80) {
        handleAccept(id);
        batch[id] = { action: 'accepted' };
      }
    });
    if (Object.keys(batch).length > 0) {
      setDecisions((prev) => ({ ...prev, ...batch }));
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      // All decisions already submitted individually
      setDecisions({});
      onSubmit?.();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Top bar */}
      <div className={styles.topBar}>
        <p className={styles.instruction}>
          Review AI-extracted tasks below. Every task requires your decision before it is added to your list.
        </p>
        <button className={styles.acceptAllBtn} onClick={handleAcceptAll}>
          ✓ Accept All ≥80
        </button>
      </div>

      {/* Thread groups */}
      <div className={styles.groups}>
        {groups.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            No tasks extracted yet. Click "Run Ingestion" to start the agent pipeline.
          </div>
        ) : (
          groups.map((group) => (
          <div key={group.id} className={styles.group}>
            <div className={styles.groupHeader}>
              <p className={styles.groupLabel}>📁 {group.context_label}</p>
              <p className={styles.groupNarrative}>{group.narrative_summary}</p>
            </div>
            {group.candidates.map((candidate) => (
              <TaskCard
                key={candidate.id}
                candidate={candidate}
                decision={decisions[candidate.id]}
                onAccept={handleAccept}
                onRequestReject={handleRequestReject}
                onEdit={handleEdit}
              />
            ))}
          </div>
        ))
        )}
      </div>

      {/* Submit section */}
      <div className={styles.submitSection}>
        <button className={styles.submitBtn} disabled={!allDecided || submitting} onClick={handleSubmit}>
          Submit All Decisions
        </button>
        {!allDecided && (
          <p className={styles.submitNote}>
            {remaining} of {total} task{remaining !== 1 ? 's' : ''} still need{remaining === 1 ? 's' : ''} a decision.
          </p>
        )}
      </div>

      {/* Reject modal */}
      {rejectModal && (
        <div className={styles.modalOverlay} onClick={() => setRejectModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Reject Task</h2>
            <p className={styles.modalSubtitle}>Why are you rejecting this task? (optional)</p>
            <textarea
              className={styles.modalTextarea}
              placeholder="e.g. Already handled, duplicate, not relevant…"
              value={rejectModal.reason}
              onChange={(e) => setRejectModal((m) => m && { ...m, reason: e.target.value })}
              autoFocus
            />
            <div className={styles.modalActions}>
              <button className={styles.modalCancelBtn} onClick={() => setRejectModal(null)}>Cancel</button>
              <button className={styles.modalRejectBtn} onClick={handleRejectConfirm}>Reject</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ConfirmTasks;
