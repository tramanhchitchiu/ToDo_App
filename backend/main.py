import logging
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from mock_data import MOCK_BRIEFING, get_fresh_tasks
from models import ApiResponse, err, ok

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Task Mom 24/7 API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

tasks_store: list[dict] = []

VALID_PRIORITIES = {"urgent", "normal", "low"}
VALID_SOURCES = {"jira", "email", "meeting", "teams", "slack"}
VALID_STATUSES = {"pending", "accepted", "rejected"}
VALID_SORT_FIELDS = {"priority", "confidence", "deadline", "extracted_at"}

PRIORITY_ORDER = {"urgent": 0, "normal": 1, "low": 2}


@app.get("/health", response_model=ApiResponse)
def health():
    return ok({"status": "healthy"})


@app.post("/run-agent", response_model=ApiResponse)
def run_agent():
    global tasks_store
    tasks_store = get_fresh_tasks()
    logger.info("run-agent: loaded %d mock tasks", len(tasks_store))
    return ok(tasks_store)


@app.get("/tasks", response_model=ApiResponse)
def get_tasks(
    priority: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    sort_by: Optional[str] = Query(None),
):
    if priority and priority not in VALID_PRIORITIES:
        return err(f"Invalid priority '{priority}'. Must be one of: {', '.join(sorted(VALID_PRIORITIES))}")

    if source and source not in VALID_SOURCES:
        return err(f"Invalid source '{source}'. Must be one of: {', '.join(sorted(VALID_SOURCES))}")

    if status and status not in VALID_STATUSES:
        return err(f"Invalid status '{status}'. Must be one of: {', '.join(sorted(VALID_STATUSES))}")

    if sort_by and sort_by not in VALID_SORT_FIELDS:
        return err(f"Invalid sort_by '{sort_by}'. Must be one of: {', '.join(sorted(VALID_SORT_FIELDS))}")

    result = list(tasks_store)

    if priority:
        result = [t for t in result if t["priority"] == priority]
    if source:
        result = [t for t in result if t["source"] == source]
    if status:
        result = [t for t in result if t["status"] == status]

    if sort_by == "priority":
        result.sort(key=lambda t: PRIORITY_ORDER.get(t["priority"], 99))
    elif sort_by == "confidence":
        result.sort(key=lambda t: t.get("confidence", 0), reverse=True)
    elif sort_by in ("deadline", "extracted_at"):
        result.sort(key=lambda t: t.get(sort_by) or "9999")

    return ok(result)


@app.get("/tasks/{task_id}", response_model=ApiResponse)
def get_task(task_id: str):
    task = next((t for t in tasks_store if t["id"] == task_id), None)
    if task is None:
        return err(f"Task '{task_id}' not found")
    return ok(task)


@app.post("/tasks/{task_id}/accept", response_model=ApiResponse)
def accept_task(task_id: str):
    task = next((t for t in tasks_store if t["id"] == task_id), None)
    if task is None:
        return err(f"Task '{task_id}' not found")
    task["status"] = "accepted"
    logger.info("accepted task %s", task_id)
    return ok({
        "task_id": task_id,
        "action": "accept",
        "status": "accepted",
        "message": "Task accepted successfully",
    })


@app.post("/tasks/{task_id}/reject", response_model=ApiResponse)
def reject_task(task_id: str):
    global tasks_store
    task = next((t for t in tasks_store if t["id"] == task_id), None)
    if task is None:
        return err(f"Task '{task_id}' not found")
    tasks_store = [t for t in tasks_store if t["id"] != task_id]
    logger.info("rejected and removed task %s", task_id)
    return ok({
        "task_id": task_id,
        "action": "reject",
        "message": "Task removed successfully",
    })


@app.get("/daily-briefing", response_model=ApiResponse)
def daily_briefing():
    return ok(MOCK_BRIEFING)
