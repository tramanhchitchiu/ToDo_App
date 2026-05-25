import copy

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
        "group_label": "Project Alpha — Auth Module",
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
        "extracted_at": "2026-05-25T09:00:00Z",
        "group_label": None,
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
        "group_label": "Project Alpha — Auth Module",
    },
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
    "sources": {"jira": 1, "email": 1, "meeting": 1},
}


def get_fresh_tasks() -> list[dict]:
    return copy.deepcopy(MOCK_TASKS)
