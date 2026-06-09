"""Task Mom 24/7 — Phase 1 FastAPI backend with seed data"""

import logging
from datetime import datetime, timedelta
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Task Mom 24/7 API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Seed data ──────────────────────────────────────────────────────────────────
# Statuses: pending → todo, accepted → in_progress, rejected → done (frontend normalises)

def _dl(days: int) -> str:
    """Return an ISO datetime string offset by `days` from today at 17:00 UTC."""
    d = datetime.utcnow().replace(hour=17, minute=0, second=0, microsecond=0) + timedelta(days=days)
    return d.strftime("%Y-%m-%dT%H:%M:%SZ")

def _extracted() -> str:
    return datetime.utcnow().replace(hour=8, minute=0, second=0, microsecond=0).strftime("%Y-%m-%dT%H:%M:%SZ")

tasks_store: dict = {t["id"]: t for t in [
    {
        "id": "task-jira-001",
        "title": "Review PR #42 — OAuth2 refresh-token flow",
        "description": "Needs review before the auth release cut on Friday. Two reviewers already approved.",
        "source": "jira",
        "source_id": "ALPHA-42",
        "priority": "urgent",
        "confidence": 94,
        "reason": "Imperative assignment: 'please review before EOD'",
        "status": "pending",
        "deadline": _dl(0),
        "extracted_at": _extracted(),
        "group_label": "Project Alpha — Auth Module",
        "source_excerpt": "[ALPHA-42 • TrungNT → Linh]\n\"Please review this PR before EOD today. Two reviewers approved but we still need your sign-off before the auth release cut on Friday.\"",
    },
    {
        "id": "task-jira-002",
        "title": "Fix bug #103 — null pointer in session middleware",
        "description": "Regression introduced in v2.4.1. Blocking 3 downstream PRs.",
        "source": "jira",
        "source_id": "ALPHA-103",
        "priority": "urgent",
        "confidence": 91,
        "reason": "High-priority bug blocking PR merges",
        "status": "accepted",
        "deadline": _dl(0),
        "extracted_at": _extracted(),
        "group_label": "Project Alpha — Auth Module",
        "source_excerpt": "[ALPHA-103 • Bug report • Severity: Critical]\n\"NullPointerException in SessionMiddleware.handle() when token is expired. Introduced in v2.4.1. Currently blocking PRs #44, #45, #46 from merging.\"",
    },
    {
        "id": "task-jira-003",
        "title": "Update API versioning docs in Confluence",
        "description": "Linked to completed JIRA ticket ALPHA-38. Docs are still on v1.",
        "source": "jira",
        "source_id": "ALPHA-38",
        "priority": "low",
        "confidence": 68,
        "reason": "Linked to completed ticket — follow-up doc update needed",
        "status": "accepted",
        "deadline": _dl(5),
        "extracted_at": _extracted(),
        "group_label": "Project Alpha — Auth Module",
        "source_excerpt": "[ALPHA-38 • Linked follow-up]\n\"Ticket ALPHA-38 is Done. Confluence API versioning docs still reference v1 endpoints. Update needed before external partners notice the discrepancy.\"",
    },
    {
        "id": "task-jira-004",
        "title": "Migrate legacy auth tokens to new format",
        "description": "Technical debt item. 12k tokens in old format need backfill script.",
        "source": "jira",
        "source_id": "ALPHA-77",
        "priority": "normal",
        "confidence": 76,
        "reason": "Sprint commitment — assigned to Linh",
        "status": "pending",
        "deadline": _dl(1),
        "extracted_at": _extracted(),
        "group_label": "Project Alpha — Auth Module",
        "source_excerpt": "[ALPHA-77 • Sprint 3 commitment • Assigned: Linh]\n\"~12,000 tokens still in legacy format. Write backfill script to migrate to JWT v2 format. Must complete before deprecation on May 31.\"",
    },
    {
        "id": "task-email-001",
        "title": "Reply to client XYZ — delivery status update",
        "description": "Client asking about Phase 2 timeline. Last reply was 3 days ago.",
        "source": "email",
        "source_id": "email-789",
        "priority": "urgent",
        "confidence": 88,
        "reason": "'Need update by Friday' detected in email body",
        "status": "pending",
        "deadline": _dl(0),
        "extracted_at": _extracted(),
        "group_label": None,
        "source_excerpt": "[Email • From: contact@xyz-corp.com]\n\"Hi Linh, could you send a quick delivery status update? We need it by Friday before our internal stakeholder review. Thanks in advance.\"",
    },
    {
        "id": "task-email-002",
        "title": "Prepare demo slides for release presentation",
        "description": "Stakeholder review call in 2 days. Need deck ready 1 day before.",
        "source": "email",
        "source_id": "email-812",
        "priority": "urgent",
        "confidence": 93,
        "reason": "'Demo by EOD tomorrow' request from stakeholder",
        "status": "accepted",
        "deadline": _dl(1),
        "extracted_at": _extracted(),
        "group_label": "Client XYZ — Release",
        "source_excerpt": "[Email • From: pm@xyz-corp.com]\n\"Please have the demo deck ready by tomorrow EOD — we need the 1 day buffer before the stakeholder call for revisions. Cover Phase 2 milestones.\"",
    },
    {
        "id": "task-email-003",
        "title": "Review and sign off on SLA amendment",
        "description": "Legal sent revised SLA for Q3. Needs PM approval before end of month.",
        "source": "email",
        "source_id": "email-834",
        "priority": "normal",
        "confidence": 81,
        "reason": "Approval deadline signal: 'sign off before end of month'",
        "status": "pending",
        "deadline": _dl(7),
        "extracted_at": _extracted(),
        "group_label": None,
        "source_excerpt": "[Email • From: legal@company.com]\n\"Attached: revised SLA for Q3 per client negotiation. Requires PM approval within 7 days. Key change: Section 4.2 response-time SLOs tightened from 4h to 2h.\"",
    },
    {
        "id": "task-email-004",
        "title": "Onboard new contractor — send repo access and docs",
        "description": "Minh joins next Monday. Need to send onboarding pack and provision accounts.",
        "source": "email",
        "source_id": "email-901",
        "priority": "normal",
        "confidence": 77,
        "reason": "Start date in 5 days — prep needed this week",
        "status": "rejected",
        "deadline": _dl(5),
        "extracted_at": _extracted(),
        "group_label": None,
        "source_excerpt": "[Email • From: hr@company.com]\n\"Reminder: Minh Nguyen (contractor, frontend) starts next Monday. Please send repo access (GitHub + Jira), onboarding doc link, and Slack invite before their first day.\"",
    },
    {
        "id": "task-meeting-001",
        "title": "Update authentication documentation",
        "description": "Action item from sprint planning. Assigned to Linh, due end of sprint.",
        "source": "meeting",
        "source_id": "meeting-456",
        "priority": "low",
        "confidence": 74,
        "reason": "Action item in sprint transcript: 'Linh to update auth docs'",
        "status": "pending",
        "deadline": _dl(0),
        "extracted_at": _extracted(),
        "group_label": "Project Alpha — Auth Module",
        "source_excerpt": "[Sprint Retro • Meeting minutes]\nAction item: \"Linh to update Confluence auth documentation to reflect the new OAuth2 flow and token refresh logic before end of sprint.\"",
    },
    {
        "id": "task-meeting-002",
        "title": "Schedule platform migration kickoff with infra team",
        "description": "Decision made in architecture review: migrate to k8s by Q3. Kickoff needed.",
        "source": "meeting",
        "source_id": "meeting-512",
        "priority": "normal",
        "confidence": 83,
        "reason": "Explicit action item assigned to PM in meeting notes",
        "status": "accepted",
        "deadline": _dl(1),
        "extracted_at": _extracted(),
        "group_label": "Platform Migration — Q3",
        "source_excerpt": "[Architecture Review • Decision recorded]\n\"Motion passed: migrate all services to k8s by Q3. PM (Linh) to schedule kickoff meeting with infra team within 1 week of this review.\"",
    },
    {
        "id": "task-meeting-003",
        "title": "Follow up on Q2 OKR review outcomes",
        "description": "Three OKRs missed. Owner agreed to post-mortem doc by next week.",
        "source": "meeting",
        "source_id": "meeting-498",
        "priority": "low",
        "confidence": 61,
        "reason": "Post-mortem commitment made in Q2 review meeting",
        "status": "rejected",
        "deadline": _dl(7),
        "extracted_at": _extracted(),
        "group_label": "Q2 Review",
        "source_excerpt": "[Q2 OKR Review • Post-mortem commitment]\n\"Three OKRs missed (Auth hardening, API latency, onboarding time). Owner committed to post-mortem doc summarising root causes by next week.\"",
    },
    {
        "id": "task-teams-001",
        "title": "Resolve CI pipeline failure on main branch",
        "description": "Pipeline red since this morning. Blocking all deployments. Likely flaky Playwright test.",
        "source": "teams",
        "source_id": "teams-msg-3421",
        "priority": "urgent",
        "confidence": 97,
        "reason": "Urgent ping from tech lead: 'main is broken, needs fix ASAP'",
        "status": "pending",
        "deadline": _dl(0),
        "extracted_at": _extracted(),
        "group_label": "Infra & DevOps",
        "source_excerpt": "[#dev-ops • TechLead]\n\"@channel URGENT — main branch CI is RED. Blocking ALL deployments. Likely flaky Playwright test in auth suite. Please investigate NOW, release is today.\"",
    },
    {
        "id": "task-teams-002",
        "title": "Review sprint planning document before standup",
        "description": "Cuong shared the doc yesterday. Standup is at 10:00.",
        "source": "teams",
        "source_id": "teams-msg-3389",
        "priority": "normal",
        "confidence": 79,
        "reason": "Review request with time constraint before standup",
        "status": "accepted",
        "deadline": _dl(1),
        "extracted_at": _extracted(),
        "group_label": "Platform Migration — Q3",
        "source_excerpt": "[#sprint-planning • Cuong → @team]\n\"Hey team, Sprint planning doc is ready in Confluence. Please review before today's 10:00 standup so we can align on capacity and the k8s migration track.\"",
    },
    {
        "id": "task-teams-003",
        "title": "Approve Figma designs for v2 dashboard",
        "description": "Designer waiting for PM sign-off before moving to handoff.",
        "source": "teams",
        "source_id": "teams-msg-3402",
        "priority": "low",
        "confidence": 72,
        "reason": "Waiting-on signal: designer blocked pending approval",
        "status": "rejected",
        "deadline": _dl(3),
        "extracted_at": _extracted(),
        "group_label": None,
        "source_excerpt": "[#design • Ana → Linh]\n\"Hi, the v2 dashboard Figma designs are ready for final review. I'm blocked on moving to developer handoff until I have your approval. Could you take a look today?\"",
    },
    {
        "id": "task-slack-001",
        "title": "Acknowledge high CPU alert on prod-worker-03",
        "description": "Alert fired this morning. CPU at 94% for 20 min. Needs acknowledgement or escalation.",
        "source": "slack",
        "source_id": "slack-alert-7821",
        "priority": "urgent",
        "confidence": 99,
        "reason": "PagerDuty-level alert forwarded to #incidents channel",
        "status": "accepted",
        "deadline": _dl(0),
        "extracted_at": _extracted(),
        "group_label": "Infra & DevOps",
        "source_excerpt": "[#incidents • PagerDuty-Bot]\n\"ALERT: prod-worker-03 — CPU at 94% for 20+ consecutive minutes (threshold: 85%). Possible memory leak. Acknowledge or escalate to on-call engineer immediately.\"",
    },
]}

VALID_PRIORITIES = {"urgent", "normal", "low"}
VALID_SOURCES = {"jira", "email", "meeting", "teams", "slack"}
VALID_STATUSES = {"pending", "accepted", "rejected"}
VALID_SORT_BY = {"priority", "confidence", "status"}


# ── Models ─────────────────────────────────────────────────────────────────────

class DecisionRequest(BaseModel):
    reason: Optional[str] = None
    notes: Optional[str] = None


class UpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    deadline: Optional[str] = None


# ── Endpoints ──────────────────────────────────────────────────────────────────

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "Task Mom 24/7 API", "version": "1.0.0"}


@app.post("/run-agent")
def run_agent():
    logger.info("run-agent: loaded %d mock tasks", len(tasks_store))
    return {
        "success": True,
        "data": list(tasks_store.values()),
        "error": None,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@app.post("/run-agent-mock")
def run_agent_mock():
    logger.info("run-agent-mock: returning %d tasks", len(tasks_store))
    return {
        "success": True,
        "data": list(tasks_store.values()),
        "error": None,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@app.get("/tasks")
def get_tasks(
    priority: Optional[str] = None,
    source: Optional[str] = None,
    status: Optional[str] = None,
    sort_by: Optional[str] = None,
):
    if priority and priority not in VALID_PRIORITIES:
        raise HTTPException(400, f"Invalid priority '{priority}'. Must be one of: {VALID_PRIORITIES}")
    if source and source not in VALID_SOURCES:
        raise HTTPException(400, f"Invalid source '{source}'. Must be one of: {VALID_SOURCES}")
    if status and status not in VALID_STATUSES:
        raise HTTPException(400, f"Invalid status '{status}'. Must be one of: {VALID_STATUSES}")
    if sort_by and sort_by not in VALID_SORT_BY:
        raise HTTPException(400, f"Invalid sort_by '{sort_by}'. Must be one of: {VALID_SORT_BY}")

    tasks = list(tasks_store.values())

    if priority:
        tasks = [t for t in tasks if t["priority"] == priority]
    if source:
        tasks = [t for t in tasks if t["source"] == source]
    if status:
        tasks = [t for t in tasks if t["status"] == status]

    if sort_by == "confidence":
        tasks.sort(key=lambda t: t["confidence"], reverse=True)
    elif sort_by == "status":
        order = {"pending": 0, "accepted": 1, "rejected": 2}
        tasks.sort(key=lambda t: order.get(t["status"], 9))
    else:
        priority_order = {"urgent": 0, "normal": 1, "low": 2}
        tasks.sort(key=lambda t: priority_order.get(t["priority"], 9))

    return {
        "success": True,
        "data": tasks,
        "error": None,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@app.get("/tasks/{task_id}")
def get_task(task_id: str):
    task = tasks_store.get(task_id)
    if not task:
        raise HTTPException(404, f"Task '{task_id}' not found")
    return {"success": True, "data": task, "error": None, "timestamp": datetime.utcnow().isoformat() + "Z"}


@app.patch("/tasks/{task_id}")
def update_task(task_id: str, body: UpdateRequest):
    task = tasks_store.get(task_id)
    if not task:
        raise HTTPException(404, f"Task '{task_id}' not found")
    if body.title is not None:
        tasks_store[task_id]["title"] = body.title
    if body.description is not None:
        tasks_store[task_id]["description"] = body.description
    if body.status is not None:
        if body.status not in VALID_STATUSES:
            raise HTTPException(400, f"Invalid status '{body.status}'. Must be one of: {VALID_STATUSES}")
        tasks_store[task_id]["status"] = body.status
    if body.deadline is not None:
        tasks_store[task_id]["deadline"] = body.deadline
    logger.info("updated task %s", task_id)
    return {
        "success": True,
        "data": tasks_store[task_id],
        "error": None,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@app.post("/tasks/{task_id}/accept")
def accept_task(task_id: str, body: DecisionRequest = DecisionRequest()):
    task = tasks_store.get(task_id)
    if not task:
        raise HTTPException(404, f"Task '{task_id}' not found")
    tasks_store[task_id]["status"] = "accepted"
    logger.info("accepted task %s", task_id)
    return {
        "success": True,
        "data": {"action": "accept", "task_id": task_id, "message": "Task accepted successfully"},
        "error": None,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@app.post("/tasks/{task_id}/reject")
def reject_task(task_id: str, body: DecisionRequest = DecisionRequest()):
    task = tasks_store.get(task_id)
    if not task:
        raise HTTPException(404, f"Task '{task_id}' not found")
    tasks_store[task_id]["status"] = "rejected"
    logger.info("rejected and removed task %s", task_id)
    return {
        "success": True,
        "data": {"action": "reject", "task_id": task_id, "message": "Task removed successfully"},
        "error": None,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@app.get("/daily-briefing")
def daily_briefing():
    tasks = list(tasks_store.values())
    active = [t for t in tasks if t["status"] != "rejected"]
    urgent = sum(1 for t in active if t["priority"] == "urgent")
    normal = sum(1 for t in active if t["priority"] == "normal")
    low = sum(1 for t in active if t["priority"] == "low")
    total = len(active)
    effort = round(total * 1.5, 1)

    if total > 10 or urgent > 3:
        risk = "high"
    elif total > 5 or urgent > 1:
        risk = "medium"
    else:
        risk = "low"

    if urgent > 3:
        rec = f"You have {urgent} urgent tasks — tackle those first. Budget ~{effort}h today."
    elif urgent > 0:
        rec = f"{urgent} urgent task(s) need attention. {total} total tasks — estimated {effort}h."
    else:
        rec = f"No urgent tasks today. {total} tasks queued, estimated {effort}h of work."

    return {
        "success": True,
        "data": {
            "total_tasks": total,
            "breakdown": {"urgent": urgent, "normal": normal, "low": low},
            "overload_risk": risk,
            "estimated_effort_hours": effort,
            "recommendation": rec,
        },
        "error": None,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }
