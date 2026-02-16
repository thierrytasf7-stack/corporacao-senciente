import sqlite3
import asyncio
from pathlib import Path
from typing import List, Optional, Dict, Any
from datetime import datetime
from aiosqlite import connect, Connection
from ..storage import get_db_path


class Database:
    def __init__(self):
        self.db_path = get_db_path()
        self._initialized = False
    
    async def initialize(self) -> None:
        """Initialize database schema"""
        if self._initialized:
            return
            
        async with connect(self.db_path) as db:
            # Enable WAL mode for better concurrency
            await db.execute("PRAGMA journal_mode=WAL")
            await db.execute("PRAGMA foreign_keys=ON")
            
            # Create tables
            await db.execute("""
                CREATE TABLE IF NOT EXISTS tasks (
                    id TEXT PRIMARY KEY,
                    command TEXT NOT NULL,
                    status TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    started_at TIMESTAMP,
                    completed_at TIMESTAMP,
                    error_message TEXT,
                    model TEXT,
                    cost_usd REAL DEFAULT 0.0,
                    metadata TEXT
                )
            """)
            
            await db.execute("""
                CREATE TABLE IF NOT EXISTS logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    task_id TEXT NOT NULL,
                    level TEXT NOT NULL,
                    message TEXT NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    metadata TEXT,
                    FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
                )
            """)
            
            await db.execute("""
                CREATE TABLE IF NOT EXISTS state_snapshots (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    task_id TEXT NOT NULL,
                    state_type TEXT NOT NULL,
                    state_data TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
                )
            """)
            
            await db.execute("""
                CREATE TABLE IF NOT EXISTS metrics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    task_id TEXT NOT NULL,
                    model TEXT NOT NULL,
                    input_tokens INTEGER NOT NULL,
                    output_tokens INTEGER NOT NULL,
                    cost_usd REAL NOT NULL,
                    latency_ms INTEGER NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    retry_count INTEGER DEFAULT 0,
                    FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
                )
            """)
            
            await db.execute("""
                CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)
            """)
            
            await db.execute("""
                CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at)
            """)
            
            await db.execute("""
                CREATE INDEX IF NOT EXISTS idx_logs_task_id ON logs(task_id)
            """)
            
            await db.execute("""
                CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp)
            """)
            
            await db.execute("""
                CREATE INDEX IF NOT EXISTS idx_metrics_task_id ON metrics(task_id)
            """)
            
            await db.execute("""
                CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics(timestamp)
            """)
            
            await db.execute("""
                CREATE INDEX IF NOT EXISTS idx_metrics_model ON metrics(model)
            """)
            
            await db.commit()
        
        self._initialized = True
    
    async def create_task(self, task_id: str, command: str, model: Optional[str] = None) -> None:
        """Create a new task"""
        async with connect(self.db_path) as db:
            await db.execute(
                """
                INSERT INTO tasks (id, command, status, model) 
                VALUES (?, ?, 'created', ?)
                """,
                (task_id, command, model)
            )
            await db.commit()
    
    async def update_task_status(self, task_id: str, status: str, 
                                error_message: Optional[str] = None) -> None:
        """Update task status"""
        async with connect(self.db_path) as db:
            await db.execute(
                """
                UPDATE tasks 
                SET status = ?, error_message = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """,
                (status, error_message, task_id)
            )
            await db.commit()
    
    async def start_task(self, task_id: str) -> None:
        """Mark task as started"""
        async with connect(self.db_path) as db:
            await db.execute(
                """
                UPDATE tasks 
                SET status = 'running', started_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """,
                (task_id,)
            )
            await db.commit()
    
    async def complete_task(self, task_id: str, cost_usd: float = 0.0) -> None:
        """Mark task as completed"""
        async with connect(self.db_path) as db:
            await db.execute(
                """
                UPDATE tasks 
                SET status = 'completed', completed_at = CURRENT_TIMESTAMP, 
                    updated_at = CURRENT_TIMESTAMP, cost_usd = ?
                WHERE id = ?
                """,
                (cost_usd, task_id)
            )
            await db.commit()
    
    async def fail_task(self, task_id: str, error_message: str) -> None:
        """Mark task as failed"""
        async with connect(self.db_path) as db:
            await db.execute(
                """
                UPDATE tasks 
                SET status = 'failed', error_message = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """,
                (error_message, task_id)
            )
            await db.commit()
    
    async def get_task(self, task_id: str) -> Optional[Dict]:
        """Get task details"""
        async with connect(self.db_path) as db:
            cursor = await db.execute(
                """
                SELECT id, command, status, created_at, updated_at, started_at, 
                       completed_at, error_message, model, cost_usd, metadata
                FROM tasks 
                WHERE id = ?
                """,
                (task_id,)
            )
            row = await cursor.fetchone()
            
            if row:
                return {
                    "id": row[0],
                    "command": row[1],
                    "status": row[2],
                    "created_at": row[3],
                    "updated_at": row[4],
                    "started_at": row[5],
                    "completed_at": row[6],
                    "error_message": row[7],
                    "model": row[8],
                    "cost_usd": row[9],
                    "metadata": row[10],
                }
            return None
    
    async def get_tasks(self, limit: int = 50, offset: int = 0, 
                       status: Optional[str] = None) -> List[Dict]:
        """Get list of tasks"""
        async with connect(self.db_path) as db:
            query = """
                SELECT id, command, status, created_at, updated_at, started_at, 
                       completed_at, error_message, model, cost_usd
                FROM tasks
            """
            params = []
            
            if status:
                query += " WHERE status = ?"
                params.append(status)
            
            query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
            params.extend([limit, offset])
            
            cursor = await db.execute(query, tuple(params))
            rows = await cursor.fetchall()
            
            return [{
                "id": row[0],
                "command": row[1],
                "status": row[2],
                "created_at": row[3],
                "updated_at": row[4],
                "started_at": row[5],
                "completed_at": row[6],
                "error_message": row[7],
                "model": row[8],
                "cost_usd": row[9],
            } for row in rows]
    
    async def get_task_count(self, status: Optional[str] = None) -> int:
        """Get count of tasks"""
        async with connect(self.db_path) as db:
            query = "SELECT COUNT(*) FROM tasks"
            params = []
            
            if status:
                query += " WHERE status = ?"
                params.append(status)
            
            cursor = await db.execute(query, tuple(params))
            row = await cursor.fetchone()
            return row[0] if row else 0
    
    async def add_log(self, task_id: str, level: str, message: str, 
                     metadata: Optional[Dict] = None) -> None:
        """Add log entry"""
        async with connect(self.db_path) as db:
            await db.execute(
                """
                INSERT INTO logs (task_id, level, message, metadata)
                VALUES (?, ?, ?, ?)
                """,
                (task_id, level, message, json.dumps(metadata) if metadata else None)
            )
            await db.commit()
    
    async def get_logs(self, task_id: str, limit: int = 100, 
                      offset: int = 0) -> List[Dict]:
        """Get logs for a task"""
        async with connect(self.db_path) as db:
            cursor = await db.execute(
                """
                SELECT id, level, message, timestamp, metadata
                FROM logs 
                WHERE task_id = ?
                ORDER BY timestamp DESC 
                LIMIT ? OFFSET ?
                """,
                (task_id, limit, offset)
            )
            rows = await cursor.fetchall()
            
            return [{
                "id": row[0],
                "level": row[1],
                "message": row[2],
                "timestamp": row[3],
                "metadata": json.loads(row[4]) if row[4] else None,
            } for row in rows]
    
    async def get_log_count(self, task_id: str) -> int:
        """Get count of logs for a task"""
        async with connect(self.db_path) as db:
            cursor = await db.execute(
                "SELECT COUNT(*) FROM logs WHERE task_id = ?",
                (task_id,)
            )
            row = await cursor.fetchone()
            return row[0] if row else 0
    
    async def add_state_snapshot(self, task_id: str, state_type: str, 
                                state_data: Dict) -> None:
        """Add state snapshot"""
        async with connect(self.db_path) as db:
            await db.execute(
                """
                INSERT INTO state_snapshots (task_id, state_type, state_data)
                VALUES (?, ?, ?)
                """,
                (task_id, state_type, json.dumps(state_data))
            )
            await db.commit()
    
    async def get_state_snapshots(self, task_id: str) -> List[Dict]:
        """Get state snapshots for a task"""
        async with connect(self.db_path) as db:
            cursor = await db.execute(
                """
                SELECT id, state_type, state_data, created_at
                FROM state_snapshots 
                WHERE task_id = ?
                ORDER BY created_at DESC
                """,
                (task_id,)
            )
            rows = await cursor.fetchall()
            
            return [{
                "id": row[0],
                "state_type": row[1],
                "state_data": json.loads(row[2]),
                "created_at": row[3],
            } for row in rows]
    
    async def get_metrics(self, task_id: str = None, 
                         model: Optional[str] = None) -> List[Dict]:
        """Get metrics"""
        async with connect(self.db_path) as db:
            query = """
                SELECT id, task_id, model, input_tokens, output_tokens, 
                       cost_usd, latency_ms, timestamp, retry_count
                FROM metrics
            """
            params = []
            
            conditions = []
            if task_id:
                conditions.append("task_id = ?")
                params.append(task_id)
            if model:
                conditions.append("model = ?")
                params.append(model)
            
            if conditions:
                query += " WHERE " + " AND ".join(conditions)
            
            query += " ORDER BY timestamp DESC"
            
            cursor = await db.execute(query, tuple(params))
            rows = await cursor.fetchall()
            
            return [{
                "id": row[0],
                "task_id": row[1],
                "model": row[2],
                "input_tokens": row[3],
                "output_tokens": row[4],
                "cost_usd": row[5],
                "latency_ms": row[6],
                "timestamp": row[7],
                "retry_count": row[8],
            } for row in rows]
    
    async def get_metrics_summary(self, days: int = 7) -> Dict:
        """Get metrics summary"""
        async with connect(self.db_path) as db:
            # Total cost
            cursor = await db.execute(
                """
                SELECT SUM(cost_usd) as total_cost, COUNT(*) as total_requests,
                       AVG(latency_ms) as avg_latency
                FROM metrics 
                WHERE timestamp >= datetime('now', ?)
                """,
                (f"-{days} days",)
            )
            total_row = await cursor.fetchone()
            
            # Cost by model
            cursor = await db.execute(
                """
                SELECT model, SUM(cost_usd) as total_cost, COUNT(*) as request_count
                FROM metrics 
                WHERE timestamp >= datetime('now', ?)
                GROUP BY model
                ORDER BY total_cost DESC
                """,
                (f"-{days} days",)
            )
            model_costs = await cursor.fetchall()
            
            return {
                "total_cost": total_row[0] if total_row[0] else 0.0,
                "total_requests": total_row[1] if total_row[1] else 0,
                "avg_latency": total_row[2] if total_row[2] else 0,
                "model_breakdown": [{
                    "model": row[0],
                    "total_cost": row[1],
                    "request_count": row[2],
                } for row in model_costs],
            }
    
    async def get_daily_metrics(self, days: int = 7) -> List[Dict]:
        """Get daily metrics"""
        async with connect(self.db_path) as db:
            cursor = await db.execute(
                """
                SELECT 
                    DATE(timestamp) as date,
                    SUM(cost_usd) as total_cost,
                    COUNT(*) as request_count,
                    AVG(latency_ms) as avg_latency
                FROM metrics 
                WHERE timestamp >= datetime('now', ?)
                GROUP BY DATE(timestamp)
                ORDER BY date DESC
                LIMIT ?
                """,
                (f"-{days} days", days)
            )
            rows = await cursor.fetchall()
            
            return [{
                "date": row[0],
                "total_cost": row[1],
                "request_count": row[2],
                "avg_latency": row[3],
            } for row in rows]


# Global database instance
_db_instance = None


async def get_database() -> Database:
    """Get global database instance"""
    global _db_instance
    if _db_instance is None:
        _db_instance = Database()
        await _db_instance.initialize()
    return _db_instance


async def close_database() -> None:
    """Close database connection"""
    global _db_instance
    if _db_instance:
        # No explicit close needed for aiosqlite
        _db_instance = None