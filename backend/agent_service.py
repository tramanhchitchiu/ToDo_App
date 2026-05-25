"""FastAPI service for Task Mom 24/7 Agent"""

import os
import asyncio
from typing import Optional
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

from agent.pipeline import AgentPipeline
from agent.models import TaskCandidate, TaskGroup

load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Task Mom 24/7 Agent API",
    description="AI-powered task extraction and aggregation service",
    version="1.0.0"
)

# Global pipeline instance
pipeline: Optional[AgentPipeline] = None

def init_pipeline():
    """Initialize the pipeline (called on startup and in tests)"""
    global pipeline
    if pipeline is None:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY not set")
        pipeline = AgentPipeline(api_key=api_key, trace_enabled=True)
        print("✓ Pipeline initialized")


# Request/Response Models
class RunAgentRequest(BaseModel):
    """Request to run the agent pipeline"""
    trace_enabled: bool = True


class RunAgentResponse(BaseModel):
    """Response from agent pipeline execution"""
    success: bool
    data: dict
    message: str
    timestamp: str


class TaskDecisionRequest(BaseModel):
    """Request to record a task decision"""
    reason: str
    notes: Optional[str] = None


class TaskDecisionResponse(BaseModel):
    """Response from decision recording"""
    success: bool
    decision_id: int
    task_id: str
    action: str
    timestamp: str


class ErrorResponse(BaseModel):
    """Standard error response"""
    success: bool
    error: str
    message: str
    timestamp: str


class DailyBriefingData(BaseModel):
    """Daily briefing data"""
    total_tasks: int
    breakdown: dict
    overload_risk: str
    estimated_effort_hours: float
    recommendation: str


class GetTasksResponse(BaseModel):
    """Response from get tasks endpoint"""
    success: bool
    data: list
    timestamp: str


class GetBriefingResponse(BaseModel):
    """Response from get daily briefing endpoint"""
    success: bool
    data: DailyBriefingData
    timestamp: str


# Endpoints
@app.on_event("startup")
async def startup():
    """Initialize pipeline on startup"""
    init_pipeline()


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Task Mom 24/7 Agent API",
        "version": "1.0.0"
    }


@app.post("/run-agent", response_model=RunAgentResponse)
async def run_agent(request: RunAgentRequest):
    """
    Run the complete agent pipeline.

    Triggers extraction → scoring → grouping → decision store → tracing.

    Returns:
        - 41 tasks extracted
        - 10 groups with narratives
        - Ready for user decisions
    """
    global pipeline

    if not pipeline:
        try:
            init_pipeline()
        except ValueError as e:
            raise HTTPException(status_code=500, detail=str(e))

    try:
        # Run pipeline
        result = await pipeline.run()

        return RunAgentResponse(
            success=True,
            data={
                "total_candidates": result.total_candidates,
                "groups": [
                    {
                        "id": g.id,
                        "context_label": g.context_label,
                        "narrative_summary": g.narrative_summary,
                        "task_count": len(g.candidates),
                        "tasks": [
                            {
                                "id": c.id,
                                "title": c.title,
                                "source": c.source,
                                "priority": c.priority,
                                "confidence": c.confidence,
                                "reason": c.reason,
                                "deadline": c.deadline,
                                "assignee": c.assignee,
                            }
                            for c in g.candidates
                        ]
                    }
                    for g in result.groups
                ],
                "trace_enabled": request.trace_enabled
            },
            message=f"Successfully extracted {result.total_candidates} tasks into {len(result.groups)} groups",
            timestamp=str(__import__("datetime").datetime.now().isoformat())
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Pipeline execution failed: {str(e)}"
        )


@app.post("/tasks/{task_id}/accept", response_model=TaskDecisionResponse)
async def accept_task(task_id: str, request: TaskDecisionRequest):
    """
    Accept a task and record the decision.

    Args:
        task_id: ID of the task to accept
        request: Decision details (reason, notes)

    Returns:
        Decision ID and confirmation
    """
    global pipeline

    if not pipeline:
        try:
            init_pipeline()
        except ValueError as e:
            raise HTTPException(status_code=500, detail=str(e))

    try:
        decision_id = pipeline.accept_decision(
            task_id=task_id,
            reason=request.reason,
            notes=request.notes or ""
        )

        return TaskDecisionResponse(
            success=True,
            decision_id=decision_id,
            task_id=task_id,
            action="accept",
            timestamp=str(__import__("datetime").datetime.now().isoformat())
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to record decision: {str(e)}"
        )


@app.post("/tasks/{task_id}/reject", response_model=TaskDecisionResponse)
async def reject_task(task_id: str, request: TaskDecisionRequest):
    """
    Reject a task and record the decision.

    Args:
        task_id: ID of the task to reject
        request: Decision details (reason, notes)

    Returns:
        Decision ID and confirmation
    """
    global pipeline

    if not pipeline:
        try:
            init_pipeline()
        except ValueError as e:
            raise HTTPException(status_code=500, detail=str(e))

    try:
        decision_id = pipeline.reject_decision(
            task_id=task_id,
            reason=request.reason,
            notes=request.notes or ""
        )

        return TaskDecisionResponse(
            success=True,
            decision_id=decision_id,
            task_id=task_id,
            action="reject",
            timestamp=str(__import__("datetime").datetime.now().isoformat())
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to record decision: {str(e)}"
        )


@app.get("/tasks", response_model=GetTasksResponse)
async def get_tasks(priority: Optional[str] = None, source: Optional[str] = None):
    """
    Get all accepted tasks from the database.

    Query params:
        priority: Filter by priority (urgent, normal, low)
        source: Filter by source (jira, email, meeting, teams, slack)

    Returns:
        List of accepted tasks
    """
    global pipeline

    if not pipeline:
        try:
            init_pipeline()
        except ValueError as e:
            raise HTTPException(status_code=500, detail=str(e))

    try:
        tasks = pipeline.store.get_accepted_tasks(priority=priority, source=source)

        return GetTasksResponse(
            success=True,
            data=tasks,
            timestamp=datetime.now().isoformat()
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get tasks: {str(e)}"
        )


@app.get("/daily-briefing", response_model=GetBriefingResponse)
async def get_daily_briefing():
    """
    Get daily workload briefing with stats and recommendation.

    Returns:
        Daily briefing data with total tasks, breakdown, overload risk, and recommendation
    """
    global pipeline

    if not pipeline:
        try:
            init_pipeline()
        except ValueError as e:
            raise HTTPException(status_code=500, detail=str(e))

    try:
        # Get accepted tasks
        tasks = pipeline.store.get_accepted_tasks()

        # Calculate breakdown by priority
        urgent_count = sum(1 for t in tasks if t['priority'] == 'urgent')
        normal_count = sum(1 for t in tasks if t['priority'] == 'normal')
        low_count = sum(1 for t in tasks if t['priority'] == 'low')

        total_tasks = len(tasks)

        # Determine overload risk
        if total_tasks > 10 or urgent_count > 3:
            overload_risk = 'high'
        elif total_tasks > 5 or urgent_count > 1:
            overload_risk = 'medium'
        else:
            overload_risk = 'low'

        # Estimate effort hours (placeholder: 1.5 hours per task)
        estimated_effort_hours = total_tasks * 1.5

        # Generate recommendation based on urgent count and total
        if urgent_count > 3:
            recommendation = f"You have {urgent_count} urgent tasks — focus on those first. Budget {estimated_effort_hours:.1f} hours for today."
        elif urgent_count > 0:
            recommendation = f"You have {urgent_count} urgent task(s) to complete. Plan {estimated_effort_hours:.1f} hours for all {total_tasks} tasks."
        elif total_tasks > 10:
            recommendation = f"Heavy day ahead: {total_tasks} tasks total. Prioritize by deadline. Estimated {estimated_effort_hours:.1f} hours of work."
        elif total_tasks > 0:
            recommendation = f"You have {total_tasks} tasks queued. Manageable day. Estimated {estimated_effort_hours:.1f} hours of work."
        else:
            recommendation = "No tasks today. You're all caught up! 🎉"

        briefing_data = DailyBriefingData(
            total_tasks=total_tasks,
            breakdown={
                'urgent': urgent_count,
                'normal': normal_count,
                'low': low_count
            },
            overload_risk=overload_risk,
            estimated_effort_hours=estimated_effort_hours,
            recommendation=recommendation
        )

        return GetBriefingResponse(
            success=True,
            data=briefing_data,
            timestamp=datetime.now().isoformat()
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get briefing: {str(e)}"
        )


@app.get("/stats")
async def get_stats():
    """Get decision statistics"""
    global pipeline

    if not pipeline:
        try:
            init_pipeline()
        except ValueError as e:
            raise HTTPException(status_code=500, detail=str(e))

    try:
        stats = pipeline.get_decision_stats()
        suggestions = pipeline.get_improvement_suggestions()

        return {
            "success": True,
            "statistics": stats,
            "suggestions": suggestions,
            "timestamp": str(__import__("datetime").datetime.now().isoformat())
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get statistics: {str(e)}"
        )


@app.get("/trace")
async def get_trace():
    """Get reasoning trace"""
    global pipeline

    if not pipeline:
        try:
            init_pipeline()
        except ValueError as e:
            raise HTTPException(status_code=500, detail=str(e))

    try:
        trace_text = pipeline.tracer.get_text_trace()

        return {
            "success": True,
            "trace": trace_text,
            "timestamp": str(__import__("datetime").datetime.now().isoformat())
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get trace: {str(e)}"
        )


# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "message": f"HTTP {exc.status_code}: {exc.detail}",
            "timestamp": datetime.now().isoformat()
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
