#!/usr/bin/env python3
"""Test extraction on focused sources: Jira (text) + Jira (CSV) + Meeting minutes"""

import asyncio
import json
import os
from pathlib import Path
from dotenv import load_dotenv

from agent.extraction.extractor import TaskExtractor
from agent.connectors.jira_connector import JiraConnector, MeetingConnector

# Load environment
load_dotenv()


async def test_focused_sources():
    """Test extraction on 3 focused sources"""

    print("=" * 80)
    print("TASK MOM 24/7 — FOCUSED SOURCES TEST")
    print("Sources: Jira (text) + Jira (CSV) + Meeting minutes")
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
    jira_connector = JiraConnector(api_key=api_key)
    meeting_connector = MeetingConnector()

    all_candidates = []
    results = {}

    # Test 1: Jira text format (single issue)
    print("[1/3] Source: Jira (Text Format)")
    print("      File: data/samples/jira_issue.txt")
    print("      Extracting...", end=" ", flush=True)

    try:
        with open("data/samples/jira_issue.txt", "r") as f:
            jira_text_content = f.read()

        from agent.models import SourceContent
        content = SourceContent(
            source="jira",
            title="CORE-1234: Implement OAuth2 Integration with Google",
            sender="jira-system",
            body=jira_text_content,
        )

        candidates = await extractor.extract_tasks(content)
        all_candidates.extend(candidates)
        results["Jira Text (Single Issue)"] = candidates

        print(f"✓ {len(candidates)} tasks")
        for i, c in enumerate(candidates, 1):
            deadline_str = f" (due: {c.deadline})" if c.deadline else ""
            assignee_str = f" → {c.assignee}" if c.assignee else ""
            print(f"  {i}. {c.title} [{c.priority.upper()}]{deadline_str}{assignee_str}")

    except Exception as e:
        print(f"❌ Error: {e}")

    print()

    # Test 2: Jira CSV export (multiple issues)
    print("[2/3] Source: Jira (CSV Export)")
    print("      File: data/samples/jira_export.csv")
    print("      Extracting...", end=" ", flush=True)

    try:
        csv_contents = await jira_connector.parse_csv_export("data/samples/jira_export.csv")

        csv_candidates = []
        for csv_content in csv_contents:
            candidates = await extractor.extract_tasks(csv_content)
            csv_candidates.extend(candidates)
            all_candidates.extend(candidates)

        results["Jira CSV (Multiple Issues)"] = csv_candidates

        print(f"✓ {len(csv_candidates)} tasks")
        for i, c in enumerate(csv_candidates, 1):
            deadline_str = f" (due: {c.deadline})" if c.deadline else ""
            assignee_str = f" → {c.assignee}" if c.assignee else ""
            print(f"  {i}. {c.title} [{c.priority.upper()}]{deadline_str}{assignee_str}")

    except Exception as e:
        print(f"❌ Error: {e}")

    print()

    # Test 3: Meeting minutes
    print("[3/3] Source: Meeting Minutes (Text)")
    print("      File: data/samples/meeting_minutes_2.txt")
    print("      Extracting...", end=" ", flush=True)

    try:
        meeting_content = await meeting_connector.read_text_file("data/samples/meeting_minutes_2.txt")
        candidates = await extractor.extract_tasks(meeting_content)
        all_candidates.extend(candidates)
        results["Meeting Minutes"] = candidates

        print(f"✓ {len(candidates)} tasks")
        for i, c in enumerate(candidates, 1):
            deadline_str = f" (due: {c.deadline})" if c.deadline else ""
            assignee_str = f" → {c.assignee}" if c.assignee else ""
            print(f"  {i}. {c.title} [{c.priority.upper()}]{deadline_str}{assignee_str}")

    except Exception as e:
        print(f"❌ Error: {e}")

    print()

    # Summary
    print("=" * 80)
    print("FOCUSED SOURCES TEST SUMMARY")
    print("=" * 80)
    print()
    print(f"Total tasks extracted: {len(all_candidates)}")
    print()

    # By source
    by_source = {}
    for c in all_candidates:
        if c.source not in by_source:
            by_source[c.source] = []
        by_source[c.source].append(c)

    print("By source:")
    print(f"  JIRA: {len(by_source.get('jira', []))} tasks")
    print(f"  MEETING: {len(by_source.get('meeting', []))} tasks")
    print()

    # By priority
    by_priority = {}
    for c in all_candidates:
        if c.priority not in by_priority:
            by_priority[c.priority] = []
        by_priority[c.priority].append(c)

    print("By priority:")
    for priority in ["urgent", "normal", "low"]:
        candidates = by_priority.get(priority, [])
        if candidates:
            print(f"  {priority.upper()}: {len(candidates)} tasks")

    # Assignments
    with_assignee = sum(1 for c in all_candidates if c.assignee)
    print(f"\nAssignee info: {with_assignee}/{len(all_candidates)} tasks have assignees")

    # Deadlines
    with_deadline = sum(1 for c in all_candidates if c.deadline)
    print(f"Deadline info: {with_deadline}/{len(all_candidates)} tasks have deadlines")

    # Save results
    output_file = Path("tests/results/focused_sources_results.json")
    output_data = {
        "test_date": "2026-05-25",
        "total_candidates": len(all_candidates),
        "sources_tested": ["Jira (Text)", "Jira (CSV)", "Meeting Minutes"],
        "by_source": {src: len(cands) for src, cands in by_source.items()},
        "by_priority": {pri: len(cands) for pri, cands in by_priority.items()},
        "candidates": [
            {
                "id": c.id,
                "title": c.title,
                "source": c.source,
                "priority": c.priority,
                "deadline": c.deadline,
                "assignee": c.assignee,
                "description": c.description,
            }
            for c in all_candidates
        ],
    }

    with open(output_file, "w") as f:
        json.dump(output_data, f, indent=2)

    print(f"\n✓ Results saved to {output_file}")

    # Assessment
    print()
    print("=" * 80)
    print("EXTRACTION QUALITY ASSESSMENT")
    print("=" * 80)

    if len(all_candidates) >= 20:
        print("✅ Extraction volume: EXCELLENT (20+ tasks)")
    elif len(all_candidates) >= 10:
        print("✅ Extraction volume: GOOD (10-19 tasks)")
    else:
        print("⚠️ Extraction volume: LOW (<10 tasks)")

    # Source coverage
    if len(by_source.get('jira', [])) > 0 and len(by_source.get('meeting', [])) > 0:
        print("✅ Source coverage: Both Jira and Meeting minutes working")
    else:
        print("⚠️ Source coverage: Missing sources")

    # Priority detection
    if by_priority.get('urgent', []):
        print(f"✅ Priority detection: Working ({len(by_priority['urgent'])} urgent tasks)")
    else:
        print("⚠️ Priority detection: No urgent tasks marked")

    print()
    print("=" * 80)

    if len(all_candidates) >= 10 and by_source.get('jira') and by_source.get('meeting'):
        print("✅ FOCUSED SOURCES TEST PASSED!")
        print("Ready for Phase 2 (Confidence Scoring)")
    else:
        print("⚠️ FOCUSED SOURCES TEST: INCOMPLETE")

    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(test_focused_sources())
