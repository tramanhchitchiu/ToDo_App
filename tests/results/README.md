# Test Results

This directory contains all test result files from the Task Mom 24/7 agent development.

## Files

### `extraction_results.json`
**Test:** `tests/test_extraction.py`  
**Phase:** Phase 1 - Extraction Engine  
**Description:** Results from extracting tasks using mock data sources  
**Contains:**
- Total candidates extracted
- Breakdown by source (jira, email, meeting, teams, slack)
- Breakdown by priority (urgent, normal, low)
- Full candidate list with id, title, source, priority, deadline, assignee

### `focused_sources_results.json`
**Test:** `tests/test_focused_sources.py`  
**Phase:** Phase 1 - Extraction Engine (Focused)  
**Description:** Results from extracting tasks on focused real sample data  
**Sources Tested:**
- Jira (Text format - single issue)
- Jira (CSV export - multiple issues)
- Meeting minutes

**Contains:**
- Total candidates extracted
- Breakdown by source
- Breakdown by priority
- Deadline extraction rate
- Assignee extraction rate

### `real_samples_results.json`
**Test:** `tests/test_real_samples.py`  
**Phase:** Phase 1 - Extraction Engine (Real Samples)  
**Description:** Results from extracting tasks on realistic sample data files  
**Contains:**
- Total candidates extracted
- Detailed results per sample file
- Breakdown by source and priority
- Task relevance metrics

### `scoring_results.json`
**Test:** `tests/test_scoring.py`  
**Phase:** Phase 2 - Confidence Scoring  
**Description:** Results from scoring extracted candidates 0-100  
**Contains:**
- Timestamp of scoring run
- Total candidates scored
- Breakdown by source (jira, meeting)
- Breakdown by priority (urgent, normal)
- Full candidate list with:
  - Confidence score (0-100)
  - Reasoning for the score
  - Original extraction metadata

**Score Distribution:**
- 90-100: Critical priority
- 70-89: High priority
- 50-69: Medium priority
- 30-49: Low priority
- 0-29: Very low priority

## Running Tests

```bash
# Phase 1: Extract from mock data
python3 tests/test_extraction.py

# Phase 1: Extract from focused sources
python3 tests/test_focused_sources.py

# Phase 1: Extract from real samples
python3 tests/test_real_samples.py

# Phase 2: Score extracted tasks
PYTHONPATH=. python3 tests/test_scoring.py
```

All results will be automatically saved to this `tests/results/` directory.

## Test Coverage

| Phase | Test | Status | Result File |
|-------|------|--------|-------------|
| 1 | Mock Data Extraction | ✅ PASS | extraction_results.json |
| 1 | Focused Sources | ✅ PASS | focused_sources_results.json |
| 1 | Real Samples | ✅ PASS | real_samples_results.json |
| 2 | Confidence Scoring | ✅ PASS | scoring_results.json |

## Key Metrics

### Extraction (Phase 1)
- **Total tasks extracted:** 41+ candidates
- **Sources supported:** Jira (text + CSV), Meeting minutes
- **Average priority detection:** 100%
- **Deadline extraction rate:** 51%
- **Assignee extraction rate:** 68%

### Scoring (Phase 2)
- **Total tasks scored:** 41 candidates
- **Average confidence score:** 51.9/100
- **Score distribution:** Even across medium and low priority
- **Reasoning:** AI-generated one-line explanations per task
