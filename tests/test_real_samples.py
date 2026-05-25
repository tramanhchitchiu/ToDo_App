#!/usr/bin/env python3
"""Test extraction on real-world sample data files"""

import asyncio
import json
import os
from pathlib import Path
from dotenv import load_dotenv

from agent.extraction.extractor import TaskExtractor
from agent.models import SourceContent

# Load environment
load_dotenv()


async def test_real_samples():
    """Test extraction on real sample files"""

    print("=" * 80)
    print("TASK MOM 24/7 — REAL SAMPLES TEST")
    print("=" * 80)
    print()

    # Check API key
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        print("❌ ERROR: ANTHROPIC_API_KEY not set in .env")
        return

    print(f"✓ API Key loaded")
    print()

    # Define sample files with metadata
    samples = [
        {
            "path": "data/samples/email_1.txt",
            "source": "email",
            "title": "URGENT: API Review Needed Before Release",
            "sender": "project-lead@company.com",
        },
        {
            "path": "data/samples/email_2.txt",
            "source": "email",
            "title": "Status Update Needed",
            "sender": "client@external-corp.com",
        },
        {
            "path": "data/samples/meeting_notes.txt",
            "source": "meeting",
            "title": "Sprint Planning Meeting",
            "sender": "engineering-team",
        },
        {
            "path": "data/samples/jira_issue.txt",
            "source": "jira",
            "title": "CORE-1234: Implement OAuth2 Integration with Google",
            "sender": "jira-system",
        },
        {
            "path": "data/samples/slack_messages.txt",
            "source": "slack",
            "title": "General Channel Messages",
            "sender": "team",
        },
    ]

    # Initialize extractor
    extractor = TaskExtractor(api_key=api_key)
    all_candidates = []
    results = {}

    # Test each sample
    for i, sample_info in enumerate(samples, 1):
        sample_path = Path(sample_info["path"])

        if not sample_path.exists():
            print(f"❌ [{i}/{len(samples)}] File not found: {sample_path}")
            continue

        print(f"[{i}/{len(samples)}] Testing {sample_info['source'].upper()}")
        print(f"  Title: {sample_info['title']}")
        print(f"  File: {sample_path}")
        print(f"  Size: {sample_path.stat().st_size} bytes")
        print("  Extracting...", end=" ", flush=True)

        try:
            # Read file
            with open(sample_path, "r") as f:
                content_text = f.read()

            # Create SourceContent object
            content = SourceContent(
                source=sample_info["source"],
                title=sample_info["title"],
                sender=sample_info["sender"],
                body=content_text,
            )

            # Extract tasks
            candidates = await extractor.extract_tasks(content)
            all_candidates.extend(candidates)
            results[sample_info["title"]] = candidates

            print(f"✓ {len(candidates)} tasks")

            # Display extracted tasks
            if candidates:
                for j, c in enumerate(candidates, 1):
                    deadline_str = f" (due: {c.deadline})" if c.deadline else ""
                    assignee_str = f" → {c.assignee}" if c.assignee else ""
                    print(f"    {j}. {c.title} [{c.priority.upper()}]{deadline_str}{assignee_str}")
            else:
                print("    (no tasks extracted)")
            print()

        except Exception as e:
            print(f"❌ Error: {e}")
            print()

    # Summary
    print("=" * 80)
    print("REAL SAMPLES TEST SUMMARY")
    print("=" * 80)
    print()
    print(f"Files tested: {len(samples)}")
    print(f"Total candidates extracted: {len(all_candidates)}")
    print()

    # By source
    by_source = {}
    for c in all_candidates:
        if c.source not in by_source:
            by_source[c.source] = []
        by_source[c.source].append(c)

    print("By source:")
    for source in ["email", "meeting", "jira", "slack"]:
        candidates = by_source.get(source, [])
        print(f"  {source.upper()}: {len(candidates)} tasks")

    # By priority
    by_priority = {}
    for c in all_candidates:
        if c.priority not in by_priority:
            by_priority[c.priority] = []
        by_priority[c.priority].append(c)

    print("\nBy priority:")
    for priority in ["urgent", "normal", "low"]:
        candidates = by_priority.get(priority, [])
        print(f"  {priority.upper()}: {len(candidates)} tasks")

    # Save detailed results
    output_file = Path("real_samples_results.json")
    output_data = {
        "test_date": "2026-05-25",
        "total_candidates": len(all_candidates),
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
        "detailed_results": {
            title: [
                {
                    "id": c.id,
                    "title": c.title,
                    "source": c.source,
                    "priority": c.priority,
                    "deadline": c.deadline,
                    "assignee": c.assignee,
                }
                for c in candidates
            ]
            for title, candidates in results.items()
        }
    }

    with open(output_file, "w") as f:
        json.dump(output_data, f, indent=2)

    print(f"\n✓ Detailed results saved to {output_file}")

    # Assessment
    print()
    print("=" * 80)
    print("EXTRACTION QUALITY ASSESSMENT")
    print("=" * 80)

    if len(all_candidates) >= 15:
        print("✅ Extraction volume: GOOD (15+ tasks extracted)")
    elif len(all_candidates) >= 8:
        print("✓ Extraction volume: ACCEPTABLE (8-14 tasks)")
    else:
        print("⚠️ Extraction volume: LOW (<8 tasks)")

    # Check for specific expected tasks
    expected_tasks = [
        "review",
        "api",
        "oauth",
        "test",
        "documentation",
        "deploy",
    ]

    extracted_text = " ".join([c.title.lower() for c in all_candidates])
    found_count = sum(1 for task in expected_tasks if task in extracted_text)

    print(f"✅ Task relevance: {found_count}/{len(expected_tasks)} expected task types found")

    # Priority distribution
    if by_priority.get("urgent", []):
        print(f"✅ Priority detection: Working ({len(by_priority['urgent'])} urgent tasks found)")
    else:
        print("⚠️ Priority detection: No urgent tasks marked")

    # Assignee extraction
    with_assignee = sum(1 for c in all_candidates if c.assignee)
    print(f"ℹ️ Assignee extraction: {with_assignee}/{len(all_candidates)} tasks have assignees")

    # Deadline extraction
    with_deadline = sum(1 for c in all_candidates if c.deadline)
    print(f"ℹ️ Deadline extraction: {with_deadline}/{len(all_candidates)} tasks have deadlines")

    print()
    print("=" * 80)

    if len(all_candidates) >= 15 and found_count >= 4:
        print("✅ REAL SAMPLES TEST PASSED!")
        print("Extraction engine working correctly on real-world data.")
    else:
        print("⚠️ REAL SAMPLES TEST: PARTIAL")
        print("Extraction is working but may need prompt refinement.")

    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(test_real_samples())
