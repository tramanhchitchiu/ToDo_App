# Task Mom 24/7 — Backend API Context

## Project Overview
FastAPI server that exposes HTTP endpoints for the Task Mom 24/7 frontend (React :3000).
The API layer is thin: receive request → call agent method → format response → return JSON.
Tagline: "không quên, không giận, không hối."

## Tech Stack
- Framework: FastAPI (Python 3.8+)
- Server: Uvicorn
- Validation: Pydantic v2
- Config: python-dotenv
- Agent integration: local import from agent.py (Phase 2 only)

## Project Structure
```
backend/
├── main.py           ← FastAPI app + all 7 endpoints
├── models.py         ← Pydantic models (Task, Briefing, response wrappers)
├── mock_data.py      ← Phase 1 hardcoded mock responses
├── requirements.txt
├── .env              ← ANTHROPIC_API_KEY and other secrets (never commit)
└── agent.py          ← Provided by Agent developer (Phase 2 only)
```

## Server Configuration
```
Host: 0.0.0.0
Port: 8000
Reload: true (dev mode)
Start: uvicorn main:app --reload
Docs: http://localhost:8000/docs (Swagger auto-generated)
```

## Standard Response Envelope (ALL endpoints MUST use this)
```json
{
  "success": true,
  "data": {} or [] or null,
  "error": null,
  "timestamp": "2026-05-22T09:00:00Z"
}
```
Error response:
```json
{
  "success": false,
  "data": null,
  "error": "Descriptive error message",
  "timestamp": "2026-05-22T09:00:00Z"
}
```

## Task Object Schema (EXACT field names — must match frontend)
```json
{
  "id": "task-email-20260522-001",
  "title": "Implement OAuth endpoint",
  "description": "Client A requires OAuth integration",
  "source": "email",
  "source_id": "email-1234",
  "deadline": "2026-05-24T17:00:00Z",
  "priority": "urgent",
  "confidence": 95,
  "reason": "Email from client with explicit deadline",
  "status": "pending",
  "extracted_at": "2026-05-22T09:15:00Z"
}
```
Field constraints:
- `source`: "jira" | "email" | "meeting" | "teams" | "slack"
- `priority`: "urgent" | "normal" | "low"
- `confidence`: integer 0–100
- `status`: "pending" | "accepted" | "rejected"
- `deadline`: ISO 8601 string or null
- `extracted_at`: ISO 8601 string

## Endpoints (7 total)

### GET /health
Returns `{status: "healthy"}` — always 200.

### POST /run-agent
- Phase 1: return mock task list from mock_data.py
- Phase 2: call `agent.process_sources(load_mock_data())`
- Returns array of task objects in `data`

### GET /tasks
- Query params (all optional): `priority`, `source`, `status`, `sort_by`
- Validate priority ∈ ["urgent", "normal", "low"] → 400 if invalid
- Validate source ∈ ["jira", "email", "meeting", "teams", "slack"] → 400 if invalid
- Returns filtered/sorted task list (empty list is valid, not an error)

### GET /tasks/{task_id}
- 200 with task object if found
- 404 with error message if not found

### POST /tasks/{task_id}/accept
- 404 if task not found
- Update task status to "accepted"
- Return `{task_id, action: "accept", status: "accepted", message: "Task accepted successfully"}`

### POST /tasks/{task_id}/reject
- 404 if task not found
- Remove task from in-memory list
- Return `{task_id, action: "reject", message: "Task removed successfully"}`

### GET /daily-briefing
- Phase 1: return mock briefing stats from mock_data.py
- Phase 2: call `agent.generate_daily_briefing()`
- Response shape:
```json
{
  "date": "2026-05-22",
  "total_tasks": 3,
  "breakdown": {"urgent": 1, "normal": 1, "low": 1},
  "due_today": 1,
  "overload_risk": "medium",
  "estimated_effort_hours": 6,
  "available_capacity_hours": 8,
  "recommendation": "Focus on the urgent PR review first."
}
```

## CORS Configuration (required — frontend is on :3000)
```python
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## In-Memory State (Phase 1 + 2)
Use a module-level list for task storage — no database needed for Sprint Mode:
```python
# In main.py or state.py
tasks_store: list[dict] = []
```
Populate from `POST /run-agent`. Mutate on accept/reject.

## Phase 1 Mock Data
```python
MOCK_TASKS = [
    {
        "id": "task-jira-001",
        "title": "Review PR #42 for authentication module",
        "description": "PR from team member needs review before EOD",
        "source": "jira",
        "source_id": "jira-42",
        "priority": "urgent",
        "confidence": 92,
        "reason": "Imperative assignment detected: 'please review before EOD'",
        "status": "pending",
        "deadline": "2026-05-25T17:00:00Z",
        "extracted_at": "2026-05-25T09:00:00Z",
        "group_label": "Project Alpha — Auth Module"
    },
    {
        "id": "task-email-001",
        "title": "Reply to client delivery status email",
        "description": "Client asking about delivery timeline for Phase 2",
        "source": "email",
        "source_id": "email-789",
        "priority": "normal",
        "confidence": 85,
        "reason": "'Need by Friday' deadline signal detected",
        "status": "pending",
        "deadline": "2026-05-26T17:00:00Z",
        "extracted_at": "2026-05-25T09:00:00Z"
    },
    {
        "id": "task-meeting-001",
        "title": "Update authentication documentation",
        "description": "Action item from sprint meeting",
        "source": "meeting",
        "source_id": "meeting-456",
        "priority": "low",
        "confidence": 74,
        "reason": "Action item in meeting transcript: 'Linh to update docs'",
        "status": "pending",
        "deadline": "2026-05-28T17:00:00Z",
        "extracted_at": "2026-05-25T09:00:00Z",
        "group_label": "Project Alpha — Auth Module"
    }
]

MOCK_BRIEFING = {
    "date": "2026-05-25",
    "total_tasks": 3,
    "breakdown": {"urgent": 1, "normal": 1, "low": 1},
    "due_today": 1,
    "due_tomorrow": 1,
    "overload_risk": "medium",
    "estimated_effort_hours": 6,
    "available_capacity_hours": 8,
    "top_priorities": ["task-jira-001"],
    "recommendation": "Focus on the urgent PR review first — the auth release depends on it.",
    "sources": {"jira": 1, "email": 1, "meeting": 1}
}
```

## Agent Interface (Phase 2 — import only after agent.py exists)
```python
from agent import TaskAgent
from data_sources import load_mock_data

agent = TaskAgent()

# Methods:
agent.process_sources(sources: dict) → list[dict]
agent.get_tasks() → list[dict]
agent.accept_task(task_id: str) → dict
agent.reject_task(task_id: str) → dict
agent.generate_daily_briefing() → dict
```

## HTTP Status Codes
- 200: success
- 400: invalid query param
- 404: task not found
- 500: agent/server error

## Code Style Rules
- No hardcoded credentials — use .env + python-dotenv
- No print() in committed code — use Python logging
- All endpoints return the standard response envelope
- Keep business logic out of main.py — API layer is thin
- datetime.utcnow().isoformat() + "Z" for timestamps
