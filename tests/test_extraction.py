#!/usr/bin/env python3
"""Test extraction engine with mock data"""

import asyncio
import os
import json
from pathlib import Path

# Load env vars
from dotenv import load_dotenv
load_dotenv()

from agent.extraction.extractor import TaskExtractor
from data.mock_sources import ALL_MOCK_SOURCES


async def main():
    """Test extraction on all mock sources"""

    print("=" * 70)
    print("TASK MOM 24/7 — EXTRACTION ENGINE TEST")
    print("=" * 70)

    # Check API key
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        print("❌ ERROR: ANTHROPIC_API_KEY not set in .env")
        print("   Copy .env.example to .env and add your API key")
        return

    print(f"✓ API Key loaded (first 20 chars: {api_key[:20]}...)")
    print()

    # Initialize extractor
    extractor = TaskExtractor(api_key=api_key)

    # Extract from each mock source
    all_candidates = []
    results = {}

    for i, source in enumerate(ALL_MOCK_SOURCES, 1):
        print(f"\n[{i}/{len(ALL_MOCK_SOURCES)}] Extracting from {source.source.upper()}")
        print(f"    Title: {source.title}")
        print(f"    From: {source.sender or 'system'}")
        print("    Processing...", end=" ", flush=True)

        try:
            candidates = await extractor.extract_tasks(source)
            all_candidates.extend(candidates)
            results[source.title] = candidates

            print(f"✓ {len(candidates)} tasks extracted")
            for c in candidates:
                print(f"      • {c.title} [{c.priority}]")

        except Exception as e:
            print(f"❌ Error: {e}")

    # Summary
    print("\n" + "=" * 70)
    print("EXTRACTION SUMMARY")
    print("=" * 70)
    print(f"Total sources processed: {len(ALL_MOCK_SOURCES)}")
    print(f"Total candidates extracted: {len(all_candidates)}")
    print()

    # Group by source
    by_source = {}
    for c in all_candidates:
        if c.source not in by_source:
            by_source[c.source] = []
        by_source[c.source].append(c)

    print("By source:")
    for source, candidates in sorted(by_source.items()):
        print(f"  {source.upper()}: {len(candidates)} tasks")

    # Group by priority
    by_priority = {}
    for c in all_candidates:
        if c.priority not in by_priority:
            by_priority[c.priority] = []
        by_priority[c.priority].append(c)

    print("\nBy priority:")
    for priority in ["urgent", "normal", "low"]:
        count = len(by_priority.get(priority, []))
        print(f"  {priority.upper()}: {count} tasks")

    # Save results for next phase
    output_file = Path("tests/results/extraction_results.json")
    output_data = {
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
            }
            for c in all_candidates
        ]
    }

    with open(output_file, "w") as f:
        json.dump(output_data, f, indent=2)

    print(f"\n✓ Results saved to {output_file}")
    print("\n✅ EXTRACTION PHASE 1 COMPLETE!")
    print("\nNext: Run Phase 2 (Confidence Scoring)")


if __name__ == "__main__":
    asyncio.run(main())
