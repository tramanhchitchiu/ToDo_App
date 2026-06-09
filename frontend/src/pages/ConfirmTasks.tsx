import React, { useState, useMemo, useEffect } from 'react';
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
      'Sprint 3 introduced OAuth2 authentication. Three tasks share this context: a PR review blocking the release cut, a regression bug blocking downstream PRs, and a documentation update. A potential requirement conflict was detected — the OAuth spec was revised on May 19.',
    candidates: [
      {
        id: 'c1',
        title: 'Review PR #42 — OAuth2 refresh-token flow',
        source: 'jira',
        priority: 'urgent',
        confidence: 94,
        reason: "Imperative assignment: 'please review before EOD'",
        deadline: '2026-05-26',
        group_id: 'g1',
        invalidation_flag: true,
        source_excerpt: '[ALPHA-42 • TrungNT → Linh]\n"Please review this PR before EOD today. Two reviewers approved but we still need your sign-off before the auth release cut on Friday."',
      },
      {
        id: 'c2',
        title: 'Fix bug #103 — null pointer in session middleware',
        source: 'jira',
        priority: 'urgent',
        confidence: 91,
        reason: 'High-priority regression blocking 3 downstream PRs',
        deadline: '2026-05-26',
        group_id: 'g1',
        source_excerpt: '[ALPHA-103 • Auto-assigned • Severity: Critical]\n"NullPointerException in SessionMiddleware.handle() when token is expired. Introduced in v2.4.1. Currently blocking PRs #44, #45, #46 from merging."',
      },
      {
        id: 'c9',
        title: 'Update authentication documentation in Confluence',
        source: 'meeting',
        priority: 'low',
        confidence: 74,
        reason: "Action item from sprint retro: 'Linh to update auth docs'",
        deadline: '2026-05-29',
        group_id: 'g1',
        source_excerpt: '[Sprint 3 Retro • 2026-05-22 • Meeting minutes]\nAction item: "Linh to update Confluence auth documentation to reflect the new OAuth2 flow and token refresh logic before end of sprint."',
      },
    ],
  },
  {
    id: 'g2',
    context_label: 'Client XYZ — May Release',
    narrative_summary:
      'Client XYZ has a stakeholder review on May 28. Two time-sensitive items detected: a delivery status reply (client waiting 3 days) and demo slide preparation (1 day buffer required before the call).',
    candidates: [
      {
        id: 'c3',
        title: 'Reply to client XYZ — delivery status update',
        source: 'email',
        priority: 'urgent',
        confidence: 88,
        reason: "'Need update by Friday' detected in email body",
        deadline: '2026-05-26',
        group_id: 'g2',
        source_excerpt: '[Email • From: contact@xyz-corp.com • 2026-05-23 14:32]\n"Hi Linh, could you send a quick delivery status update? We need it by Friday before our internal stakeholder review. Thanks in advance."',
      },
      {
        id: 'c4',
        title: 'Prepare demo slides for May release presentation',
        source: 'email',
        priority: 'urgent',
        confidence: 93,
        reason: "'Demo by EOD Friday' request from stakeholder",
        deadline: '2026-05-27',
        group_id: 'g2',
        source_excerpt: '[Email • From: pm@xyz-corp.com • 2026-05-24 09:15]\n"Please have the demo deck ready by Thursday EOD — we need the 1 day buffer before the May 28 stakeholder call for revisions. Cover Phase 2 milestones."',
      },
    ],
  },
  {
    id: 'g3',
    context_label: 'Platform Migration — Q3',
    narrative_summary:
      'Architecture review approved k8s migration for Q3 2026. Two action items were assigned: scheduling the kickoff with the infra team, and reviewing the Sprint 4 planning document before standup.',
    candidates: [
      {
        id: 'c5',
        title: 'Schedule platform migration kickoff with infra team',
        source: 'meeting',
        priority: 'normal',
        confidence: 83,
        reason: 'Explicit action item assigned to PM in architecture review',
        deadline: '2026-05-28',
        group_id: 'g3',
        source_excerpt: '[Architecture Review • 2026-05-21 • Decision recorded]\n"Motion passed: migrate all services to k8s by Q3 2026. PM (Linh) to schedule kickoff meeting with infra team within 1 week of this review."',
      },
      {
        id: 'c6',
        title: 'Review sprint 4 planning document before standup',
        source: 'teams',
        priority: 'normal',
        confidence: 79,
        reason: 'Review request with time constraint — standup at 10:00',
        deadline: '2026-05-27',
        group_id: 'g3',
        source_excerpt: "[#sprint-planning • Cuong → @team • 09:05]\n\"Hey team, Sprint 4 planning doc is ready in Confluence. Please review before today's 10:00 standup so we can align on capacity and unblock the k8s migration track.\"",
      },
    ],
  },
  {
    id: 'g4',
    context_label: 'Infra & DevOps',
    narrative_summary:
      'Two active infrastructure incidents require immediate attention. The CI pipeline on main has been red since 08:15 blocking all deployments. A PagerDuty-level CPU alert on prod-worker-03 remains unacknowledged since 07:45.',
    candidates: [
      {
        id: 'c7',
        title: 'Resolve CI pipeline failure on main branch',
        source: 'teams',
        priority: 'urgent',
        confidence: 97,
        reason: "Urgent ping from tech lead: 'main is broken, needs fix ASAP'",
        deadline: '2026-05-26',
        group_id: 'g4',
        source_excerpt: '[#dev-ops • TechLead • 08:22]\n"@channel URGENT — main branch CI is RED since 08:15. Blocking ALL deployments. Likely flaky Playwright test in auth suite. Please investigate NOW, release is today."',
      },
      {
        id: 'c8',
        title: 'Acknowledge high CPU alert on prod-worker-03',
        source: 'slack',
        priority: 'urgent',
        confidence: 99,
        reason: 'PagerDuty-level alert forwarded to #incidents — unacknowledged 90 min',
        deadline: '2026-05-26',
        group_id: 'g4',
        source_excerpt: '[#incidents • PagerDuty-Bot • 07:45]\n"ALERT: prod-worker-03 — CPU at 94% for 20+ consecutive minutes (threshold: 85%). Possible memory leak or runaway process. Acknowledge or escalate to on-call engineer immediately."',
      },
    ],
  },
  {
    id: 'g5',
    context_label: 'Compliance & Admin',
    narrative_summary:
      'Two administrative tasks with approaching deadlines: an SLA amendment requiring PM sign-off before May 30, and contractor onboarding preparation for Minh who joins June 2. The onboarding task may conflict with the current hiring freeze notice.',
    candidates: [
      {
        id: 'c10',
        title: 'Review and sign off on SLA amendment',
        source: 'email',
        priority: 'normal',
        confidence: 81,
        reason: "Approval deadline signal: 'sign off before end of month'",
        deadline: '2026-05-30',
        group_id: 'g5',
        source_excerpt: '[Email • From: legal@company.com • 2026-05-22]\n"Attached: revised SLA for Q3 per client negotiation outcomes. Requires PM approval before May 30. Key change: Section 4.2 response-time SLOs tightened from 4h to 2h."',
      },
      {
        id: 'c11',
        title: 'Onboard new contractor — send repo access and docs',
        source: 'email',
        priority: 'normal',
        confidence: 77,
        reason: 'Start date June 2 — prep needed this week',
        deadline: '2026-06-02',
        group_id: 'g5',
        invalidation_flag: true,
        source_excerpt: '[Email • From: hr@company.com • 2026-05-24]\n"Reminder: Minh Nguyen (contractor, frontend) starts Monday June 2. Please ensure repo access (GitHub + Jira), onboarding doc link, and Slack invite are sent before their first day."',
      },
    ],
  },
];

const ALL_CANDIDATES: TaskCandidate[] = MOCK_GROUPS.flatMap((g) => g.candidates);

// ─── component ────────────────────────────────────────────────────────────────

interface ConfirmTasksProps {
  groups?: TaskGroup[];
  onSubmit?: () => void;
  onRemainingChange?: (remaining: number) => void;
}

export function ConfirmTasks({ groups = MOCK_GROUPS, onSubmit, onRemainingChange }: ConfirmTasksProps) {
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { onRemainingChange?.(remaining); }, [remaining]);

  function handleAccept(id: string) {
    setDecisions((prev) => ({ ...prev, [id]: { action: 'accepted' } }));
    apiClient.acceptTask(id, 'User confirmed', '').catch(() => {});
  }

  function handleEdit(id: string, data: { title: string; deadline?: string }) {
    setDecisions((prev) => ({ ...prev, [id]: { action: 'edited', ...data } }));
    apiClient.patchTask(id, { title: data.title, deadline: data.deadline }).catch(() => {});
  }

  function handleRequestReject(id: string) {
    setRejectModal({ candidateId: id, reason: '' });
  }

  function handleRejectConfirm() {
    if (!rejectModal) return;
    const { candidateId, reason } = rejectModal;
    setDecisions((prev) => ({
      ...prev,
      [candidateId]: { action: 'rejected', reason },
    }));
    setRejectModal(null);
    apiClient.rejectTask(candidateId, reason || 'No reason provided', '').catch(() => {});
  }

  function handleAcceptAll() {
    undecidedIds.forEach((id) => {
      const c = allCandidates.find((x) => x.id === id);
      if (c && c.confidence >= 80) handleAccept(id);
    });
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
              {group.candidates.some((c) => c.invalidation_flag) && (
                <div className={styles.groupWarning}>
                  <span className={styles.groupWarningIcon}>⚠️</span>
                  <span className={styles.groupWarningText}>
                    One or more tasks in this group may be outdated — a related requirement or context may have changed. Review carefully before accepting.
                  </span>
                </div>
              )}
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
