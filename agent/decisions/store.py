"""Decision persistence and learning: SQLite store for user task decisions"""

import os
import sqlite3
from datetime import datetime
from typing import Optional, List
from dataclasses import dataclass


@dataclass
class Decision:
    """User decision on a task"""
    task_id: str
    action: str  # 'accept' | 'reject' | 'edit'
    reason: Optional[str] = None
    timestamp: Optional[str] = None
    notes: Optional[str] = None


class DecisionStore:
    """SQLite persistence for task decisions and learning patterns"""

    def __init__(self, db_path: Optional[str] = None):
        self.db_path = db_path or os.getenv("DB_PATH", "agent_decisions.db")
        self._init_db()

    def _init_db(self):
        """Initialize database schema"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Create decisions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS decisions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_id TEXT NOT NULL,
                action TEXT NOT NULL,
                reason TEXT,
                notes TEXT,
                timestamp TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Create decision patterns table for learning
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS patterns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pattern TEXT NOT NULL UNIQUE,
                reject_count INTEGER DEFAULT 0,
                accept_count INTEGER DEFAULT 0,
                confidence_adjustment REAL DEFAULT 0.0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Create task feedback table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS task_feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_id TEXT NOT NULL,
                original_confidence INTEGER,
                final_confidence INTEGER,
                action TEXT NOT NULL,
                reason TEXT,
                feedback TEXT,
                timestamp TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        conn.commit()
        conn.close()

    def save_decision(self, decision: Decision) -> int:
        """
        Save user decision on a task.

        Args:
            decision: Decision object with task_id, action, reason

        Returns:
            Decision ID
        """
        if not decision.timestamp:
            decision.timestamp = datetime.now().isoformat()

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO decisions (task_id, action, reason, notes, timestamp)
            VALUES (?, ?, ?, ?, ?)
        """, (decision.task_id, decision.action, decision.reason, decision.notes, decision.timestamp))

        decision_id = cursor.lastrowid
        conn.commit()
        conn.close()

        # Update patterns based on decision
        self._update_patterns(decision)

        return decision_id

    def get_decisions(self, task_id: Optional[str] = None) -> List[Decision]:
        """
        Get decisions from database.

        Args:
            task_id: Filter by task ID (optional)

        Returns:
            List of Decision objects
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        if task_id:
            cursor.execute("""
                SELECT task_id, action, reason, notes, timestamp
                FROM decisions WHERE task_id = ?
                ORDER BY created_at DESC
            """, (task_id,))
        else:
            cursor.execute("""
                SELECT task_id, action, reason, notes, timestamp
                FROM decisions
                ORDER BY created_at DESC
            """)

        rows = cursor.fetchall()
        conn.close()

        return [
            Decision(task_id=row[0], action=row[1], reason=row[2], notes=row[3], timestamp=row[4])
            for row in rows
        ]

    def get_decision_stats(self) -> dict:
        """Get overall decision statistics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("SELECT action, COUNT(*) FROM decisions GROUP BY action")
        stats = {row[0]: row[1] for row in cursor.fetchall()}

        cursor.execute("SELECT COUNT(*) FROM decisions")
        total = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(DISTINCT task_id) FROM decisions")
        unique_tasks = cursor.fetchone()[0]

        conn.close()

        return {
            "total_decisions": total,
            "unique_tasks_decided": unique_tasks,
            "by_action": stats,
            "accept_rate": stats.get("accept", 0) / total if total > 0 else 0,
            "reject_rate": stats.get("reject", 0) / total if total > 0 else 0,
        }

    def _update_patterns(self, decision: Decision):
        """
        Learn patterns from user decisions.
        Track which task characteristics lead to acceptance/rejection.
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Extract simple patterns from task_id and action
        # In real implementation, would analyze title, priority, source, etc.
        pattern_key = f"{decision.action}"

        cursor.execute("""
            INSERT INTO patterns (pattern, reject_count, accept_count)
            VALUES (?, 0, 0)
            ON CONFLICT(pattern) DO NOTHING
        """, (pattern_key,))

        if decision.action == "accept":
            cursor.execute("""
                UPDATE patterns SET accept_count = accept_count + 1
                WHERE pattern = ?
            """, (pattern_key,))
        elif decision.action == "reject":
            cursor.execute("""
                UPDATE patterns SET reject_count = reject_count + 1
                WHERE pattern = ?
            """, (pattern_key,))

        conn.commit()
        conn.close()

    def get_rejection_patterns(self) -> List[dict]:
        """
        Get tasks that are frequently rejected.
        Use to identify scoring improvements needed.

        Returns:
            List of patterns with reject counts
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("""
            SELECT pattern, reject_count, accept_count,
                   ROUND(CAST(reject_count AS FLOAT) / (reject_count + accept_count), 2) as reject_rate
            FROM patterns
            WHERE (reject_count + accept_count) > 0
            ORDER BY reject_rate DESC
            LIMIT 10
        """)

        patterns = [
            {
                "pattern": row[0],
                "rejects": row[1],
                "accepts": row[2],
                "reject_rate": row[3],
            }
            for row in cursor.fetchall()
        ]

        conn.close()
        return patterns

    def record_feedback(self, task_id: str, original_confidence: int, final_confidence: int,
                       action: str, reason: str, feedback: str):
        """
        Record feedback on how well we scored a task.

        Args:
            task_id: Task ID
            original_confidence: Initial score (0-100)
            final_confidence: User's implied score based on action
            action: User's decision (accept/reject/edit)
            reason: Why user made this decision
            feedback: User's comments
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO task_feedback
            (task_id, original_confidence, final_confidence, action, reason, feedback, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (task_id, original_confidence, final_confidence, action, reason, feedback,
              datetime.now().isoformat()))

        conn.commit()
        conn.close()

    def get_scoring_accuracy(self) -> dict:
        """
        Calculate how accurate our confidence scoring is.
        Compare original_confidence vs final_confidence.

        Returns:
            Accuracy metrics
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                COUNT(*) as total,
                AVG(ABS(original_confidence - final_confidence)) as avg_error,
                MAX(ABS(original_confidence - final_confidence)) as max_error,
                MIN(ABS(original_confidence - final_confidence)) as min_error
            FROM task_feedback
        """)

        row = cursor.fetchone()
        conn.close()

        if row[0] == 0:
            return {
                "total_feedback": 0,
                "avg_confidence_error": 0,
                "accuracy": 0
            }

        total = row[0]
        avg_error = row[1] or 0

        return {
            "total_feedback": total,
            "avg_confidence_error": round(avg_error, 1),
            "max_confidence_error": row[2] or 0,
            "min_confidence_error": row[3] or 0,
            "accuracy": round(100 - (avg_error / 100 * 100), 1) if avg_error else 100,
        }

    def get_improvement_suggestions(self) -> List[str]:
        """
        Analyze rejection patterns and suggest scoring improvements.

        Returns:
            List of improvement suggestions
        """
        suggestions = []
        stats = self.get_decision_stats()
        reject_rate = stats.get("reject_rate", 0)

        if reject_rate > 0.3:
            suggestions.append("High rejection rate (>30%) - consider lowering confidence thresholds")

        patterns = self.get_rejection_patterns()
        if patterns and patterns[0].get("reject_rate", 0) > 0.5:
            suggestions.append(f"Pattern '{patterns[0]['pattern']}' has high rejection rate - review scoring logic")

        accuracy = self.get_scoring_accuracy()
        if accuracy.get("avg_confidence_error", 0) > 15:
            suggestions.append(f"High confidence error ({accuracy['avg_confidence_error']}%) - retrain on recent feedback")

        if not suggestions:
            suggestions.append("Scoring confidence is well-calibrated. Continue monitoring patterns.")

        return suggestions

    def clear_all(self):
        """Clear all decisions (for testing). USE WITH CAUTION."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM decisions")
        cursor.execute("DELETE FROM patterns")
        cursor.execute("DELETE FROM task_feedback")
        conn.commit()
        conn.close()
