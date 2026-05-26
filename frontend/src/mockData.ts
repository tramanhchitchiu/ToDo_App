import type { TodoItem, TaskGroup, TaskSource, TaskPriority, TaskStatus } from './types/api.types';

// ─── Dashboard — todo list ────────────────────────────────────────────────────

export const MOCK_TODO_ITEMS: TodoItem[] = [
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
    done_date: '2026-05-25',
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
    done_date: '2026-05-23',
    confidence: 68,
    reason: 'Linked to completed JIRA ticket ALPHA-38',
  },
];

// ─── Confirm Tasks — agent-grouped candidates ─────────────────────────────────

export const MOCK_TASK_GROUPS: TaskGroup[] = [
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
        source_excerpt:
          '[ALPHA-42 • TrungNT → Linh]\n"Please review this PR before EOD today. Two reviewers approved but we still need your sign-off before the auth release cut on Friday."',
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
        source_excerpt:
          '[ALPHA-103 • Auto-assigned • Severity: Critical]\n"NullPointerException in SessionMiddleware.handle() when token is expired. Introduced in v2.4.1. Currently blocking PRs #44, #45, #46 from merging."',
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
        source_excerpt:
          '[Sprint 3 Retro • 2026-05-22 • Meeting minutes]\nAction item: "Linh to update Confluence auth documentation to reflect the new OAuth2 flow and token refresh logic before end of sprint."',
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
        source_excerpt:
          '[Email • From: contact@xyz-corp.com • 2026-05-23 14:32]\n"Hi Linh, could you send a quick delivery status update? We need it by Friday before our internal stakeholder review. Thanks in advance."',
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
        source_excerpt:
          '[Email • From: pm@xyz-corp.com • 2026-05-24 09:15]\n"Please have the demo deck ready by Thursday EOD — we need the 1 day buffer before the May 28 stakeholder call for revisions. Cover Phase 2 milestones."',
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
        source_excerpt:
          '[Architecture Review • 2026-05-21 • Decision recorded]\n"Motion passed: migrate all services to k8s by Q3 2026. PM (Linh) to schedule kickoff meeting with infra team within 1 week of this review."',
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
        source_excerpt:
          "[#sprint-planning • Cuong → @team • 09:05]\n\"Hey team, Sprint 4 planning doc is ready in Confluence. Please review before today's 10:00 standup so we can align on capacity and unblock the k8s migration track.\"",
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
        source_excerpt:
          '[#dev-ops • TechLead • 08:22]\n"@channel URGENT — main branch CI is RED since 08:15. Blocking ALL deployments. Likely flaky Playwright test in auth suite. Please investigate NOW, release is today."',
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
        source_excerpt:
          '[#incidents • PagerDuty-Bot • 07:45]\n"ALERT: prod-worker-03 — CPU at 94% for 20+ consecutive minutes (threshold: 85%). Possible memory leak or runaway process. Acknowledge or escalate to on-call engineer immediately."',
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
        source_excerpt:
          '[Email • From: legal@company.com • 2026-05-22]\n"Attached: revised SLA for Q3 per client negotiation outcomes. Requires PM approval before May 30. Key change: Section 4.2 response-time SLOs tightened from 4h to 2h."',
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
        source_excerpt:
          '[Email • From: hr@company.com • 2026-05-24]\n"Reminder: Minh Nguyen (contractor, frontend) starts Monday June 2. Please ensure repo access (GitHub + Jira), onboarding doc link, and Slack invite are sent before their first day."',
      },
    ],
  },
];

// ─── Briefing — today / tomorrow task lists ───────────────────────────────────

export interface BriefingTask {
  id: string;
  title: string;
  source: TaskSource;
  priority: TaskPriority;
  status: TaskStatus;
  deadlineLabel: string;
  deadlineUrgent: boolean;
}

export const MOCK_BRIEFING_TODAY: BriefingTask[] = [
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

export const MOCK_BRIEFING_TOMORROW: BriefingTask[] = [
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

export const MOCK_BRIEFING_TEXT =
  "You have 3 tasks due today and 2 tasks due tomorrow. Your top priority is reviewing PR #42 before 18:00 — the auth module release depends on it. Don't forget to reply to the client email for Project XYZ before end of day. You've got this!";
