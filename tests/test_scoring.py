#!/usr/bin/env python3
"""Test confidence scoring on extracted candidates"""

import asyncio
import json
import os
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

from agent.extraction.extractor import TaskExtractor
from agent.scoring.confidence import ConfidenceScorer
from agent.connectors.jira_connector import JiraConnector, MeetingConnector

load_dotenv()


async def test_scoring():
    """Test scoring on extracted candidates"""

    print("=" * 80)
    print("TASK MOM 24/7 — CONFIDENCE SCORING TEST")
    print("Phase 1: Extract → Phase 2: Score")
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
    jira_connector = JiraConnector(api_key=api_key)
    meeting_connector = MeetingConnector()

    all_candidates = []
    all_scored = []

    # Test 1: Jira text format
    print("[1/3] Source: Jira (Text Format)")
    print("      File: data/samples/jira_issue.txt")
    print("      Extracting...", end=" ", flush=True)

    try:
        with open("data/samples/jira_issue.txt", "r") as f:
            jira_text_content = f.read()

        from agent.models import SourceContent
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

    # Test 2: Jira CSV format
    print("[2/3] Source: Jira (CSV Export)")
    print("      File: data/samples/jira_export.csv")
    print("      Extracting...", end=" ", flush=True)

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

    # Test 3: Meeting minutes
    print("[3/3] Source: Meeting Minutes")
    print("      File: data/samples/meeting_minutes_2.txt")
    print("      Extracting...", end=" ", flush=True)

    try:
        meeting_source = await meeting_connector.read_text_file("data/samples/meeting_minutes_2.txt")
        meeting_candidates = await extractor.extract_tasks(meeting_source)
        all_candidates.extend(meeting_candidates)
        print(f"✓ {len(meeting_candidates)} tasks")

    except Exception as e:
        print(f"❌ Error: {e}")

    print()
    print("=" * 80)
    print(f"EXTRACTION COMPLETE: {len(all_candidates)} candidates extracted")
    print("=" * 80)
    print()

    # Now score all candidates
    print("SCORING PHASE")
    print("=" * 80)
    print(f"Scoring {len(all_candidates)} candidates...")
    print()

    for i, candidate in enumerate(all_candidates, 1):
        print(f"[{i}/{len(all_candidates)}] {candidate.title[:60]}")
        print(f"    Source: {candidate.source} | Priority: {candidate.priority} | Deadline: {candidate.deadline or 'None'}")
        print(f"    Scoring...", end=" ", flush=True)

        try:
            scored = await scorer.score_task(candidate)
            all_scored.append(scored)
            print(f"✓ Score: {scored.confidence}/100")
            print(f"    Reason: {scored.reason}")
        except Exception as e:
            print(f"❌ Error: {e}")

    print()
    print("=" * 80)
    print("SCORING SUMMARY")
    print("=" * 80)

    # Statistics
    if all_scored:
        scores = [c.confidence for c in all_scored]
        print(f"Total scored: {len(all_scored)}")
        print(f"Average score: {sum(scores) / len(scores):.1f}/100")
        print(f"Highest: {max(scores)}/100")
        print(f"Lowest: {min(scores)}/100")
        print()

        # Distribution
        ranges = {
            "90-100 (Critical)": len([s for s in scores if 90 <= s <= 100]),
            "70-89 (High)": len([s for s in scores if 70 <= s < 90]),
            "50-69 (Medium)": len([s for s in scores if 50 <= s < 70]),
            "30-49 (Low)": len([s for s in scores if 30 <= s < 50]),
            "0-29 (Very Low)": len([s for s in scores if s < 30]),
        }

        print("Distribution:")
        for range_label, count in ranges.items():
            bar = "█" * (count * 2)
            print(f"  {range_label}: {count:2d} {bar}")
        print()

        # Top 5 highest confidence
        print("Top 5 Highest Confidence:")
        sorted_tasks = sorted(all_scored, key=lambda x: x.confidence, reverse=True)
        for i, task in enumerate(sorted_tasks[:5], 1):
            print(f"  {i}. [{task.confidence}] {task.title[:60]}")
            print(f"     {task.reason}")
        print()

        # Top 5 lowest confidence
        print("Top 5 Lowest Confidence:")
        for i, task in enumerate(sorted_tasks[-5:], 1):
            print(f"  {i}. [{task.confidence}] {task.title[:60]}")
            print(f"     {task.reason}")

    # Save results
    print()
    print("=" * 80)
    print("SAVING RESULTS")
    print("=" * 80)

    output_data = {
        "timestamp": datetime.now().isoformat(),
        "phase": "Extraction + Scoring",
        "total_candidates": len(all_scored),
        "by_source": {},
        "by_priority": {},
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
                "description": c.description,
            }
            for c in all_scored
        ]
    }

    # Aggregate by source
    for candidate in all_scored:
        if candidate.source not in output_data["by_source"]:
            output_data["by_source"][candidate.source] = 0
        output_data["by_source"][candidate.source] += 1

    # Aggregate by priority
    for candidate in all_scored:
        if candidate.priority not in output_data["by_priority"]:
            output_data["by_priority"][candidate.priority] = 0
        output_data["by_priority"][candidate.priority] += 1

    # Write to file
    output_file = Path("tests/results/scoring_results.json")
    with open(output_file, "w") as f:
        json.dump(output_data, f, indent=2)

    print(f"✓ Results saved to {output_file}")
    print()
    print("=" * 80)
    print("✅ PHASE 2: CONFIDENCE SCORING COMPLETE!")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(test_scoring())
