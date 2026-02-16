import asyncio
import logging
import sqlite3
from typing import Any, Dict, List, Optional, Union
from datetime import datetime
from contextlib import asynccontextmanager

import aiosqlite
from pydantic import BaseModel

from az_os.data.models import Task, Cost, Budget, ModelPricing, Tool, ExecutionLog, StateSnapshot

logger = logging.getLogger(__name__)


class SQLiteRepository:
    def __init__(self, database_url: str = "sqlite:///az_os.db"):
        self.database_url = database_url
        self.connection = None
        self.is_initialized = False
        
    async def initialize(self) -> None:
        """Initialize the SQLite database"""
        if self.is_initialized:
            return
            
        # Extract database path from URL
        db_path = self.database_url.replace("sqlite:///", "")
        
        # Create directory if it doesn't exist
        db_dir = os.path.dirname(db_path)
        if db_dir:
            os.makedirs(db_dir, exist_ok=True)
        
        # Create tables
        async with self._get_connection() as conn:
            await self._create_tables(conn)
            await self._create_indexes(conn)
            
        self.is_initialized = True
        logger.info(f"SQLite database initialized at {db_path}")
    
    @asynccontextmanager
    async def _get_connection(self):
        """Get a database connection"""
        conn = await aiosqlite.connect(self.database_url.replace("sqlite:///", ""))
        try:
            yield conn
        finally:
            await conn.close()
    
    async def _create_tables(self, conn) -> None:
        """Create database tables"""
        await conn.executescript("".join([
            """
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                command TEXT NOT NULL,
                status TEXT NOT NULL,
                priority TEXT NOT NULL,
                model TEXT,
                cost REAL DEFAULT 0.0,
                estimated_tokens INTEGER DEFAULT 0,
                actual_tokens INTEGER DEFAULT 0,
                created_at TIMESTAMP,
                started_at TIMESTAMP,
                completed_at TIMESTAMP,
                updated_at TIMESTAMP,
                parent_task_id TEXT,
                FOREIGN KEY (parent_task_id) REFERENCES tasks (id)
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS costs (
                id TEXT PRIMARY KEY,
                task_id TEXT NOT NULL,
                tokens INTEGER NOT NULL,
                model TEXT NOT NULL,
                provider TEXT NOT NULL,
                cost REAL NOT NULL,
                timestamp TIMESTAMP NOT NULL,
                FOREIGN KEY (task_id) REFERENCES tasks (id)
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS budget (
                id TEXT PRIMARY KEY DEFAULT 'default',
                amount REAL NOT NULL,
                alert_percentage REAL NOT NULL,
                last_checked TIMESTAMP
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS model_pricing (
                model TEXT NOT NULL,
                provider TEXT NOT NULL,
                input_cost REAL NOT NULL,
                output_cost REAL NOT NULL,
                cache_cost REAL DEFAULT 0.0,
                updated_at TIMESTAMP NOT NULL,
                PRIMARY KEY (model, provider)
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS tools (
                name TEXT PRIMARY KEY,
                description TEXT NOT NULL,
                inputs TEXT NOT NULL,
                outputs TEXT NOT NULL,
                category TEXT NOT NULL,
                enabled INTEGER DEFAULT 1
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS execution_logs (
                id TEXT PRIMARY KEY,
                task_id TEXT NOT NULL,
                level TEXT NOT NULL,
                message TEXT NOT NULL,
                timestamp TIMESTAMP NOT NULL,
                metadata TEXT,
                FOREIGN KEY (task_id) REFERENCES tasks (id)
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS state_snapshots (
                id TEXT PRIMARY KEY,
                task_id TEXT NOT NULL,
                data TEXT NOT NULL,
                timestamp TIMESTAMP NOT NULL,
                description TEXT,
                FOREIGN KEY (task_id) REFERENCES tasks (id)
            );
            """
        ]))
        
        await conn.commit()
    
    async def _create_indexes(self, conn) -> None:
        """Create database indexes"""
        await conn.executescript("".join([
            "CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status);",
            "CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks (created_at);",
            "CREATE INDEX IF NOT EXISTS idx_tasks_completed_at ON tasks (completed_at);",
            "CREATE INDEX IF NOT EXISTS idx_costs_timestamp ON costs (timestamp);",
            "CREATE INDEX IF NOT EXISTS idx_costs_task_id ON costs (task_id);",
            "CREATE INDEX IF NOT EXISTS idx_execution_logs_timestamp ON execution_logs (timestamp);",
            "CREATE INDEX IF NOT EXISTS idx_execution_logs_task_id ON execution_logs (task_id);",
            "CREATE INDEX IF NOT EXISTS idx_state_snapshots_timestamp ON state_snapshots (timestamp);",
            "CREATE INDEX IF NOT EXISTS idx_state_snapshots_task_id ON state_snapshots (task_id);"
        ]))
        
        await conn.commit()
    
    async def create_task(self, task: Task) -> Task:
        """Create a new task"""
        async with self._get_connection() as conn:
            await conn.execute("
                INSERT INTO tasks (id, command, status, priority, model, cost, 
                                 estimated_tokens, actual_tokens, created_at, 
                                 started_at, completed_at, updated_at, parent_task_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ", (
                task.id, task.command, task.status, task.priority, task.model,
                task.cost, task.estimated_tokens, task.actual_tokens,
                task.created_at, task.started_at, task.completed_at,
                task.updated_at, task.parent_task_id
            ))
            await conn.commit()
        
        return task
    
    async def get_task(self, task_id: str) -> Optional[Task]:
        """Get a task by ID"""
        async with self._get_connection() as conn:
            cursor = await conn.execute("
                SELECT id, command, status, priority, model, cost, 
                       estimated_tokens, actual_tokens, created_at, 
                       started_at, completed_at, updated_at, parent_task_id
                FROM tasks
                WHERE id = ?
            ", (task_id,))
            
            row = await cursor.fetchone()
            if row:
                return Task(
                    id=row[0], command=row[1], status=row[2], priority=row[3],
                    model=row[4], cost=row[5], estimated_tokens=row[6],
                    actual_tokens=row[7], created_at=row[8], started_at=row[9],
                    completed_at=row[10], updated_at=row[11], parent_task_id=row[12]
                )
        
        return None
    
    async def update_task(self, task: Task) -> Task:
        """Update an existing task"""
        async with self._get_connection() as conn:
            await conn.execute("
                UPDATE tasks
                SET command = ?, status = ?, priority = ?, model = ?, cost = ?,
                    estimated_tokens = ?, actual_tokens = ?, created_at = ?,
                    started_at = ?, completed_at = ?, updated_at = ?, parent_task_id = ?
                WHERE id = ?
            ", (
                task.command, task.status, task.priority, task.model, task.cost,
                task.estimated_tokens, task.actual_tokens, task.created_at,
                task.started_at, task.completed_at, task.updated_at,
                task.parent_task_id, task.id
            ))
            await conn.commit()
        
        return task
    
    async def list_tasks(self, status: Optional[str] = None, 
                        priority: Optional[str] = None,
                        limit: int = 100, offset: int = 0) -> List[Task]:
        """List tasks with optional filters"""
        query = "SELECT id, command, status, priority, model, cost, estimated_tokens, actual_tokens, created_at, started_at, completed_at, updated_at, parent_task_id FROM tasks"
        params = []
        
        conditions = []
        if status:
            conditions.append("status = ?")
            params.append(status)
        if priority:
            conditions.append("priority = ?")
            params.append(priority)
        
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        
        query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        
        tasks = []
        async with self._get_connection() as conn:
            cursor = await conn.execute(query, tuple(params))
            async for row in cursor:
                tasks.append(Task(
                    id=row[0], command=row[1], status=row[2], priority=row[3],
                    model=row[4], cost=row[5], estimated_tokens=row[6],
                    actual_tokens=row[7], created_at=row[8], started_at=row[9],
                    completed_at=row[10], updated_at=row[11], parent_task_id=row[12]
                ))
        
        return tasks
    
    async def delete_task(self, task_id: str) -> bool:
        """Delete a task by ID"""
        async with self._get_connection() as conn:
            cursor = await conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
            await conn.commit()
            return cursor.rowcount > 0
    
    async def create_cost(self, cost: Cost) -> Cost:
        """Create a new cost record"""
        async with self._get_connection() as conn:
            await conn.execute("
                INSERT INTO costs (id, task_id, tokens, model, provider, cost, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ", (
                cost.id, cost.task_id, cost.tokens, cost.model,
                cost.provider, cost.cost, cost.timestamp
            ))
            await conn.commit()
        
        return cost
    
    async def get_costs(self, start_time: Optional[datetime] = None,
                       end_time: Optional[datetime] = None) -> List[Cost]:
        """Get cost records within a time range"""
        query = "SELECT id, task_id, tokens, model, provider, cost, timestamp FROM costs"
        params = []
        
        conditions = []
        if start_time:
            conditions.append("timestamp >= ?")
            params.append(start_time)
        if end_time:
            conditions.append("timestamp <= ?")
            params.append(end_time)
        
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        
        query += " ORDER BY timestamp DESC"
        
        costs = []
        async with self._get_connection() as conn:
            cursor = await conn.execute(query, tuple(params))
            async for row in cursor:
                costs.append(Cost(
                    id=row[0], task_id=row[1], tokens=row[2], model=row[3],
                    provider=row[4], cost=row[5], timestamp=row[6]
                ))
        
        return costs
    
    async def get_model_pricing(self, model: str, provider: str) -> Optional[float]:
        """Get pricing for a specific model from a provider"""
        async with self._get_connection() as conn:
            cursor = await conn.execute("
                SELECT input_cost, output_cost
                FROM model_pricing
                WHERE model = ? AND provider = ?
            ", (model, provider))
            
            row = await cursor.fetchone()
            if row:
                # Return average of input and output cost
                return (row[0] + row[1]) / 2
        
        return None
    
    async def set_budget_alert(self, amount: float, alert_percentage: float) -> None:
        """Set budget alert threshold"""
        async with self._get_connection() as conn:
            await conn.execute("
                INSERT OR REPLACE INTO budget (id, amount, alert_percentage, last_checked)
                VALUES (?, ?, ?, ?)
            ", ('default', amount, alert_percentage, datetime.now()))
            await conn.commit()
    
    async def get_budget(self) -> Optional[Budget]:
        """Get current budget configuration"""
        async with self._get_connection() as conn:
            cursor = await conn.execute("
                SELECT amount, alert_percentage, last_checked
                FROM budget
                WHERE id = 'default'
            ")
            
            row = await cursor.fetchone()
            if row:
                return Budget(
                    amount=row[0], 
                    alert_percentage=row[1],
                    last_checked=row[2]
                )
        
        return None
    
    async def create_tool(self, tool: Tool) -> Tool:
        """Create a new tool"""
        async with self._get_connection() as conn:
            await conn.execute("
                INSERT INTO tools (name, description, inputs, outputs, category, enabled)
                VALUES (?, ?, ?, ?, ?, ?)
            ", (
                tool.name, tool.description, str(tool.inputs),
                str(tool.outputs), tool.category, int(tool.enabled)
            ))
            await conn.commit()
        
        return tool
    
    async def get_tool(self, tool_name: str) -> Optional[Tool]:
        """Get a tool by name"""
        async with self._get_connection() as conn:
            cursor = await conn.execute("
                SELECT name, description, inputs, outputs, category, enabled
                FROM tools
                WHERE name = ?
            ", (tool_name,))
            
            row = await cursor.fetchone()
            if row:
                return Tool(
                    name=row[0], description=row[1], inputs=eval(row[2]),
                    outputs=eval(row[3]), category=row[4], enabled=bool(row[5])
                )
        
        return None
    
    async def list_tools(self, category: Optional[str] = None,
                        enabled: Optional[bool] = None) -> List[Tool]:
        """List tools with optional filters"""
        query = "SELECT name, description, inputs, outputs, category, enabled FROM tools"
        params = []
        
        conditions = []
        if category:
            conditions.append("category = ?")
            params.append(category)
        if enabled is not None:
            conditions.append("enabled = ?")
            params.append(int(enabled))
        
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        
        query += " ORDER BY name"
        
        tools = []
        async with self._get_connection() as conn:
            cursor = await conn.execute(query, tuple(params))
            async for row in cursor:
                tools.append(Tool(
                    name=row[0], description=row[1], inputs=eval(row[2]),
                    outputs=eval(row[3]), category=row[4], enabled=bool(row[5])
                ))
        
        return tools
    
    async def create_execution_log(self, log: ExecutionLog) -> ExecutionLog:
        """Create a new execution log"""
        async with self._get_connection() as conn:
            await conn.execute("
                INSERT INTO execution_logs (id, task_id, level, message, timestamp, metadata)
                VALUES (?, ?, ?, ?, ?, ?)
            ", (
                log.id, log.task_id, log.level, log.message,
                log.timestamp, str(log.metadata) if log.metadata else None
            ))
            await conn.commit()
        
        return log
    
    async def get_execution_logs(self, task_id: Optional[str] = None,
                                level: Optional[str] = None,
                                limit: int = 100, offset: int = 0) -> List[ExecutionLog]:
        """Get execution logs with optional filters"""
        query = "SELECT id, task_id, level, message, timestamp, metadata FROM execution_logs"
        params = []
        
        conditions = []
        if task_id:
            conditions.append("task_id = ?")
            params.append(task_id)
        if level:
            conditions.append("level = ?")
            params.append(level)
        
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        
        query += " ORDER BY timestamp DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        
        logs = []
        async with self._get_connection() as conn:
            cursor = await conn.execute(query, tuple(params))
            async for row in cursor:
                logs.append(ExecutionLog(
                    id=row[0], task_id=row[1], level=row[2], message=row[3],
                    timestamp=row[4], metadata=eval(row[5]) if row[5] else None
                ))
        
        return logs
    
    async def create_state_snapshot(self, snapshot: StateSnapshot) -> StateSnapshot:
        """Create a new state snapshot"""
        async with self._get_connection() as conn:
            await conn.execute("
                INSERT INTO state_snapshots (id, task_id, data, timestamp, description)
                VALUES (?, ?, ?, ?, ?)
            ", (
                snapshot.id, snapshot.task_id, str(snapshot.data),
                snapshot.timestamp, snapshot.description
            ))
            await conn.commit()
        
        return snapshot
    
    async def get_state_snapshots(self, task_id: Optional[str] = None,
                                 limit: int = 100, offset: int = 0) -> List[StateSnapshot]:
        """Get state snapshots with optional filters"""
        query = "SELECT id, task_id, data, timestamp, description FROM state_snapshots"
        params = []
        
        conditions = []
        if task_id:
            conditions.append("task_id = ?")
            params.append(task_id)
        
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        
        query += " ORDER BY timestamp DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        
        snapshots = []
        async with self._get_connection() as conn:
            cursor = await conn.execute(query, tuple(params))
            async for row in cursor:
                snapshots.append(StateSnapshot(
                    id=row[0], task_id=row[1], data=eval(row[2]),
                    timestamp=row[3], description=row[4]
                ))
        
        return snapshots
    
    async def close(self) -> None:
        """Close the database connection"""
        if self.connection:
            await self.connection.close()
            self.connection = None
        logger.info("SQLite database connection closed")