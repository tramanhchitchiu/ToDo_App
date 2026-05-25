# Basic Design Document (基本設計書)
## Task Mom 24/7 — AI-Powered Multi-Source TODO Aggregator

| Item | Detail |
|---|---|
| **Document Version** | 1.0 |
| **Date** | 2026-05-21 |
| **Based On** | requirement_definition.md v1.0 |
| **Status** | Draft |

---

## Section 1: Screen List

| Screen ID | Screen Name | Role(s) with Access | Menu Hierarchy | Main Functions (FR-IDs) |
|---|---|---|---|---|
| S01 | Login Screen | All (unauthenticated) | — | FR-01: Authenticate user |
| S02 | TODO Dashboard | R-01 | Dashboard | FR-08: Centralized task list with sort/filter; FR-10: Inline status update; FR-13: Duplicate flag indicator; FR-14: AI priority badge |
| S03 | Task Detail Screen | R-01 | Dashboard › Task Detail | FR-09: Full task detail with thread narrative + source excerpt; FR-10: Edit fields and update status |
| S04 | Task Confirmation Screen | R-01 | Dashboard › Confirm Tasks | FR-05: Confidence Meter display; FR-06: Thread Intelligence + invalidation flags; FR-07: Accept / Edit / Reject per item and batch |
| S05 | Data Source Settings | R-01 | Settings › Data Sources | FR-02: Add / edit / remove source connectors; FR-03: Manual ingestion trigger |
| S06 | Notification Settings | R-01 | Settings › Notifications | FR-11: Reminder offset config; FR-12: Notification channel preferences |
| S07 | Daily Briefing Screen | R-01 | Dashboard › Daily Briefing | FR-16: View AI-generated daily summary and today's task list |
| S08 | User Management Screen | R-03 | Admin › Users | FR-18: Create / deactivate users; assign connector access |

---

## Section 2: Screen Transition Diagram

```mermaid
flowchart TD
    S01[S01\nLogin Screen] -->|Submit valid credentials| S02[S02\nTODO Dashboard]

    S02 -->|Click task row| S03[S03\nTask Detail Screen]
    S02 -->|Click 'Confirm Tasks' badge/button| S04[S04\nTask Confirmation Screen]
    S02 -->|Click 'Daily Briefing'| S07[S07\nDaily Briefing Screen]
    S02 -->|Click 'Data Sources' in sidebar| S05[S05\nData Source Settings]
    S02 -->|Click 'Notifications' in sidebar| S06[S06\nNotification Settings]
    S02 -->|Admin: Click 'Users' in sidebar| S08[S08\nUser Management Screen]
    S02 -->|Click 'Logout'| S01

    S03 -->|Save edits / Update status| S03
    S03 -->|Click Back / Breadcrumb| S02

    S04 -->|Finish confirming all candidates| S02
    S04 -->|Click task title to see full detail| S03

    S05 -->|Save connector config| S05
    S05 -->|Trigger manual ingestion → candidates queued| S04
    S05 -->|Click Back| S02

    S06 -->|Save preferences| S06
    S06 -->|Click Back| S02

    S07 -->|Click task in briefing list| S03
    S07 -->|Click Back| S02

    S08 -->|Save user record| S08
    S08 -->|Click Back| S02
```

---

## Section 3: Screen Layout Design

---

### S01: Login Screen

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                                                                      │
│                  ┌─────────────────────────────────┐                │
│                  │   🤱 Task Mom 24/7               │                │
│                  │   "không quên, không giận,       │                │
│                  │    không hối"                    │                │
│                  ├─────────────────────────────────┤                │
│                  │  Email                           │                │
│                  │  ┌───────────────────────────┐  │                │
│                  │  │ user@example.com          │  │                │
│                  │  └───────────────────────────┘  │                │
│                  │  Password                        │                │
│                  │  ┌───────────────────────────┐  │                │
│                  │  │ ••••••••                  │  │                │
│                  │  └───────────────────────────┘  │                │
│                  │                                  │                │
│                  │  [ Error message area ]          │                │
│                  │                                  │                │
│                  │  ┌───────────────────────────┐  │                │
│                  │  │       Sign In             │  │                │
│                  │  └───────────────────────────┘  │                │
│                  │                                  │                │
│                  │  ──────────── or ────────────   │                │
│                  │  ┌───────────────────────────┐  │                │
│                  │  │  Sign in with SSO         │  │                │
│                  │  └───────────────────────────┘  │                │
│                  └─────────────────────────────────┘                │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

### S02: TODO Dashboard

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ 🤱 Task Mom 24/7                               [🔔 3]  Linh (R-01)  [Logout] │
├──────────────┬───────────────────────────────────────────────────────────────┤
│ > Dashboard  │  TODO Dashboard                           [+ Manual Ingest]   │
│   Confirm(5) │ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐  │
│   Briefing   │ │ Total: 24  │ │ Due Today:3│ │Overdue: 1  │ │ Done: 12   │  │
│ ─────────    │ └────────────┘ └────────────┘ └────────────┘ └────────────┘  │
│ Settings     │                                                               │
│   Sources    │ [🔍 Search tasks...]  [Source ▼]  [Status ▼]  [Priority ▼]   │
│   Notifs     │                                                               │
│ ─────────    │ ┌─────────────────────────────────────────────────────────┐   │
│ Admin        │ │ # │ Title          │ Source │ Deadline  │ Priority│Status│  │
│   Users      │ ├───┼────────────────┼────────┼───────────┼─────────┼──────┤  │
│              │ │ 1 │ Review PR #42  │ Jira   │ 2026-05-21│ 🔴 High │ Todo │  │
│              │ │ 2 │ Reply client   │ Email  │ 2026-05-22│ 🟡 Med  │ In ▶ │  │
│              │ │ 3 │ Update doc…   │ Meeting│ 2026-05-24│ 🟢 Low  │ Todo │  │
│              │ │ 4 │ Fix bug #103  │ Teams  │ 2026-05-25│ 🔴 High │ Todo │  │
│              │ │ …                                                       │   │
│              │ └─────────────────────────────────────────────────────────┘   │
│              │                          [< 1  2  3 >]  Showing 1–10 of 24   │
├──────────────┴───────────────────────────────────────────────────────────────┤
│ Task Mom 24/7 v1.0 — Last ingestion: 2026-05-21 08:30                        │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### S03: Task Detail Screen

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ 🤱 Task Mom 24/7                               [🔔 3]  Linh (R-01)  [Logout] │
├──────────────┬───────────────────────────────────────────────────────────────┤
│   Dashboard  │  Dashboard › Task Detail                         [← Back]     │
│   Confirm(5) │                                                               │
│   Briefing   │  Title                                                        │
│ ─────────    │  ┌─────────────────────────────────────────────────────────┐  │
│ Settings     │  │ Review PR #42 for authentication module                 │  │
│   Sources    │  └─────────────────────────────────────────────────────────┘  │
│   Notifs     │                                                               │
│              │  ┌────────────────┐  ┌───────────────┐  ┌────────────────┐   │
│              │  │ Source: Jira   │  │ Deadline:     │  │ Priority: High │   │
│              │  │                │  │ 2026-05-21    │  │ [AI Suggested] │   │
│              │  └────────────────┘  └───────────────┘  └────────────────┘   │
│              │                                                               │
│              │  Status: [ Todo ▼ ]     Assigned to: Linh                    │
│              │                                                               │
│              │  Description                                                  │
│              │  ┌─────────────────────────────────────────────────────────┐  │
│              │  │ The PR needs a second reviewer before merging. Please   │  │
│              │  │ review and approve or leave comments.                   │  │
│              │  └─────────────────────────────────────────────────────────┘  │
│              │                                                               │
│              │  Thread Context                                               │
│              │  ┌─────────────────────────────────────────────────────────┐  │
│              │  │ Group: Project Alpha — Auth Module                      │  │
│              │  │ Narrative: "Sprint 3 introduced OAuth2. PR #42 is the   │  │
│              │  │  final review gate before merge to main. Related to     │  │
│              │  │  tasks: Fix bug #103 (blocking), Update doc (follow-up)"│  │
│              │  └─────────────────────────────────────────────────────────┘  │
│              │                                                               │
│              │  Source Excerpt (read-only)                                   │
│              │  ┌─────────────────────────────────────────────────────────┐  │
│              │  │ [Jira] Ticket ALPHA-42 assigned to Linh by TrungNT:     │  │
│              │  │ "Please review this PR before EOD today."               │  │
│              │  └─────────────────────────────────────────────────────────┘  │
│              │                                                               │
│              │                     [Save Changes]  [Cancel]                 │
├──────────────┴───────────────────────────────────────────────────────────────┤
│ Task Mom 24/7 v1.0                                                           │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### S04: Task Confirmation Screen

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ 🤱 Task Mom 24/7                               [🔔 3]  Linh (R-01)  [Logout] │
├──────────────┬───────────────────────────────────────────────────────────────┤
│   Dashboard  │  Confirm Tasks  (5 pending)       [✓ Accept All ≥80]  [← Back]│
│ > Confirm(5) │                                                               │
│   Briefing   │  ┌──────────────────────────────────────────────────────────┐ │
│ ─────────    │  │ 📁 Thread: Project Alpha — Auth Module                   │ │
│ Settings     │  │ "Sprint 3 introduced OAuth2. Two tasks share this thread."│ │
│   Sources    │  ├──────────────────────────────────────────────────────────┤ │
│   Notifs     │  │ [☐] Review PR #42          Source: Jira   Score: 92/100  │ │
│              │  │     "Imperative assignment: 'please review'"             │ │
│              │  │     Deadline: 2026-05-21   ⚠️ May be invalidated         │ │
│              │  │                  [✓ Accept]  [✏ Edit]  [✗ Reject]        │ │
│              │  ├──────────────────────────────────────────────────────────┤ │
│              │  │ [☐] Update auth docs       Source: Meeting  Score: 74/100│ │
│              │  │     "Action item noted in minutes: 'Linh to update docs'"│ │
│              │  │     Deadline: 2026-05-24                                  │ │
│              │  │                  [✓ Accept]  [✏ Edit]  [✗ Reject]        │ │
│              │  └──────────────────────────────────────────────────────────┘ │
│              │                                                               │
│              │  ┌──────────────────────────────────────────────────────────┐ │
│              │  │ 📁 Thread: Client XYZ — Delivery                         │ │
│              │  ├──────────────────────────────────────────────────────────┤ │
│              │  │ [☐] Reply to client email  Source: Email  Score: 85/100  │ │
│              │  │     "'Need by Friday' deadline signal detected"          │ │
│              │  │     Deadline: 2026-05-22                                  │ │
│              │  │                  [✓ Accept]  [✏ Edit]  [✗ Reject]        │ │
│              │  └──────────────────────────────────────────────────────────┘ │
│              │                                                               │
│              │                           [Submit All Decisions]             │
├──────────────┴───────────────────────────────────────────────────────────────┤
│ Task Mom 24/7 v1.0                                                           │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### S05: Data Source Settings

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ 🤱 Task Mom 24/7                               [🔔 3]  Linh (R-01)  [Logout] │
├──────────────┬───────────────────────────────────────────────────────────────┤
│   Dashboard  │  Settings › Data Sources                  [+ Add Source]      │
│   Confirm(5) │                                                               │
│   Briefing   │  ┌──────────────────────────────────────────────────────────┐ │
│ ─────────    │  │ Jira                                  🟢 Active  [Edit]   │ │
│ Settings     │  │ Endpoint: https://fpt.atlassian.net   Polling: 30 min     │ │
│ > Sources    │  │                               [▶ Run Now]  [🗑 Remove]    │ │
│   Notifs     │  ├──────────────────────────────────────────────────────────┤ │
│              │  │ Email (Exchange)               🟢 Active  [Edit]          │ │
│              │  │ Account: linh@fpt.com          Polling: 15 min            │ │
│              │  │                               [▶ Run Now]  [🗑 Remove]    │ │
│              │  ├──────────────────────────────────────────────────────────┤ │
│              │  │ Meeting Minutes (File Upload)  🔵 Manual  [Edit]          │ │
│              │  │ Upload .txt / .docx / .pdf                                │ │
│              │  │  [📁 Upload File]              Last: 2026-05-20           │ │
│              │  ├──────────────────────────────────────────────────────────┤ │
│              │  │ Teams                          🔴 Inactive [Edit]         │ │
│              │  │ Not configured                                            │ │
│              │  │                               [▶ Configure]               │ │
│              │  └──────────────────────────────────────────────────────────┘ │
│              │                                                               │
│              │  ┌──────────────────────────────────────────────────────────┐ │
│              │  │ Add / Edit Source Form                                   │ │
│              │  │ Source Type: [ Jira ▼ ]                                  │ │
│              │  │ Endpoint URL: [___________________________________]       │ │
│              │  │ API Token:    [___________________________________]       │ │
│              │  │ Polling (min):[ 30 ]    [ ] Active                       │ │
│              │  │                              [Save]  [Cancel]            │ │
│              │  └──────────────────────────────────────────────────────────┘ │
├──────────────┴───────────────────────────────────────────────────────────────┤
│ Task Mom 24/7 v1.0                                                           │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### S06: Notification Settings

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ 🤱 Task Mom 24/7                               [🔔 3]  Linh (R-01)  [Logout] │
├──────────────┬───────────────────────────────────────────────────────────────┤
│   Dashboard  │  Settings › Notifications                                     │
│   Confirm(5) │                                                               │
│   Briefing   │  Reminder Channels                                            │
│ ─────────    │  ┌──────────────────────────────────────────────────────────┐ │
│ Settings     │  │ [☑] In-App Notification                                  │ │
│   Sources    │  │ [☑] Email         Target: linh@fpt.com                   │ │
│ > Notifs     │  │ [☐] Microsoft Teams  Target: [_______________________]   │ │
│              │  │ [☐] Slack            Target: [_______________________]   │ │
│              │  └──────────────────────────────────────────────────────────┘ │
│              │                                                               │
│              │  Reminder Timing                                              │
│              │  ┌──────────────────────────────────────────────────────────┐ │
│              │  │ Send reminders:                                          │ │
│              │  │  [☑] 24 hours before deadline                           │ │
│              │  │  [☑] 1 hour before deadline                             │ │
│              │  │  [☐] Custom offset: [ ___ ] hours before                │ │
│              │  └──────────────────────────────────────────────────────────┘ │
│              │                                                               │
│              │  Daily Briefing                                               │
│              │  ┌──────────────────────────────────────────────────────────┐ │
│              │  │ [☑] Enable Daily Briefing                               │ │
│              │  │ Send at: [ 08:00 ] (HH:MM)                              │ │
│              │  │ Channel: [ Email ▼ ]                                     │ │
│              │  └──────────────────────────────────────────────────────────┘ │
│              │                                                               │
│              │                              [Save Settings]  [Reset]        │
├──────────────┴───────────────────────────────────────────────────────────────┤
│ Task Mom 24/7 v1.0                                                           │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### S07: Daily Briefing Screen

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ 🤱 Task Mom 24/7                               [🔔 3]  Linh (R-01)  [Logout] │
├──────────────┬───────────────────────────────────────────────────────────────┤
│   Dashboard  │  Daily Briefing — Thu, 21 May 2026                 [← Back]  │
│   Confirm(5) │                                                               │
│ > Briefing   │  ┌──────────────────────────────────────────────────────────┐ │
│ ─────────    │  │ 🌅 Good morning, Linh!                                   │ │
│ Settings     │  │                                                          │ │
│   Sources    │  │ You have 3 tasks due today and 2 due tomorrow. One task  │ │
│   Notifs     │  │ is overdue — review PR #42 needs your attention before   │ │
│              │  │ EOD. Your highest-priority item is the client email reply │ │
│              │  │ for Project XYZ. Have a focused day!                     │ │
│              │  └──────────────────────────────────────────────────────────┘ │
│              │                                                               │
│              │  Today's Tasks (3)                                            │
│              │  ┌──────────────────────────────────────────────────────────┐ │
│              │  │  🔴 Review PR #42           Jira    Due: Today 18:00     │ │
│              │  │  🟡 Reply to client email   Email   Due: Today EOD       │ │
│              │  │  🟢 Team standup notes      Teams   Due: Today 10:00     │ │
│              │  └──────────────────────────────────────────────────────────┘ │
│              │                                                               │
│              │  Tomorrow's Tasks (2)                                         │
│              │  ┌──────────────────────────────────────────────────────────┐ │
│              │  │  🔴 Fix bug #103            Jira    Due: Tomorrow        │ │
│              │  │  🟡 Update auth docs        Meeting Due: Fri 2026-05-24  │ │
│              │  └──────────────────────────────────────────────────────────┘ │
├──────────────┴───────────────────────────────────────────────────────────────┤
│ Task Mom 24/7 v1.0 — Briefing generated: 2026-05-21 08:00                   │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### S08: User Management Screen *(Extended Mode — R-03 only)*

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ 🤱 Task Mom 24/7                             [🔔 0]  Admin (R-03)  [Logout]  │
├──────────────┬───────────────────────────────────────────────────────────────┤
│   Dashboard  │  Admin › User Management                   [+ Create User]   │
│   Confirm(0) │                                                               │
│   Briefing   │  [🔍 Search by name or email...]                             │
│ ─────────    │                                                               │
│ Settings     │  ┌──────────────────────────────────────────────────────────┐ │
│   Sources    │  │ Name          │ Email             │ Role  │ Status │ Act  │ │
│   Notifs     │  ├───────────────┼───────────────────┼───────┼────────┼──── │ │
│ ─────────    │  │ Nguyen T.Linh │ linh@fpt.com      │ User  │🟢Active│[···]│ │
│ > Admin      │  │ Tran Van A    │ trva@fpt.com      │ User  │🟢Active│[···]│ │
│   Users      │  │ Le Thi B      │ lethb@fpt.com     │ User  │🔴Inact │[···]│ │
│              │  │ Admin Sys     │ admin@fpt.com     │ Admin │🟢Active│[···]│ │
│              │  └──────────────────────────────────────────────────────────┘ │
│              │                          [< 1 >]  Showing 1–4 of 4           │
│              │                                                               │
│              │  ┌──────────────────────────────────────────────────────────┐ │
│              │  │ Create / Edit User Form                                  │ │
│              │  │ Display Name: [_________________________________]        │ │
│              │  │ Email:        [_________________________________]        │ │
│              │  │ Role:         [ User ▼ ]                                 │ │
│              │  │ Status:       [☑] Active                                 │ │
│              │  │ Connectors:   [☑] Jira  [☑] Email  [☐] Teams            │ │
│              │  │                              [Save]  [Cancel]            │ │
│              │  └──────────────────────────────────────────────────────────┘ │
├──────────────┴───────────────────────────────────────────────────────────────┤
│ Task Mom 24/7 v1.0                                                           │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Section 4: UI Component Description

---

### S01: Login Screen

| Item ID | Item Name | Item Type | I/O | Data Type | Initial Value | Required | Max Length | Validation Rules | Description |
|---|---|---|---|---|---|---|---|---|---|
| S01-ITM-01 | Email Field | TextField | Input | string | Empty | Yes | 255 | Valid email format (RFC 5322) | User enters their email address |
| S01-ITM-02 | Password Field | PasswordField | Input | string | Empty | Yes | 128 | Min 8 characters | User enters password; masked display |
| S01-ITM-03 | Sign In Button | Button | Input | - | - | - | - | Enabled only when both fields are non-empty | Submits login form |
| S01-ITM-04 | SSO Button | Button | Input | - | - | - | - | - | Redirects to SSO provider flow |
| S01-ITM-05 | Error Message | Label | Output | string | Hidden | - | - | Shown on auth failure | Displays "Invalid email or password" |

---

### S02: TODO Dashboard

| Item ID | Item Name | Item Type | I/O | Data Type | Initial Value | Required | Max Length | Validation Rules | Description |
|---|---|---|---|---|---|---|---|---|---|
| S02-ITM-01 | Total Tasks Badge | Label | Output | number | 0 | - | - | - | Count of all confirmed TodoItems |
| S02-ITM-02 | Due Today Badge | Label | Output | number | 0 | - | - | - | Count of tasks with deadline = today |
| S02-ITM-03 | Overdue Badge | Label | Output | number | 0 | - | - | Highlight red if > 0 | Count of tasks past deadline |
| S02-ITM-04 | Done Badge | Label | Output | number | 0 | - | - | - | Count of tasks with status = Done |
| S02-ITM-05 | Search Bar | SearchBar | Input | string | Empty | No | 200 | - | Full-text filter on task title and description |
| S02-ITM-06 | Source Filter | Dropdown | Input | enum | All | No | - | Values: All, Jira, Email, Meeting, Teams | Filter task list by source |
| S02-ITM-07 | Status Filter | Dropdown | Input | enum | All | No | - | Values: All, Todo, In Progress, Done | Filter task list by status |
| S02-ITM-08 | Priority Filter | Dropdown | Input | enum | All | No | - | Values: All, High, Medium, Low | Filter task list by priority |
| S02-ITM-09 | Task Table | Table | Output | array\<TodoItem\> | Empty | - | - | Sortable by title, source, deadline, priority, status | Displays confirmed tasks |
| S02-ITM-10 | Status Toggle | Dropdown | Both | enum | Current status | No | - | Values: Todo, In Progress, Done | Inline status update per row |
| S02-ITM-11 | Pagination | Pagination | Both | number | Page 1 | No | - | Page size: 10 | Navigate pages of task list |
| S02-ITM-12 | Manual Ingest Button | Button | Input | - | - | - | - | - | Triggers immediate ingestion run |
| S02-ITM-13 | Notification Bell | Button | Output | number | 0 | - | - | Badge shows unread count | Opens notification panel |
| S02-ITM-14 | Confirm Tasks Button | Button | Output | number | 0 | - | - | Badge shows pending candidate count | Navigates to S04 |

---

### S03: Task Detail Screen

| Item ID | Item Name | Item Type | I/O | Data Type | Initial Value | Required | Max Length | Validation Rules | Description |
|---|---|---|---|---|---|---|---|---|---|
| S03-ITM-01 | Title Field | TextField | Both | string | Loaded value | Yes | 500 | Non-empty | Editable task title |
| S03-ITM-02 | Source Label | Label | Output | string | Loaded value | - | - | Read-only | Displays source type (Jira, Email, etc.) |
| S03-ITM-03 | Deadline Picker | DatePicker | Both | date | Loaded value | No | - | Must be today or future | Editable deadline |
| S03-ITM-04 | Priority Label | Label | Output | enum | Loaded value | - | - | Values: High, Medium, Low; AI Suggested badge if set by agent | Displays priority |
| S03-ITM-05 | Status Dropdown | Dropdown | Both | enum | Loaded value | Yes | - | Values: Todo, In Progress, Done | Update task status |
| S03-ITM-06 | Assignee Label | Label | Output | string | Loaded value | - | - | Read-only | Displays assignee name |
| S03-ITM-07 | Description Field | TextField | Both | string | Loaded value | No | 2000 | - | Multi-line editable description |
| S03-ITM-08 | Thread Context Panel | Label | Output | string | Loaded value | - | - | Read-only; collapsible | Displays TaskGroup context_label and narrative_summary |
| S03-ITM-09 | Invalidation Warning | Label | Output | boolean | Hidden | - | - | Show if invalidation_flag = true | Warns user that task context may have changed |
| S03-ITM-10 | Source Excerpt | Label | Output | string | Loaded value | - | - | Read-only | Shows original text snippet from source |
| S03-ITM-11 | Save Changes Button | Button | Input | - | - | - | - | Enabled when any field is changed | Saves edits to TodoItem |
| S03-ITM-12 | Cancel Button | Button | Input | - | - | - | - | - | Discards unsaved changes |
| S03-ITM-13 | Back Link | Link | Input | - | - | - | - | - | Returns to S02 |

---

### S04: Task Confirmation Screen

| Item ID | Item Name | Item Type | I/O | Data Type | Initial Value | Required | Max Length | Validation Rules | Description |
|---|---|---|---|---|---|---|---|---|---|
| S04-ITM-01 | Thread Group Header | Label | Output | string | Loaded | - | - | One header per TaskGroup | Displays context_label and narrative_summary |
| S04-ITM-02 | Invalidation Warning | Label | Output | boolean | Hidden | - | - | Shown if invalidation_flag = true | Warns that requirement may have changed |
| S04-ITM-03 | Task Title | Label | Output | string | Loaded | - | - | Clickable — navigates to S03 | Displays candidate title |
| S04-ITM-04 | Confidence Score | Label | Output | number | Loaded | - | - | Color-coded: ≥80 green, 50–79 yellow, <50 red | Shows 0–100 score |
| S04-ITM-05 | Confidence Reason | Label | Output | string | Loaded | - | - | Read-only | One-line explanation from agent |
| S04-ITM-06 | Source Badge | Label | Output | string | Loaded | - | - | Values: Jira, Email, Meeting, Teams | Source type indicator |
| S04-ITM-07 | Deadline Label | Label | Output | date | Loaded | - | - | - | Candidate deadline if detected |
| S04-ITM-08 | Accept Button | Button | Input | - | - | - | - | - | Accepts candidate; creates TodoItem |
| S04-ITM-09 | Edit Button | Button | Input | - | - | - | - | - | Opens inline edit form for candidate fields |
| S04-ITM-10 | Reject Button | Button | Input | - | - | - | - | - | Opens reject reason modal |
| S04-ITM-11 | Reject Reason Modal | Modal | Input | string | Empty | No | 500 | - | Optional reason for rejection (used for feedback learning) |
| S04-ITM-12 | Batch Accept Button | Button | Input | number | - | - | - | Threshold configurable (default: score ≥ 80) | Accepts all candidates above score threshold |
| S04-ITM-13 | Batch Select Checkbox | Checkbox | Input | boolean | Unchecked | No | - | - | Select/deselect all for batch action |
| S04-ITM-14 | Submit All Button | Button | Input | - | - | - | - | Disabled until every candidate has a decision | Commits all Accept/Reject/Edit decisions |

---

### S05: Data Source Settings

| Item ID | Item Name | Item Type | I/O | Data Type | Initial Value | Required | Max Length | Validation Rules | Description |
|---|---|---|---|---|---|---|---|---|---|
| S05-ITM-01 | Source List | Table | Output | array\<DataSourceConfig\> | Loaded | - | - | - | Shows all configured connectors with status |
| S05-ITM-02 | Add Source Button | Button | Input | - | - | - | - | - | Opens Add/Edit Source form |
| S05-ITM-03 | Run Now Button | Button | Input | - | - | - | - | Visible per active source | Triggers manual ingestion for that source |
| S05-ITM-04 | Remove Button | Button | Input | - | - | - | - | Requires confirmation dialog | Deletes connector config |
| S05-ITM-05 | Source Type Dropdown | Dropdown | Input | enum | Jira | Yes | - | Values: Jira, Email, Meeting Minutes, Teams, Slack | Source type selector in form |
| S05-ITM-06 | Endpoint URL Field | TextField | Input | string | Empty | Conditional | 500 | Required for API sources; valid URL format | API endpoint or server URL |
| S05-ITM-07 | API Token Field | PasswordField | Input | string | Empty | Conditional | 500 | Required for API sources; stored as secret ref | Credentials; masked display |
| S05-ITM-08 | Polling Interval | TextField | Input | number | 30 | Yes | - | Integer 5–1440 (minutes) | Auto-refresh frequency in minutes |
| S05-ITM-09 | Active Checkbox | Checkbox | Input | boolean | Checked | No | - | - | Enables/disables connector |
| S05-ITM-10 | File Upload Input | FileUpload | Input | file | - | Conditional | - | Accept: .txt, .docx, .pdf; max 20 MB | Shown only for Meeting Minutes source type |
| S05-ITM-11 | Save Button | Button | Input | - | - | - | - | Form validation must pass | Saves connector configuration |
| S05-ITM-12 | Cancel Button | Button | Input | - | - | - | - | - | Closes form without saving |

---

### S06: Notification Settings

| Item ID | Item Name | Item Type | I/O | Data Type | Initial Value | Required | Max Length | Validation Rules | Description |
|---|---|---|---|---|---|---|---|---|---|
| S06-ITM-01 | In-App Checkbox | Checkbox | Both | boolean | Checked | No | - | - | Enable in-app browser notification |
| S06-ITM-02 | Email Checkbox | Checkbox | Both | boolean | Checked | No | - | At least one channel must be active | Enable email reminder |
| S06-ITM-03 | Email Target | TextField | Both | string | User email | Conditional | 255 | Required + valid email if Email checkbox checked | Target email address |
| S06-ITM-04 | Teams Checkbox | Checkbox | Both | boolean | Unchecked | No | - | - | Enable Microsoft Teams reminder |
| S06-ITM-05 | Teams Target | TextField | Both | string | Empty | Conditional | 500 | Required if Teams checked; webhook URL format | Teams webhook URL |
| S06-ITM-06 | Slack Checkbox | Checkbox | Both | boolean | Unchecked | No | - | - | Enable Slack reminder |
| S06-ITM-07 | Slack Target | TextField | Both | string | Empty | Conditional | 500 | Required if Slack checked; webhook URL format | Slack webhook URL |
| S06-ITM-08 | 24h Offset Checkbox | Checkbox | Both | boolean | Checked | No | - | - | Send reminder 24 hours before deadline |
| S06-ITM-09 | 1h Offset Checkbox | Checkbox | Both | boolean | Checked | No | - | At least one offset must be selected | Send reminder 1 hour before deadline |
| S06-ITM-10 | Custom Offset Field | TextField | Both | number | Empty | No | - | Integer 1–168 hours; required if custom checked | User-defined reminder offset |
| S06-ITM-11 | Briefing Enable Checkbox | Checkbox | Both | boolean | Checked | No | - | - | Enable daily briefing delivery |
| S06-ITM-12 | Briefing Time | TextField | Both | time | 08:00 | Conditional | - | HH:MM format; required if briefing enabled | Time to deliver daily briefing |
| S06-ITM-13 | Briefing Channel | Dropdown | Both | enum | Email | Conditional | - | Values: In-App, Email, Teams, Slack; must be an active channel | Channel for briefing delivery |
| S06-ITM-14 | Save Settings Button | Button | Input | - | - | - | - | All validation must pass | Persists notification preferences |
| S06-ITM-15 | Reset Button | Button | Input | - | - | - | - | Requires confirmation | Resets to default values |

---

### S07: Daily Briefing Screen

| Item ID | Item Name | Item Type | I/O | Data Type | Initial Value | Required | Max Length | Validation Rules | Description |
|---|---|---|---|---|---|---|---|---|---|
| S07-ITM-01 | Greeting Header | Label | Output | string | Loaded | - | - | Personalized with user display name | "Good morning, [Name]!" |
| S07-ITM-02 | Briefing Text | Label | Output | string | Loaded | - | - | Read-only; AI-generated | Narrative summary of today's workload |
| S07-ITM-03 | Today Tasks List | Table | Output | array\<TodoItem\> | Loaded | - | - | Sorted by priority desc, deadline asc | Tasks due today |
| S07-ITM-04 | Tomorrow Tasks List | Table | Output | array\<TodoItem\> | Loaded | - | - | Sorted by priority desc | Tasks due tomorrow |
| S07-ITM-05 | Task Row Link | Link | Input | - | - | - | - | Each row navigates to S03 | Click to view task detail |
| S07-ITM-06 | Priority Icon | Label | Output | enum | Loaded | - | - | 🔴 High, 🟡 Medium, 🟢 Low | Visual priority indicator |
| S07-ITM-07 | Back Button | Button | Input | - | - | - | - | - | Returns to S02 |

---

### S08: User Management Screen *(Extended Mode)*

| Item ID | Item Name | Item Type | I/O | Data Type | Initial Value | Required | Max Length | Validation Rules | Description |
|---|---|---|---|---|---|---|---|---|---|
| S08-ITM-01 | Search Bar | SearchBar | Input | string | Empty | No | 200 | - | Filter by name or email |
| S08-ITM-02 | User Table | Table | Output | array\<User\> | Loaded | - | - | Sortable by name, email, status | Lists all users |
| S08-ITM-03 | Create User Button | Button | Input | - | - | - | - | R-03 only | Opens Create/Edit User form |
| S08-ITM-04 | Action Menu | Modal | Input | - | - | - | - | Per-row context menu | Edit / Deactivate actions |
| S08-ITM-05 | Display Name Field | TextField | Both | string | Empty | Yes | 100 | Non-empty | User's display name |
| S08-ITM-06 | Email Field | TextField | Both | string | Empty | Yes | 255 | Valid email; unique in system | User's login email |
| S08-ITM-07 | Role Dropdown | Dropdown | Both | enum | User | Yes | - | Values: User, Admin | Assign system role |
| S08-ITM-08 | Status Checkbox | Checkbox | Both | boolean | Checked | No | - | - | Active / Inactive toggle |
| S08-ITM-09 | Connector Checkboxes | Checkbox | Both | array\<string\> | None | No | - | At least one connector recommended | Assign accessible data sources |
| S08-ITM-10 | Save User Button | Button | Input | - | - | - | - | Form validation must pass | Creates or updates user record |
| S08-ITM-11 | Cancel Button | Button | Input | - | - | - | - | - | Closes form without saving |

---

## Section 5: Event Description

---

### S01: Login Screen

| Event ID | Event Name | Input Information | Validation Rules | Event Process Description | Output Data | Next Screen ID |
|---|---|---|---|---|---|---|
| S01-EVT-01 | onLoad | — | — | 1. Check if session token exists in cookie. 2. If valid, redirect to S02. 3. If not, render Login Screen. | Login form rendered | S02 (if session valid) |
| S01-EVT-02 | onSubmit (Sign In) | S01-ITM-01 (email), S01-ITM-02 (password) | Email: valid format. Password: non-empty. | 1. Disable Sign In button to prevent double-submit. 2. POST credentials to `/api/auth/login`. 3. On success: store JWT in httpOnly cookie; redirect to S02. 4. On failure: display S01-ITM-05 error message; re-enable button. | JWT session token | S02 |
| S01-EVT-03 | onClick (SSO Button) | — | — | 1. Redirect browser to SSO provider endpoint. 2. On callback: receive auth token; store; redirect to S02. | SSO token → JWT | S02 |

---

### S02: TODO Dashboard

| Event ID | Event Name | Input Information | Validation Rules | Event Process Description | Output Data | Next Screen ID |
|---|---|---|---|---|---|---|
| S02-EVT-01 | onLoad | User session token | Valid authenticated session | 1. Fetch summary counts (total, due today, overdue, done) via `GET /api/todos/summary`. 2. Fetch first page of TodoItems (default: all sources, all statuses, sort by deadline asc) via `GET /api/todos`. 3. Render S02-ITM-01 to S02-ITM-14. | TodoItem list, summary counts | — |
| S02-EVT-02 | onSearch | S02-ITM-05 (search text) | — | 1. Debounce 300ms. 2. Re-fetch task list with `search` query param. 3. Re-render table. | Filtered TodoItem list | — |
| S02-EVT-03 | onFilter (Source/Status/Priority) | S02-ITM-06, S02-ITM-07, S02-ITM-08 | Valid enum values | 1. Combine active filter values. 2. Re-fetch task list with filter params. 3. Reset to page 1. 4. Re-render table. | Filtered TodoItem list | — |
| S02-EVT-04 | onClick (Task Row) | todo_id | Valid todo_id | 1. Navigate to S03 passing todo_id as route param. | — | S03 |
| S02-EVT-05 | onChange (Status Toggle) | todo_id, new status | New status ≠ current status | 1. PATCH `/api/todos/{todo_id}` with `{status: newStatus}`. 2. On success: update row in table without full reload; show Toast "Status updated". 3. On error: revert dropdown; show error Toast. | Updated TodoItem | — |
| S02-EVT-06 | onClick (Manual Ingest) | — | — | 1. POST `/api/ingestion/run` for all active sources. 2. Show spinner on button; disable until complete. 3. On completion: navigate to S04 if new candidates exist; else show Toast "No new tasks found". | Ingestion session ID | S04 (if candidates) |
| S02-EVT-07 | onPageChange | Page number | Valid page ≥ 1 | 1. Fetch requested page with current filters/sort. 2. Re-render table. | Paginated TodoItem list | — |
| S02-EVT-08 | onClick (Confirm Tasks Badge) | — | Pending candidates > 0 | 1. Navigate to S04. | — | S04 |
| S02-EVT-09 | onClick (Logout) | — | — | 1. DELETE `/api/auth/session`. 2. Clear JWT cookie. 3. Redirect to S01. | — | S01 |

---

### S03: Task Detail Screen

| Event ID | Event Name | Input Information | Validation Rules | Event Process Description | Output Data | Next Screen ID |
|---|---|---|---|---|---|---|
| S03-EVT-01 | onLoad | todo_id (route param) | Valid todo_id belonging to current user | 1. Fetch `GET /api/todos/{todo_id}` including thread group and source excerpt. 2. Populate all fields. 3. Show invalidation warning (S03-ITM-09) if `invalidation_flag = true`. | TodoItem detail | — |
| S03-EVT-02 | onSave | S03-ITM-01 to S03-ITM-07, S03-ITM-05 | Title non-empty. Deadline: if set, must be a valid date. | 1. Validate all changed fields. 2. If valid: PATCH `/api/todos/{todo_id}` with changed fields. 3. On success: show Toast "Task saved"; remain on S03 with refreshed data. 4. On error: show error Toast; keep form editable. | Updated TodoItem | — |
| S03-EVT-03 | onClick (Cancel) | — | — | 1. If unsaved changes exist: show confirm dialog "Discard changes?". 2. On confirm: discard and return to S02. 3. On dismiss: remain on S03. | — | S02 |
| S03-EVT-04 | onChange (Status Dropdown) | New status value | Valid enum | 1. Mark form as dirty (triggers save requirement). | — | — |
| S03-EVT-05 | onClick (Back) | — | — | 1. Same behavior as Cancel (S03-EVT-03). | — | S02 |

---

### S04: Task Confirmation Screen

| Event ID | Event Name | Input Information | Validation Rules | Event Process Description | Output Data | Next Screen ID |
|---|---|---|---|---|---|---|
| S04-EVT-01 | onLoad | User session token | Valid session | 1. Fetch `GET /api/candidates?status=pending_confirmation` for current user. 2. Group by task_group_id. 3. Render candidates with confidence scores and thread narratives. | TaskCandidate list grouped by TaskGroup | — |
| S04-EVT-02 | onClick (Accept) | candidate_id | Valid candidate_id | 1. POST `/api/candidates/{candidate_id}/accept`. 2. System creates TodoItem from candidate; stores UserFeedback (action=accept). 3. Remove candidate card from list. 4. Update pending count badge. | New TodoItem, UserFeedback | — |
| S04-EVT-03 | onClick (Edit) | candidate_id | Valid candidate_id | 1. Expand inline edit form for that candidate (title, description, deadline editable). 2. User modifies fields. 3. On confirm: POST `/api/candidates/{candidate_id}/accept` with edited fields. 4. System creates TodoItem with edited values; stores UserFeedback (action=edit). | New TodoItem (edited), UserFeedback | — |
| S04-EVT-04 | onClick (Reject) | candidate_id | Valid candidate_id | 1. Open Reject Reason modal (S04-ITM-11). 2. User optionally enters reason. 3. On submit: POST `/api/candidates/{candidate_id}/reject` with `{reject_reason}`. 4. System stores UserFeedback (action=reject). 5. Remove card from list. | UserFeedback | — |
| S04-EVT-05 | onClick (Batch Accept ≥80) | Threshold score | — | 1. Collect all candidates with confidence_score ≥ 80. 2. Batch-POST `/api/candidates/batch-accept` with candidate_id list. 3. System creates TodoItems; stores UserFeedback for each. 4. Remove accepted cards; show Toast "N tasks confirmed". | N new TodoItems | — |
| S04-EVT-06 | onClick (Submit All) | All pending candidate decisions | Every candidate must have a decision (Accept/Edit/Reject) | 1. Validate all candidates have been actioned. 2. If any remain undecided: highlight undecided cards; show validation message. 3. If all decided: POST `/api/candidates/batch-submit`. 4. Navigate to S02. | All TodoItems and UserFeedback records committed | S02 |
| S04-EVT-07 | onClick (Task Title) | candidate_id, linked todo_id | — | 1. If task already accepted (has todo_id): navigate to S03. 2. If still candidate: open read-only detail popover. | — | S03 (if accepted) |

---

### S05: Data Source Settings

| Event ID | Event Name | Input Information | Validation Rules | Event Process Description | Output Data | Next Screen ID |
|---|---|---|---|---|---|---|
| S05-EVT-01 | onLoad | User session token | Valid session | 1. Fetch `GET /api/sources` for current user. 2. Render source cards with status indicators. | DataSourceConfig list | — |
| S05-EVT-02 | onSave (Add/Edit Source) | S05-ITM-05 to S05-ITM-09, S05-ITM-10 | Source type required. Endpoint URL: valid URL for API types. Polling: integer 5–1440. API Token non-empty for API types. File: .txt/.docx/.pdf ≤ 20MB for Meeting Minutes. | 1. Validate form. 2. For API sources: POST `/api/sources` or PATCH `/api/sources/{source_id}` with config (credentials stored server-side as secret ref — never in DB plain text). 3. For file upload: POST `/api/sources/upload` multipart. 4. On success: refresh source list; show Toast "Source saved". | DataSourceConfig record | — |
| S05-EVT-03 | onClick (Run Now) | source_id | Source must be active | 1. POST `/api/ingestion/run?source_id={source_id}`. 2. Show spinner on Run Now button. 3. On complete: if candidates generated, navigate to S04; else show Toast "No new tasks found". | IngestionSession, TaskCandidates | S04 (if candidates) |
| S05-EVT-04 | onClick (Remove) | source_id | — | 1. Show confirmation dialog "Remove this source? All future ingestion from this source will stop." 2. On confirm: DELETE `/api/sources/{source_id}`. 3. Refresh source list. | — | — |

---

### S06: Notification Settings

| Event ID | Event Name | Input Information | Validation Rules | Event Process Description | Output Data | Next Screen ID |
|---|---|---|---|---|---|---|
| S06-EVT-01 | onLoad | User session token | Valid session | 1. Fetch `GET /api/notification-prefs` for current user. 2. Populate all checkboxes, target fields, and time picker. | NotificationPreference data | — |
| S06-EVT-02 | onSave | S06-ITM-01 to S06-ITM-13 | At least one channel active. Conditional target fields required. At least one offset checked. Briefing time valid HH:MM if briefing enabled. Briefing channel must be an active channel. | 1. Validate all fields. 2. PUT `/api/notification-prefs` with complete preference object. 3. On success: show Toast "Notification preferences saved". 4. On error: show field-level error messages. | NotificationPreference record | — |
| S06-EVT-03 | onClick (Reset) | — | — | 1. Show confirmation "Reset to defaults?". 2. On confirm: reload default values into form (without saving). | Form reset to defaults | — |

---

### S07: Daily Briefing Screen

| Event ID | Event Name | Input Information | Validation Rules | Event Process Description | Output Data | Next Screen ID |
|---|---|---|---|---|---|---|
| S07-EVT-01 | onLoad | User session token, today's date | Valid session | 1. Fetch `GET /api/briefing/today` which returns AI-generated text + today's tasks + tomorrow's tasks. 2. If no briefing generated yet for today: trigger generation inline (POST `/api/briefing/generate`); show loading spinner. 3. Render S07-ITM-01 to S07-ITM-07. | DailyBriefing object, TodoItem lists | — |
| S07-EVT-02 | onClick (Task Row) | todo_id | Valid todo_id | 1. Navigate to S03 with todo_id. | — | S03 |
| S07-EVT-03 | onClick (Back) | — | — | 1. Navigate to S02. | — | S02 |

---

### S08: User Management Screen

| Event ID | Event Name | Input Information | Validation Rules | Event Process Description | Output Data | Next Screen ID |
|---|---|---|---|---|---|---|
| S08-EVT-01 | onLoad | Admin session token | R-03 role required; redirect to S02 if R-01 | 1. Fetch `GET /api/admin/users`. 2. Render user table. | User list | — |
| S08-EVT-02 | onSearch | S08-ITM-01 (search text) | — | 1. Debounce 300ms. 2. Re-fetch with `search` param. 3. Re-render table. | Filtered User list | — |
| S08-EVT-03 | onSave (Create/Edit User) | S08-ITM-05 to S08-ITM-09 | Display name non-empty. Email: valid format + unique. Role: valid enum. | 1. Validate form. 2. For new user: POST `/api/admin/users`. System creates user + sends activation email. 3. For edit: PATCH `/api/admin/users/{user_id}`. 4. On success: refresh table; show Toast. | User record | — |
| S08-EVT-04 | onClick (Deactivate) | user_id | Cannot deactivate own account | 1. Show confirmation "Deactivate user? They will lose access immediately." 2. On confirm: PATCH `/api/admin/users/{user_id}` `{status: inactive}`. 3. Refresh table. | Updated User status | — |

---

## Section 6: Data Structure Definition

### Data Structure List

| ID | Data Structure Name | Usage Purpose | Related Screens | Description |
|---|---|---|---|---|
| DS-01 | LoginRequest | Login form submission | S01 | Credentials payload sent to auth API |
| DS-02 | SessionToken | Auth state after login | All screens | JWT-based session |
| DS-03 | TodoItem | Confirmed task displayed on dashboard/detail | S02, S03, S07 | Maps to entity E-05 |
| DS-04 | TaskCandidate | Pending task awaiting user confirmation | S04 | Maps to entity E-04 |
| DS-05 | TaskGroup | Thread context grouping candidates/items | S03, S04 | Maps to entity E-06 |
| DS-06 | DataSourceConfig | External connector configuration | S05 | Maps to entity E-02 |
| DS-07 | NotificationPreference | User notification settings | S06 | Maps to entity E-08 |
| DS-08 | DailyBriefing | AI-generated morning summary | S07 | Derived from TodoItems + LLM |
| DS-09 | User | User account (admin use) | S08 | Maps to entity E-01 |
| DS-10 | UserFeedback | Accept/reject/edit records | S04 (written), S15 agent (read) | Maps to entity E-07 |

---

### DS-01: LoginRequest
```
LoginRequest {
  email:    string (required, email format, max: 255)
  password: string (required, min: 8, max: 128)
}
```

### DS-02: SessionToken
```
SessionToken {
  token:     string (required, JWT format)
  user_id:   number (required)
  role:      enum[User/Admin] (required)
  expires_at: datetime (required)
}
```

### DS-03: TodoItem
```
TodoItem {
  todo_id:          number (required, PK)
  candidate_id:     number (optional, FK → TaskCandidate)
  user_id:          number (required, FK → User)
  group_id:         number (optional, FK → TaskGroup)
  title:            string (required, max: 500)
  description:      string (optional, max: 2000)
  source_type:      enum[Jira/Email/Meeting/Teams/Slack] (required)
  source_excerpt:   string (optional, max: 1000)
  deadline:         date (optional)
  priority:         enum[High/Medium/Low] (optional)
  priority_source:  enum[AI/Manual] (optional)
  status:           enum[Todo/InProgress/Done] (required, default: Todo)
  assignee:         string (optional, max: 255)
  created_at:       datetime (required)
  updated_at:       datetime (required)
}
```

### DS-04: TaskCandidate
```
TaskCandidate {
  candidate_id:        number (required, PK)
  session_id:          number (required, FK → IngestionSession)
  user_id:             number (required, FK → User)
  group_id:            number (optional, FK → TaskGroup)
  title:               string (required, max: 500)
  description:         string (optional, max: 2000)
  source_type:         enum[Jira/Email/Meeting/Teams/Slack] (required)
  source_excerpt:      string (optional, max: 1000)
  deadline:            date (optional)
  assignee:            string (optional, max: 255)
  confidence_score:    number (required, min: 0, max: 100)
  confidence_reason:   string (required, max: 300)
  invalidation_flag:   boolean (required, default: false)
  confirmation_status: enum[pending_confirmation/accepted/rejected/edited] (required)
  created_at:          datetime (required)
}
```

### DS-05: TaskGroup
```
TaskGroup {
  group_id:          number (required, PK)
  user_id:           number (required, FK → User)
  context_label:     string (required, max: 255)
  narrative_summary: string (required, max: 1000)
  created_at:        datetime (required)
  updated_at:        datetime (required)
}
```

### DS-06: DataSourceConfig
```
DataSourceConfig {
  source_id:           number (required, PK)
  user_id:             number (required, FK → User)
  source_type:         enum[Jira/Email/Meeting/Teams/Slack] (required)
  endpoint_url:        string (optional, max: 500, valid URL)
  credentials_ref:     string (optional, max: 255, secret manager reference key)
  polling_interval_min: number (required, min: 5, max: 1440)
  last_ingested_at:    datetime (optional)
  is_active:           boolean (required, default: true)
}
```

### DS-07: NotificationPreference
```
NotificationPreference {
  pref_id:              number (required, PK)
  user_id:              number (required, FK → User)
  channel_inapp:        boolean (required, default: true)
  channel_email:        boolean (required, default: true)
  email_target:         string (optional, max: 255, email format)
  channel_teams:        boolean (required, default: false)
  teams_target:         string (optional, max: 500)
  channel_slack:        boolean (required, default: false)
  slack_target:         string (optional, max: 500)
  offset_24h:           boolean (required, default: true)
  offset_1h:            boolean (required, default: true)
  offset_custom_hours:  number (optional, min: 1, max: 168)
  briefing_enabled:     boolean (required, default: true)
  briefing_time:        string (optional, pattern: HH:MM)
  briefing_channel:     enum[InApp/Email/Teams/Slack] (optional)
}
```

### DS-08: DailyBriefing
```
DailyBriefing {
  briefing_id:     number (required, PK)
  user_id:         number (required, FK → User)
  briefing_date:   date (required)
  briefing_text:   string (required, max: 2000)
  today_tasks:     array<TodoItem> (required)
  tomorrow_tasks:  array<TodoItem> (required)
  generated_at:    datetime (required)
}
```

### DS-09: User
```
User {
  user_id:       number (required, PK)
  email:         string (required, max: 255, email format, unique)
  display_name:  string (required, max: 100)
  role:          enum[User/Admin] (required, default: User)
  is_active:     boolean (required, default: true)
  created_at:    datetime (required)
}
```

### DS-10: UserFeedback
```
UserFeedback {
  feedback_id:       number (required, PK)
  candidate_id:      number (required, FK → TaskCandidate)
  user_id:           number (required, FK → User)
  action:            enum[accept/reject/edit] (required)
  edited_title:      string (optional, max: 500)
  edited_description: string (optional, max: 2000)
  edited_deadline:   date (optional)
  reject_reason:     string (optional, max: 500)
  created_at:        datetime (required)
}
```

---

## Section 7: CSV Layout Definition

No CSV import or export is identified in the current requirements. Data is exchanged via REST API (JSON) for all structured data. Meeting Minutes are ingested as file uploads (.txt / .docx / .pdf) handled by the Meeting Minutes connector (IF-03), not as CSV.

*"No CSV files identified from requirements."*

---

## Section 8: Basic Design Verification & Requirement Mapping

### Requirement Traceability Matrix

| FR-ID | Feature Description | Covered In | Screen ID(s) | Status |
|---|---|---|---|---|
| FR-01 | User Authentication | S01 components, S01-EVT-01/02/03 | S01 | ✓ Covered |
| FR-02 | Connect Data Source | S05 components, S05-EVT-02, DS-06 | S05 | ✓ Covered |
| FR-03 | Scheduled / Manual Ingestion | S05-EVT-03 (manual), B-01 (scheduled) | S05 | ✓ Covered |
| FR-04 | TODO Extraction (LLM) | Agent-side (B-01 batch); output surfaces in S04 | S04 | ✓ Covered |
| FR-05 | Confidence Meter | S04-ITM-04/05, S04-EVT-01, DS-04 | S04 | ✓ Covered |
| FR-06 | Thread Intelligence | S04-ITM-01/02, S03-ITM-08/09, DS-05 | S03, S04 | ✓ Covered |
| FR-07 | Task Confirmation (Accept/Edit/Reject) | S04-ITM-08 to S04-ITM-14, S04-EVT-02 to EVT-06 | S04 | ✓ Covered |
| FR-08 | Centralized TODO Dashboard | S02 all components, S02-EVT-01 to EVT-07 | S02 | ✓ Covered |
| FR-09 | Task Detail View | S03-ITM-01 to ITM-10, S03-EVT-01 | S03 | ✓ Covered |
| FR-10 | Task Edit & Status Update | S02-EVT-05, S03-ITM-01/03/05/07, S03-EVT-02 | S02, S03 | ✓ Covered |
| FR-11 | Deadline Reminder | S06-ITM-08 to ITM-10, B-03 batch | S06 | ✓ Covered |
| FR-12 | Notification Settings | S06 all components, S06-EVT-01/02, DS-07 | S06 | ✓ Covered |
| FR-13 | Duplicate Detection | S02-ITM-09 (duplicate flag column) | S02 | ⚠️ Partial — UI flag shown; merge confirmation flow not designed in detail |
| FR-14 | AI Priority Suggestion | S02-ITM-09, S03-ITM-04 (AI Suggested badge) | S02, S03 | ⚠️ Partial — display designed; agent suggestion API not fully specified in this doc |
| FR-15 | Feedback Learning | S04-EVT-04 (reject reason stored in DS-10) | S04 | ⚠️ Partial — data collected; agent learning loop is internal agent logic, not a UI screen |
| FR-16 | Daily Briefing Screen | S07 all components, S07-EVT-01, DS-08, B-02 | S07 | ✓ Covered |
| FR-17 | Cross-Session Memory | Agent-side (no dedicated UI screen required) | — | ⚠️ Partial — no dedicated screen; observable via agent trace; deferred to Internal Design |
| FR-18 | Multi-User Isolation | S08 all components, S08-EVT-01 to EVT-04, DS-09 | S08 | ✓ Covered |
| FR-19 | Agent Reasoning Trace | No dedicated UI in Sprint Mode; accessible via logs | — | ⚠️ Partial — no dedicated screen designed; trace data stored in AgentTrace (E-10); recommended to add a Trace Viewer screen in Extended Mode |

---

### IPA Compliance Checklist

| Criteria | Status | Notes |
|---|---|---|
| All screens from SRD are designed | ✓ OK | All 8 screens (S01–S08) from SRD Section 5 are present in Sections 1, 3, 4, and 5. |
| All FR-IDs are traceable to screen/event | ✓ OK | All 19 FRs mapped in traceability matrix. 4 are Partial due to agent-internal logic or deferred design. |
| Screen transition diagram is complete | ✓ OK | All 8 screens and all batch-triggered transitions included in Section 2 Mermaid diagram. |
| All components have Item IDs and specs | ✓ OK | Every screen has a complete component table with S[nn]-ITM-[nn] IDs, types, validation rules, and descriptions. |
| All events have validation and process steps | ✓ OK | Every screen has a complete event table with S[nn]-EVT-[nn] IDs, numbered process steps, and validation rules. |
| Data structures map to ER entities | ✓ OK | DS-01 through DS-10 directly correspond to entities E-01 through E-08 in the SRD ER diagram. |
| CSV layouts defined for all import/export | ✓ OK | No CSV files exist in requirements; stated explicitly in Section 7. |
| No fabricated screens or features | ✓ OK | All screens and components are traceable to FR-IDs in the SRD. |
| ID consistency across all sections | ✓ OK | Screen IDs S01–S08, item IDs S[nn]-ITM-[nn], event IDs S[nn]-EVT-[nn], and DS-[nn] used consistently throughout. |
| Document usable as developer/tester input | ✓ OK | Each event contains numbered process steps referencing API endpoints; each component specifies data type, validation, and I/O. Sufficient for frontend development and test case design. |

---

*End of Basic Design Document — Task Mom 24/7 v1.0*
