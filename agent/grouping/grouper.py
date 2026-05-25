"""Thread Intelligence: Group related tasks and generate narratives"""

import os
from typing import Optional
from anthropic import Anthropic
from agent.models import TaskCandidate, TaskGroup


class TaskGrouper:
    """Group related task candidates and generate context narratives"""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not set. Please set it in .env or environment.")
        self.client = Anthropic(api_key=self.api_key)

    async def group_tasks(self, candidates: list[TaskCandidate]) -> list[TaskGroup]:
        """
        Group task candidates by context and generate narratives.

        Args:
            candidates: List of scored TaskCandidate objects

        Returns:
            List of TaskGroup objects with narrative summaries
        """

        system_prompt = """You are a task grouping expert. Analyze a list of task candidates and:

1. IDENTIFY GROUPS: Find natural clusters of related tasks based on:
   - Project/client context (keywords in title/description)
   - Assignee (same person responsible)
   - Deadline windows (due same week/month)
   - Dependencies (one task blocks another)
   - Feature/epic area (OAuth, payments, security, etc.)

2. CREATE LABELS: Generate concise context labels like:
   - "Project Alpha — OAuth2 Integration"
   - "Sprint 5 — Security Focus"
   - "Client Meeting Follow-up"
   - "Q2 Planning & Budgets"

3. GENERATE NARRATIVES: For each group, write 2-3 sentence summary that:
   - Explains the group's business context
   - Notes urgency/importance
   - Highlights dependencies or blockers
   - Mentions key stakeholders if clear

   Example narrative:
   "OAuth2 implementation is blocking the May release. Security token
    encryption is urgent (78/100) and must be done before testing.
    All items assigned to John with deadline 2026-05-29."

4. DETECT INVALIDATIONS: Mark tasks that:
   - Are duplicates (same work described twice)
   - Are superseded by other tasks
   - Contradict accepted tasks
   - Reference completed work

OUTPUT FORMAT (JSON):
[
  {
    "context_label": "Project Alpha — OAuth2 Integration",
    "narrative_summary": "OAuth2 is blocking the release...",
    "task_ids": ["c_jira_0", "c_jira_5", "c_meeting_10"],
    "invalidation_flags": []
  },
  {
    "context_label": "Sprint Review - PR Reviews",
    "narrative_summary": "3 PRs need review this week...",
    "task_ids": ["c_jira_20", "c_meeting_5"],
    "invalidation_flags": ["c_jira_20 is duplicate of earlier PR review"]
  }
]

If no clear grouping, create one group per task or small related pairs.
"""

        # Prepare task list for Claude
        tasks_text = "\n".join([
            f"ID: {c.id}\n"
            f"Title: {c.title}\n"
            f"Source: {c.source}\n"
            f"Priority: {c.priority}\n"
            f"Confidence: {c.confidence}\n"
            f"Deadline: {c.deadline or 'None'}\n"
            f"Assignee: {c.assignee or 'Unassigned'}\n"
            f"Description: {c.description or 'N/A'}\n"
            for c in candidates
        ])

        user_message = f"""Analyze these {len(candidates)} task candidates and group them by context:

{tasks_text}

Generate grouping with context labels and narrative summaries. Return valid JSON."""

        try:
            response = self.client.messages.create(
                model="claude-opus-4-7",
                max_tokens=3000,
                messages=[
                    {"role": "user", "content": user_message}
                ],
                system=system_prompt
            )

            # Parse response
            response_text = response.content[0].text.strip()

            # Extract JSON from response
            import json
            groups_data = json.loads(response_text)

            # Create TaskGroup objects
            groups = []
            candidate_map = {c.id: c for c in candidates}

            for i, group_data in enumerate(groups_data):
                task_ids = group_data.get("task_ids", [])
                group_candidates = [candidate_map[tid] for tid in task_ids if tid in candidate_map]

                # Mark invalidations on candidates
                invalidations = group_data.get("invalidation_flags", [])
                for candidate in group_candidates:
                    for invalidation in invalidations:
                        if candidate.id in invalidation:
                            candidate.invalidation_flag = True

                group = TaskGroup(
                    id=f"g_{i+1:04d}",
                    context_label=group_data.get("context_label", f"Group {i+1}"),
                    narrative_summary=group_data.get("narrative_summary", ""),
                    candidates=group_candidates
                )
                groups.append(group)

            return groups

        except Exception as e:
            # Fallback: simple grouping by assignee
            return self._fallback_group(candidates)

    def _fallback_group(self, candidates: list[TaskCandidate]) -> list[TaskGroup]:
        """
        Fallback grouping if API fails.
        Groups by assignee, then by priority/deadline.
        """
        groups = []
        grouped = {}

        # Group by assignee first
        for candidate in candidates:
            assignee = candidate.assignee or "Unassigned"
            if assignee not in grouped:
                grouped[assignee] = []
            grouped[assignee].append(candidate)

        # Create TaskGroup objects
        for i, (assignee, tasks) in enumerate(grouped.items()):
            # Sort by confidence (descending)
            tasks.sort(key=lambda x: x.confidence, reverse=True)

            # Generate simple label
            if tasks:
                primary_priority = max(t.priority for t in tasks)
                label = f"{assignee} — {primary_priority.title()} Priority Tasks"
            else:
                label = f"Group {i+1}"

            # Generate simple narrative
            task_count = len(tasks)
            urgent_count = sum(1 for t in tasks if t.priority == "urgent")
            with_deadline = sum(1 for t in tasks if t.deadline)

            narrative = f"{assignee} has {task_count} tasks"
            if urgent_count > 0:
                narrative += f", including {urgent_count} urgent"
            if with_deadline > 0:
                narrative += f", {with_deadline} with deadlines"
            narrative += "."

            group = TaskGroup(
                id=f"g_{i+1:04d}",
                context_label=label,
                narrative_summary=narrative,
                candidates=tasks
            )
            groups.append(group)

        return groups

    async def detect_invalidations(self, group: TaskGroup) -> list[str]:
        """
        Detect potentially invalidated/duplicate tasks within a group.

        Args:
            group: TaskGroup to analyze

        Returns:
            List of invalidation reasons/flags
        """
        if len(group.candidates) < 2:
            return []

        system_prompt = """You are a task deduplication expert. Analyze a group of related tasks
and identify any that are:
- Duplicates (same work, different wording)
- Superseded (newer task makes older one obsolete)
- Contradictory (tasks that conflict)

Return JSON with array of invalidation flags:
{
  "invalidations": [
    "Task A is duplicate of Task B",
    "Task C supersedes Task D"
  ]
}
"""

        tasks_text = "\n".join([
            f"- [{c.id}] {c.title} ({c.priority}, confidence: {c.confidence})"
            for c in group.candidates
        ])

        user_message = f"""Analyze these related tasks for duplicates/invalidations:
{tasks_text}

Return JSON."""

        try:
            response = self.client.messages.create(
                model="claude-opus-4-7",
                max_tokens=500,
                messages=[
                    {"role": "user", "content": user_message}
                ],
                system=system_prompt
            )

            response_text = response.content[0].text.strip()

            import json
            result = json.loads(response_text)
            return result.get("invalidations", [])

        except:
            return []
