# Task Mom 24/7 — AI-Powered Multi-Source TODO Aggregator

> "không quên, không giận, không hối."  
> *"Don't forget, don't get angry, don't regret"* — Vietnamese wisdom

**Status:** 🚀 Phase 1 Complete (Extraction Engine) | Phase 2-7 In Progress

---

## Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Setup API key
cp .env.example .env
# Edit .env: ANTHROPIC_API_KEY=sk-ant-...

# 3. Test extraction
python3 test_focused_sources.py

# Expected output: 41 tasks extracted from Jira + Meeting
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

### 🚀 Phase 2: Confidence Scoring — NEXT

**What's Needed:**
- [ ] Score each task 0-100
- [ ] Add one-line reasoning
- [ ] Consider: deadline, urgency, clarity, sender importance
- [ ] Test with extracted candidates

**Estimated:** 1 hour

---

### 🚀 Phase 3: Thread Intelligence — QUEUED

**What's Needed:**
- [ ] Group tasks by context (project, client, feature)
- [ ] Generate narrative summaries per group
- [ ] Detect invalidation flags (outdated tasks)

**Estimated:** 1 hour

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

```
ToDo_App-main/
├── README.md                           ← You are here
├── CLAUDE.md                           ← Development context
│
├── agent/                              ← AI AGENT CORE
│   ├── models.py                       ✅ Data structures
│   ├── extraction/
│   │   └── extractor.py                ✅ Task extraction engine
│   ├── scoring/
│   │   └── confidence.py               🚀 (Phase 2)
│   ├── grouping/
│   │   └── grouper.py                  🚀 (Phase 3)
│   ├── decisions/
│   │   └── store.py                    🚀 (Phase 4)
│   ├── reasoning/
│   │   └── tracer.py                   🚀 (Phase 5)
│   └── connectors/
│       └── jira_connector.py           ✅ Jira + Meeting
│
├── data/
│   ├── mock_sources.py                 ✅ Mock data
│   └── samples/                        ✅ Real test data
│       ├── jira_issue.txt
│       ├── jira_export.csv
│       └── meeting_minutes_2.txt
│
├── frontend/                           ✅ React UI (COMPLETE)
│   ├── src/
│   │   ├── pages/                      8 pages implemented
│   │   ├── components/                 4 components
│   │   ├── constants/colors.ts         Design tokens
│   │   └── types/api.types.ts          Type definitions
│   └── package.json
│
├── backend/                            🚀 (Other developer)
│   ├── agent_service.py                (FastAPI endpoints)
│   └── ...
│
├── tests/
│   ├── test_extraction.py              ✅ Mock data test
│   └── test_focused_sources.py         ✅ Real data test
│
├── docs/
│   ├── PHASE1_REPORT.md                ✅ Extraction audit
│   ├── AGENT_IMPLEMENTATION_PLAN.md    ✅ Full implementation guide
│   ├── AGENT_SETUP.md                  ✅ Quick start
│   └── ...
│
├── .env.example                        ✅ Template
├── requirements.txt                    ✅ Dependencies
└── .gitignore                          ✅ Security
```

---

## Development Timeline

**Sprint Mode (8 hours total):**

| Hour | Phase | Status | Deliverable |
|------|-------|--------|-------------|
| 1-2 | Phase 1: Extraction | ✅ DONE | 41 tasks extracted |
| 2-3 | Phase 2: Scoring | 🚀 NEXT | Confidence scores |
| 3-4 | Phase 3: Grouping | 🚀 PLANNED | Task groups |
| 4-5 | Phase 4: Store | 🚀 PLANNED | Decision persistence |
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
**Agent Core:** 🚀 Phase 1 Done, Phase 2-7 In Progress (Claude extraction + scoring)

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

**Last Updated:** 2026-05-25  
**Phase 1 Status:** ✅ COMPLETE  
**Next Phase:** Confidence Scoring (Phase 2)
