#!/usr/bin/env python3
"""Test complete agent pipeline"""

import asyncio
import json
import os
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

from agent.pipeline import AgentPipeline

load_dotenv()


async def test_pipeline():
    """Test the complete agent pipeline"""

    print("=" * 80)
    print("TASK MOM 24/7 — MAIN PIPELINE TEST")
    print("Phase 6: Orchestration (Extract → Score → Group → Store → Trace)")
    print("=" * 80)
    print()

    # Check API key
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        print("❌ ERROR: ANTHROPIC_API_KEY not set in .env")
        return

    print(f"✓ API Key loaded")
    print()

    # Initialize pipeline
    print("Initializing pipeline...", end=" ", flush=True)
    try:
        pipeline = AgentPipeline(api_key=api_key, trace_enabled=True)
        print("✓")
    except Exception as e:
        print(f"❌ Error: {e}")
        return

    print()

    # Run pipeline
    print("=" * 80)
    print("RUNNING COMPLETE PIPELINE")
    print("=" * 80)
    print()

    try:
        print("Starting extraction → scoring → grouping → storage → tracing...")
        print()

        result = await pipeline.run()

        print()
        print("=" * 80)
        print("PIPELINE RESULTS")
        print("=" * 80)
        print()

        print(f"Total candidates extracted: {result.total_candidates}")
        print(f"Groups created: {len(result.groups)}")
        print()

        # Show groups
        print("Task Groups:")
        print("─" * 80)
        for i, group in enumerate(result.groups[:5], 1):  # Show first 5
            print(f"[{i}] {group.context_label}")
            print(f"    Tasks: {len(group.candidates)}")
            print(f"    Summary: {group.narrative_summary[:100]}...")
            print()

        if len(result.groups) > 5:
            print(f"... and {len(result.groups) - 5} more groups")
            print()

        # Test decision making
        print("=" * 80)
        print("TESTING DECISION MAKING")
        print("=" * 80)
        print()

        if result.groups and result.groups[0].candidates:
            first_task = result.groups[0].candidates[0]

            print(f"Task: {first_task.title}")
            print(f"Confidence: {first_task.confidence}/100")
            print()

            print("Recording user decisions...")
            print()

            # Accept first task
            decision_id = pipeline.accept_decision(
                task_id=first_task.id,
                reason="Clear deadline and high priority",
                notes="Confirmed with stakeholder"
            )
            print(f"[1] Accepted: {first_task.title}")
            print(f"    Decision ID: {decision_id}")
            print()

            # Reject second task if exists
            if len(result.groups[0].candidates) > 1:
                second_task = result.groups[0].candidates[1]
                decision_id = pipeline.reject_decision(
                    task_id=second_task.id,
                    reason="Already completed",
                    notes="Was finished last week"
                )
                print(f"[2] Rejected: {second_task.title}")
                print(f"    Decision ID: {decision_id}")
                print()

            # Get stats
            print("Decision Statistics:")
            stats = pipeline.get_decision_stats()
            print(f"  Total decisions: {stats['total_decisions']}")
            print(f"  By action: {stats['by_action']}")
            print()

            # Get suggestions
            print("Improvement Suggestions:")
            suggestions = pipeline.get_improvement_suggestions()
            for i, suggestion in enumerate(suggestions, 1):
                print(f"  [{i}] {suggestion}")
            print()

        # Display trace
        print("=" * 80)
        print("REASONING TRACE (first 50 lines)")
        print("=" * 80)
        print()

        trace_lines = result.trace.split("\n")[:50]
        for line in trace_lines:
            print(line)

        print()
        print("... (trace continues)")
        print()

        # Save results
        print("=" * 80)
        print("SAVING RESULTS")
        print("=" * 80)
        print()

        output_file = Path("tests/results/pipeline_results.json")
        output_data = {
            "timestamp": datetime.now().isoformat(),
            "phase": "Main Pipeline",
            "total_candidates": result.total_candidates,
            "groups_created": len(result.groups),
            "groups": [
                {
                    "id": g.id,
                    "context_label": g.context_label,
                    "task_count": len(g.candidates),
                }
                for g in result.groups
            ],
            "pipeline_status": "success",
        }

        with open(output_file, "w") as f:
            json.dump(output_data, f, indent=2)

        print(f"✓ Results saved to {output_file}")
        print()

        # Save traces
        print("Saving reasoning traces...")
        trace_files = pipeline.save_trace(format="both")
        print(f"✓ Traces saved to: {trace_files}")
        print()

    except Exception as e:
        print(f"❌ Pipeline error: {e}")
        import traceback
        traceback.print_exc()
        return

    print("=" * 80)
    print("✅ PHASE 6: MAIN PIPELINE TEST COMPLETE!")
    print("=" * 80)
    print()
    print("Summary:")
    print(f"  • Pipeline executed successfully")
    print(f"  • {result.total_candidates} candidates processed")
    print(f"  • {len(result.groups)} task groups created")
    print(f"  • Decision store ready for user actions")
    print(f"  • Reasoning trace captured (2 formats)")
    print()


if __name__ == "__main__":
    asyncio.run(test_pipeline())
