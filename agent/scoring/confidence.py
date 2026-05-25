"""Confidence scoring engine for task candidates"""

import os
from datetime import datetime
from typing import Optional
from anthropic import Anthropic
from agent.models import TaskCandidate


class ConfidenceScorer:
    """Score task candidates 0-100 with reasoning"""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not set. Please set it in .env or environment.")
        self.client = Anthropic(api_key=self.api_key)

    async def score_task(self, candidate: TaskCandidate) -> TaskCandidate:
        """
        Score a single task candidate and add confidence score + reasoning.

        Args:
            candidate: TaskCandidate with id, title, source, priority, deadline, etc.

        Returns:
            Updated TaskCandidate with confidence score (0-100) and reason
        """

        system_prompt = """You are an expert task prioritization system. Score actionable tasks 0-100 based on:

SCORING FACTORS:
1. **Deadline urgency** (0-30 points)
   - Due today/tomorrow: +30
   - Due this week: +20
   - Due next week: +10
   - Due in 2+ weeks: +5
   - No deadline: +0

2. **Priority signals** (0-30 points)
   - Urgent/blocking/critical/ASAP/must: +30
   - High priority/important: +25
   - Normal/default: +15
   - Low/optional/nice-to-have: +5

3. **Task clarity** (0-20 points)
   - Crystal clear + actionable: +20
   - Clear with some ambiguity: +15
   - Somewhat vague: +10
   - Very unclear: +5

4. **Impact & dependencies** (0-10 points)
   - Blocks other work: +10
   - Enables other work: +7
   - Independent: +3

5. **Assignment** (0-10 points)
   - Explicitly assigned to user/team: +10
   - Assigned to someone else: +5
   - Unassigned: +3

FINAL SCORE: Sum of all factors (0-100)

OUTPUT FORMAT (JSON):
{
  "score": <0-100>,
  "reason": "<one-line explanation of score>"
}

Example reasons:
- "Due today + blocking release (urgent signals) = 95"
- "Clear deadline Friday + normal priority = 65"
- "Low priority, no deadline, somewhat vague = 28"
- "Depends on other work, no clear deadline = 42"
"""

        # Calculate relative deadline for context
        deadline_context = ""
        if candidate.deadline:
            try:
                deadline = datetime.fromisoformat(candidate.deadline)
                today = datetime.now()
                days_until = (deadline - today).days
                if days_until < 0:
                    deadline_context = f"(OVERDUE by {abs(days_until)} days)"
                else:
                    deadline_context = f"(in {days_until} days)"
            except:
                pass

        user_message = f"""Score this task candidate:

Title: {candidate.title}
Description: {candidate.description or 'N/A'}
Source: {candidate.source}
Priority: {candidate.priority}
Deadline: {candidate.deadline} {deadline_context}
Assignee: {candidate.assignee or 'Unassigned'}

Provide JSON response with score (0-100) and one-line reason."""

        try:
            response = self.client.messages.create(
                model="claude-opus-4-7",
                max_tokens=200,
                messages=[
                    {"role": "user", "content": user_message}
                ],
                system=system_prompt
            )

            # Parse response
            response_text = response.content[0].text.strip()

            # Extract JSON from response
            import json
            result = json.loads(response_text)

            # Update candidate with score and reason
            candidate.confidence = int(result["score"])
            candidate.reason = result["reason"]

            return candidate

        except Exception as e:
            # Fallback: simple rule-based scoring if API fails
            return self._fallback_score(candidate)

    def _fallback_score(self, candidate: TaskCandidate) -> TaskCandidate:
        """
        Fallback scoring if API call fails.
        Uses simple rule-based approach.
        """
        score = 0
        factors = []

        # Deadline urgency (0-30)
        if candidate.deadline:
            try:
                deadline = datetime.fromisoformat(candidate.deadline)
                today = datetime.now()
                days_until = (deadline - today).days

                if days_until < 0:
                    score += 30
                    factors.append("overdue")
                elif days_until == 0:
                    score += 30
                    factors.append("due today")
                elif days_until == 1:
                    score += 28
                    factors.append("due tomorrow")
                elif days_until <= 7:
                    score += 20
                    factors.append(f"due in {days_until} days")
                elif days_until <= 14:
                    score += 10
                    factors.append("due within 2 weeks")
                else:
                    score += 5
                    factors.append("future deadline")
            except:
                score += 0
        else:
            score += 0
            factors.append("no deadline")

        # Priority signals (0-30)
        priority_lower = candidate.priority.lower()
        if priority_lower == "urgent":
            score += 30
            factors.append("urgent priority")
        elif priority_lower == "normal":
            score += 15
            factors.append("normal priority")
        elif priority_lower == "low":
            score += 5
            factors.append("low priority")

        # Task clarity (0-20) - estimate from title length
        title_words = len(candidate.title.split())
        if title_words >= 4:
            score += 18
            factors.append("clear description")
        elif title_words >= 2:
            score += 12
            factors.append("somewhat clear")
        else:
            score += 5
            factors.append("brief/unclear")

        # Assignee (0-10)
        if candidate.assignee:
            score += 8
            factors.append("has assignee")
        else:
            score += 2
            factors.append("unassigned")

        # Cap at 100
        score = min(score, 100)

        # Generate reason
        reason = " + ".join(factors[:2])  # Use top 2 factors
        candidate.confidence = score
        candidate.reason = reason

        return candidate

    async def score_batch(self, candidates: list[TaskCandidate]) -> list[TaskCandidate]:
        """
        Score multiple candidates.

        Args:
            candidates: List of TaskCandidate objects

        Returns:
            List of scored TaskCandidate objects
        """
        scored = []
        for candidate in candidates:
            scored_candidate = await self.score_task(candidate)
            scored.append(scored_candidate)
        return scored
