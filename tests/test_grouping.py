#!/usr/bin/env python3
"""Test task grouping and narrative generation"""

import asyncio
import json
import os
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

from agent.extraction.extractor import TaskExtractor
from agent.scoring.confidence import ConfidenceScorer
from agent.grouping.grouper import TaskGrouper
from agent.connectors.jira_connector import JiraConnector, MeetingConnector
from agent.models import SourceContent

load_dotenv()


async def test_grouping():
    """Test grouping on extracted and scored candidates"""

    print("=" * 80)
    print("TASK MOM 24/7 — THREAD INTELLIGENCE TEST")
    print("Phase 1: Extract → Phase 2: Score → Phase 3: Group")
    print("=" * 80)
    print()

    # Check API key
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        print("❌ ERROR: ANTHROPIC_API_KEY not set in .env")
        return

    print(f"✓ API Key loaded")
    print()

    # Initialize components
    extractor = TaskExtractor(api_key=api_key)
    scorer = ConfidenceScorer(api_key=api_key)
    grouper = TaskGrouper(api_key=api_key)
    jira_connector = JiraConnector(api_key=api_key)
    meeting_connector = MeetingConnector()

    all_candidates = []

    # Phase 1: Extract from all sources
    print("PHASE 1: EXTRACTION")
    print("=" * 80)

    # Jira text format
    print("[1/3] Jira (Text Format)...", end=" ", flush=True)
    try:
        with open("data/samples/jira_issue.txt", "r") as f:
            jira_text_content = f.read()

        jira_text_source = SourceContent(
            source="jira",
            title="CORE-1234: Implement OAuth2 Integration with Google",
            sender="jira-system",
            body=jira_text_content,
        )
        jira_text_candidates = await extractor.extract_tasks(jira_text_source)
        all_candidates.extend(jira_text_candidates)
        print(f"✓ {len(jira_text_candidates)} tasks")
    except Exception as e:
        print(f"❌ Error: {e}")

    # Jira CSV format
    print("[2/3] Jira (CSV Export)...", end=" ", flush=True)
    try:
        jira_csv_sources = await jira_connector.parse_csv_export("data/samples/jira_export.csv")
        jira_csv_candidates = []
        for source in jira_csv_sources:
            candidates = await extractor.extract_tasks(source)
            jira_csv_candidates.extend(candidates)
            all_candidates.extend(candidates)
        print(f"✓ {len(jira_csv_candidates)} tasks")
    except Exception as e:
        print(f"❌ Error: {e}")

    # Meeting minutes
    print("[3/3] Meeting Minutes...", end=" ", flush=True)
    try:
        meeting_source = await meeting_connector.read_text_file("data/samples/meeting_minutes_2.txt")
        meeting_candidates = await extractor.extract_tasks(meeting_source)
        all_candidates.extend(meeting_candidates)
        print(f"✓ {len(meeting_candidates)} tasks")
    except Exception as e:
        print(f"❌ Error: {e}")

    print()
    print(f"Total extracted: {len(all_candidates)} candidates")
    print()

    # Phase 2: Score all candidates
    print("PHASE 2: CONFIDENCE SCORING")
    print("=" * 80)
    print(f"Scoring {len(all_candidates)} candidates...", end=" ", flush=True)

    scored_candidates = []
    for candidate in all_candidates:
        try:
            scored = await scorer.score_task(candidate)
            scored_candidates.append(scored)
        except Exception as e:
            print(f"\n❌ Error scoring {candidate.title}: {e}")

    print(f"✓ {len(scored_candidates)} scored")
    print()

    # Phase 3: Group by context
    print("PHASE 3: THREAD INTELLIGENCE (GROUPING)")
    print("=" * 80)
    print(f"Grouping {len(scored_candidates)} candidates by context...", end=" ", flush=True)

    try:
        groups = await grouper.group_tasks(scored_candidates)
        print(f"✓ {len(groups)} groups created")
        print()
    except Exception as e:
        print(f"❌ Error: {e}")
        return

    # Display grouping results
    print("=" * 80)
    print("GROUPING RESULTS")
    print("=" * 80)
    print()

    for i, group in enumerate(groups, 1):
        print(f"[Group {i}] {group.context_label}")
        print(f"{'─' * 76}")
        print(f"Narrative: {group.narrative_summary}")
        print(f"Tasks ({len(group.candidates)}):")
        for candidate in group.candidates:
            status = "⚠️ INVALIDATED" if candidate.invalidation_flag else "✓"
            print(f"  {status} [{candidate.confidence:2d}] {candidate.title[:65]}")
            if candidate.assignee:
                print(f"      → {candidate.assignee}")
        print()

    # Statistics
    print("=" * 80)
    print("GROUPING STATISTICS")
    print("=" * 80)
    print()
    print(f"Total groups created: {len(groups)}")
    print(f"Tasks per group (avg): {len(scored_candidates) / len(groups):.1f}")
    print()

    # Group size distribution
    group_sizes = {}
    for group in groups:
        size = len(group.candidates)
        if size not in group_sizes:
            group_sizes[size] = 0
        group_sizes[size] += 1

    print("Group size distribution:")
    for size in sorted(group_sizes.keys()):
        count = group_sizes[size]
        bar = "█" * (count * 2)
        print(f"  {size:2d} tasks: {count:2d} groups {bar}")

    print()

    # Invalidation detection
    invalidated = sum(1 for c in scored_candidates if c.invalidation_flag)
    print(f"Invalidated tasks: {invalidated}/{len(scored_candidates)}")

    # High confidence tasks per group
    print()
    print("High confidence tasks (80+) per group:")
    for i, group in enumerate(groups, 1):
        high_conf = [c for c in group.candidates if c.confidence >= 80]
        if high_conf:
            print(f"  Group {i}: {len(high_conf)} tasks (90-100)")

    # Save results
    print()
    print("=" * 80)
    print("SAVING RESULTS")
    print("=" * 80)

    output_file = Path("tests/results/grouping_results.json")
    output_data = {
        "timestamp": datetime.now().isoformat(),
        "phase": "Extraction + Scoring + Grouping",
        "total_candidates": len(scored_candidates),
        "total_groups": len(groups),
        "groups": [
            {
                "id": g.id,
                "context_label": g.context_label,
                "narrative_summary": g.narrative_summary,
                "task_count": len(g.candidates),
                "candidates": [
                    {
                        "id": c.id,
                        "title": c.title,
                        "source": c.source,
                        "priority": c.priority,
                        "confidence": c.confidence,
                        "reason": c.reason,
                        "deadline": c.deadline,
                        "assignee": c.assignee,
                        "invalidated": c.invalidation_flag,
                    }
                    for c in g.candidates
                ]
            }
            for g in groups
        ],
        "statistics": {
            "total_groups": len(groups),
            "avg_tasks_per_group": len(scored_candidates) / len(groups) if groups else 0,
            "invalidated_tasks": invalidated,
            "group_distribution": group_sizes
        }
    }

    with open(output_file, "w") as f:
        json.dump(output_data, f, indent=2)

    print(f"✓ Results saved to {output_file}")
    print()
    print("=" * 80)
    print("✅ PHASE 3: THREAD INTELLIGENCE COMPLETE!")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(test_grouping())
