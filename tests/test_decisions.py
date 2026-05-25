#!/usr/bin/env python3
"""Test decision store and learning patterns"""

import os
import json
from pathlib import Path
from datetime import datetime
from agent.decisions.store import DecisionStore, Decision


def test_decision_store():
    """Test decision store persistence and learning"""

    print("=" * 80)
    print("TASK MOM 24/7 — DECISION STORE TEST")
    print("Phase 4: Persistence & Learning")
    print("=" * 80)
    print()

    # Use temporary test database
    test_db = "test_decisions.db"
    if os.path.exists(test_db):
        os.remove(test_db)

    store = DecisionStore(db_path=test_db)
    print(f"✓ Decision store initialized: {test_db}")
    print()

    # Test 1: Save decisions
    print("=" * 80)
    print("TEST 1: SAVING DECISIONS")
    print("=" * 80)

    decisions = [
        Decision(task_id="c_jira_0", action="accept", reason="Urgent OAuth2 work", notes="High confidence score was correct"),
        Decision(task_id="c_jira_1", action="accept", reason="Blocking release", notes="Well-scored security task"),
        Decision(task_id="c_jira_5", action="reject", reason="Already completed", notes="Score was too high for done work"),
        Decision(task_id="c_meeting_10", action="accept", reason="Clear deadline", notes="Good confidence score"),
        Decision(task_id="c_meeting_15", action="reject", reason="Duplicate of JIRA task", notes="System extracted twice"),
        Decision(task_id="c_meeting_20", action="edit", reason="Low confidence but important", notes="Should be higher priority"),
    ]

    for i, decision in enumerate(decisions, 1):
        decision_id = store.save_decision(decision)
        print(f"[{i}] Saved: {decision.task_id} → {decision.action} (ID: {decision_id})")

    print()

    # Test 2: Get decisions
    print("=" * 80)
    print("TEST 2: RETRIEVING DECISIONS")
    print("=" * 80)

    all_decisions = store.get_decisions()
    print(f"Total decisions saved: {len(all_decisions)}")
    print()

    for decision in all_decisions[:3]:
        print(f"Task: {decision.task_id}")
        print(f"  Action: {decision.action}")
        print(f"  Reason: {decision.reason}")
        print()

    # Test 3: Statistics
    print("=" * 80)
    print("TEST 3: DECISION STATISTICS")
    print("=" * 80)

    stats = store.get_decision_stats()
    print(f"Total decisions: {stats['total_decisions']}")
    print(f"Unique tasks decided: {stats['unique_tasks_decided']}")
    print(f"Accept rate: {stats['accept_rate']:.1%}")
    print(f"Reject rate: {stats['reject_rate']:.1%}")
    print()
    print("By action:")
    for action, count in stats['by_action'].items():
        print(f"  {action}: {count}")
    print()

    # Test 4: Record feedback
    print("=" * 80)
    print("TEST 4: RECORDING FEEDBACK")
    print("=" * 80)

    feedbacks = [
        ("c_jira_0", 95, 95, "accept", "Urgent signals", "Perfect score"),
        ("c_jira_1", 78, 90, "accept", "Was underscored", "Should be higher"),
        ("c_jira_5", 48, 20, "reject", "Task already done", "Score was way too high"),
        ("c_meeting_10", 68, 80, "accept", "Clear deadline", "Deadline should boost more"),
        ("c_meeting_15", 52, 10, "reject", "Duplicate", "Duplicate detection failed"),
    ]

    for i, (task_id, orig, final, action, reason, feedback) in enumerate(feedbacks, 1):
        store.record_feedback(task_id, orig, final, action, reason, feedback)
        print(f"[{i}] {task_id}: {orig} → {final} ({action})")

    print()

    # Test 5: Scoring accuracy
    print("=" * 80)
    print("TEST 5: SCORING ACCURACY ANALYSIS")
    print("=" * 80)

    accuracy = store.get_scoring_accuracy()
    print(f"Total feedback: {accuracy['total_feedback']}")
    print(f"Avg confidence error: {accuracy['avg_confidence_error']} points")
    print(f"Max error: {accuracy['max_confidence_error']} points")
    print(f"Min error: {accuracy['min_confidence_error']} points")
    print(f"Overall accuracy: {accuracy['accuracy']:.1f}%")
    print()

    # Test 6: Rejection patterns
    print("=" * 80)
    print("TEST 6: REJECTION PATTERNS")
    print("=" * 80)

    patterns = store.get_rejection_patterns()
    if patterns:
        for i, pattern in enumerate(patterns[:5], 1):
            print(f"[{i}] Pattern: {pattern['pattern']}")
            print(f"    Accepts: {pattern['accepts']}, Rejects: {pattern['rejects']}")
            print(f"    Reject rate: {pattern['reject_rate']:.1%}")
            print()
    else:
        print("No significant patterns yet")
        print()

    # Test 7: Improvement suggestions
    print("=" * 80)
    print("TEST 7: IMPROVEMENT SUGGESTIONS")
    print("=" * 80)

    suggestions = store.get_improvement_suggestions()
    for i, suggestion in enumerate(suggestions, 1):
        print(f"[{i}] {suggestion}")
    print()

    # Save test results
    print("=" * 80)
    print("SAVING TEST RESULTS")
    print("=" * 80)

    output_file = Path("tests/results/decisions_results.json")
    output_data = {
        "timestamp": datetime.now().isoformat(),
        "phase": "Decision Store & Learning",
        "statistics": stats,
        "accuracy": accuracy,
        "suggestions": suggestions,
        "decisions_saved": len(all_decisions),
        "feedback_recorded": len(feedbacks),
        "rejection_patterns": patterns,
    }

    with open(output_file, "w") as f:
        json.dump(output_data, f, indent=2)

    print(f"✓ Results saved to {output_file}")
    print()

    # Cleanup
    if os.path.exists(test_db):
        os.remove(test_db)
    print(f"✓ Test database cleaned up")
    print()

    print("=" * 80)
    print("✅ PHASE 4: DECISION STORE TEST COMPLETE!")
    print("=" * 80)
    print()
    print("Summary:")
    print(f"  • Saved {len(all_decisions)} decisions to database")
    print(f"  • Recorded {len(feedbacks)} feedback entries")
    print(f"  • Calculated scoring accuracy: {accuracy['accuracy']:.1f}%")
    print(f"  • Generated {len(suggestions)} improvement suggestions")
    print()
    print("Key metrics:")
    print(f"  • Accept rate: {stats['accept_rate']:.1%}")
    print(f"  • Reject rate: {stats['reject_rate']:.1%}")
    print(f"  • Avg confidence error: {accuracy['avg_confidence_error']} points")
    print()


if __name__ == "__main__":
    test_decision_store()
