"""SQLite storage backend for AZ-OS."""
import sqlite3
from pathlib import Path
from typing import Optional, List, Dict, Any
from datetime import datetime


class Database:
    """SQLite database for task management."""

    def __init__(self, config=None):
        """Initialize database."""
        self.db_path = Path.home() / '.az-os' / 'db' / 'tasks.db'
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.config = config
        self._init_db()

    def _init_db(self):
        """Initialize database schema."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('PRAGMA foreign_keys = ON')

            conn.execute('''
                CREATE TABLE IF NOT EXISTS tasks (
                    id TEXT PRIMARY KEY,
                    command TEXT NOT NULL,
                    status TEXT NOT NULL,
                    priority TEXT NOT NULL,
                    model TEXT,
                    cost REAL DEFAULT 0.0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    completed_at TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            conn.execute('''
                CREATE TABLE IF NOT EXISTS task_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    task_id TEXT NOT NULL,
                    log_level TEXT NOT NULL,
                    message TEXT NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
                )
            ''')

            conn.execute('''
                CREATE TABLE IF NOT EXISTS cost_tracking (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    task_id TEXT NOT NULL,
                    provider TEXT NOT NULL,
                    model TEXT NOT NULL,
                    tokens_used INTEGER,
                    cost REAL NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
                )
            ''')

            conn.execute('''
                CREATE TABLE IF NOT EXISTS task_state (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    task_id TEXT NOT NULL,
                    state_name TEXT NOT NULL,
                    state_data TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
                )
            ''')

            conn.execute('''
                CREATE TABLE IF NOT EXISTS tool_usage (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    task_id TEXT NOT NULL,
                    tool_name TEXT NOT NULL,
                    execution_time REAL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
                )
            ''')

            # Create indexes
            conn.execute('CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)')
            conn.execute('CREATE INDEX IF NOT EXISTS idx_tasks_created ON tasks(created_at)')
            conn.execute('CREATE INDEX IF NOT EXISTS idx_logs_task ON task_logs(task_id)')
            conn.execute('CREATE INDEX IF NOT EXISTS idx_cost_task ON cost_tracking(task_id)')

            conn.commit()

    def create_task(self, task_id: str, command: str, status: str = 'pending',
                   priority: str = 'medium', model: Optional[str] = None) -> Dict:
        """Create a new task."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT INTO tasks (id, command, status, priority, model, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            ''', (task_id, command, status, priority, model))
            conn.commit()
        return {'id': task_id, 'command': command, 'status': status}

    def get_task(self, task_id: str) -> Optional[Dict]:
        """Get a task by ID."""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute('SELECT * FROM tasks WHERE id = ?', (task_id,))
            row = cursor.fetchone()
            return dict(row) if row else None

    def list_tasks(self, status: Optional[str] = None, limit: int = 20) -> List[Dict]:
        """List tasks with optional filtering."""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            if status:
                cursor = conn.execute(
                    'SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC LIMIT ?',
                    (status, limit)
                )
            else:
                cursor = conn.execute(
                    'SELECT * FROM tasks ORDER BY created_at DESC LIMIT ?',
                    (limit,)
                )
            return [dict(row) for row in cursor.fetchall()]

    def update_task_status(self, task_id: str, status: str) -> bool:
        """Update task status."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                'UPDATE tasks SET status = ?, updated_at = datetime("now") WHERE id = ?',
                (status, task_id)
            )
            conn.commit()
            return cursor.rowcount > 0

    def add_log(self, task_id: str, level: str, message: str) -> int:
        """Add a log entry."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                'INSERT INTO task_logs (task_id, log_level, message) VALUES (?, ?, ?)',
                (task_id, level, message)
            )
            conn.commit()
            return cursor.lastrowid

    def get_logs(self, task_id: str) -> List[Dict]:
        """Get logs for a task."""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute(
                'SELECT * FROM task_logs WHERE task_id = ? ORDER BY timestamp DESC',
                (task_id,)
            )
            return [dict(row) for row in cursor.fetchall()]

    def track_cost(self, task_id: str, provider: str, model: str,
                   tokens: int, cost_usd: float) -> int:
        """Track LLM cost."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                '''INSERT INTO cost_tracking (task_id, provider, model, tokens_used, cost)
                   VALUES (?, ?, ?, ?, ?)''',
                (task_id, provider, model, tokens, cost_usd)
            )
            conn.commit()
            return cursor.lastrowid

    def get_total_cost(self) -> float:
        """Get total cost of all tasks."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('SELECT SUM(cost) FROM cost_tracking')
            result = cursor.fetchone()
            return result[0] or 0.0

    def get_cost_by_model(self) -> Dict[str, float]:
        """Get total cost grouped by model."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                'SELECT model, SUM(cost) as total FROM cost_tracking GROUP BY model'
            )
            return {row[0]: row[1] for row in cursor.fetchall()}
