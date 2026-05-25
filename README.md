# Task Mom 24/7 — AI-Powered Multi-Source TODO Aggregator

> "không quên, không giận, không hối."  
> *"Don't forget, don't get angry, don't regret"* — Vietnamese wisdom

**Status:** ✅ Phase 1-3 Complete | 🚀 Phase 4-7 Queued

---

## Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Setup API key
cp .env.example .env
# Edit .env: ANTHROPIC_API_KEY=sk-ant-...

# 3. Run Phase 1: Extract tasks
PYTHONPATH=. python3 tests/test_focused_sources.py
# Expected: 41 tasks extracted from Jira + Meeting

# 4. Run Phase 2: Score tasks
PYTHONPATH=. python3 tests/test_scoring.py
# Expected: 41 tasks scored (0-100) with reasoning

# Results saved to tests/results/
```

---

## Project Overview

Task Mom 24/7 is an AI Agent system that:

1. **Extracts tasks** from multiple sources (Jira, Meeting minutes)
2. **Scores confidence** (0-100) with reasoning
3. **Groups by context** with narrative summaries
4. **Tracks decisions** (accept/reject/edit)
5. **Learns patterns** from user feedback
6. **Reminders** before deadlines
7. **Daily briefing** of workload

**Target Users:** Software teams managing tasks across multiple projects (Developers, PMs, QAs, Tech Leads)

---

## Current Status (2026-05-25)

### ✅ Phase 1: Extraction Engine — COMPLETE

**What's Done:**
- ✅ Task extraction from unstructured text using Claude API
- ✅ Multi-source support: Jira (text + CSV), Meeting minutes
- ✅ MCP connector ready for real Jira integration
- ✅ Type-safe data models (TaskCandidate, TaskGroup, TodoItem)
- ✅ 41 tasks extracted from test data

**Test Results:**
```
Jira (text format):    8 tasks ✓
Jira (CSV export):    10 tasks ✓
Meeting minutes:      23 tasks ✓
────────────────────────────
Total:               41 tasks ✓
Priority detection:    9 urgent ✓
Assignee info:        28 tasks ✓
Deadline parsing:     21 tasks ✓
```

**Files:**
- `agent/models.py` — Data structures
- `agent/extraction/extractor.py` — LLM extraction engine
- `agent/connectors/jira_connector.py` — Jira + Meeting connectors
- `data/samples/` — Test data (Jira + Meeting)
- `test_extraction.py` — Mock data test
- `test_focused_sources.py` — Real samples test

---

### ✅ Phase 2: Confidence Scoring — COMPLETE

**What's Done:**
- ✅ ConfidenceScorer class with 5-factor algorithm
- ✅ Claude API-powered intelligent scoring (0-100)
- ✅ One-line reasoning for every score
- ✅ Fallback rule-based scoring for resilience
- ✅ 41 candidates scored with confidence scores

**Test Results:**
```
Total scored:          41 candidates ✓
Average score:         51.9/100
Highest score:         95/100 (Google OAuth2 - urgent, due in 3 days)
Lowest score:          28/100 (distant deadline, vague scope)
Distribution:
  Critical (90-100):   1 task
  High (70-89):        8 tasks
  Medium (50-69):     11 tasks
  Low (30-49):        20 tasks
  Very Low (0-29):     1 task
```

**Files:**
- `agent/scoring/confidence.py` — Confidence scoring engine
- `tests/test_scoring.py` — Scoring test
- `tests/results/scoring_results.json` — Results

---

### ✅ Phase 3: Thread Intelligence — COMPLETE

**What's Done:**
- ✅ TaskGrouper class with context-aware grouping
- ✅ Claude API-powered narrative generation
- ✅ Invalidation flag detection for duplicates
- ✅ Test suite validating grouping logic
- ✅ 41 candidates grouped into 11 meaningful clusters

**Test Results:**
```
Total groups created: 11
Tasks per group (avg): 3.7
Groups by size:
  - 8 tasks: 1 group (OAuth2/Auth)
  - 4 tasks: 2 groups (AI features, Compliance)
  - 3 tasks: 4 groups (Platform, Hiring, Operations, QBR)
  - 1 task: 1 group (Auth expansion)
  - 0 tasks: 2 groups (edge cases)

Invalidated tasks: 0 (no duplicates detected)
```

**Example Group - OAuth2/Authentication:**
```
Context: "Google SSO Release (May 29)"
Narrative: "John Developer is leading the Google OAuth2 
rollout with hard deadline 2026-05-29. Core implementation 
blocks downstream work: secure token storage, auto-refresh, 
tests, code review, security review, and QA handoff."
Tasks: 8 related items
```

**Files:**
- `agent/grouping/grouper.py` — TaskGrouper engine (226 lines)
- `tests/test_grouping.py` — Grouping test suite (240 lines)
- `tests/results/grouping_results.json` — Results

---

### 🚀 Phase 4: Decision Store — QUEUED

**What's Needed:**
- [ ] SQLite persistence for decisions
- [ ] Track accept/reject/edit actions
- [ ] Learn rejection patterns
- [ ] Improve confidence scoring over time

**Estimated:** 1 hour

---

### 🚀 Phase 5: Reasoning Trace — QUEUED

**What's Needed:**
- [ ] Log all decision steps (ingest → extract → score → group)
- [ ] Human-readable trace output
- [ ] Transparency for judges

**Estimated:** 0.5 hours

---

### 🚀 Phase 6: Main Pipeline — QUEUED

**What's Needed:**
- [ ] Orchestrate all components
- [ ] Create `run_agent()` async function
- [ ] Handle errors gracefully

**Estimated:** 1 hour

---

### 🚀 Phase 7: FastAPI Integration — QUEUED

**What's Needed:**
- [ ] `POST /run-agent` endpoint
- [ ] `POST /tasks/{id}/accept` endpoint
- [ ] `POST /tasks/{id}/reject` endpoint
- [ ] Connect to frontend

**Estimated:** 1 hour

---

## Architecture

### Three Layers

```
┌─────────────────────────────────────────────┐
│ FRONTEND (React)                            │
│ - Dashboard, filters, task confirmation     │ ← Already complete ✅
│ localhost:3000                              │
└────────────────┬────────────────────────────┘
                 │ HTTP JSON
                 ↓
┌─────────────────────────────────────────────┐
│ BACKEND API (FastAPI)                       │
│ - /run-agent, /tasks, /accept, /reject      │ ← Backend dev (other member)
│ localhost:8000                              │
└────────────────┬────────────────────────────┘
                 │ Calls
                 ↓
┌─────────────────────────────────────────────┐
│ AGENT CORE (Python + Claude API)            │
│ - Extract, Score, Group, Trace, Learn       │ ← Your work ✅ Phase 1 done
│ TaskExtractor, ConfidenceScorer, Grouper    │
└─────────────────────────────────────────────┘
```

---

## Data Models

```typescript
TaskCandidate {
  id: string                 // c_jira_0
  title: string             // "Fix null pointer exception"
  source: string            // 'jira' | 'email' | 'meeting' | 'teams' | 'slack'
  priority: string          // 'urgent' | 'normal' | 'low'
  confidence: 0-100         // Assigned in Phase 2
  reason: string            // "NullPointerException blocking release"
  deadline?: string         // ISO date: 2026-05-28
  assignee?: string         // John Smith
}

TaskGroup {
  id: string                // g_1234
  context_label: string     // "Project Alpha — OAuth2"
  narrative_summary: string // "Multi-sentence story of this group"
  candidates: TaskCandidate[]
}

TodoItem (Confirmed task)
  + status: 'todo' | 'in_progress' | 'done'
```

---

## Sources Supported

### Current (Phase 1)

| Source | Format | Status | Notes |
|--------|--------|--------|-------|
| **Jira** | Text issue format | ✅ Working | Single issues |
| **Jira** | CSV bulk export | ✅ Working | Multiple issues |
| **Meeting** | Text minutes | ✅ Working | Detailed notes |

### Ready for Future

| Source | Format | Status | Notes |
|--------|--------|--------|-------|
| **Jira** | API via MCP | 🔧 Ready | Real-time sync |
| **Email** | IMAP | 🚀 Planned | Email body parsing |
| **Slack** | API | 🚀 Planned | Message threads |
| **Teams** | API | 🚀 Planned | Channel messages |

---

## Installation & Setup

### Prerequisites
- Python 3.8+
- pip / poetry
- Anthropic API key (free tier available)

### Steps

```bash
# 1. Clone and navigate
cd /path/to/ToDo_App-main

# 2. Install dependencies
pip install -r requirements.txt

# 3. Setup environment
cp .env.example .env
# Edit .env and add: ANTHROPIC_API_KEY=sk-ant-...

# 4. Run tests
python3 test_extraction.py              # Mock data test
python3 test_focused_sources.py         # Real samples test
```

---

## Project Structure

### Complete Directory Tree

```
ToDo_App-main/
├── README.md                           ← Main project documentation
├── CLAUDE.md                           ← Development context & constraints
│
├── agent/                              ← 🤖 AI AGENT CORE (Python)
│   ├── __init__.py
│   ├── models.py                       ✅ Phase 1: Data structures (TaskCandidate, TaskGroup, TodoItem)
│   │
│   ├── extraction/                     ✅ Phase 1: Task Extraction
│   │   ├── __init__.py
│   │   └── extractor.py                Task extraction engine using Claude API
│   │
│   ├── scoring/                        ✅ Phase 2: Confidence Scoring (COMPLETE)
│   │   ├── __init__.py
│   │   └── confidence.py               5-factor confidence scorer (0-100)
│   │
│   ├── grouping/                       ✅ Phase 3: Thread Intelligence (COMPLETE)
│   │   ├── __init__.py
│   │   └── grouper.py                  Context-aware task grouping + narratives
│   │
│   ├── decisions/                      🚀 Phase 4: Decision Store (Planned)
│   │   └── __init__.py
│   │
│   ├── reasoning/                      🚀 Phase 5: Reasoning Trace (Planned)
│   │   └── __init__.py
│   │
│   └── connectors/                     ✅ Data source connectors
│       ├── __init__.py
│       └── jira_connector.py           Jira (API, CSV, text) + Meeting minutes
│
├── data/                               📊 Test Data
│   ├── mock_sources.py                 ✅ 7 mock data sources for testing
│   │
│   └── samples/                        ✅ Real sample data files
│       ├── jira_issue.txt              Jira issue in text format
│       ├── jira_export.csv             Jira bulk export (10 issues)
│       ├── meeting_minutes_2.txt       Meeting minutes (23 action items)
│       └── meeting_notes.txt           Additional meeting notes
│
├── frontend/                           ✅ React UI (COMPLETE)
│   ├── designs/                        🎨 Stitch design mockups (8 screens)
│   │   ├── s01-login.png               Login page
│   │   ├── s02-dashboard.png           Main dashboard
│   │   ├── s03-task detail.png         Task detail view
│   │   ├── s04-task confirmation.png   Accept/reject confirmation
│   │   ├── s05-data source settings.png Data source config
│   │   ├── s06-notification settings.png Notification settings
│   │   ├── s07-daily briefing.png      Daily briefing widget
│   │   └── s08-user management.png     Admin user management
│   │
│   ├── src/
│   │   ├── pages/                      8 page components (each .tsx + .module.css)
│   │   │   ├── AdminUsers.tsx/.css      User management (admin)
│   │   │   ├── Briefing.tsx/.css        Daily briefing stats
│   │   │   ├── ConfirmTasks.tsx/.css    Accept/reject interface
│   │   │   ├── Dashboard.tsx/.css       Main task dashboard
│   │   │   ├── DataSources.tsx/.css     Jira/Email/Slack config
│   │   │   ├── Login.tsx/.css           Authentication
│   │   │   ├── Notifications.tsx/.css   Settings & alerts
│   │   │   └── TaskDetail.tsx/.css      Single task details
│   │   │
│   │   ├── components/                 4 reusable components (each .tsx + .module.css)
│   │   │   ├── AppShell.tsx/.css       Sidebar + header wrapper
│   │   │   ├── TaskCard.tsx/.css       Individual task card
│   │   │   ├── DailyBriefing.tsx/.css  Stats widget
│   │   │   └── FilterBar.tsx/.css      Priority/source/sort filters
│   │   │
│   │   ├── constants/
│   │   │   └── colors.ts               Design tokens (FPT orange, dark mode, etc.)
│   │   │
│   │   ├── types/
│   │   │   └── api.types.ts            TypeScript interfaces (Task, TaskGroup, etc.)
│   │   │
│   │   └── App.tsx                     React root component
│   │
│   ├── public/                         Static assets
│   ├── package.json                    Dependencies (React, Axios, TypeScript)
│   └── README.md                       Frontend-specific docs
│
├── backend/                            🚀 FastAPI Backend (In Progress)
│   └── (To be implemented by backend dev)
│
├── tests/                              🧪 Test Suite
│   ├── test_extraction.py              ✅ Mock data extraction test
│   ├── test_focused_sources.py         ✅ Focused samples test (3 sources)
│   ├── test_real_samples.py            ✅ Extended real samples test
│   ├── test_scoring.py                 ✅ Confidence scoring test
│   ├── test_grouping.py                ✅ Grouping & narrative test (Phase 3)
│   │
│   └── results/                        📊 Test Results (all tests save here)
│       ├── README.md                   Test results documentation
│       ├── extraction_results.json     Mock data extraction results
│       ├── focused_sources_results.json Real sample extraction (Phase 1)
│       ├── real_samples_results.json   Extended sample results
│       ├── scoring_results.json        Confidence scoring results (Phase 2)
│       └── grouping_results.json       ✅ Task grouping results (Phase 3)
│
├── .env.example                        Environment template (API keys)
├── requirements.txt                    Python dependencies
├── .gitignore                          Git ignore rules
└── LICENSE                             MIT License
```

---

## Folder Organization Guide

### 📁 `agent/` — AI Agent Core (Python)
The heart of Task Mom 24/7. Implements task extraction, scoring, grouping, and learning.

**Phase-based Structure:**
- **Phase 1 (extraction/)**: Extract tasks from unstructured text → TaskCandidate objects
- **Phase 2 (scoring/)**: Score each candidate 0-100 → confidence + reasoning
- **Phase 3 (grouping/)**: Group related tasks → TaskGroup with narrative summaries
- **Phase 4 (decisions/)**: Persist user decisions → SQLite for learning
- **Phase 5 (reasoning/)**: Log reasoning steps → human-readable traces

**Shared:**
- `models.py` — Data structures used across all phases
- `connectors/` — Connect to Jira, Email, Slack APIs

### 📊 `data/` — Test Data
Mock and real sample data for testing and validation.

- **mock_sources.py** — 7 artificially generated sources for unit testing
- **samples/** — Real Jira issues, CSV exports, and meeting minutes
  - Ensures extraction works on realistic input

### 🎨 `frontend/` — React UI (Create React App)
Complete user-facing application in React + TypeScript + CSS Modules.

**Organized by feature:**
- **pages/** — Full-page components (Dashboard, Settings, etc.)
- **components/** — Reusable UI pieces (TaskCard, FilterBar, etc.)
- **designs/** — Stitch mockups showing what each page should look like
- **constants/** — Color tokens and design system
- **types/** — TypeScript interfaces for API contracts

### 🧪 `tests/` — Test Suite
All tests and their results in one place.

- **Root level** — Test scripts (test_extraction.py, test_scoring.py, etc.)
- **results/** — JSON output files from running tests
  - Each test saves its results here automatically
  - `results/README.md` documents each result file

### 🔧 Config Files
- **.env.example** → Copy to `.env`, add your ANTHROPIC_API_KEY
- **requirements.txt** → `pip install -r requirements.txt`
- **CLAUDE.md** → Development constraints and design rules

---

## Test Results Organization

All test results are saved to `tests/results/` for centralized organization and easy tracking.

### Result Files

| File | Phase | Test | Description |
|------|-------|------|-------------|
| `extraction_results.json` | 1 | `test_extraction.py` | Mock data extraction (7 sources) |
| `focused_sources_results.json` | 1 | `test_focused_sources.py` | Real sample extraction (Jira + Meeting) |
| `real_samples_results.json` | 1 | `test_real_samples.py` | Extended sample extraction |
| `scoring_results.json` | 2 | `test_scoring.py` | Confidence scoring of 41 candidates |

### Running Tests

```bash
# All tests save results to tests/results/ automatically

# Phase 1: Extract from mock data
python3 tests/test_extraction.py

# Phase 1: Extract from focused sources
PYTHONPATH=. python3 tests/test_focused_sources.py

# Phase 1: Extract from real samples
PYTHONPATH=. python3 tests/test_real_samples.py

# Phase 2: Score extracted tasks
PYTHONPATH=. python3 tests/test_scoring.py
```

### View Results

Each result file contains:
- **Timestamps** of when tests were run
- **Statistics** on extraction/scoring performance
- **Detailed candidate lists** with all extracted metadata
- **Quality metrics** (source coverage, priority detection, etc.)

See `tests/results/README.md` for detailed documentation of each result file.

---

## File Organization Conventions

### Python (Agent Code)
- **Module structure**: One class per file, descriptive names
- **Test files**: `test_*.py` in `tests/` directory
- **Result files**: Saved to `tests/results/*.json` automatically
- **Naming**: `snake_case` for files/functions, `PascalCase` for classes

Examples:
```
agent/extraction/extractor.py      → TaskExtractor class
agent/scoring/confidence.py         → ConfidenceScorer class
tests/test_scoring.py              → test_scoring() async function
tests/results/scoring_results.json  → test results (auto-saved)
```

### Frontend (React/TypeScript)
- **File structure**: One component per file + accompanying CSS Module
- **Naming**: `PascalCase.tsx` + `PascalCase.module.css`
- **No UI library** — custom components only
- **State management** — useState/useEffect only, no Redux/Context

Examples:
```
frontend/src/pages/Dashboard.tsx         → Page component
frontend/src/pages/Dashboard.module.css  → Styles (CSS Modules)
frontend/src/components/TaskCard.tsx     → Reusable component
frontend/src/types/api.types.ts          → TypeScript interfaces
frontend/src/constants/colors.ts         → Design tokens
```

### Test Results
- **Auto-saved to**: `tests/results/*.json`
- **Naming pattern**: `{test-name}_results.json`
- **Each contains**: metadata, statistics, detailed candidate lists
- **Documented in**: `tests/results/README.md`

Examples:
```
tests/results/extraction_results.json      → From test_extraction.py
tests/results/scoring_results.json         → From test_scoring.py
tests/results/focused_sources_results.json → From test_focused_sources.py
tests/results/real_samples_results.json    → From test_real_samples.py
```

### Sample Data
Located in `data/samples/`:
```
jira_issue.txt              Single Jira issue in text format
jira_export.csv            10 Jira issues in CSV format
meeting_minutes_2.txt      Real meeting with 23 action items
meeting_notes.txt          Additional meeting notes
```

---

## Development Timeline

**Sprint Mode (8 hours total):**

| Hour | Phase | Status | Deliverable |
|------|-------|--------|-------------|
| 1-2 | Phase 1: Extraction | ✅ DONE | 41 tasks extracted |
| 2-3 | Phase 2: Scoring | ✅ DONE | Confidence scores (avg 51.9/100) |
| 3-4 | Phase 3: Grouping | ✅ DONE | 11 task groups with narratives |
| 4-5 | Phase 4: Store | 🚀 NEXT | Decision persistence |
| 5-6 | Phase 5: Trace | 🚀 PLANNED | Reasoning logs |
| 6-7 | Phase 6: Pipeline | 🚀 PLANNED | Agent orchestration |
| 7-8 | Phase 7: FastAPI | 🚀 PLANNED | API endpoints |

---

## How It Works (Example)

### Input: Meeting Minutes
```
SPRINT PLANNING - 2026-05-25

Action Items:
- Linh: Complete security audit by 2026-05-27
- John: Implement OAuth2 integration by 2026-06-01
- QA: Test payment processing changes
```

### Processing
```
1. EXTRACT (Phase 1) ✅
   ├─ "Complete security audit" [URGENT, due 2026-05-27, assigned: Linh]
   ├─ "Implement OAuth2 integration" [NORMAL, due 2026-06-01, assigned: John]
   └─ "Test payment processing" [NORMAL, assigned: QA]

2. SCORE (Phase 2) 🚀
   ├─ Audit task: 92/100 (deadline + urgent keywords)
   ├─ OAuth2 task: 85/100 (clear deadline)
   └─ Test task: 78/100 (implicit, no deadline)

3. GROUP (Phase 3) 🚀
   ├─ Context: "Sprint 5 Security Focus"
   ├─ Narrative: "Security audit is critical path for release..."
   └─ Tasks grouped together

4. STORE (Phase 4) 🚀
   └─ User confirms: accept all 3 tasks → stored in database

5. LEARN (Phase 4) 🚀
   └─ If user rejects similar tasks later, system learns pattern
```

### Output: Frontend
```
Dashboard shows:
✓ 3 new tasks from sprint planning
✓ All marked urgent/normal
✓ Linh assigned to 1 task
✓ Deadlines visible
✓ Grouped under "Sprint 5 Security"
```

---

## Testing

### Run Extraction Tests

```bash
# Test with mock data (7 sources)
python3 test_extraction.py

# Test with real samples (3 focused sources)
python3 test_focused_sources.py

# View results
cat extraction_results.json | jq '.'
cat focused_sources_results.json | jq '.'
```

### Expected Output
```
✅ EXTRACTION PHASE 1 COMPLETE!
Total candidates extracted: 41
By source: jira(18), meeting(23)
By priority: urgent(9), normal(32)
```

---

## Next Steps (Phase 2)

To implement Confidence Scoring:

1. Create `agent/scoring/confidence.py`
2. Implement `ConfidenceScorer` class
3. Score each of 41 candidates 0-100
4. Add one-line reasoning for each
5. Run `test_scoring.py`

**Estimated time:** 1 hour

---

## Configuration

### Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...         # Claude API key

# Optional
DB_PATH=./agent_decisions.db         # SQLite database
TRACE_LOG=./agent_trace.log          # Reasoning trace file
```

### Key Files to Know

- **CLAUDE.md** — Project constraints and design rules
- **AGENT_SETUP.md** — Quick start guide
- **AGENT_IMPLEMENTATION_PLAN.md** — Full technical details
- **PHASE1_REPORT.md** — Extraction engine audit

---

## Team

**Frontend:** ✅ Complete (React UI)  
**Backend API:** 🚀 In Progress (FastAPI endpoints)  
**Agent Core:** ✅ Phase 1-2 Done, 🚀 Phase 3-7 In Progress (extraction + scoring + grouping)

---

## Performance Targets

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Extraction time | <10s | ~7s | ✅ |
| Tasks extracted | 15-20 | 41 | ✅ |
| Assignee extraction | 50% | 68% | ✅ |
| Deadline parsing | 40% | 51% | ✅ |

---

## License

Part of FPT's AI Hackathon 2026

---

## Support

- See **AGENT_SETUP.md** for quick start
- See **AGENT_IMPLEMENTATION_PLAN.md** for technical details
- See **PHASE1_REPORT.md** for audit results
- Check `.env.example` for environment setup

---

**Last Updated:** 2026-05-26  
**Phase 1 Status:** ✅ COMPLETE (41 tasks extracted)  
**Phase 2 Status:** ✅ COMPLETE (41 tasks scored, avg 51.9/100)  
**Phase 3 Status:** ✅ COMPLETE (11 groups with narratives)  
**Next Phase:** 🚀 Decision Store (Phase 4)
