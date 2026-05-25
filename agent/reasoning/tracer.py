"""Reasoning Trace: Log all decision steps for transparency and debugging"""

import json
from datetime import datetime
from typing import Optional, List, Any
from dataclasses import dataclass, asdict


@dataclass
class TraceStep:
    """Single step in the reasoning trace"""
    phase: str  # extraction, scoring, grouping, decision
    step: str  # action taken
    input_data: Optional[dict] = None
    output_data: Optional[dict] = None
    timestamp: Optional[str] = None
    duration_ms: Optional[float] = None
    status: str = "success"  # success, error, skipped
    error: Optional[str] = None
    notes: Optional[str] = None


class ReasoningTracer:
    """Log and format reasoning trace for transparency"""

    def __init__(self, log_file: Optional[str] = None):
        self.log_file = log_file or "agent_trace.log"
        self.steps: List[TraceStep] = []
        self.start_time = datetime.now()

    def add_step(self, phase: str, step: str, input_data: Optional[dict] = None,
                 output_data: Optional[dict] = None, duration_ms: Optional[float] = None,
                 error: Optional[str] = None, notes: Optional[str] = None):
        """
        Add a step to the trace.

        Args:
            phase: Phase name (extraction, scoring, grouping, decision)
            step: Step description
            input_data: Input to this step
            output_data: Output from this step
            duration_ms: Execution time
            error: Error if failed
            notes: Additional notes
        """
        trace_step = TraceStep(
            phase=phase,
            step=step,
            input_data=input_data,
            output_data=output_data,
            timestamp=datetime.now().isoformat(),
            duration_ms=duration_ms,
            status="error" if error else "success",
            error=error,
            notes=notes
        )
        self.steps.append(trace_step)

    def get_text_trace(self) -> str:
        """Generate human-readable text trace"""
        lines = []
        lines.append("=" * 80)
        lines.append("TASK MOM 24/7 — REASONING TRACE")
        lines.append("=" * 80)
        lines.append("")
        lines.append(f"Trace started: {self.start_time.isoformat()}")
        lines.append(f"Total duration: {(datetime.now() - self.start_time).total_seconds():.2f}s")
        lines.append(f"Total steps: {len(self.steps)}")
        lines.append("")

        # Group steps by phase
        phases = {}
        for step in self.steps:
            if step.phase not in phases:
                phases[step.phase] = []
            phases[step.phase].append(step)

        # Phase order
        phase_order = ["ingestion", "extraction", "scoring", "grouping", "decision", "learning"]

        for phase in phase_order:
            if phase not in phases:
                continue

            phase_steps = phases[phase]
            lines.append("─" * 80)
            lines.append(f"PHASE: {phase.upper()}")
            lines.append("─" * 80)
            lines.append("")

            for i, step in enumerate(phase_steps, 1):
                status_icon = "✓" if step.status == "success" else "✗"
                lines.append(f"[{i}] {status_icon} {step.step}")

                if step.duration_ms:
                    lines.append(f"    Time: {step.duration_ms:.1f}ms")

                if step.notes:
                    lines.append(f"    Note: {step.notes}")

                if step.error:
                    lines.append(f"    ⚠️ ERROR: {step.error}")

                if step.input_data:
                    lines.append(f"    Input:")
                    for key, value in step.input_data.items():
                        if isinstance(value, (int, float, str, bool)):
                            lines.append(f"      • {key}: {value}")
                        elif isinstance(value, list):
                            lines.append(f"      • {key}: [{len(value)} items]")
                        elif isinstance(value, dict):
                            lines.append(f"      • {key}: {{...}}")

                if step.output_data:
                    lines.append(f"    Output:")
                    for key, value in step.output_data.items():
                        if isinstance(value, (int, float, str, bool)):
                            lines.append(f"      • {key}: {value}")
                        elif isinstance(value, list):
                            lines.append(f"      • {key}: [{len(value)} items]")
                        elif isinstance(value, dict):
                            lines.append(f"      • {key}: {{...}}")

                lines.append("")

        lines.append("=" * 80)
        lines.append("END OF TRACE")
        lines.append("=" * 80)

        return "\n".join(lines)

    def get_json_trace(self) -> dict:
        """Generate JSON trace for machine parsing"""
        return {
            "metadata": {
                "start_time": self.start_time.isoformat(),
                "end_time": datetime.now().isoformat(),
                "total_duration_seconds": (datetime.now() - self.start_time).total_seconds(),
                "total_steps": len(self.steps),
            },
            "steps": [asdict(step) for step in self.steps],
            "summary": self._get_summary()
        }

    def _get_summary(self) -> dict:
        """Get summary statistics from trace"""
        by_phase = {}
        by_status = {"success": 0, "error": 0, "skipped": 0}
        total_time = 0.0

        for step in self.steps:
            # Count by phase
            if step.phase not in by_phase:
                by_phase[step.phase] = {"total": 0, "success": 0, "error": 0}
            by_phase[step.phase]["total"] += 1
            by_phase[step.phase][step.status] += 1

            # Count by status
            by_status[step.status] += 1

            # Sum duration
            if step.duration_ms:
                total_time += step.duration_ms

        return {
            "by_phase": by_phase,
            "by_status": by_status,
            "total_time_ms": total_time,
        }

    def save_trace(self, format: str = "both") -> str:
        """
        Save trace to file.

        Args:
            format: 'text', 'json', or 'both'

        Returns:
            Path to saved file(s)
        """
        paths = []

        if format in ("text", "both"):
            text_file = self.log_file.replace(".log", ".txt")
            with open(text_file, "w") as f:
                f.write(self.get_text_trace())
            paths.append(text_file)

        if format in ("json", "both"):
            json_file = self.log_file.replace(".log", ".json")
            with open(json_file, "w") as f:
                json.dump(self.get_json_trace(), f, indent=2)
            paths.append(json_file)

        return " & ".join(paths)

    def get_phase_summary(self, phase: str) -> dict:
        """Get summary for a specific phase"""
        phase_steps = [s for s in self.steps if s.phase == phase]

        if not phase_steps:
            return {"phase": phase, "steps": 0}

        total_time = sum((s.duration_ms or 0) for s in phase_steps)
        success_count = sum(1 for s in phase_steps if s.status == "success")
        error_count = sum(1 for s in phase_steps if s.status == "error")

        return {
            "phase": phase,
            "steps": len(phase_steps),
            "success": success_count,
            "errors": error_count,
            "total_time_ms": total_time,
        }

    def print_trace(self):
        """Print trace to console"""
        print(self.get_text_trace())
