# Task Mom 24/7 — Frontend Project Context

## Project Overview
Task Mom 24/7 is an AI-powered TODO aggregator for software teams. An AI agent
automatically collects tasks from Jira, email, meeting minutes, and chat, then
presents them for user review. The tagline: "không quên, không giận, không hối."

## Tech Stack
- Framework: Create React App (CRA) with TypeScript
- HTTP client: Axios
- Styling: CSS Modules (one .module.css per component)
- No UI library — custom components only
- No state management library — useState/useEffect only

## Design System

### Colors
```
Primary accent:       #F26522  (FPT orange — buttons, active states, badges)
Background dark:      #0F1117
Surface/card dark:    #1A1D23
Sidebar dark:         #13161B
Background light:     #F8F9FA
Surface/card light:   #FFFFFF
Sidebar light:        #F1F3F5
Text primary dark:    #F9FAFB
Text secondary dark:  #9CA3AF
Text primary light:   #111827
Text secondary light: #6B7280
Border dark:          #2D3748
Border light:         #E5E7EB
High priority/overdue:#EF4444
Medium priority:      #F59E0B
Low priority/done:    #10B981
Confidence high(≥80): #10B981
Confidence mid(50-79):#F59E0B
Confidence low(<50):  #EF4444
```

### Typography
- Font family: Inter, system-ui, sans-serif
- Monospace (source excerpts, agent trace): JetBrains Mono, monospace
- Base size: 14px, line-height 1.5

### Spacing scale
- xs: 8px | sm: 12px | md: 16px | lg: 24px | xl: 32px

### Border radius
- Small elements: 4px
- Buttons, inputs, cards: 8px
- Large sections: 12px

### Layout
- Fixed left sidebar: 240px wide
- Top header bar: 56px tall
- Main content: remaining width, scrollable
- Sidebar has app logo top, nav links middle, user info bottom

## Component Structure
```
frontend/src/
├── pages/
│   └── Dashboard.tsx           ← Main page
├── components/
│   ├── AppShell.tsx            ← Sidebar + header wrapper
│   ├── TaskCard.tsx            ← Individual task with Accept/Reject
│   ├── DailyBriefing.tsx       ← Briefing stats widget
│   ├── FilterBar.tsx           ← Priority / Source / Sort dropdowns
│   └── ActionBar.tsx           ← Run Agent button + loading state
├── constants/
│   └── colors.ts               ← All color tokens as named exports
├── types/
│   └── api.types.ts            ← TypeScript interfaces
└── App.tsx
```

## TypeScript Interfaces
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  source: 'jira' | 'email' | 'meeting' | 'teams' | 'slack';
  priority: 'urgent' | 'normal' | 'low';
  confidence: number;        // 0-100
  reason: string;            // one-line explanation
  deadline?: string;         // ISO date string
  assignee?: string;
  group_label?: string;      // thread context label
}

interface DailyBriefingData {
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
```

## API Endpoints (backend runs on http://localhost:8000)
```
GET  /health                    → verify API online
POST /run-agent                 → trigger task extraction
GET  /tasks                     → get all tasks
GET  /tasks?priority=urgent     → filter by priority
POST /tasks/{id}/accept         → accept a task
POST /tasks/{id}/reject         → reject a task
GET  /daily-briefing            → get briefing stats
```

### Standard response envelope
```json
{
  "success": true,
  "data": {},
  "timestamp": "2026-05-21T09:00:00Z"
}
```

## Visual Design Reference
Stitch screen designs are saved as PNG files in /designs/. Always reference the
relevant screenshot when generating a component so styling matches exactly.

- designs/S01-login.png
- designs/S02-dashboard.png
- designs/S03-task-detail.png
- designs/S04-confirm.png
- designs/S05-sources.png
- designs/S06-notifications.png
- designs/S07-briefing.png
- designs/S08-admin.png

## Key Design Rules (enforced from Stitch designs)
1. Dark mode is the primary view. Light mode uses same layout, inverted surfaces.
2. Cards use subtle box-shadow for elevation — no heavy borders.
3. Priority pills: pill-shaped, 10% opacity background + matching text color.
4. Source badges: colored pills — Jira=blue #3B82F6, Email=purple #8B5CF6, Meeting=teal #14B8A6, Teams=indigo #6366F1.
5. Confidence score badge: colored by threshold (green ≥80, yellow 50-79, red <50).
6. TaskCard left border: 4px solid, color matches priority (red/amber/green).
7. Primary CTA buttons: background #F26522, white text, 8px radius, 48px height.
8. Sidebar active item: orange left border indicator + slightly lighter background.
9. Tables: hover state only — no alternating row colors.
10. Monospace font for source excerpts and agent traces.

## Development Phases
- Phase 1 (hours 1-5): Use mock data only. Do NOT call the API.
- Phase 2 (hour 5+): Replace mock with real API calls.

## Mock Data for Phase 1
```typescript
const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Review PR #42 for authentication module',
    source: 'jira',
    priority: 'urgent',
    confidence: 92,
    reason: "Imperative assignment detected: 'please review before EOD'",
    deadline: '2026-05-21',
    group_label: 'Project Alpha — Auth Module'
  },
  {
    id: 'task-2',
    title: 'Reply to client delivery status email',
    source: 'email',
    priority: 'normal',
    confidence: 85,
    reason: "'Need by Friday' deadline signal detected",
    deadline: '2026-05-22'
  },
  {
    id: 'task-3',
    title: 'Update authentication documentation',
    source: 'meeting',
    priority: 'low',
    confidence: 74,
    reason: "Action item in meeting transcript: 'Linh to update docs'",
    deadline: '2026-05-24',
    group_label: 'Project Alpha — Auth Module'
  }
];

const mockBriefing: DailyBriefingData = {
  total_tasks: 3,
  breakdown: { urgent: 1, normal: 1, low: 1 },
  overload_risk: 'medium',
  estimated_effort_hours: 6,
  recommendation: 'Focus on the urgent PR review first — the auth release depends on it.'
};
```

## Code Style Rules
- One component per file, named export + default export both
- CSS Modules only — no inline styles except truly dynamic values (e.g., border color from priority)
- Use color tokens from constants/colors.ts, never hardcode hex values in components
- All props must be typed with TypeScript interfaces
- Error states and loading states required for every API call component
- No console.log in committed code
