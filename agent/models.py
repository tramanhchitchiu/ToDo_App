"""Data models for Task Mom 24/7 Agent"""

from dataclasses import dataclass, field, asdict
from typing import Optional
from datetime import datetime


@dataclass
class TaskCandidate:
    """Task candidate extracted by agent, awaiting human confirmation"""
    id: str
    title: str
    source: str  # 'jira' | 'email' | 'meeting' | 'teams' | 'slack'
    priority: str  # 'urgent' | 'normal' | 'low'
    confidence: int  # 0-100
    reason: str  # one-line explanation of confidence
    description: Optional[str] = None
    deadline: Optional[str] = None  # ISO date
    assignee: Optional[str] = None
    group_id: Optional[str] = None
    invalidation_flag: bool = False


@dataclass
class TaskGroup:
    """Group of related task candidates with shared context"""
    id: str
    context_label: str  # e.g., "Project Alpha — Auth Module"
    narrative_summary: str  # 2-3 sentence story of the context
    candidates: list[TaskCandidate] = field(default_factory=list)


@dataclass
class TodoItem:
    """Confirmed task in user's task list"""
    id: str
    title: str
    source: str
    priority: str
    status: str  # 'todo' | 'in_progress' | 'done'
    confidence: int
    reason: str
    description: Optional[str] = None
    deadline: Optional[str] = None
    assignee: Optional[str] = None
    group_label: Optional[str] = None


@dataclass
class SourceContent:
    """Raw content from a source, ready for extraction"""
    source: str  # 'jira' | 'email' | 'meeting' | 'teams'
    body: str  # full text
    title: Optional[str] = None
    sender: Optional[str] = None
    timestamp: Optional[str] = None


@dataclass
class ExtractionResult:
    """Result of extraction + scoring + grouping"""
    groups: list[TaskGroup]
    total_candidates: int
    trace: str  # human-readable reasoning trace


def to_dict(obj):
    """Convert dataclass to dict recursively"""
    if isinstance(obj, (list, tuple)):
        return [to_dict(item) for item in obj]
    elif hasattr(obj, '__dataclass_fields__'):
        return {k: to_dict(v) for k, v in asdict(obj).items()}
    else:
        return obj
