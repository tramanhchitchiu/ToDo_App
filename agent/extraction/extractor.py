"""Task extraction engine using Claude API"""

import json
import os
from typing import Optional
from anthropic import Anthropic
from agent.models import TaskCandidate, SourceContent


class TaskExtractor:
    """Extract task candidates from unstructured content using Claude API"""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not set. Please set it in .env or environment.")
        self.client = Anthropic(api_key=self.api_key)

    async def extract_tasks(
        self,
        content: SourceContent,
    ) -> list[TaskCandidate]:
        """
        Extract task candidates from raw content.

        Args:
            content: SourceContent with body text, source type, etc.

        Returns:
            List of TaskCandidate objects
        """

        system_prompt = """You are an AI assistant that extracts actionable TODO items from unstructured text
(emails, meeting minutes, chat messages, Jira comments).

Your task:
1. Identify all explicit and implicit action items
2. For each task, extract:
   - title: Brief, actionable statement (3-10 words)
   - description: Additional context (optional, 1 sentence max)
   - deadline: ISO date if mentioned (e.g., "2026-05-25"), null if not mentioned
   - assignee: Person responsible (if mentioned), null otherwise
   - priority: 'urgent' | 'normal' | 'low' (inferred from signals)

SIGNALS FOR DETECTION:
Priority signals:
- Urgent: "ASAP", "urgent", "blocking", "critical", "EOD", "before EOD", "high priority", "must"
- Normal: "should do", "need to", "action item", "please"
- Low: "can", "maybe", "consider", "optional", "nice to have"

Action signals:
- Imperatives: "review", "fix", "update", "prepare", "send", "confirm"
- Questions: "Can you...", "Could you...", "Will you..."
- Action items: "Action item:", "TODO:", "Need to:", "Remember to:"
- Assignments: "Assigned to", "assigned:", "linh to"

Deadline signals:
- Explicit: "by 2026-05-25", "before Friday", "2026-05-21"
- Relative: "EOD today" → today, "by Friday" → next Friday, "this week" → nearest Friday
- Absence: if no deadline mentioned, use null

AVOID extracting:
- Conversational statements ("How are you?", "Thanks for that")
- Completed tasks ("Already done", "Fixed last week")
- Metadata ("Email from X", "In the meeting")
- Questions without action implications

OUTPUT FORMAT (JSON):
[
  {
    "title": "Review PR #42 for authentication module",
    "description": "OAuth2 implementation needs sign-off",
    "deadline": "2026-05-25",
    "assignee": "Linh",
    "priority": "urgent"
  },
  ...
]

If no tasks found, return: []
If parsing fails, return: []
"""

        user_message = f"""
Extract all TODO items from this {content.source} content:

{f'Title: {content.title}' if content.title else ''}
{f'From: {content.sender}' if content.sender else ''}

---
{content.body}
---

Return ONLY valid JSON array, no additional text.
"""

        try:
            response = self.client.messages.create(
                model="claude-opus-4-7",
                max_tokens=2000,
                system=system_prompt,
                messages=[{"role": "user", "content": user_message}]
            )

            # Extract JSON from response
            response_text = response.content[0].text

            # Try to parse JSON
            try:
                tasks = json.loads(response_text)
            except json.JSONDecodeError:
                # Try to extract JSON array from text
                start = response_text.find("[")
                end = response_text.rfind("]") + 1
                if start >= 0 and end > start:
                    tasks = json.loads(response_text[start:end])
                else:
                    print(f"Warning: Could not parse JSON from response: {response_text}")
                    tasks = []

            # Validate and convert to TaskCandidate objects
            candidates = []
            for i, task in enumerate(tasks):
                if not isinstance(task, dict) or not task.get("title"):
                    continue

                candidate = TaskCandidate(
                    id=f"c_{content.source}_{i}",
                    title=task.get("title", "").strip(),
                    description=task.get("description"),
                    source=content.source,
                    deadline=task.get("deadline"),
                    assignee=task.get("assignee"),
                    priority=task.get("priority", "normal").lower(),
                    confidence=0,  # Will be scored in next phase
                    reason=""  # Will be filled in scoring phase
                )
                candidates.append(candidate)

            return candidates

        except Exception as e:
            print(f"Error during extraction: {e}")
            raise


# For synchronous usage (optional convenience wrapper)
def extract_tasks_sync(content: SourceContent, api_key: Optional[str] = None) -> list[TaskCandidate]:
    """Synchronous wrapper for extraction (for testing)"""
    import asyncio

    extractor = TaskExtractor(api_key=api_key)

    async def _extract():
        return await extractor.extract_tasks(content)

    # Try to run in existing event loop, otherwise create new one
    try:
        loop = asyncio.get_running_loop()
        # We're already in async context, can't run async in sync
        raise RuntimeError("extract_tasks_sync called from async context. Use extract_tasks instead.")
    except RuntimeError as e:
        if "no running event loop" not in str(e).lower():
            raise
        # No running loop, create one
        return asyncio.run(_extract())
