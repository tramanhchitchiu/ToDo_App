"""Main agent pipeline orchestrator: Extract → Score → Group → Store → Trace"""

import os
import time
from typing import Optional, List
from agent.models import TaskCandidate, TaskGroup, ExtractionResult
from agent.extraction.extractor import TaskExtractor
from agent.scoring.confidence import ConfidenceScorer
from agent.grouping.grouper import TaskGrouper
from agent.decisions.store import DecisionStore, Decision
from agent.reasoning.tracer import ReasoningTracer
from agent.connectors.jira_connector import JiraConnector, MeetingConnector


class AgentPipeline:
    """Orchestrate the complete task extraction and processing pipeline"""

    def __init__(self, api_key: Optional[str] = None, trace_enabled: bool = True):
        """
        Initialize the pipeline with all components.

        Args:
            api_key: Anthropic API key
            trace_enabled: Enable reasoning trace logging
        """
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not set")

        # Initialize components
        self.extractor = TaskExtractor(api_key=self.api_key)
        self.scorer = ConfidenceScorer(api_key=self.api_key)
        self.grouper = TaskGrouper(api_key=self.api_key)
        self.store = DecisionStore()
        self.jira_connector = JiraConnector(api_key=self.api_key)
        self.meeting_connector = MeetingConnector()

        # Tracing
        self.trace_enabled = trace_enabled
        self.tracer = ReasoningTracer() if trace_enabled else None

    async def run(self, sources: Optional[List] = None) -> ExtractionResult:
        """
        Run the complete pipeline: Extract → Score → Group → Store → Trace

        Args:
            sources: List of SourceContent objects (optional, uses default if None)

        Returns:
            ExtractionResult with groups, count, and trace
        """
        start_time = time.time()

        try:
            # Phase 1: Extract
            candidates = await self._extract_phase(sources)

            # Phase 2: Score
            candidates = await self._score_phase(candidates)

            # Phase 3: Group
            groups = await self._group_phase(candidates)

            # Phase 4: Store (prepare for user decisions)
            await self._store_phase(groups)

            # Phase 5: Trace
            trace_output = self._trace_phase()

            # Create result
            total_time = time.time() - start_time
            result = ExtractionResult(
                groups=groups,
                total_candidates=len(candidates),
                trace=trace_output
            )

            if self.trace_enabled:
                self.tracer.add_step(
                    phase="pipeline",
                    step="Complete pipeline execution",
                    output_data={
                        "groups": len(groups),
                        "candidates": len(candidates),
                        "execution_time_seconds": total_time
                    },
                    duration_ms=total_time * 1000
                )

            return result

        except Exception as e:
            if self.trace_enabled:
                self.tracer.add_step(
                    phase="pipeline",
                    step="Pipeline execution",
                    status="error",
                    error=str(e)
                )
            raise

    async def _extract_phase(self, sources: Optional[List]) -> List[TaskCandidate]:
        """Phase 1: Extract tasks from sources"""
        extract_start = time.time()

        if self.trace_enabled:
            self.tracer.add_step(
                phase="extraction",
                step="Initialize extractor",
                output_data={"model": "claude-opus-4-7"},
                duration_ms=(time.time() - extract_start) * 1000
            )

        candidates = []

        # If no sources provided, use default connectors
        if sources is None:
            try:
                # Jira text
                step_start = time.time()
                with open("data/samples/jira_issue.txt", "r") as f:
                    content = f.read()
                from agent.models import SourceContent
                jira_text_source = SourceContent(
                    source="jira",
                    title="Jira Issue Text",
                    sender="jira-system",
                    body=content
                )
                jira_candidates = await self.extractor.extract_tasks(jira_text_source)
                candidates.extend(jira_candidates)

                if self.trace_enabled:
                    self.tracer.add_step(
                        phase="extraction",
                        step="Extract from Jira (text)",
                        output_data={"tasks": len(jira_candidates)},
                        duration_ms=(time.time() - step_start) * 1000
                    )

                # Jira CSV
                step_start = time.time()
                csv_sources = await self.jira_connector.parse_csv_export("data/samples/jira_export.csv")
                for source in csv_sources:
                    csv_candidates = await self.extractor.extract_tasks(source)
                    candidates.extend(csv_candidates)

                if self.trace_enabled:
                    self.tracer.add_step(
                        phase="extraction",
                        step="Extract from Jira (CSV)",
                        output_data={"tasks": len([c for c in candidates if c.source == "jira"])},
                        duration_ms=(time.time() - step_start) * 1000
                    )

                # Meeting minutes
                step_start = time.time()
                meeting_source = await self.meeting_connector.read_text_file("data/samples/meeting_minutes_2.txt")
                meeting_candidates = await self.extractor.extract_tasks(meeting_source)
                candidates.extend(meeting_candidates)

                if self.trace_enabled:
                    self.tracer.add_step(
                        phase="extraction",
                        step="Extract from meeting minutes",
                        output_data={"tasks": len(meeting_candidates)},
                        duration_ms=(time.time() - step_start) * 1000
                    )

            except FileNotFoundError as e:
                raise FileNotFoundError(f"Sample data not found: {e}")
        else:
            # Extract from provided sources
            for source in sources:
                task_candidates = await self.extractor.extract_tasks(source)
                candidates.extend(task_candidates)

        return candidates

    async def _score_phase(self, candidates: List[TaskCandidate]) -> List[TaskCandidate]:
        """Phase 2: Score candidates"""
        score_start = time.time()

        if self.trace_enabled:
            self.tracer.add_step(
                phase="scoring",
                step="Initialize scorer",
                output_data={"candidates": len(candidates)},
                duration_ms=(time.time() - score_start) * 1000
            )

        scored = []
        for candidate in candidates:
            scored_candidate = await self.scorer.score_task(candidate)
            scored.append(scored_candidate)

        if self.trace_enabled:
            avg_score = sum(c.confidence for c in scored) / len(scored) if scored else 0
            self.tracer.add_step(
                phase="scoring",
                step="Score all candidates",
                input_data={"candidates": len(candidates)},
                output_data={"avg_confidence": round(avg_score, 1), "total": len(scored)},
                duration_ms=(time.time() - score_start) * 1000
            )

        return scored

    async def _group_phase(self, candidates: List[TaskCandidate]) -> List[TaskGroup]:
        """Phase 3: Group tasks"""
        group_start = time.time()

        if self.trace_enabled:
            self.tracer.add_step(
                phase="grouping",
                step="Initialize grouper",
                output_data={"candidates": len(candidates)},
                duration_ms=(time.time() - group_start) * 1000
            )

        groups = await self.grouper.group_tasks(candidates)

        if self.trace_enabled:
            self.tracer.add_step(
                phase="grouping",
                step="Group tasks by context",
                input_data={"candidates": len(candidates)},
                output_data={"groups": len(groups), "avg_per_group": len(candidates) / len(groups) if groups else 0},
                duration_ms=(time.time() - group_start) * 1000
            )

        return groups

    async def _store_phase(self, groups: List[TaskGroup]):
        """Phase 4: Prepare decision store"""
        store_start = time.time()

        if self.trace_enabled:
            self.tracer.add_step(
                phase="decision",
                step="Initialize decision store",
                output_data={"database": "agent_decisions.db"},
                duration_ms=(time.time() - store_start) * 1000
            )

        # Decision store is ready for user actions
        # In a real system, the frontend would call store.save_decision()
        if self.trace_enabled:
            self.tracer.add_step(
                phase="decision",
                step="Decision store ready",
                notes="Awaiting user accept/reject actions",
                duration_ms=(time.time() - store_start) * 1000
            )

    def _trace_phase(self) -> str:
        """Phase 5: Generate trace output"""
        if not self.trace_enabled:
            return "Tracing disabled"

        return self.tracer.get_text_trace()

    def save_trace(self, format: str = "both") -> str:
        """Save reasoning trace to file"""
        if not self.trace_enabled:
            return "Tracing disabled"
        return self.tracer.save_trace(format=format)

    def accept_decision(self, task_id: str, reason: str, notes: str = "") -> int:
        """User accepts a task"""
        decision = Decision(
            task_id=task_id,
            action="accept",
            reason=reason,
            notes=notes
        )
        return self.store.save_decision(decision)

    def reject_decision(self, task_id: str, reason: str, notes: str = "") -> int:
        """User rejects a task"""
        decision = Decision(
            task_id=task_id,
            action="reject",
            reason=reason,
            notes=notes
        )
        return self.store.save_decision(decision)

    def edit_decision(self, task_id: str, reason: str, notes: str = "") -> int:
        """User edits a task"""
        decision = Decision(
            task_id=task_id,
            action="edit",
            reason=reason,
            notes=notes
        )
        return self.store.save_decision(decision)

    def get_decision_stats(self) -> dict:
        """Get decision statistics"""
        return self.store.get_decision_stats()

    def get_improvement_suggestions(self) -> list:
        """Get improvement suggestions based on decisions"""
        return self.store.get_improvement_suggestions()
