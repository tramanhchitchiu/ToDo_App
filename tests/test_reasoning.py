#!/usr/bin/env python3
"""Test reasoning trace module"""

import json
from pathlib import Path
from datetime import datetime
from agent.reasoning.tracer import ReasoningTracer


def test_reasoning_trace():
    """Test complete reasoning trace pipeline"""

    print("=" * 80)
    print("TASK MOM 24/7 — REASONING TRACE TEST")
    print("Phase 5: Transparency & Debugging")
    print("=" * 80)
    print()

    # Create tracer
    tracer = ReasoningTracer(log_file="agent_trace.log")
    print("✓ Tracer initialized")
    print()

    # Simulate Phase 1: Extraction
    print("Recording extraction phase steps...")
    tracer.add_step(
        phase="extraction",
        step="Load Jira issue from file",
        input_data={"source": "jira", "file": "data/samples/jira_issue.txt"},
        output_data={"tasks_found": 1, "text_length": 1200},
        duration_ms=45.2,
        notes="Successfully parsed Jira issue format"
    )

    tracer.add_step(
        phase="extraction",
        step="Extract 8 tasks from Jira text",
        input_data={"source": "jira", "format": "text"},
        output_data={"tasks_extracted": 8, "avg_confidence": None},
        duration_ms=523.1,
        notes="Used Claude API for extraction"
    )

    tracer.add_step(
        phase="extraction",
        step="Extract 10 tasks from Jira CSV",
        input_data={"source": "jira", "format": "csv", "rows": 10},
        output_data={"tasks_extracted": 10, "fields_parsed": 9},
        duration_ms=412.5,
        notes="Processed bulk export"
    )

    tracer.add_step(
        phase="extraction",
        step="Extract 23 tasks from meeting minutes",
        input_data={"source": "meeting", "lines": 150},
        output_data={"tasks_extracted": 23, "action_items": 23},
        duration_ms=687.3,
        notes="Meeting notes had clear action items"
    )

    print("✓ Phase 1 recorded (4 steps)")
    print()

    # Simulate Phase 2: Scoring
    print("Recording scoring phase steps...")
    tracer.add_step(
        phase="scoring",
        step="Initialize confidence scorer",
        output_data={"model": "claude-opus-4-7", "factors": 5},
        duration_ms=12.3,
        notes="Ready to score 41 candidates"
    )

    tracer.add_step(
        phase="scoring",
        step="Score 41 candidates",
        input_data={"candidates": 41},
        output_data={
            "avg_confidence": 51.9,
            "highest": 95,
            "lowest": 28,
            "reasoning_generated": 41
        },
        duration_ms=12450.8,
        notes="Batch scoring completed"
    )

    tracer.add_step(
        phase="scoring",
        step="Analyze score distribution",
        output_data={
            "critical": 1,
            "high": 8,
            "medium": 11,
            "low": 20,
            "very_low": 1
        },
        duration_ms=23.4,
        notes="Well-distributed confidence scores"
    )

    print("✓ Phase 2 recorded (3 steps)")
    print()

    # Simulate Phase 3: Grouping
    print("Recording grouping phase steps...")
    tracer.add_step(
        phase="grouping",
        step="Initialize grouper",
        output_data={"candidates": 41},
        duration_ms=8.1,
        notes="Ready to group tasks"
    )

    tracer.add_step(
        phase="grouping",
        step="Analyze task relationships",
        input_data={"candidates": 41, "factors": ["assignee", "deadline", "project"]},
        output_data={"relationships_found": 23},
        duration_ms=156.2,
        notes="Identified task clusters"
    )

    tracer.add_step(
        phase="grouping",
        step="Generate group narratives",
        input_data={"groups": 11},
        output_data={
            "groups_created": 11,
            "narratives_generated": 11,
            "avg_tasks_per_group": 3.7
        },
        duration_ms=8923.4,
        notes="Claude API generated narratives"
    )

    print("✓ Phase 3 recorded (3 steps)")
    print()

    # Simulate Phase 4: Decision Store
    print("Recording decision store phase steps...")
    tracer.add_step(
        phase="decision",
        step="Initialize database",
        output_data={"database": "agent_decisions.db", "tables": 3},
        duration_ms=4.2,
        notes="SQLite database ready"
    )

    tracer.add_step(
        phase="decision",
        step="Save user decisions",
        input_data={"decisions": 6},
        output_data={"saved": 6, "accept": 3, "reject": 2, "edit": 1},
        duration_ms=12.5,
        notes="All decisions persisted"
    )

    tracer.add_step(
        phase="decision",
        step="Record feedback",
        input_data={"feedback_entries": 5},
        output_data={"avg_error": 18.8, "accuracy": 81.2},
        duration_ms=8.3,
        notes="Scoring accuracy calculated"
    )

    print("✓ Phase 4 recorded (3 steps)")
    print()

    # Simulate Phase 5: Learning
    print("Recording learning phase steps...")
    tracer.add_step(
        phase="learning",
        step="Analyze rejection patterns",
        input_data={"decisions": 6},
        output_data={"high_reject_patterns": 1, "improvements_suggested": 3},
        duration_ms=34.1,
        notes="Pattern learning enabled"
    )

    print("✓ Phase 5 recorded (1 step)")
    print()

    # Display trace
    print("=" * 80)
    print("TRACE OUTPUT (TEXT FORMAT)")
    print("=" * 80)
    print()

    tracer.print_trace()
    print()

    # Get JSON trace
    print("=" * 80)
    print("TRACE SUMMARY (JSON)")
    print("=" * 80)
    print()

    json_trace = tracer.get_json_trace()
    summary = json_trace["summary"]

    print("Phase Summary:")
    for phase, stats in summary["by_phase"].items():
        print(f"  {phase}: {stats['total']} steps ({stats['success']} success, {stats['error']} errors)")

    print()
    print("Status Summary:")
    for status, count in summary["by_status"].items():
        print(f"  {status}: {count}")

    print()
    print(f"Total execution time: {summary['total_time_ms']:.1f}ms")
    print()

    # Save traces
    print("=" * 80)
    print("SAVING TRACES")
    print("=" * 80)

    text_path = tracer.save_trace(format="both")
    print(f"✓ Traces saved to:")
    for path in text_path.split(" & "):
        print(f"  • {path}")
    print()

    # Save JSON summary to results
    output_file = Path("tests/results/reasoning_results.json")
    output_data = {
        "timestamp": datetime.now().isoformat(),
        "phase": "Reasoning Trace",
        "total_steps": len(tracer.steps),
        "total_duration_ms": summary["total_time_ms"],
        "by_phase": summary["by_phase"],
        "by_status": summary["by_status"],
        "phases_traced": list(summary["by_phase"].keys()),
    }

    with open(output_file, "w") as f:
        json.dump(output_data, f, indent=2)

    print(f"✓ Results saved to {output_file}")
    print()

    print("=" * 80)
    print("✅ PHASE 5: REASONING TRACE TEST COMPLETE!")
    print("=" * 80)
    print()
    print("Summary:")
    print(f"  • {len(tracer.steps)} trace steps recorded")
    print(f"  • 5 phases traced: extraction, scoring, grouping, decision, learning")
    print(f"  • Total execution time: {summary['total_time_ms']:.1f}ms")
    print(f"  • Transparency enabled for judges and debugging")
    print()


if __name__ == "__main__":
    test_reasoning_trace()
