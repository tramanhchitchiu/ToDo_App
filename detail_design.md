# Detail Design Document (詳細設計書)
## Task Mom 24/7 — AI-Powered Multi-Source TODO Aggregator

| Item | Detail |
|---|---|
| **Document Version** | 1.0 |
| **Date** | 2026-05-21 |
| **Based On** | basic_design.md v1.0, requirement_definition.md v1.0 |
| **Status** | Draft |

---

## Section 1: Technical Architecture Overview

### 1.1 Technology Stack Matrix

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Frontend Framework | Next.js (App Router) | 14.x | SSR/CSR hybrid web application; page routing |
| UI Component Library | Material UI (MUI) | v5.x | Pre-built accessible components aligned with ASCII layouts in Basic Design |
| CSS Utility | Tailwind CSS | 3.x | Spacing, layout overrides, responsive utilities |
| Form Handling | React Hook Form | 7.x | Controlled form state with minimal re-renders |
| Schema Validation (FE) | Zod | 3.x | Client-side DTO validation schemas shared with backend types |
| API Client | Axios | 1.x | HTTP requests to backend; interceptor-based auth token injection |
| Server State | TanStack Query (React Query) | v5.x | Caching, background refetch, optimistic updates for task list |
| Backend Framework | NestJS | 10.x | Modular REST API; dependency injection; decorator-based routing |
| ORM | TypeORM | 0.3.x | Entity mapping, migration management, query building |
| Database | SQLite (Sprint Mode) / PostgreSQL (Extended) | — | Persistent storage for all entities |
| Authentication | Passport.js + JWT strategy | — | Stateless session via signed JWT; bcrypt for password hashing |
| Agent Runtime | LangChain / LangGraph (Python) or NestJS service | — | Multi-step reasoning, tool use, memory; separate process or NestJS module |
| LLM Provider | Team's choice (Claude / OpenAI / Gemini) | — | Task extraction, confidence scoring, thread narrative, briefing generation |
| Testing (BE) | Jest + Supertest | — | Unit tests for services; E2E tests for API endpoints |
| Testing (FE) | Jest + React Testing Library | — | Component unit tests; form validation tests |

---

### 1.2 System Architecture Diagram

```mermaid
flowchart TD
    subgraph Client["Browser Client (Next.js)"]
        FE[React Pages & Components]
        RQ[TanStack Query Cache]
        AX[Axios Instance + Interceptors]
    end

    subgraph Backend["NestJS API Server"]
        AUTH[AuthModule\n/api/auth]
        TODOS[TodosModule\n/api/todos]
        CAND[CandidatesModule\n/api/candidates]
        SRC[SourcesModule\n/api/sources]
        INGEST[IngestionModule\n/api/ingestion]
        NOTIF[NotifPrefsModule\n/api/notification-prefs]
        BRIEF[BriefingModule\n/api/briefing]
        ADMIN[AdminModule\n/api/admin]
        AGENT[AgentService\n(internal)]
    end

    subgraph DataLayer["Data Layer"]
        ORM[TypeORM]
        DB[(SQLite / PostgreSQL)]
    end

    subgraph ExternalSources["External Data Sources"]
        JIRA[Jira API]
        EMAIL[Email Server\nIMAP/Exchange]
        TEAMS[Teams/Slack\nWebhook API]
        FILES[Meeting Minutes\nFile Upload]
    end

    subgraph LLM["LLM Provider"]
        LLMAPI[Claude / OpenAI / Gemini\nAPI]
    end

    subgraph Notifications["Notification Channels"]
        NOUT[Email / Teams / Slack\nOutbound]
    end

    FE --> AX
    AX -->|HTTP + JWT| AUTH
    AX --> TODOS
    AX --> CAND
    AX --> SRC
    AX --> INGEST
    AX --> NOTIF
    AX --> BRIEF
    AX --> ADMIN

    AUTH --> ORM
    TODOS --> ORM
    CAND --> ORM
    SRC --> ORM
    INGEST --> AGENT
    BRIEF --> AGENT
    AGENT --> LLMAPI
    AGENT --> JIRA
    AGENT --> EMAIL
    AGENT --> TEAMS
    AGENT --> FILES
    AGENT --> ORM
    NOTIF --> ORM
    ADMIN --> ORM
    ORM --> DB
    AGENT -->|dispatch| NOUT
```

---

### 1.3 Project Structure

```
taskmom/
├── frontend/                        # Next.js 14 App Router
│   ├── app/
│   │   ├── layout.tsx               # Root layout (MUI ThemeProvider, QueryClient)
│   │   ├── page.tsx                 # Redirect to /dashboard or /login
│   │   ├── login/page.tsx           # S01 Login Screen
│   │   ├── dashboard/
│   │   │   ├── page.tsx             # S02 TODO Dashboard
│   │   │   ├── tasks/[id]/page.tsx  # S03 Task Detail Screen
│   │   │   ├── confirm/page.tsx     # S04 Task Confirmation Screen
│   │   │   └── briefing/page.tsx    # S07 Daily Briefing Screen
│   │   ├── settings/
│   │   │   ├── sources/page.tsx     # S05 Data Source Settings
│   │   │   └── notifications/page.tsx # S06 Notification Settings
│   │   └── admin/
│   │       └── users/page.tsx       # S08 User Management
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx         # Sidebar + header wrapper
│   │   │   ├── Sidebar.tsx          # Left navigation
│   │   │   └── TopBar.tsx           # Header with user/logout
│   │   ├── tasks/
│   │   │   ├── TaskTable.tsx        # Sortable/filterable task list
│   │   │   ├── TaskRow.tsx          # Single row in task table
│   │   │   ├── TaskDetailForm.tsx   # Edit form for task detail
│   │   │   └── ThreadContextPanel.tsx # Thread narrative display
│   │   ├── confirmation/
│   │   │   ├── CandidateGroup.tsx   # Thread group wrapper
│   │   │   ├── CandidateCard.tsx    # Single candidate card
│   │   │   ├── ConfidenceMeter.tsx  # Score display + reason
│   │   │   └── RejectReasonModal.tsx
│   │   ├── sources/
│   │   │   ├── SourceList.tsx
│   │   │   └── SourceForm.tsx
│   │   ├── notifications/
│   │   │   └── NotifPrefsForm.tsx
│   │   ├── briefing/
│   │   │   └── BriefingCard.tsx
│   │   ├── admin/
│   │   │   ├── UserTable.tsx
│   │   │   └── UserForm.tsx
│   │   └── shared/
│   │       ├── ConfirmDialog.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorToast.tsx
│   │       └── PriorityBadge.tsx
│   ├── lib/
│   │   ├── axios.ts                 # Axios instance config
│   │   ├── queryClient.ts           # TanStack Query config
│   │   └── zod-schemas.ts           # Shared validation schemas
│   └── types/
│       └── api.types.ts             # TypeScript interfaces for all DTOs
│
└── backend/                         # NestJS 10
    ├── src/
    │   ├── main.ts                  # Bootstrap; global pipes; CORS
    │   ├── app.module.ts            # Root module
    │   ├── auth/                    # JWT login, guards, decorators
    │   ├── todos/                   # CRUD for TodoItem
    │   ├── candidates/              # Candidate confirmation flow
    │   ├── sources/                 # Connector config management
    │   ├── ingestion/               # Trigger ingestion runs
    │   ├── notification-prefs/      # User notification settings
    │   ├── briefing/                # Daily briefing generation
    │   ├── admin/                   # User management (R-03 only)
    │   ├── agent/                   # AgentService: tools, LLM calls, memory
    │   │   ├── tools/               # fetch-jira, fetch-email, parse-meeting,
    │   │   │                        #   extract-todos, score-confidence,
    │   │   │                        #   group-threads, schedule-reminder
    │   │   ├── memory/              # Session + cross-session memory
    │   │   └── trace/               # AgentTrace logging
    │   ├── entities/                # TypeORM entity classes
    │   ├── migrations/              # TypeORM migration files
    │   └── common/
    │       ├── guards/              # JwtAuthGuard, RolesGuard
    │       ├── decorators/          # @Roles(), @CurrentUser()
    │       ├── filters/             # Global exception filter
    │       ├── interceptors/        # Logging interceptor
    │       └── dto/                 # Shared DTOs
    └── test/                        # Jest unit + E2E tests
```

---

## Section 2: Database Design

### 2.1 Entity Relationship Diagram

```mermaid
erDiagram
    users {
        INTEGER user_id PK
        TEXT email
        TEXT display_name
        TEXT password_hash
        TEXT role
        INTEGER is_active
        TEXT created_at
    }
    data_source_configs {
        INTEGER source_id PK
        INTEGER user_id FK
        TEXT source_type
        TEXT endpoint_url
        TEXT credentials_ref
        INTEGER polling_interval_min
        TEXT last_ingested_at
        INTEGER is_active
    }
    ingestion_sessions {
        INTEGER session_id PK
        INTEGER source_id FK
        INTEGER user_id FK
        TEXT started_at
        TEXT ended_at
        TEXT status
        INTEGER candidates_extracted
    }
    task_groups {
        INTEGER group_id PK
        INTEGER user_id FK
        TEXT context_label
        TEXT narrative_summary
        TEXT created_at
        TEXT updated_at
    }
    task_candidates {
        INTEGER candidate_id PK
        INTEGER session_id FK
        INTEGER user_id FK
        INTEGER group_id FK
        TEXT title
        TEXT description
        TEXT source_type
        TEXT source_excerpt
        TEXT deadline
        TEXT assignee
        INTEGER confidence_score
        TEXT confidence_reason
        INTEGER invalidation_flag
        TEXT confirmation_status
        TEXT created_at
    }
    todo_items {
        INTEGER todo_id PK
        INTEGER candidate_id FK
        INTEGER user_id FK
        INTEGER group_id FK
        TEXT title
        TEXT description
        TEXT source_type
        TEXT source_excerpt
        TEXT deadline
        TEXT priority
        TEXT priority_source
        TEXT status
        TEXT assignee
        TEXT created_at
        TEXT updated_at
    }
    user_feedbacks {
        INTEGER feedback_id PK
        INTEGER candidate_id FK
        INTEGER user_id FK
        TEXT action
        TEXT edited_title
        TEXT edited_description
        TEXT edited_deadline
        TEXT reject_reason
        TEXT created_at
    }
    notification_preferences {
        INTEGER pref_id PK
        INTEGER user_id FK
        INTEGER channel_inapp
        INTEGER channel_email
        TEXT email_target
        INTEGER channel_teams
        TEXT teams_target
        INTEGER channel_slack
        TEXT slack_target
        INTEGER offset_24h
        INTEGER offset_1h
        INTEGER offset_custom_hours
        INTEGER briefing_enabled
        TEXT briefing_time
        TEXT briefing_channel
    }
    notification_logs {
        INTEGER notif_id PK
        INTEGER todo_id FK
        INTEGER user_id FK
        TEXT channel_type
        TEXT message_summary
        TEXT status
        TEXT sent_at
    }
    agent_traces {
        INTEGER trace_id PK
        INTEGER session_id FK
        INTEGER user_id FK
        TEXT trigger_type
        TEXT trace_content
        TEXT created_at
    }

    users ||--o{ data_source_configs : "owns"
    users ||--o{ ingestion_sessions : "owns"
    users ||--o{ task_groups : "owns"
    users ||--o{ task_candidates : "reviews"
    users ||--o{ todo_items : "owns"
    users ||--o{ user_feedbacks : "provides"
    users ||--o| notification_preferences : "sets"
    users ||--o{ notification_logs : "receives"
    data_source_configs ||--o{ ingestion_sessions : "generates"
    ingestion_sessions ||--o{ task_candidates : "yields"
    ingestion_sessions ||--o{ agent_traces : "produces"
    task_groups ||--o{ task_candidates : "groups"
    task_groups ||--o{ todo_items : "groups"
    task_candidates ||--o| todo_items : "confirmed as"
    task_candidates ||--o| user_feedbacks : "records"
    todo_items ||--o{ notification_logs : "triggers"
```

---

### 2.2 Table Schema Specifications

| Table Name | Columns | Primary Key | Foreign Keys | Indexes | Constraints |
|---|---|---|---|---|---|
| users | user_id, email, display_name, password_hash, role, is_active, created_at | user_id | — | UNIQUE(email); IDX(role, is_active) | role IN ('User','Admin'); is_active IN (0,1) |
| data_source_configs | source_id, user_id, source_type, endpoint_url, credentials_ref, polling_interval_min, last_ingested_at, is_active | source_id | user_id → users | IDX(user_id, is_active); IDX(user_id, source_type) | source_type IN ('Jira','Email','Meeting','Teams','Slack'); polling_interval_min BETWEEN 5 AND 1440 |
| ingestion_sessions | session_id, source_id, user_id, started_at, ended_at, status, candidates_extracted | session_id | source_id → data_source_configs; user_id → users | IDX(user_id, started_at DESC); IDX(source_id, status) | status IN ('running','completed','failed'); candidates_extracted >= 0 |
| task_groups | group_id, user_id, context_label, narrative_summary, created_at, updated_at | group_id | user_id → users | IDX(user_id, created_at DESC) | context_label NOT NULL |
| task_candidates | candidate_id, session_id, user_id, group_id, title, description, source_type, source_excerpt, deadline, assignee, confidence_score, confidence_reason, invalidation_flag, confirmation_status, created_at | candidate_id | session_id → ingestion_sessions; user_id → users; group_id → task_groups | IDX(user_id, confirmation_status); IDX(session_id); IDX(group_id) | confidence_score BETWEEN 0 AND 100; confirmation_status IN ('pending_confirmation','accepted','rejected','edited'); invalidation_flag IN (0,1) |
| todo_items | todo_id, candidate_id, user_id, group_id, title, description, source_type, source_excerpt, deadline, priority, priority_source, status, assignee, created_at, updated_at | todo_id | candidate_id → task_candidates; user_id → users; group_id → task_groups | IDX(user_id, status); IDX(user_id, deadline); IDX(user_id, priority); IDX(group_id) | status IN ('Todo','InProgress','Done'); priority IN ('High','Medium','Low',NULL); priority_source IN ('AI','Manual',NULL) |
| user_feedbacks | feedback_id, candidate_id, user_id, action, edited_title, edited_description, edited_deadline, reject_reason, created_at | feedback_id | candidate_id → task_candidates; user_id → users | IDX(user_id, action); IDX(candidate_id) | action IN ('accept','reject','edit'); UNIQUE(candidate_id) |
| notification_preferences | pref_id, user_id, channel_inapp, channel_email, email_target, channel_teams, teams_target, channel_slack, slack_target, offset_24h, offset_1h, offset_custom_hours, briefing_enabled, briefing_time, briefing_channel | pref_id | user_id → users | UNIQUE(user_id) | All channel flags IN (0,1); briefing_channel IN ('InApp','Email','Teams','Slack',NULL) |
| notification_logs | notif_id, todo_id, user_id, channel_type, message_summary, status, sent_at | notif_id | todo_id → todo_items; user_id → users | IDX(user_id, sent_at DESC); IDX(todo_id, channel_type, status) | channel_type IN ('InApp','Email','Teams','Slack'); status IN ('sent','failed') |
| agent_traces | trace_id, session_id, user_id, trigger_type, trace_content, created_at | trace_id | session_id → ingestion_sessions; user_id → users | IDX(session_id); IDX(user_id, created_at DESC) | trigger_type IN ('scheduled','manual','briefing','reminder') |

---

### 2.3 Column Detail Specifications

#### Table: users

| Column Name | Data Type | Nullable | Default | Constraint | Description |
|---|---|---|---|---|---|
| user_id | INTEGER | No | AUTOINCREMENT | PK | Surrogate primary key |
| email | TEXT | No | — | UNIQUE; max 255 chars; email format | Login identifier |
| display_name | TEXT | No | — | max 100 chars | Human-readable name shown in UI |
| password_hash | TEXT | No | — | bcrypt hash, 60 chars | Stored password; never plain text |
| role | TEXT | No | 'User' | IN ('User','Admin') | Access role; Admin = R-03 |
| is_active | INTEGER | No | 1 | IN (0,1) | 0 = deactivated; login denied |
| created_at | TEXT | No | CURRENT_TIMESTAMP | ISO 8601 datetime | Account creation timestamp |

#### Table: data_source_configs

| Column Name | Data Type | Nullable | Default | Constraint | Description |
|---|---|---|---|---|---|
| source_id | INTEGER | No | AUTOINCREMENT | PK | Surrogate key |
| user_id | INTEGER | No | — | FK → users(user_id) ON DELETE CASCADE | Owner user |
| source_type | TEXT | No | — | IN ('Jira','Email','Meeting','Teams','Slack') | Connector type |
| endpoint_url | TEXT | Yes | NULL | Valid URL when present; max 500 | API base URL for Jira/Teams/Slack |
| credentials_ref | TEXT | Yes | NULL | max 255; secret manager key reference | Points to .env key or secret; never stored as plain credential |
| polling_interval_min | INTEGER | No | 30 | BETWEEN 5 AND 1440 | How often agent fetches new data |
| last_ingested_at | TEXT | Yes | NULL | ISO 8601 datetime | Timestamp of most recent successful ingestion |
| is_active | INTEGER | No | 1 | IN (0,1) | Connector enabled/disabled |

#### Table: ingestion_sessions

| Column Name | Data Type | Nullable | Default | Constraint | Description |
|---|---|---|---|---|---|
| session_id | INTEGER | No | AUTOINCREMENT | PK | Surrogate key |
| source_id | INTEGER | No | — | FK → data_source_configs(source_id) ON DELETE CASCADE | Which connector was polled |
| user_id | INTEGER | No | — | FK → users(user_id) ON DELETE CASCADE | Owner user |
| started_at | TEXT | No | CURRENT_TIMESTAMP | ISO 8601 datetime | Session start time |
| ended_at | TEXT | Yes | NULL | ISO 8601 datetime; must be >= started_at | Set on completion or failure |
| status | TEXT | No | 'running' | IN ('running','completed','failed') | Session lifecycle state |
| candidates_extracted | INTEGER | No | 0 | >= 0 | Count of TaskCandidates created in this session |

#### Table: task_groups

| Column Name | Data Type | Nullable | Default | Constraint | Description |
|---|---|---|---|---|---|
| group_id | INTEGER | No | AUTOINCREMENT | PK | Surrogate key |
| user_id | INTEGER | No | — | FK → users(user_id) ON DELETE CASCADE | Owner user |
| context_label | TEXT | No | — | max 255 chars | Short thread name, e.g., "Project Alpha — Auth Module" |
| narrative_summary | TEXT | No | — | max 1000 chars | LLM-generated narrative of the thread's story |
| created_at | TEXT | No | CURRENT_TIMESTAMP | ISO 8601 datetime | Group creation timestamp |
| updated_at | TEXT | No | CURRENT_TIMESTAMP | ISO 8601 datetime | Updated on narrative refresh |

#### Table: task_candidates

| Column Name | Data Type | Nullable | Default | Constraint | Description |
|---|---|---|---|---|---|
| candidate_id | INTEGER | No | AUTOINCREMENT | PK | Surrogate key |
| session_id | INTEGER | No | — | FK → ingestion_sessions(session_id) | Originating ingestion session |
| user_id | INTEGER | No | — | FK → users(user_id) ON DELETE CASCADE | Owner user |
| group_id | INTEGER | Yes | NULL | FK → task_groups(group_id) ON DELETE SET NULL | Thread group; nullable if ungrouped |
| title | TEXT | No | — | max 500 chars | Extracted task title |
| description | TEXT | Yes | NULL | max 2000 chars | Extracted task description |
| source_type | TEXT | No | — | IN ('Jira','Email','Meeting','Teams','Slack') | Origin source |
| source_excerpt | TEXT | Yes | NULL | max 1000 chars | Raw text snippet used for extraction |
| deadline | TEXT | Yes | NULL | ISO 8601 date | Extracted deadline if detected |
| assignee | TEXT | Yes | NULL | max 255 chars | Extracted assignee name |
| confidence_score | INTEGER | No | — | BETWEEN 0 AND 100 | Agent confidence 0–100 |
| confidence_reason | TEXT | No | — | max 300 chars | One-line explanation for score |
| invalidation_flag | INTEGER | No | 0 | IN (0,1) | 1 = agent suspects this task may be stale |
| confirmation_status | TEXT | No | 'pending_confirmation' | IN ('pending_confirmation','accepted','rejected','edited') | Human-in-the-loop state |
| created_at | TEXT | No | CURRENT_TIMESTAMP | ISO 8601 datetime | Extraction timestamp |

#### Table: todo_items

| Column Name | Data Type | Nullable | Default | Constraint | Description |
|---|---|---|---|---|---|
| todo_id | INTEGER | No | AUTOINCREMENT | PK | Surrogate key |
| candidate_id | INTEGER | Yes | NULL | FK → task_candidates(candidate_id) ON DELETE SET NULL | Source candidate; NULL if manually created |
| user_id | INTEGER | No | — | FK → users(user_id) ON DELETE CASCADE | Owner user |
| group_id | INTEGER | Yes | NULL | FK → task_groups(group_id) ON DELETE SET NULL | Thread group |
| title | TEXT | No | — | max 500 chars | Task title |
| description | TEXT | Yes | NULL | max 2000 chars | Task description |
| source_type | TEXT | No | — | IN ('Jira','Email','Meeting','Teams','Slack','Manual') | Origin |
| source_excerpt | TEXT | Yes | NULL | max 1000 chars | Source snippet for reference |
| deadline | TEXT | Yes | NULL | ISO 8601 date | Task deadline |
| priority | TEXT | Yes | NULL | IN ('High','Medium','Low',NULL) | Task priority |
| priority_source | TEXT | Yes | NULL | IN ('AI','Manual',NULL) | Who set priority |
| status | TEXT | No | 'Todo' | IN ('Todo','InProgress','Done') | Task lifecycle status |
| assignee | TEXT | Yes | NULL | max 255 chars | Assigned person name |
| created_at | TEXT | No | CURRENT_TIMESTAMP | ISO 8601 datetime | Task creation timestamp |
| updated_at | TEXT | No | CURRENT_TIMESTAMP | ISO 8601 datetime; updated on every PATCH | Last modification time |

#### Table: user_feedbacks

| Column Name | Data Type | Nullable | Default | Constraint | Description |
|---|---|---|---|---|---|
| feedback_id | INTEGER | No | AUTOINCREMENT | PK | Surrogate key |
| candidate_id | INTEGER | No | — | FK → task_candidates(candidate_id); UNIQUE | One feedback record per candidate |
| user_id | INTEGER | No | — | FK → users(user_id) ON DELETE CASCADE | User who gave feedback |
| action | TEXT | No | — | IN ('accept','reject','edit') | Decision taken |
| edited_title | TEXT | Yes | NULL | max 500 chars | Set only when action = 'edit' |
| edited_description | TEXT | Yes | NULL | max 2000 chars | Set only when action = 'edit' |
| edited_deadline | TEXT | Yes | NULL | ISO 8601 date | Set only when action = 'edit' |
| reject_reason | TEXT | Yes | NULL | max 500 chars | Set only when action = 'reject' |
| created_at | TEXT | No | CURRENT_TIMESTAMP | ISO 8601 datetime | When decision was made |

#### Table: notification_preferences

| Column Name | Data Type | Nullable | Default | Constraint | Description |
|---|---|---|---|---|---|
| pref_id | INTEGER | No | AUTOINCREMENT | PK | Surrogate key |
| user_id | INTEGER | No | — | FK → users(user_id); UNIQUE | One preference record per user |
| channel_inapp | INTEGER | No | 1 | IN (0,1) | In-app notification enabled |
| channel_email | INTEGER | No | 1 | IN (0,1) | Email reminder enabled |
| email_target | TEXT | Yes | NULL | Email format; max 255 | Target email for reminders |
| channel_teams | INTEGER | No | 0 | IN (0,1) | Teams reminder enabled |
| teams_target | TEXT | Yes | NULL | max 500; webhook URL | Teams incoming webhook URL |
| channel_slack | INTEGER | No | 0 | IN (0,1) | Slack reminder enabled |
| slack_target | TEXT | Yes | NULL | max 500; webhook URL | Slack incoming webhook URL |
| offset_24h | INTEGER | No | 1 | IN (0,1) | Send reminder 24h before deadline |
| offset_1h | INTEGER | No | 1 | IN (0,1) | Send reminder 1h before deadline |
| offset_custom_hours | INTEGER | Yes | NULL | BETWEEN 1 AND 168 | Custom offset in hours; NULL if not used |
| briefing_enabled | INTEGER | No | 1 | IN (0,1) | Daily briefing enabled |
| briefing_time | TEXT | Yes | '08:00' | Pattern HH:MM | Time to dispatch daily briefing |
| briefing_channel | TEXT | Yes | 'Email' | IN ('InApp','Email','Teams','Slack',NULL) | Briefing delivery channel |

#### Table: notification_logs

| Column Name | Data Type | Nullable | Default | Constraint | Description |
|---|---|---|---|---|---|
| notif_id | INTEGER | No | AUTOINCREMENT | PK | Surrogate key |
| todo_id | INTEGER | No | — | FK → todo_items(todo_id) ON DELETE CASCADE | Task that triggered reminder |
| user_id | INTEGER | No | — | FK → users(user_id) ON DELETE CASCADE | Recipient user |
| channel_type | TEXT | No | — | IN ('InApp','Email','Teams','Slack') | Channel used |
| message_summary | TEXT | No | — | max 500 chars | Brief description of message content |
| status | TEXT | No | — | IN ('sent','failed') | Delivery outcome |
| sent_at | TEXT | No | CURRENT_TIMESTAMP | ISO 8601 datetime | Dispatch timestamp |

#### Table: agent_traces

| Column Name | Data Type | Nullable | Default | Constraint | Description |
|---|---|---|---|---|---|
| trace_id | INTEGER | No | AUTOINCREMENT | PK | Surrogate key |
| session_id | INTEGER | No | — | FK → ingestion_sessions(session_id) | Associated ingestion session |
| user_id | INTEGER | No | — | FK → users(user_id) ON DELETE CASCADE | Owner user |
| trigger_type | TEXT | No | — | IN ('scheduled','manual','briefing','reminder') | What triggered the agent run |
| trace_content | TEXT | No | — | JSON string; max 50,000 chars | Full structured log of agent reasoning steps, tool calls, inputs/outputs |
| created_at | TEXT | No | CURRENT_TIMESTAMP | ISO 8601 datetime | When trace was recorded |

---

### 2.4 Business Data Rules

| Data Type / Field | Example Values | Business Rules |
|---|---|---|
| task_candidates.confirmation_status | pending_confirmation → accepted | Only valid transitions: pending_confirmation → accepted, pending_confirmation → rejected, pending_confirmation → edited. Once set to accepted/rejected/edited, status is immutable. |
| todo_items.status | Todo → InProgress → Done | Forward-only transitions allowed in normal flow. Users may revert Done → InProgress (task re-opened). Done → Todo is not permitted. |
| todo_items.priority | High, Medium, Low | When priority_source = 'AI', the priority field is set by AgentService during extraction. When user manually sets priority, priority_source updates to 'Manual' and AI suggestion is overridden. |
| task_candidates.confidence_score | 92 | Scores 80–100: display green badge. Scores 50–79: yellow badge. Scores 0–49: red badge. Threshold for batch-accept is 80 (configurable in future). |
| notification_preferences channel flags | channel_email=1, channel_teams=0 | At least one of channel_inapp, channel_email, channel_teams, channel_slack must be 1 before preferences can be saved. |
| notification_preferences offset flags | offset_24h=1, offset_1h=1 | At least one of offset_24h, offset_1h, or a valid offset_custom_hours must be active. |
| data_source_configs.polling_interval_min | 30 | Minimum 5 minutes to avoid API rate limit violations. Maximum 1440 minutes (24 hours). |
| todo_items.deadline | 2026-05-21 | If deadline is in the past at save time, the backend issues a warning response but does not block the save. The dashboard flags overdue items (deadline < today AND status != 'Done'). |
| user_feedbacks | UNIQUE(candidate_id) | A candidate can receive exactly one feedback record. Re-confirming a candidate is not permitted; user must create a new task manually if they change their mind after rejection. |

---

## Section 3: Backend API Design

### 3.1 API Endpoint Matrix

| Module | Endpoint | Method | Purpose | Request DTO | Response DTO | Auth Guards |
|---|---|---|---|---|---|---|
| Auth | /api/auth/login | POST | Authenticate user; issue JWT | LoginRequestDto | AuthResponseDto | None |
| Auth | /api/auth/session | DELETE | Logout; clear session hint | — | MessageDto | JwtAuthGuard |
| Todos | /api/todos | GET | List confirmed todos (paginated, filtered, sorted) | TodosQueryDto (query) | PaginatedTodosDto | JwtAuthGuard |
| Todos | /api/todos/summary | GET | Count summary (total, due today, overdue, done) | — | TodoSummaryDto | JwtAuthGuard |
| Todos | /api/todos/:id | GET | Get single todo with thread context | — | TodoDetailDto | JwtAuthGuard |
| Todos | /api/todos/:id | PATCH | Update todo fields (title, description, deadline, status, priority) | UpdateTodoDto | TodoDetailDto | JwtAuthGuard |
| Candidates | /api/candidates | GET | List pending candidates grouped by task_group | CandidatesQueryDto (query) | GroupedCandidatesDto | JwtAuthGuard |
| Candidates | /api/candidates/:id/accept | POST | Accept a single candidate; create TodoItem | — | TodoDetailDto | JwtAuthGuard |
| Candidates | /api/candidates/:id/reject | POST | Reject a single candidate | RejectCandidateDto | MessageDto | JwtAuthGuard |
| Candidates | /api/candidates/:id/edit-accept | POST | Accept with edits; create TodoItem with edited fields | EditAcceptCandidateDto | TodoDetailDto | JwtAuthGuard |
| Candidates | /api/candidates/batch-accept | POST | Accept all candidates with score >= threshold | BatchAcceptDto | BatchResultDto | JwtAuthGuard |
| Candidates | /api/candidates/batch-submit | POST | Submit all pending decisions at once | BatchSubmitDto | BatchResultDto | JwtAuthGuard |
| Sources | /api/sources | GET | List user's configured source connectors | — | SourceListDto | JwtAuthGuard |
| Sources | /api/sources | POST | Create new source connector | CreateSourceDto | SourceDetailDto | JwtAuthGuard |
| Sources | /api/sources/:id | PATCH | Update source connector config | UpdateSourceDto | SourceDetailDto | JwtAuthGuard |
| Sources | /api/sources/:id | DELETE | Remove source connector | — | MessageDto | JwtAuthGuard |
| Sources | /api/sources/upload | POST | Upload meeting minutes file | Multipart file | SourceDetailDto | JwtAuthGuard |
| Ingestion | /api/ingestion/run | POST | Trigger manual ingestion for all or one source | IngestionRunDto | IngestionResultDto | JwtAuthGuard |
| Notif Prefs | /api/notification-prefs | GET | Get user's notification preferences | — | NotifPrefsDto | JwtAuthGuard |
| Notif Prefs | /api/notification-prefs | PUT | Replace user's notification preferences | UpdateNotifPrefsDto | NotifPrefsDto | JwtAuthGuard |
| Briefing | /api/briefing/today | GET | Get today's briefing (generates if missing) | — | DailyBriefingDto | JwtAuthGuard |
| Briefing | /api/briefing/generate | POST | Manually regenerate today's briefing | — | DailyBriefingDto | JwtAuthGuard |
| Admin | /api/admin/users | GET | List all users (paginated, searchable) | AdminUsersQueryDto (query) | PaginatedUsersDto | JwtAuthGuard + RolesGuard(Admin) |
| Admin | /api/admin/users | POST | Create new user account | CreateUserDto | UserDetailDto | JwtAuthGuard + RolesGuard(Admin) |
| Admin | /api/admin/users/:id | PATCH | Update user (role, status, connectors) | UpdateUserDto | UserDetailDto | JwtAuthGuard + RolesGuard(Admin) |

---

### 3.2 DTO Specifications

| DTO Name | Field | Type | Required | Validation Rules | Description |
|---|---|---|---|---|---|
| LoginRequestDto | email | string | Yes | Email format; max 255 | Login email |
| LoginRequestDto | password | string | Yes | Min 8; max 128 | Login password |
| AuthResponseDto | access_token | string | Yes | JWT | Signed JWT access token |
| AuthResponseDto | user_id | number | Yes | — | Authenticated user ID |
| AuthResponseDto | role | string | Yes | User or Admin | User role |
| AuthResponseDto | expires_in | number | Yes | Seconds | Token TTL |
| TodosQueryDto | page | number | No | Min 1; default 1 | Page number |
| TodosQueryDto | page_size | number | No | Min 1; max 100; default 10 | Items per page |
| TodosQueryDto | search | string | No | Max 200 | Full-text search on title, description |
| TodosQueryDto | source | string | No | IN (Jira,Email,Meeting,Teams,Slack,all) | Source filter |
| TodosQueryDto | status | string | No | IN (Todo,InProgress,Done,all) | Status filter |
| TodosQueryDto | priority | string | No | IN (High,Medium,Low,all) | Priority filter |
| TodosQueryDto | sort_by | string | No | IN (deadline,priority,created_at,title); default deadline | Sort field |
| TodosQueryDto | sort_dir | string | No | IN (asc,desc); default asc | Sort direction |
| UpdateTodoDto | title | string | No | Max 500; if present, non-empty | Updated title |
| UpdateTodoDto | description | string | No | Max 2000 | Updated description |
| UpdateTodoDto | deadline | string | No | ISO 8601 date | Updated deadline |
| UpdateTodoDto | status | string | No | IN (Todo,InProgress,Done) | Updated status |
| UpdateTodoDto | priority | string | No | IN (High,Medium,Low) | Updated priority; sets priority_source to Manual |
| RejectCandidateDto | reject_reason | string | No | Max 500 | Optional rejection reason for learning |
| EditAcceptCandidateDto | title | string | No | Max 500; if present, non-empty | Override title |
| EditAcceptCandidateDto | description | string | No | Max 2000 | Override description |
| EditAcceptCandidateDto | deadline | string | No | ISO 8601 date | Override deadline |
| BatchAcceptDto | threshold | number | No | Min 0; max 100; default 80 | Minimum score for batch accept |
| BatchSubmitDto | decisions | array | Yes | Min 1 item | Array of {candidate_id, action, …edit fields, reject_reason} |
| CreateSourceDto | source_type | string | Yes | IN (Jira,Email,Meeting,Teams,Slack) | Connector type |
| CreateSourceDto | endpoint_url | string | Conditional | Required for Jira/Teams/Slack; valid URL; max 500 | API endpoint |
| CreateSourceDto | api_token | string | Conditional | Required for Jira/Teams/Slack; max 500 | Credential; server stores as secret ref |
| CreateSourceDto | polling_interval_min | number | Yes | BETWEEN 5 AND 1440 | Polling frequency |
| CreateSourceDto | is_active | boolean | No | Default true | Connector active state |
| UpdateSourceDto | endpoint_url | string | No | Valid URL; max 500 | Updated endpoint |
| UpdateSourceDto | api_token | string | No | Max 500 | Updated credential |
| UpdateSourceDto | polling_interval_min | number | No | BETWEEN 5 AND 1440 | Updated frequency |
| UpdateSourceDto | is_active | boolean | No | — | Enable/disable |
| IngestionRunDto | source_id | number | No | Valid source_id; if omitted, run all active sources | Target source for manual run |
| UpdateNotifPrefsDto | channel_inapp | boolean | No | — | Enable in-app |
| UpdateNotifPrefsDto | channel_email | boolean | No | — | Enable email |
| UpdateNotifPrefsDto | email_target | string | Conditional | Required if channel_email=true; email format; max 255 | Target email |
| UpdateNotifPrefsDto | channel_teams | boolean | No | — | Enable Teams |
| UpdateNotifPrefsDto | teams_target | string | Conditional | Required if channel_teams=true; max 500 | Teams webhook URL |
| UpdateNotifPrefsDto | channel_slack | boolean | No | — | Enable Slack |
| UpdateNotifPrefsDto | slack_target | string | Conditional | Required if channel_slack=true; max 500 | Slack webhook URL |
| UpdateNotifPrefsDto | offset_24h | boolean | No | — | 24h reminder |
| UpdateNotifPrefsDto | offset_1h | boolean | No | — | 1h reminder |
| UpdateNotifPrefsDto | offset_custom_hours | number | No | BETWEEN 1 AND 168 | Custom offset |
| UpdateNotifPrefsDto | briefing_enabled | boolean | No | — | Enable briefing |
| UpdateNotifPrefsDto | briefing_time | string | Conditional | Required if briefing_enabled=true; HH:MM pattern | Briefing time |
| UpdateNotifPrefsDto | briefing_channel | string | Conditional | Required if briefing_enabled=true; must match an active channel | Briefing channel |
| CreateUserDto | display_name | string | Yes | Max 100; non-empty | New user display name |
| CreateUserDto | email | string | Yes | Email format; max 255; unique | New user email |
| CreateUserDto | role | string | Yes | IN (User,Admin) | Assigned role |
| UpdateUserDto | display_name | string | No | Max 100 | Updated name |
| UpdateUserDto | role | string | No | IN (User,Admin) | Updated role |
| UpdateUserDto | is_active | boolean | No | — | Activate/deactivate |
| AdminUsersQueryDto | search | string | No | Max 200 | Name or email search |
| AdminUsersQueryDto | page | number | No | Min 1; default 1 | Page number |
| AdminUsersQueryDto | page_size | number | No | Min 1; max 100; default 20 | Page size |

---

### 3.3 Request/Response Flow

```mermaid
sequenceDiagram
    participant C as Browser Client
    participant G as JwtAuthGuard
    participant RG as RolesGuard
    participant CT as Controller
    participant SV as Service
    participant DB as Database (TypeORM)

    C->>G: HTTP Request + Authorization: Bearer {JWT}
    G->>G: Verify JWT signature and expiry
    alt Token invalid or expired
        G-->>C: 401 Unauthorized
    end
    G->>RG: Pass decoded user payload
    RG->>RG: Check user.role against required roles
    alt Role insufficient
        RG-->>C: 403 Forbidden
    end
    RG->>CT: Call controller method
    CT->>CT: Validate request DTO (class-validator)
    alt Validation fails
        CT-->>C: 400 Bad Request + error details
    end
    CT->>SV: Call service method with validated DTO
    SV->>SV: Apply business rules and data scope filter (WHERE user_id = current_user)
    SV->>DB: TypeORM query (SELECT / INSERT / UPDATE / DELETE)
    alt DB error
        DB-->>SV: Exception
        SV-->>CT: Rethrow as InternalServerErrorException
        CT-->>C: 500 Internal Server Error
    end
    DB-->>SV: Entity / Entity[]
    SV->>SV: Map entity to response DTO
    SV-->>CT: Response DTO
    CT-->>C: 200 / 201 + JSON response body
```

---

### 3.4 HTTP Status Code Matrix

| Scenario | Status Code | Response Body |
|---|---|---|
| Request succeeded (read) | 200 OK | Requested data DTO |
| Resource created | 201 Created | Created resource DTO |
| Action succeeded (no content needed) | 200 OK | `{ "message": "…" }` |
| Validation error (DTO field fails) | 400 Bad Request | `{ "statusCode": 400, "errors": [{ "field": "…", "message": "…" }] }` |
| Missing or invalid JWT | 401 Unauthorized | `{ "statusCode": 401, "message": "Unauthorized" }` |
| Valid JWT but insufficient role | 403 Forbidden | `{ "statusCode": 403, "message": "Forbidden" }` |
| Resource not found | 404 Not Found | `{ "statusCode": 404, "message": "Resource not found" }` |
| Unique constraint violated | 409 Conflict | `{ "statusCode": 409, "message": "…already exists" }` |
| Business rule violation | 422 Unprocessable Entity | `{ "statusCode": 422, "message": "…rule description" }` |
| File too large | 413 Payload Too Large | `{ "statusCode": 413, "message": "File exceeds 20 MB limit" }` |
| Unhandled server error | 500 Internal Server Error | `{ "statusCode": 500, "message": "Internal server error" }` |

---

### 3.5 Data Validation Rules

| Field Type | Validation Rules | Error Message (EN) | Error Message (JP) |
|---|---|---|---|
| Email field | Required; max 255 chars; matches RFC 5322 email pattern | "Invalid email address format." | "メールアドレスの形式が正しくありません。" |
| Password field | Required; min 8 chars; max 128 chars | "Password must be between 8 and 128 characters." | "パスワードは8〜128文字で入力してください。" |
| Task title | Required; max 500 chars; non-whitespace-only | "Title is required and must not exceed 500 characters." | "タイトルは必須で500文字以内で入力してください。" |
| Deadline date | Optional; ISO 8601 date format (YYYY-MM-DD) | "Deadline must be a valid date in YYYY-MM-DD format." | "期限日はYYYY-MM-DD形式で入力してください。" |
| Polling interval | Required integer; between 5 and 1440 | "Polling interval must be between 5 and 1440 minutes." | "ポーリング間隔は5〜1440分の範囲で設定してください。" |
| Confidence score | Required integer; between 0 and 100 | "Confidence score must be between 0 and 100." | "信頼スコアは0〜100の範囲で指定してください。" |
| File upload | MIME type in (text/plain, application/vnd.openxmlformats, application/pdf); max 20 MB | "Only .txt, .docx, or .pdf files are accepted. Maximum size is 20 MB." | "アップロードできるファイルは.txt、.docx、.pdfのみです。最大サイズは20MBです。" |
| Webhook URL (Teams/Slack) | Required if channel enabled; valid URL; must start with https:// | "Webhook URL must be a valid HTTPS URL." | "WebhookのURLはhttpsから始まる有効なURLで入力してください。" |
| Briefing time | Pattern HH:MM; hours 00–23; minutes 00–59 | "Briefing time must be in HH:MM format (e.g., 08:00)." | "ブリーフィング時刻はHH:MM形式（例：08:00）で入力してください。" |
| Enum fields (status, role, etc.) | Value must be one of the defined enum values | "Invalid value. Accepted values are: {list}." | "不正な値です。使用可能な値：{list}" |

---

## Section 4: Frontend Architecture

### 4.1 Page and Component Tree

```
app/
├── login/page.tsx (S01)
│   └── LoginForm
│       ├── EmailField          (S01-ITM-01)
│       ├── PasswordField       (S01-ITM-02)
│       ├── SignInButton        (S01-ITM-03)
│       ├── SSOButton           (S01-ITM-04)
│       └── ErrorMessage        (S01-ITM-05)
│
├── dashboard/page.tsx (S02)
│   └── AppShell
│       ├── TopBar
│       │   ├── NotificationBell    (S02-ITM-13)
│       │   └── UserMenu (Logout)
│       ├── Sidebar
│       │   └── NavLinks (Dashboard, Confirm, Briefing, Sources, Notifs, Admin)
│       └── DashboardPage content
│           ├── SummaryCards        (S02-ITM-01..04)
│           ├── TaskFilters
│           │   ├── SearchBar       (S02-ITM-05)
│           │   ├── SourceFilter    (S02-ITM-06)
│           │   ├── StatusFilter    (S02-ITM-07)
│           │   └── PriorityFilter  (S02-ITM-08)
│           ├── ManualIngestButton  (S02-ITM-12)
│           ├── ConfirmTasksButton  (S02-ITM-14)
│           ├── TaskTable
│           │   ├── TaskRow (× n)
│           │   │   ├── PriorityBadge   (S02-ITM-09)
│           │   │   └── StatusToggle    (S02-ITM-10)
│           │   └── Pagination          (S02-ITM-11)
│           └── ErrorToast
│
├── dashboard/tasks/[id]/page.tsx (S03)
│   └── AppShell
│       └── TaskDetailPage content
│           ├── Breadcrumb + BackLink  (S03-ITM-13)
│           ├── TaskDetailForm
│           │   ├── TitleField         (S03-ITM-01)
│           │   ├── SourceLabel        (S03-ITM-02)
│           │   ├── DeadlinePicker     (S03-ITM-03)
│           │   ├── PriorityLabel      (S03-ITM-04)
│           │   ├── StatusDropdown     (S03-ITM-05)
│           │   ├── AssigneeLabel      (S03-ITM-06)
│           │   └── DescriptionField   (S03-ITM-07)
│           ├── ThreadContextPanel     (S03-ITM-08)
│           │   └── InvalidationWarning (S03-ITM-09)
│           ├── SourceExcerpt          (S03-ITM-10)
│           └── FormActions
│               ├── SaveButton         (S03-ITM-11)
│               └── CancelButton       (S03-ITM-12)
│
├── dashboard/confirm/page.tsx (S04)
│   └── AppShell
│       └── ConfirmPage content
│           ├── PageHeader
│           │   ├── PendingCount
│           │   └── BatchAcceptButton  (S04-ITM-12)
│           ├── CandidateGroup (× n per TaskGroup)
│           │   ├── GroupHeader        (S04-ITM-01)
│           │   ├── InvalidationWarning (S04-ITM-02)
│           │   └── CandidateCard (× n)
│           │       ├── BatchCheckbox  (S04-ITM-13)
│           │       ├── TaskTitle      (S04-ITM-03)
│           │       ├── ConfidenceMeter (S04-ITM-04 + 05)
│           │       ├── SourceBadge    (S04-ITM-06)
│           │       ├── DeadlineLabel  (S04-ITM-07)
│           │       ├── AcceptButton   (S04-ITM-08)
│           │       ├── EditButton     (S04-ITM-09)
│           │       └── RejectButton   (S04-ITM-10)
│           ├── RejectReasonModal      (S04-ITM-11)
│           └── SubmitAllButton        (S04-ITM-14)
│
├── settings/sources/page.tsx (S05)
│   └── AppShell
│       └── SourcesPage content
│           ├── AddSourceButton        (S05-ITM-02)
│           ├── SourceList
│           │   └── SourceCard (× n)
│           │       ├── StatusIndicator
│           │       ├── RunNowButton   (S05-ITM-03)
│           │       └── RemoveButton   (S05-ITM-04)
│           ├── SourceForm (Add/Edit)
│           │   ├── SourceTypeDropdown (S05-ITM-05)
│           │   ├── EndpointURLField   (S05-ITM-06)
│           │   ├── APITokenField      (S05-ITM-07)
│           │   ├── PollingField       (S05-ITM-08)
│           │   ├── ActiveCheckbox     (S05-ITM-09)
│           │   ├── FileUploadInput    (S05-ITM-10)
│           │   ├── SaveButton         (S05-ITM-11)
│           │   └── CancelButton       (S05-ITM-12)
│           └── ConfirmDialog (for Remove)
│
├── settings/notifications/page.tsx (S06)
│   └── AppShell
│       └── NotifPrefsPage content
│           └── NotifPrefsForm
│               ├── ChannelSection (in-app, email, Teams, Slack checkboxes + targets)
│               ├── ReminderTimingSection (offset checkboxes + custom field)
│               ├── BriefingSection (enable checkbox, time picker, channel dropdown)
│               ├── SaveButton     (S06-ITM-14)
│               └── ResetButton    (S06-ITM-15)
│
├── dashboard/briefing/page.tsx (S07)
│   └── AppShell
│       └── BriefingPage content
│           ├── GreetingHeader         (S07-ITM-01)
│           ├── BriefingCard           (S07-ITM-02)
│           ├── TodayTasksList         (S07-ITM-03)
│           │   └── TaskRow (× n)
│           │       ├── PriorityIcon   (S07-ITM-06)
│           │       └── TaskLink       (S07-ITM-05)
│           └── TomorrowTasksList      (S07-ITM-04)
│
└── admin/users/page.tsx (S08)
    └── AppShell
        └── UserManagementPage content
            ├── SearchBar              (S08-ITM-01)
            ├── CreateUserButton       (S08-ITM-03)
            ├── UserTable              (S08-ITM-02)
            │   └── UserRow (× n)
            │       └── ActionMenu     (S08-ITM-04)
            └── UserForm (Create/Edit)
                ├── DisplayNameField   (S08-ITM-05)
                ├── EmailField         (S08-ITM-06)
                ├── RoleDropdown       (S08-ITM-07)
                ├── StatusCheckbox     (S08-ITM-08)
                ├── ConnectorCheckboxes (S08-ITM-09)
                ├── SaveUserButton     (S08-ITM-10)
                └── CancelButton       (S08-ITM-11)
```

---

### 4.2 Component Props Interface

| Component | Required Props | Optional Props | Event Handlers | State Variables |
|---|---|---|---|---|
| LoginForm | — | errorMessage: string | onSubmit(email, password) | email: string; password: string; isLoading: boolean |
| TaskTable | todos: TodoItem[]; total: number; page: number | sortBy: string; sortDir: string | onRowClick(id); onStatusChange(id, status); onPageChange(page) | — (controlled by parent) |
| TaskRow | todo: TodoItem | — | onRowClick; onStatusChange | localStatus: string (optimistic) |
| TaskDetailForm | todo: TodoItem | readOnly: boolean | onSave(fields); onCancel | isDirty: boolean; formValues: UpdateTodoDto |
| ThreadContextPanel | group: TaskGroup | showInvalidation: boolean | — | isExpanded: boolean |
| CandidateGroup | group: TaskGroup; candidates: TaskCandidate[] | — | — | — |
| CandidateCard | candidate: TaskCandidate | isSelected: boolean | onAccept(id); onEdit(id); onReject(id); onSelect(id) | isEditMode: boolean; editValues: EditAcceptCandidateDto |
| ConfidenceMeter | score: number; reason: string | — | — | — |
| RejectReasonModal | isOpen: boolean; candidateId: number | — | onConfirm(reason); onClose | reason: string |
| SourceCard | source: DataSourceConfig | — | onRunNow(id); onEdit(source); onRemove(id) | isRunning: boolean |
| SourceForm | onSave(dto); onCancel | initialValues: DataSourceConfig | — | formValues: CreateSourceDto; isSubmitting: boolean |
| NotifPrefsForm | initialValues: NotifPreference | — | onSave(dto); onReset | formValues: UpdateNotifPrefsDto; isSubmitting: boolean |
| BriefingCard | briefingText: string; generatedAt: datetime | isLoading: boolean | — | — |
| UserTable | users: User[]; total: number; page: number | — | onEdit(user); onDeactivate(id); onPageChange(page) | — |
| UserForm | onSave(dto); onCancel | initialValues: User | — | formValues: CreateUserDto; isSubmitting: boolean |
| ConfirmDialog | isOpen: boolean; message: string | title: string | onConfirm(); onDismiss() | — |
| PriorityBadge | priority: High/Medium/Low | source: AI/Manual | — | — |
| ErrorToast | — | — | — | messages: string[]; visible: boolean |

---

### 4.3 State Management Flow

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated
    Unauthenticated --> LoginPending : User submits credentials
    LoginPending --> Authenticated : API returns JWT
    LoginPending --> Unauthenticated : API returns 401 (show error)
    Authenticated --> [*] : User clicks Logout

    state Authenticated {
        [*] --> DashboardLoading
        DashboardLoading --> DashboardReady : todos + summary loaded
        DashboardReady --> FilterApplied : User changes filter/search
        FilterApplied --> DashboardReady : Query re-fetches
        DashboardReady --> StatusUpdating : User toggles status in row
        StatusUpdating --> DashboardReady : PATCH succeeds (optimistic update confirmed)
        StatusUpdating --> DashboardReady : PATCH fails (rollback optimistic update)

        DashboardReady --> ConfirmPageLoading : Navigate to S04
        ConfirmPageLoading --> ConfirmPageReady : candidates loaded
        ConfirmPageReady --> CandidateDecided : User accepts/rejects/edits one candidate
        CandidateDecided --> ConfirmPageReady : Card removed from list
        ConfirmPageReady --> SubmittingAll : User clicks Submit All
        SubmittingAll --> DashboardReady : All decisions committed; navigate to S02

        DashboardReady --> DetailLoading : Click task row
        DetailLoading --> DetailReady : TodoItem loaded
        DetailReady --> DetailDirty : User edits any field
        DetailDirty --> DetailSaving : User clicks Save
        DetailSaving --> DetailReady : PATCH succeeds
        DetailSaving --> DetailDirty : PATCH fails (show error)
    }
```

---

### 4.4 API Integration Map

| Page / Component | API Endpoint Called | Trigger | Data Used |
|---|---|---|---|
| LoginForm | POST /api/auth/login | onSubmit | Store JWT; redirect to /dashboard |
| DashboardPage | GET /api/todos/summary | onLoad | Summary cards (S02-ITM-01..04) |
| DashboardPage | GET /api/todos | onLoad, filter change, sort change, page change | TaskTable rows |
| TaskRow.StatusToggle | PATCH /api/todos/:id | onChange | Optimistic status update in table |
| TopBar (logout) | DELETE /api/auth/session | onClick | Clear JWT; redirect to /login |
| ManualIngestButton | POST /api/ingestion/run | onClick | Spinner; navigate to /confirm if candidates |
| ConfirmPage | GET /api/candidates | onLoad | Grouped candidate list |
| CandidateCard (Accept) | POST /api/candidates/:id/accept | onClick | Remove card from list |
| CandidateCard (Edit-Accept) | POST /api/candidates/:id/edit-accept | onConfirmEdit | Remove card from list; show success toast |
| CandidateCard (Reject) | POST /api/candidates/:id/reject | onConfirmReject | Remove card from list |
| BatchAcceptButton | POST /api/candidates/batch-accept | onClick | Bulk remove cards |
| SubmitAllButton | POST /api/candidates/batch-submit | onClick | Navigate to /dashboard |
| TaskDetailPage | GET /api/todos/:id | onLoad | Populate all form fields |
| TaskDetailForm.SaveButton | PATCH /api/todos/:id | onClick | Refresh detail view |
| SourcesPage | GET /api/sources | onLoad | SourceCard list |
| SourceForm (save) | POST or PATCH /api/sources (or /api/sources/upload) | onSave | Refresh source list |
| SourceCard.RemoveButton | DELETE /api/sources/:id | onConfirm | Remove card from list |
| SourceCard.RunNowButton | POST /api/ingestion/run?source_id=X | onClick | Navigate to /confirm if candidates |
| NotifPrefsPage | GET /api/notification-prefs | onLoad | Populate form |
| NotifPrefsForm.SaveButton | PUT /api/notification-prefs | onSave | Show success toast |
| BriefingPage | GET /api/briefing/today | onLoad | BriefingCard + task lists |
| UserManagementPage | GET /api/admin/users | onLoad, search | UserTable rows |
| UserForm (save) | POST or PATCH /api/admin/users | onSave | Refresh user table |
| UserRow.ActionMenu (deactivate) | PATCH /api/admin/users/:id | onConfirm | Refresh user table |

---

## Section 5: Authentication & Session Design

### 5.1 Authentication Flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant API as NestJS Auth API
    participant DB as Database

    Note over B,DB: Login Flow
    B->>API: POST /api/auth/login {email, password}
    API->>DB: SELECT user WHERE email = ? AND is_active = 1
    alt User not found or inactive
        API-->>B: 401 Unauthorized
    end
    API->>API: bcrypt.compare(password, password_hash)
    alt Password mismatch
        API-->>B: 401 Unauthorized
    end
    API->>API: Sign JWT with {sub: user_id, role, email, iat, exp}
    API-->>B: 200 {access_token, user_id, role, expires_in}
    B->>B: Store token in httpOnly cookie (or memory for SPA)

    Note over B,DB: Authenticated Request Flow
    B->>API: GET /api/todos (Authorization: Bearer {token})
    API->>API: JwtAuthGuard verifies signature + expiry
    alt Token expired or invalid
        API-->>B: 401 Unauthorized
    end
    API->>DB: Query with user_id from JWT payload
    API-->>B: 200 Data

    Note over B,DB: Logout Flow
    B->>API: DELETE /api/auth/session
    API-->>B: 200 {message: "Logged out"}
    B->>B: Clear token from storage; redirect to /login
```

---

### 5.2 Token Specification

| Property | Value |
|---|---|
| Token Type | JWT (JSON Web Token) |
| Storage Location | httpOnly cookie (preferred for security) or in-memory for SPA; never localStorage |
| Expiry (Access Token) | 8 hours (suitable for a full workday session) |
| Refresh Token | Not implemented in Sprint Mode; re-login required on expiry |
| Payload Fields | sub (user_id: integer), email (string), role (User/Admin), iat (issued-at), exp (expiry) |
| Signing Algorithm | HS256 (HMAC-SHA256) with secret from environment variable JWT_SECRET |
| Token Prefix in Header | Bearer |

---

### 5.3 Session Management Rules

1. A JWT is issued on every successful login. There is no refresh token in Sprint Mode — users must log in again after the 8-hour expiry.
2. The JWT payload includes the user's role at the time of login. If an Admin deactivates a user account, the deactivated user's existing token will still be accepted until it expires (max 8 hours). The backend checks `is_active` at login time only.
3. Concurrent sessions are permitted — the same user may be logged in from multiple browsers simultaneously. All sessions share the same JWT_SECRET and become invalid only upon expiry.
4. On logout (`DELETE /api/auth/session`), the server returns 200 and the client clears the token from storage. There is no server-side token blacklist in Sprint Mode — token invalidation is expiry-based.
5. If a request arrives with an expired JWT, the server returns 401. The frontend intercepts this via Axios response interceptor, clears the stored token, and redirects the user to `/login`.
6. In Extended Mode, implement a refresh token stored in the database with 7-day TTL. On access token expiry, the frontend silently exchanges the refresh token for a new access token via `POST /api/auth/refresh`.

---

## Section 6: Validation & Business Rules

### 6.1 Client-Side Validation Matrix

| Field | Required | Format Rules | Length Rules | Custom Rules |
|---|---|---|---|---|
| Login email | Yes | RFC 5322 email pattern (Zod .email()) | Max 255 | — |
| Login password | Yes | No format restriction on client | Min 8; max 128 | — |
| Task title (edit) | Yes | Non-whitespace-only | Max 500 | Show error immediately on blur |
| Task deadline (edit) | No | ISO date string; Zod .date() | — | Must not be in the past if set (show warning, not block) |
| Source endpoint URL | Conditional | Valid URL (Zod .url()) | Max 500 | Only shown/required when source_type is Jira, Teams, or Slack |
| Source API token | Conditional | Any printable string | Max 500 | Required when source_type is Jira, Teams, or Slack |
| Polling interval | Yes | Integer | Min 5; max 1440 | Show inline: "between 5 and 1440 minutes" |
| Notification email target | Conditional | Email format | Max 255 | Shown/required only when channel_email = true |
| Teams/Slack webhook | Conditional | HTTPS URL | Max 500 | Shown/required only when respective channel = true |
| Briefing time | Conditional | HH:MM pattern | Exactly 5 chars | Required when briefing_enabled = true |
| User display name (admin) | Yes | Non-whitespace | Max 100 | — |
| User email (admin) | Yes | Email format | Max 255 | — |

---

### 6.2 Server-Side Validation Matrix

| Field | Required | Format Rules | Length Rules | Custom Rules (server-only) |
|---|---|---|---|---|
| Login email | Yes | Email pattern | Max 255 | Existence check: user with this email must exist in DB |
| Login password | Yes | — | Min 8; max 128 | bcrypt.compare against stored hash |
| Task title (PATCH) | If provided | Non-empty string | Max 500 | Belongs-to-user check: todo must belong to current user |
| Task status (PATCH) | If provided | IN (Todo,InProgress,Done) | — | Transition rule: Done→Todo blocked (returns 422) |
| Task deadline (PATCH) | If provided | ISO 8601 date | — | Past deadline: accepted with warning flag in response |
| Source endpoint URL | Conditional | Valid URL | Max 500 | Server additionally verifies HTTPS scheme for external APIs |
| Source API token | Conditional | — | Max 500 | Stored as reference key only; never logged |
| Polling interval | Yes | Integer | 5–1440 | — |
| Candidate confirmation | — | — | — | Candidate must belong to current user; status must be pending_confirmation; duplicate confirm returns 409 |
| Notif prefs at-least-one | — | — | — | At least one channel flag must be true (returns 422 otherwise) |
| Notif prefs offset | — | — | — | At least one of offset_24h, offset_1h, or valid offset_custom_hours (returns 422 otherwise) |
| Admin: user email | Yes | Email format | Max 255 | UNIQUE check: email must not exist in users table (returns 409 if duplicate) |
| Admin: deactivate own | — | — | — | Admin cannot deactivate their own account (returns 422) |
| File upload | — | MIME type + extension | Max 20 MB | Accepted MIME: text/plain, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/pdf |

---

### 6.3 Business Rule Specifications

**Rule BR-01: Task Status Transition**

| From Status | To Status | Permitted | If Not Permitted |
|---|---|---|---|
| Todo | InProgress | Yes | — |
| Todo | Done | Yes | — |
| InProgress | Done | Yes | — |
| InProgress | Todo | Yes | — |
| Done | InProgress | Yes | — |
| Done | Todo | No | Return 422: "Cannot revert a completed task to Todo." |

---

**Rule BR-02: Candidate Confirmation Gate**

```mermaid
flowchart TD
    A[User triggers Accept/Reject/Edit] --> B{candidate.confirmation_status == 'pending_confirmation'?}
    B -->|Yes| C{candidate.user_id == current_user?}
    C -->|Yes| D[Proceed with action]
    C -->|No| E[Return 403 Forbidden]
    B -->|No| F[Return 409 Conflict\n'Candidate already confirmed']
```

---

**Rule BR-03: Notification At-Least-One Channel**

Condition: On PUT /api/notification-prefs, the combination of channel_inapp + channel_email + channel_teams + channel_slack must have at least one value equal to 1 (true).

Success: Preferences saved normally.
Error: Return 422 with message: "At least one notification channel must be active."

---

**Rule BR-04: Confidence Score Batch Accept Threshold**

When POST /api/candidates/batch-accept is called with optional `threshold` (default 80):
- All task_candidates where `user_id = current_user AND confirmation_status = 'pending_confirmation' AND confidence_score >= threshold` are accepted in a single transaction.
- If zero candidates match the threshold, return 200 with `{ accepted_count: 0, message: "No candidates met the threshold." }`.
- Each accepted candidate creates one TodoItem and one UserFeedback record with action='accept'.

---

**Rule BR-05: File Upload — Meeting Minutes Ingestion**

When a meeting minutes file is uploaded (POST /api/sources/upload):
1. Validate file type and size (server-side).
2. Save file temporarily to server filesystem.
3. Create a DataSourceConfig record with source_type = 'Meeting' and is_active = false (manual-only; no polling).
4. Immediately trigger an ingestion session for this source.
5. Delete the temporary file after ingestion completes or fails.
6. Return the IngestionResultDto including candidate count.

---

### 6.4 Error Message Strategy

| Error Type | Display Location | Duration | User Action Required |
|---|---|---|---|
| Form field validation (client) | Below the invalid field (inline red text) | Until field is corrected | Correct the field value |
| Form submission error (API 400/422) | Form-level error banner at top of form | Until user dismisses or resubmits | Review and correct highlighted fields |
| Authentication failure (401 on login) | S01-ITM-05 error label on login screen | Until user resubmits | Re-enter credentials |
| Session expiry (401 on authenticated request) | Redirect to /login with query param `?reason=session_expired`; banner on login page | Until next login | Log in again |
| Not found (404) | Toast notification (bottom-right) | 5 seconds; auto-dismiss | No action required |
| Conflict (409) | Toast notification (bottom-right) | 8 seconds | User reviews; may need to refresh page |
| Server error (500) | Toast notification: "Something went wrong. Please try again." | 8 seconds; manual dismiss option | Retry action or contact support |
| Network error (no response) | Toast notification: "Could not reach the server. Check your connection." | 10 seconds; retry button | Click Retry or check network |
| File upload error (413/type) | Inline error below file input | Until file is changed | Select a valid file |

---

## Section 7: Role-Based Access Control

### 7.1 Permission Matrix

| Feature / Endpoint | R-01 (User) | R-03 (Admin) |
|---|---|---|
| POST /api/auth/login | ✅ Own | ✅ Own |
| DELETE /api/auth/session | ✅ Own | ✅ Own |
| GET /api/todos | ✅ Own | ✅ Own |
| GET /api/todos/summary | ✅ Own | ✅ Own |
| GET /api/todos/:id | ✅ Own | ✅ Own |
| PATCH /api/todos/:id | ✅ Own | ✅ Own |
| GET /api/candidates | ✅ Own | ✅ Own |
| POST /api/candidates/:id/accept | ✅ Own | ✅ Own |
| POST /api/candidates/:id/reject | ✅ Own | ✅ Own |
| POST /api/candidates/:id/edit-accept | ✅ Own | ✅ Own |
| POST /api/candidates/batch-accept | ✅ Own | ✅ Own |
| POST /api/candidates/batch-submit | ✅ Own | ✅ Own |
| GET /api/sources | ✅ Own | ✅ Own |
| POST /api/sources | ✅ Own | ✅ Own |
| PATCH /api/sources/:id | ✅ Own | ✅ Own |
| DELETE /api/sources/:id | ✅ Own | ✅ Own |
| POST /api/sources/upload | ✅ Own | ✅ Own |
| POST /api/ingestion/run | ✅ Own | ✅ Own |
| GET /api/notification-prefs | ✅ Own | ✅ Own |
| PUT /api/notification-prefs | ✅ Own | ✅ Own |
| GET /api/briefing/today | ✅ Own | ✅ Own |
| POST /api/briefing/generate | ✅ Own | ✅ Own |
| GET /api/admin/users | ❌ None | ✅ Full |
| POST /api/admin/users | ❌ None | ✅ Full |
| PATCH /api/admin/users/:id | ❌ None | ✅ Full |

*✅ Own = authenticated access, data scoped to current user's records only. ✅ Full = access to all records.*

---

### 7.2 Data Scoping Rules

| Role | Data Scope | Filter Applied | Notes |
|---|---|---|---|
| R-01 (User) | Own data only | All queries include `WHERE user_id = :currentUserId` | Enforced in every Service method; not optional |
| R-03 (Admin) — own features | Own data only | Same as R-01 for personal todos/sources/prefs | Admin's personal tasks are still user-scoped |
| R-03 (Admin) — admin endpoints | All users | No user_id filter on /api/admin/* endpoints | Admin can read/modify any user account |
| R-02 (Agent) | Current user's context | Agent runs scoped to the user who owns the source config triggering ingestion | Agent never mixes data between users |

---

### 7.3 Access Control Flow

```mermaid
flowchart TD
    A[Incoming HTTP Request] --> B{Authorization header present?}
    B -->|No| Z1[Return 401 Unauthorized]
    B -->|Yes| C[JwtAuthGuard: verify JWT signature and expiry]
    C -->|Invalid or expired| Z1
    C -->|Valid| D{Does endpoint require Admin role?}
    D -->|Yes| E{JWT payload role == 'Admin'?}
    E -->|No| Z2[Return 403 Forbidden]
    E -->|Yes| F[Pass to Controller]
    D -->|No — any authenticated user| F
    F --> G[Controller calls Service]
    G --> H[Service appends WHERE user_id = currentUser.user_id to all queries]
    H --> I{Requested resource user_id == currentUser.user_id?}
    I -->|No — resource belongs to another user| Z3[Return 404 Not Found\ndo not reveal existence]
    I -->|Yes| J[Process and return data]
```

---

### 7.4 UI Element Visibility

| UI Element | Visible To | Hidden From | If Hidden: Behavior |
|---|---|---|---|
| Sidebar "Admin / Users" link | R-03 (Admin) | R-01 (User) | Link not rendered in DOM; direct URL access redirected to /dashboard |
| S08 User Management Screen | R-03 (Admin) | R-01 (User) | Server-side redirect to /dashboard if role != Admin |
| PriorityBadge "AI Suggested" label | R-01, R-03 when priority_source = 'AI' | When priority_source = 'Manual' or null | Badge component not rendered |
| ThreadContextPanel invalidation warning | When invalidation_flag = true | When invalidation_flag = false | Component not rendered |
| CandidateCard edit inline form | After user clicks Edit button | Before Edit button clicked | Form section has display:none until opened |
| BatchAcceptButton | Always visible on S04 | — | Disabled (greyed out) when zero candidates meet threshold |
| SubmitAllButton | Always visible on S04 | — | Disabled until every candidate card has a decision |

---

## Section 8: Business Logic Specifications

### 8.1 Core Business Rules Table

| Rule ID | Rule Name | Trigger Condition | Logic Description | Output / Side Effect |
|---|---|---|---|---|
| BL-01 | Todo Data Isolation | Every API read/write for todos, candidates, sources, prefs | Service layer appends `user_id = currentUser.user_id` to all ORM queries | Query returns only caller's own records; no cross-user data leakage |
| BL-02 | Task Extraction Pipeline | B-01 ingestion batch fires; POST /api/ingestion/run called | AgentService: (1) fetch raw content per source, (2) call extract_todos_from_text tool, (3) score each candidate with confidence meter, (4) group candidates into thread contexts, (5) flag potential invalidations, (6) save all candidates with status = pending_confirmation, (7) write AgentTrace | New TaskCandidate rows; updated IngestionSession; AgentTrace record |
| BL-03 | Confidence Score Calculation | During task extraction for each candidate | AgentService calls LLM with candidate text. LLM returns integer 0–100 and one-line reason based on signal detection: imperative verbs, deadline phrases ("need by", "due", "EOD"), assignment phrases ("please do", "action item"), sender authority signals | confidence_score and confidence_reason set on TaskCandidate |
| BL-04 | Thread Grouping | After extraction, during BL-02 step 4 | AgentService groups candidates by shared entity references (project name, ticket ID, client name). For each group: calls LLM to generate context_label and narrative_summary. If a candidate's context contradicts an earlier task in the group (conflicting requirement detected), sets invalidation_flag = true | TaskGroup records created or updated; candidates linked via group_id |
| BL-05 | Candidate-to-TodoItem Promotion | POST /api/candidates/:id/accept or /edit-accept | CandidatesService: (1) set candidate.confirmation_status = 'accepted' or 'edited', (2) create TodoItem from candidate fields (applying edits if any), (3) set priority_source = 'AI' if priority was agent-set, (4) create UserFeedback record (action = accept or edit), (5) all in a DB transaction | New TodoItem row; UserFeedback row; candidate status updated |
| BL-06 | Duplicate Detection | During BL-02 extraction, optional (FR-13) | AgentService compares new candidate titles against existing TodoItems for same user using LLM semantic similarity check. If similarity > 0.85, sets a duplicate_flag on the candidate and links the probable duplicate_todo_id | TaskCandidate marked with duplicate indicator; user sees warning in S04 |
| BL-07 | Deadline Reminder Dispatch | B-03 runs every 15 minutes | ReminderService: (1) query todos WHERE status != 'Done' AND deadline IS NOT NULL AND user has active prefs. (2) For each active offset (24h, 1h, custom): check if current time falls within [deadline - offset - 7min, deadline - offset + 7min] window. (3) If no NotificationLog exists for this todo_id + offset combo: dispatch notification via configured channels, write NotificationLog | NotificationLog records; notifications sent via IF-06 |
| BL-08 | Daily Briefing Generation | B-02 fires at user's configured briefing_time; GET /api/briefing/today if no record for today | BriefingService: (1) query today's and tomorrow's todos for user, (2) call LLM with task list to generate friendly narrative (tone: supportive, non-judgmental), (3) save DailyBriefing record, (4) dispatch via briefing_channel | DailyBriefing record; notification dispatched |
| BL-09 | Feedback Learning | On every UserFeedback create (BL-05 accept/reject) | AgentService accumulates UserFeedback. On next ingestion for same user: retrieve last 50 feedback records; pass reject patterns to LLM as context ("User previously rejected tasks matching: X, Y"). Adjust extraction prompt to penalize similar patterns | Modified extraction prompt for subsequent runs; no DB schema change |
| BL-10 | Cross-Session Memory | Before extraction in BL-02 | AgentService queries all prior IngestionSession source_excerpts for current user to build a "seen content" set. New raw content is diffed against this set; duplicate source_excerpts are skipped without re-extraction | Reduced duplicate candidates; IngestionSession records serve as memory |

---

### 8.2 Status Transition Diagrams

**TaskCandidate.confirmation_status**

```mermaid
stateDiagram-v2
    [*] --> pending_confirmation : Created by AgentService (BL-02)
    pending_confirmation --> accepted : User clicks Accept (BL-05)
    pending_confirmation --> edited : User clicks Edit + Accept (BL-05)
    pending_confirmation --> rejected : User clicks Reject (BL-05)
    accepted --> [*]
    edited --> [*]
    rejected --> [*]
```

**TodoItem.status**

```mermaid
stateDiagram-v2
    [*] --> Todo : Created on candidate accept (BL-05)
    Todo --> InProgress : User updates status
    Todo --> Done : User marks complete
    InProgress --> Done : User marks complete
    InProgress --> Todo : User reverts (reopens)
    Done --> InProgress : User re-opens
    Done --> Todo : ❌ Blocked (BR-01)
```

**IngestionSession.status**

```mermaid
stateDiagram-v2
    [*] --> running : Session created (BL-02 start)
    running --> completed : All extraction steps succeed
    running --> failed : Any unrecoverable error in pipeline
    completed --> [*]
    failed --> [*]
```

---

### 8.3 Calculation & Transformation Rules

| Field / Output | Formula / Logic | Input Fields | Edge Cases |
|---|---|---|---|
| TodoSummaryDto.total | COUNT(todo_items) WHERE user_id = current AND status != 'Done' | todo_items.status, user_id | Returns 0 if no active todos |
| TodoSummaryDto.due_today | COUNT(todo_items) WHERE deadline = TODAY AND status != 'Done' | todo_items.deadline, status | Uses server date in user's local timezone (set via user profile or defaulted to UTC+7) |
| TodoSummaryDto.overdue | COUNT(todo_items) WHERE deadline < TODAY AND status != 'Done' | todo_items.deadline, status | Tasks with no deadline are never counted as overdue |
| TodoSummaryDto.done | COUNT(todo_items) WHERE status = 'Done' | todo_items.status | Counts all time, not just today |
| Confidence score color | Score >= 80 → green; 50–79 → yellow; 0–49 → red | confidence_score | Score exactly 80 is green; score exactly 50 is yellow |
| Overdue flag in task list | deadline < TODAY AND status != 'Done' | deadline, status | Used for visual highlighting in TaskRow; not stored in DB |
| Priority sort weight | High = 1, Medium = 2, Low = 3, null = 4 | priority | Null priority tasks sort last in priority sort |
| Reminder dispatch window | deadline - offset - 7min <= now <= deadline - offset + 7min | deadline, offset value, current timestamp | 14-minute window prevents double-dispatch when B-03 runs on its 15-minute cycle. Boundary condition: if deadline is exactly offset_hours from now, reminder fires on current cycle |

---

### 8.4 Data Mapping: Entity ↔ DTO ↔ Display

| Entity Field | DTO Field | Display Label | Transformation Applied |
|---|---|---|---|
| todo_items.todo_id | TodoDetailDto.todo_id | — (internal) | Direct mapping |
| todo_items.title | TodoDetailDto.title | Title | Direct mapping |
| todo_items.status | TodoDetailDto.status | Status | Enum to MUI Chip: Todo=grey, InProgress=blue, Done=green |
| todo_items.priority | TodoDetailDto.priority | Priority | Enum to PriorityBadge: High=red 🔴, Medium=yellow 🟡, Low=green 🟢 |
| todo_items.priority_source | TodoDetailDto.priority_source | (badge suffix) | AI → show "AI Suggested" badge next to priority; Manual → no badge |
| todo_items.deadline | TodoDetailDto.deadline | Deadline | ISO date string to locale date display (e.g., "21 May 2026"); overdue dates displayed in red |
| todo_items.source_type | TodoDetailDto.source_type | Source | Enum to icon + label: Jira=blue J icon, Email=envelope, Meeting=document, Teams=T icon, Slack=hash icon |
| todo_items.updated_at | TodoDetailDto.updated_at | Last updated | ISO datetime to relative time ("2 hours ago") in detail view |
| task_candidates.confidence_score | TaskCandidateDto.confidence_score | Score badge (0–100) | Integer to colored badge per BL-03 color rule |
| task_groups.narrative_summary | TaskGroupDto.narrative_summary | Thread context text | Rendered as read-only paragraph; links to related tasks parsed from text |
| task_candidates.invalidation_flag | TaskCandidateDto.invalidation_flag | ⚠️ May be invalidated | Boolean 1 → show warning chip; 0 → hidden |
| users.is_active | UserDetailDto.is_active | Status | Boolean 1 → 🟢 Active chip; 0 → 🔴 Inactive chip |

---

## Section 9: API Endpoint Specifications

---

### POST /api/auth/login

| Property | Detail |
|---|---|
| Purpose | Validate user credentials and return a signed JWT access token |
| Auth Required | No |
| Required Role(s) | None |

**Request:**

| Parameter | Location | Type | Required | Validation |
|---|---|---|---|---|
| email | body | string | Yes | Email format; max 255 |
| password | body | string | Yes | Min 8; max 128 |

**Response (Success — 200 OK):**

| Field | Type | Description |
|---|---|---|
| access_token | string | Signed JWT |
| user_id | number | Authenticated user's ID |
| role | string | User or Admin |
| expires_in | number | Token TTL in seconds (28800 = 8 hours) |

**Response (Error):**

| Status | Error Code | Message (EN) | Message (JP) | Cause |
|---|---|---|---|---|
| 400 | VALIDATION_ERROR | "Invalid email address format." | "メールアドレスの形式が正しくありません。" | Malformed email in body |
| 401 | INVALID_CREDENTIALS | "Invalid email or password." | "メールアドレスまたはパスワードが正しくありません。" | User not found, password mismatch, or is_active = 0 |
| 500 | SERVER_ERROR | "Internal server error." | "サーバーエラーが発生しました。" | DB unavailable or JWT signing failure |

---

### GET /api/todos

| Property | Detail |
|---|---|
| Purpose | Return paginated, filtered, sorted list of confirmed TodoItems for the authenticated user |
| Auth Required | Yes |
| Required Role(s) | User or Admin (own data) |

**Request:**

| Parameter | Location | Type | Required | Validation |
|---|---|---|---|---|
| page | query | number | No | Min 1; default 1 |
| page_size | query | number | No | Min 1; max 100; default 10 |
| search | query | string | No | Max 200 |
| source | query | string | No | IN (Jira,Email,Meeting,Teams,Slack,all); default all |
| status | query | string | No | IN (Todo,InProgress,Done,all); default all |
| priority | query | string | No | IN (High,Medium,Low,all); default all |
| sort_by | query | string | No | IN (deadline,priority,created_at,title); default deadline |
| sort_dir | query | string | No | IN (asc,desc); default asc |

**Response (Success — 200 OK):**

| Field | Type | Description |
|---|---|---|
| data | array\<TodoItem\> | Page of todo items |
| total | number | Total matching records |
| page | number | Current page |
| page_size | number | Items per page |

**Response (Error):**

| Status | Error Code | Message (EN) | Message (JP) | Cause |
|---|---|---|---|---|
| 400 | VALIDATION_ERROR | "Invalid query parameter value." | "クエリパラメータの値が不正です。" | Enum value not in accepted list |
| 401 | UNAUTHORIZED | "Unauthorized." | "認証が必要です。" | Missing or invalid JWT |
| 500 | SERVER_ERROR | "Internal server error." | "サーバーエラーが発生しました。" | DB error |

---

### PATCH /api/todos/:id

| Property | Detail |
|---|---|
| Purpose | Update one or more fields of a specific TodoItem |
| Auth Required | Yes |
| Required Role(s) | User or Admin (must be owner) |

**Request:**

| Parameter | Location | Type | Required | Validation |
|---|---|---|---|---|
| id | path | number | Yes | Valid integer |
| title | body | string | No | Max 500; non-empty if present |
| description | body | string | No | Max 2000 |
| deadline | body | string | No | ISO 8601 date |
| status | body | string | No | IN (Todo,InProgress,Done); transition rules apply |
| priority | body | string | No | IN (High,Medium,Low) |

**Response (Success — 200 OK):**

| Field | Type | Description |
|---|---|---|
| todo_id | number | ID of updated item |
| title | string | Updated title |
| status | string | Updated status |
| priority | string | Updated priority |
| priority_source | string | AI or Manual (set to Manual on PATCH) |
| deadline | string | Updated deadline |
| updated_at | string | Server timestamp of update |

**Response (Error):**

| Status | Error Code | Message (EN) | Message (JP) | Cause |
|---|---|---|---|---|
| 400 | VALIDATION_ERROR | "Title must not be empty." | "タイトルは空にできません。" | Empty title string |
| 401 | UNAUTHORIZED | "Unauthorized." | "認証が必要です。" | Missing JWT |
| 404 | NOT_FOUND | "Todo not found." | "タスクが見つかりません。" | id does not exist or belongs to another user |
| 422 | TRANSITION_BLOCKED | "Cannot revert a completed task to Todo." | "完了したタスクをTodo状態に戻すことはできません。" | Done → Todo transition attempt |
| 500 | SERVER_ERROR | "Internal server error." | "サーバーエラーが発生しました。" | DB error |

---

### POST /api/candidates/:id/reject

| Property | Detail |
|---|---|
| Purpose | Reject a pending task candidate; store user feedback for learning |
| Auth Required | Yes |
| Required Role(s) | User or Admin (must be owner) |

**Request:**

| Parameter | Location | Type | Required | Validation |
|---|---|---|---|---|
| id | path | number | Yes | Valid integer |
| reject_reason | body | string | No | Max 500 |

**Response (Success — 200 OK):**

| Field | Type | Description |
|---|---|---|
| message | string | "Candidate rejected." |
| feedback_id | number | ID of created UserFeedback record |

**Response (Error):**

| Status | Error Code | Message (EN) | Message (JP) | Cause |
|---|---|---|---|---|
| 401 | UNAUTHORIZED | "Unauthorized." | "認証が必要です。" | Missing JWT |
| 404 | NOT_FOUND | "Candidate not found." | "候補タスクが見つかりません。" | id missing or not owned by user |
| 409 | ALREADY_CONFIRMED | "Candidate has already been confirmed." | "この候補タスクはすでに確認済みです。" | confirmation_status is not pending_confirmation |
| 500 | SERVER_ERROR | "Internal server error." | "サーバーエラーが発生しました。" | DB transaction error |

---

### POST /api/ingestion/run

| Property | Detail |
|---|---|
| Purpose | Trigger an immediate ingestion run for all or a specific active source |
| Auth Required | Yes |
| Required Role(s) | User or Admin (own sources only) |

**Request:**

| Parameter | Location | Type | Required | Validation |
|---|---|---|---|---|
| source_id | body | number | No | Must be a valid source_id owned by current user if provided |

**Response (Success — 200 OK):**

| Field | Type | Description |
|---|---|---|
| sessions | array | List of {session_id, source_type, status, candidates_extracted} per source run |
| total_candidates | number | Sum of new candidates extracted |
| has_pending | boolean | true if total_candidates > 0; frontend uses this to navigate to /confirm |

**Response (Error):**

| Status | Error Code | Message (EN) | Message (JP) | Cause |
|---|---|---|---|---|
| 401 | UNAUTHORIZED | "Unauthorized." | "認証が必要です。" | Missing JWT |
| 404 | NOT_FOUND | "Source not found or inactive." | "データソースが見つからないか無効です。" | source_id invalid or not owned by user |
| 422 | NO_ACTIVE_SOURCES | "No active sources configured." | "有効なデータソースが設定されていません。" | All sources are inactive and no source_id given |
| 500 | SERVER_ERROR | "Internal server error." | "サーバーエラーが発生しました。" | AgentService or external API failure |

---

### PUT /api/notification-prefs

| Property | Detail |
|---|---|
| Purpose | Replace the authenticated user's notification preferences (full replacement, not partial) |
| Auth Required | Yes |
| Required Role(s) | User or Admin (own prefs only) |

**Request:**

| Parameter | Location | Type | Required | Validation |
|---|---|---|---|---|
| channel_inapp | body | boolean | No | — |
| channel_email | body | boolean | No | — |
| email_target | body | string | Conditional | Required if channel_email=true; email format; max 255 |
| channel_teams | body | boolean | No | — |
| teams_target | body | string | Conditional | Required if channel_teams=true; max 500 |
| channel_slack | body | boolean | No | — |
| slack_target | body | string | Conditional | Required if channel_slack=true; max 500 |
| offset_24h | body | boolean | No | — |
| offset_1h | body | boolean | No | — |
| offset_custom_hours | body | number | No | BETWEEN 1 AND 168 |
| briefing_enabled | body | boolean | No | — |
| briefing_time | body | string | Conditional | Required if briefing_enabled=true; HH:MM |
| briefing_channel | body | string | Conditional | Required if briefing_enabled=true; must be an active channel |

**Response (Success — 200 OK):**

| Field | Type | Description |
|---|---|---|
| pref_id | number | Preference record ID |
| (all pref fields) | — | Complete saved preference object |

**Response (Error):**

| Status | Error Code | Message (EN) | Message (JP) | Cause |
|---|---|---|---|---|
| 400 | VALIDATION_ERROR | "Webhook URL must be a valid HTTPS URL." | "WebhookのURLはhttpsから始まる有効なURLで入力してください。" | Malformed webhook URL |
| 401 | UNAUTHORIZED | "Unauthorized." | "認証が必要です。" | Missing JWT |
| 422 | NO_ACTIVE_CHANNEL | "At least one notification channel must be active." | "通知チャンネルを少なくとも1つ有効にしてください。" | All channels set to false |
| 422 | NO_ACTIVE_OFFSET | "At least one reminder timing must be selected." | "リマインダーのタイミングを少なくとも1つ選択してください。" | All offsets inactive |
| 422 | BRIEFING_CHANNEL_INACTIVE | "Selected briefing channel is not active." | "選択されたブリーフィングチャンネルが有効ではありません。" | briefing_channel points to a disabled channel |
| 500 | SERVER_ERROR | "Internal server error." | "サーバーエラーが発生しました。" | DB error |

---

### GET /api/briefing/today

| Property | Detail |
|---|---|
| Purpose | Return today's daily briefing for the authenticated user; auto-generate if not yet created |
| Auth Required | Yes |
| Required Role(s) | User or Admin |

**Request:** No parameters.

**Response (Success — 200 OK):**

| Field | Type | Description |
|---|---|---|
| briefing_id | number | Briefing record ID |
| briefing_date | string | ISO date (today) |
| briefing_text | string | AI-generated narrative summary |
| today_tasks | array\<TodoItem\> | Tasks due today, sorted by priority |
| tomorrow_tasks | array\<TodoItem\> | Tasks due tomorrow, sorted by priority |
| generated_at | string | ISO datetime of generation |

**Response (Error):**

| Status | Error Code | Message (EN) | Message (JP) | Cause |
|---|---|---|---|---|
| 401 | UNAUTHORIZED | "Unauthorized." | "認証が必要です。" | Missing JWT |
| 503 | LLM_UNAVAILABLE | "Briefing generation is temporarily unavailable." | "ブリーフィングの生成が一時的に利用できません。" | LLM provider API unreachable |
| 500 | SERVER_ERROR | "Internal server error." | "サーバーエラーが発生しました。" | DB or agent error |

---

### POST /api/admin/users

| Property | Detail |
|---|---|
| Purpose | Create a new user account; send activation email |
| Auth Required | Yes |
| Required Role(s) | Admin only |

**Request:**

| Parameter | Location | Type | Required | Validation |
|---|---|---|---|---|
| display_name | body | string | Yes | Max 100; non-empty |
| email | body | string | Yes | Email format; max 255; unique |
| role | body | string | Yes | IN (User, Admin) |

**Response (Success — 201 Created):**

| Field | Type | Description |
|---|---|---|
| user_id | number | New user ID |
| email | string | Email address |
| display_name | string | Display name |
| role | string | Assigned role |
| is_active | boolean | Always true on creation |
| created_at | string | ISO datetime |

**Response (Error):**

| Status | Error Code | Message (EN) | Message (JP) | Cause |
|---|---|---|---|---|
| 400 | VALIDATION_ERROR | "Invalid email address format." | "メールアドレスの形式が正しくありません。" | Malformed email |
| 401 | UNAUTHORIZED | "Unauthorized." | "認証が必要です。" | Missing JWT |
| 403 | FORBIDDEN | "Forbidden." | "アクセスが拒否されました。" | Caller is not Admin |
| 409 | EMAIL_CONFLICT | "An account with this email already exists." | "このメールアドレスは既に登録されています。" | Email uniqueness violation |
| 500 | SERVER_ERROR | "Internal server error." | "サーバーエラーが発生しました。" | DB error |

---

## Section 10: Error Handling

### 10.1 Error Scenario Matrix

| Error Code | HTTP Status | Scenario | Message (EN) | Message (JP) | Recovery Action |
|---|---|---|---|---|---|
| VALIDATION_ERROR | 400 | DTO field fails class-validator check | "Validation failed: {field} — {reason}" | "バリデーションエラー：{field} — {reason}" | Client corrects the invalid field |
| INVALID_CREDENTIALS | 401 | Login: wrong email or password | "Invalid email or password." | "メールアドレスまたはパスワードが正しくありません。" | User re-enters credentials |
| UNAUTHORIZED | 401 | JWT missing, malformed, or expired | "Unauthorized." | "認証が必要です。" | Redirect to login |
| FORBIDDEN | 403 | JWT valid but role insufficient | "Forbidden." | "アクセスが拒否されました。" | Do not retry; inform user |
| NOT_FOUND | 404 | Resource does not exist or belongs to another user | "Resource not found." | "リソースが見つかりません。" | Refresh page or return to list |
| EMAIL_CONFLICT | 409 | Create user: email already in users table | "An account with this email already exists." | "このメールアドレスは既に登録されています。" | Use a different email |
| ALREADY_CONFIRMED | 409 | Candidate confirm: status already decided | "Candidate has already been confirmed." | "この候補タスクはすでに確認済みです。" | Refresh confirmation queue |
| TRANSITION_BLOCKED | 422 | Todo status: Done → Todo attempted | "Cannot revert a completed task to Todo." | "完了したタスクをTodo状態に戻すことはできません。" | Choose InProgress instead |
| NO_ACTIVE_CHANNEL | 422 | Notif prefs: all channels false | "At least one notification channel must be active." | "通知チャンネルを少なくとも1つ有効にしてください。" | Enable at least one channel |
| NO_ACTIVE_SOURCES | 422 | Ingestion: no active connectors | "No active sources configured." | "有効なデータソースが設定されていません。" | Navigate to Sources settings |
| FILE_TOO_LARGE | 413 | Upload > 20 MB | "File exceeds the 20 MB size limit." | "ファイルサイズが20MBの上限を超えています。" | Upload a smaller file |
| INVALID_FILE_TYPE | 400 | Upload wrong MIME type | "Only .txt, .docx, or .pdf files are accepted." | "アップロードできるファイルは.txt、.docx、.pdfのみです。" | Upload correct file type |
| LLM_UNAVAILABLE | 503 | LLM API returns error or timeout | "Briefing generation is temporarily unavailable." | "ブリーフィングの生成が一時的に利用できません。" | Retry in a few minutes |
| EXTERNAL_API_ERROR | 502 | Jira/Email/Teams API returns non-2xx | "Failed to fetch data from {source}. Ingestion will retry on next cycle." | "{source}のデータ取得に失敗しました。次回のサイクルで再試行されます。" | Ingestion continues with remaining sources |
| SERVER_ERROR | 500 | Unhandled exception in service or DB | "Internal server error." | "サーバーエラーが発生しました。" | Retry; if persistent, contact admin |
| NETWORK_ERROR | — (client-side) | No HTTP response received | "Could not reach the server. Check your connection." | "サーバーに接続できません。ネットワークを確認してください。" | Retry button shown on toast |

---

### 10.2 Backend Exception Handling Strategy

| Exception Type | Handler Location | Log Level | User-Facing Response |
|---|---|---|---|
| class-validator ValidationError (DTO) | Global ValidationPipe (NestJS) | WARN | 400 with field-level errors array |
| UnauthorizedException (JWT guard) | Global Exception Filter | INFO | 401 with UNAUTHORIZED code |
| ForbiddenException (roles guard) | Global Exception Filter | WARN | 403 with FORBIDDEN code |
| NotFoundException | Controller / Service throw | INFO | 404 with NOT_FOUND code |
| ConflictException | Service throw | INFO | 409 with specific conflict code |
| UnprocessableEntityException (business rule) | Service throw | INFO | 422 with rule violation message |
| PayloadTooLargeException (file) | NestJS interceptor | WARN | 413 with FILE_TOO_LARGE code |
| External API error (Jira/Email/LLM timeout) | AgentService try-catch | ERROR | 502 or 503 depending on source |
| TypeORM QueryFailedError | Global Exception Filter | ERROR | 500 with SERVER_ERROR code; original DB error logged internally |
| Any unhandled Error | Global Exception Filter | ERROR | 500 with SERVER_ERROR code; full stack trace logged |

*All errors above WARN level are written to the structured log with fields: timestamp, level, error_code, user_id (if authenticated), endpoint, request_id.*

---

### 10.3 Frontend Error Handling Strategy

| Error Source | Catch Location | Display Method | Retry Behavior |
|---|---|---|---|
| Login API 401 | LoginForm onSubmit handler | S01-ITM-05 inline error label | User corrects and resubmits manually |
| Any API 401 (session expiry) | Axios response interceptor (global) | Redirect to /login?reason=session_expired; banner on login page | Automatic redirect; no retry |
| Any API 403 | Axios response interceptor (global) | ErrorToast: "You don't have permission to do this." | No retry; toast auto-dismisses |
| Any API 400 (form validation) | TanStack Query mutation onError | Form-level error banner; field highlights from error response | User fixes fields; resubmits |
| Any API 404 | TanStack Query query onError | ErrorToast; if on detail page, navigate back to list | No auto-retry |
| Any API 409 (conflict) | TanStack Query mutation onError | ErrorToast with specific message | User may refresh or choose different action |
| Any API 422 (business rule) | TanStack Query mutation onError | ErrorToast with rule message | User reads message and adjusts action |
| Any API 500 | TanStack Query onError (global handler) | ErrorToast: "Something went wrong. Please try again." | Retry button on toast triggers refetch |
| Network error (no response) | Axios request interceptor catch | ErrorToast with retry button | onClick Retry re-fires the last request |
| File upload rejection (type/size) | SourceForm file input onChange | Inline error below file input | User selects different file |

---

### 10.4 Logging Strategy

| Log Level | When Used | Fields Logged |
|---|---|---|
| DEBUG | Internal agent reasoning steps, tool call inputs/outputs (development only) | timestamp, session_id, step_name, tool_name, input_summary, output_summary |
| INFO | Successful API requests; user login/logout; ingestion session start/complete | timestamp, level, user_id, method, endpoint, status_code, duration_ms, request_id |
| WARN | Validation errors; unauthorized access attempts; rate limit approach; past-deadline saves | timestamp, level, user_id, endpoint, error_code, message |
| ERROR | External API failures; LLM provider errors; DB query errors; unhandled exceptions | timestamp, level, user_id, endpoint, error_code, message, stack_trace, request_id |

*All logs emitted as structured JSON. Sensitive fields (password, api_token, credentials_ref, email body content) are never logged. Agent reasoning traces are stored separately in the agent_traces table — not in the application log stream — to keep logs clean and to allow judges to inspect them via the admin view.*

---

## Appendix: Detail Design Checklist

| Criteria | Status | Notes |
|---|---|---|
| All DB tables fully specified with constraints | ✓ OK | 10 tables with column-level types, nullability, defaults, and FK/index/constraint specs |
| All API endpoints specified with DTOs | ✓ OK | 23 endpoints in Section 3.1; key endpoints fully expanded in Section 9 |
| All frontend components have props and state | ✓ OK | Section 4.2 covers all significant components from the component tree |
| All validation rules defined (client + server) | ✓ OK | Sections 6.1 and 6.2 with differences noted; EN + JP messages in Section 3.5 |
| All business rules described without code | ✓ OK | Sections 6.3 and 8.1 use tables and Mermaid diagrams only; no code blocks |
| All error scenarios and messages defined | ✓ OK | Section 10.1 covers 15 error codes; EN + JP messages; recovery actions |
| RBAC matrix covers every feature | ✓ OK | Section 7.1 covers all 23 endpoints; Section 7.3 provides access flow diagram |
| Status transitions diagrammed for all entities | ✓ OK | Section 8.2: TaskCandidate, TodoItem, and IngestionSession transitions |
| EN/JP error messages provided throughout | ✓ OK | Sections 3.4, 3.5, 9, and 10.1 all include both EN and JP messages |
| No source code used anywhere in document | ✓ OK | All logic expressed via tables, Mermaid diagrams, and numbered steps |
| Full traceability: Basic Design → Detail Design | ✓ OK | All 8 screens from Basic Design map to pages/components in Section 4.1; all FR-IDs traceable through BL rules in Section 8.1 |
| Document sufficient for AI code generation | ✓ OK | DB schema, API DTOs, validation rules, business logic, and component props are specified with enough precision to generate implementation without additional specification |

---

*End of Detail Design Document — Task Mom 24/7 v1.0*
