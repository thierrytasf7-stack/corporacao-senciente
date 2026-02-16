# 📊 AZ-OS DATA MODEL

**Project:** AZ-OS (Agent Zero Operating System)
**Version:** 1.0.0
**Date:** 2026-02-15
**Status:** Data Model Complete

---

## 🗄️ SQLITE SCHEMA

### Database Configuration
```sql
-- Database name: az_os.db
-- Version: 1.0.0
-- Encoding: UTF-8
-- Foreign keys: ENABLED
```

### Core Tables

#### 1. tasks Table
```sql
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    command TEXT NOT NULL,
    status TEXT NOT NULL,
    priority TEXT NOT NULL,
    model TEXT,
    cost REAL DEFAULT 0.0,
    estimated_tokens INTEGER DEFAULT 0,
    actual_tokens INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    parent_task_id TEXT,
    FOREIGN KEY (parent_task_id) REFERENCES tasks (id) ON DELETE CASCADE
);

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_completed_at ON tasks(completed_at);
CREATE INDEX idx_tasks_model ON tasks(model);
```

#### 2. task_logs Table
```sql
CREATE TABLE task_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT NOT NULL,
    log_level TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata TEXT,
    FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
);

CREATE INDEX idx_task_logs_task_id ON task_logs(task_id);
CREATE INDEX idx_task_logs_timestamp ON task_logs(timestamp);
CREATE INDEX idx_task_logs_log_level ON task_logs(log_level);
```

#### 3. task_state_snapshots Table
```sql
CREATE TABLE task_state_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT NOT NULL,
    snapshot_name TEXT NOT NULL,
    state_data TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_snapshots_task_name ON task_state_snapshots(task_id, snapshot_name);
CREATE INDEX idx_snapshots_task_id ON task_state_snapshots(task_id);
CREATE INDEX idx_snapshots_created_at ON task_state_snapshots(created_at);
```

#### 4. cost_tracking Table
```sql
CREATE TABLE cost_tracking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    tokens_used INTEGER NOT NULL,
    cost REAL NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
);

CREATE INDEX idx_cost_tracking_task_id ON cost_tracking(task_id);
CREATE INDEX idx_cost_tracking_provider ON cost_tracking(provider);
CREATE INDEX idx_cost_tracking_timestamp ON cost_tracking(timestamp);
```

#### 5. tool_usage Table
```sql
CREATE TABLE tool_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT NOT NULL,
    tool_name TEXT NOT NULL,
    tool_category TEXT NOT NULL,
    execution_time REAL NOT NULL,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
);

CREATE INDEX idx_tool_usage_task_id ON tool_usage(task_id);
CREATE INDEX idx_tool_usage_tool_name ON tool_usage(tool_name);
CREATE INDEX idx_tool_usage_timestamp ON tool_usage(timestamp);
```

#### 6. configuration Table
```sql
CREATE TABLE configuration (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_config_key ON configuration(key);
```

#### 7. metrics Table
```sql
CREATE TABLE metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_name TEXT NOT NULL,
    metric_value REAL NOT NULL,
    metric_type TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tags TEXT
);

CREATE INDEX idx_metrics_name ON metrics(metric_name);
CREATE INDEX idx_metrics_timestamp ON metrics(timestamp);
CREATE INDEX idx_metrics_type ON metrics(metric_type);
```

---

## 🧠 CHROMA DB COLLECTIONS SCHEMA

### Configuration
```python
# ChromaDB setup
from chromadb.config import Settings
from chromadb.persistence.models import CollectionConfig

chroma_settings = Settings(
    chroma_db_path="data/chroma_db",
    collection_config=CollectionConfig(
        metadata_config={
            "text_2021_in_tokens": True,
            "tokens_2021_in_bytes": True,
        },
        index_config={
            "ids": "Flat",
            "vectors": "HNSW",
            "metadata": "IVF",
        },
        store_type="type_1",
    )
)
```

### Collections

#### 1. documents Collection
```python
documents_collection = {
    "name": "documents",
    "description": "Indexed documents for semantic search",
    "metadata_schema": {
        "id": "string",
        "title": "string",
        "type": "string",  # documentation, code, config, etc.
        "format": "string",  # markdown, txt, py, json, etc.
        "created_at": "datetime",
        "updated_at": "datetime",
        "tags": "array",
        "source": "string",  # file, url, etc.
    },
    "vector_config": {
        "embedding_model": "all-MiniLM-L6-v2",
        "dimension": 384,
        "similarity_metric": "cosine",
    }
}
```

#### 2. contexts Collection
```python
contexts_collection = {
    "name": "contexts",
    "description": "Task-specific context vectors",
    "metadata_schema": {
        "task_id": "string",
        "context_type": "string",  # task, tool, user, etc.
        "relevance_score": "number",
        "created_at": "datetime",
        "expires_at": "datetime",
    },
    "vector_config": {
        "embedding_model": "sentence-transformers/all-MiniLM-L6-v2",
        "dimension": 384,
        "similarity_metric": "cosine",
    }
}
```

#### 3. tool_descriptions Collection
```python
tool_descriptions_collection = {
    "name": "tool_descriptions",
    "description": "MCP tool descriptions and metadata",
    "metadata_schema": {
        "tool_name": "string",
        "category": "string",
        "arguments": "object",
        "returns": "string",
        "examples": "array",
        "created_at": "datetime",
        "updated_at": "datetime",
    },
    "vector_config": {
        "embedding_model": "all-MiniLM-L6-v2",
        "dimension": 384,
        "similarity_metric": "cosine",
    }
}
```

---

## 🔄 STATE MACHINE DIAGRAMS

### Task State Machine
```mermaid
stateDiagram-v2
    [*] -> INITIALIZED
    INITIALIZED -> PENDING: queue_task
    PENDING -> RUNNING: start_execution
    RUNNING -> COMPLETED: task_success
    RUNNING -> FAILED: task_error
    FAILED -> RETRYING: auto_retry
    RETRYING -> RUNNING: retry_execution
    RUNNING -> CANCELLED: user_cancel
    COMPLETED -> [*]
    CANCELLED -> [*]
    FAILED -> [*]: max_retries_exceeded
```

### Cost State Machine
```mermaid
stateDiagram-v2
    [*] -> BUDGET_OK
    BUDGET_OK -> BUDGET_WARNING: cost_exceeds_threshold
    BUDGET_WARNING -> BUDGET_CRITICAL: cost_exceeds_critical
    BUDGET_CRITICAL -> BUDGET_OK: cost_decreases
    BUDGET_WARNING -> BUDGET_OK: cost_decreases
    BUDGET_CRITICAL -> BUDGET_PAUSED: auto_pause
    BUDGET_PAUSED -> BUDGET_OK: budget_increased
    BUDGET_PAUSED -> [*]: user_action_required
```

### Tool Execution State Machine
```mermaid
stateDiagram-v2
    [*] -> TOOL_READY
    TOOL_READY -> TOOL_EXECUTING: execute_tool
    TOOL_EXECUTING -> TOOL_SUCCESS: tool_success
    TOOL_EXECUTING -> TOOL_FAILED: tool_error
    TOOL_FAILED -> TOOL_RETRYING: auto_retry
    TOOL_RETRYING -> TOOL_EXECUTING: retry_execution
    TOOL_SUCCESS -> TOOL_READY: reset_state
    TOOL_FAILED -> TOOL_READY: reset_state
    TOOL_RETRYING -> [*]: max_retries_exceeded
```

---

## 📋 PERSISTENCE PATTERNS

### Repository Pattern
```python
from abc import ABC, abstractmethod
from typing import Generic, TypeVar, List, Optional, AsyncIterator

T = TypeVar('T')

class Repository(ABC, Generic[T]):
    @abstractmethod
    async def add(self, item: T) -> T:
        """Add item to repository"""
        pass
    
    @abstractmethod
    async def get(self, id: str) -> Optional[T]:
        """Get item by ID"""
        pass
    
    @abstractmethod
    async def update(self, item: T) -> T:
        """Update existing item"""
        pass
    
    @abstractmethod
    async def delete(self, id: str) -> bool:
        """Delete item by ID"""
        pass
    
    @abstractmethod
    async def list(
        self,
        filters: Optional[Dict] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[T]:
        """List items with filters"""
        pass
    
    @abstractmethod
    async def find(
        self,
        query: str,
        n_results: int = 10,
    ) -> List[T]:
        """Find items by query"""
        pass
```

### Unit of Work Pattern
```python
class UnitOfWork:
    def __init__(self):
        self._new_objects = []
        self._dirty_objects = []
        self._removed_objects = []
    
    def register_new(self, obj):
        self._new_objects.append(obj)
    
    def register_dirty(self, obj):
        if obj not in self._dirty_objects:
            self._dirty_objects.append(obj)
    
    def register_removed(self, obj):
        self._removed_objects.append(obj)
    
    async def commit(self):
        await self._insert_new()
        await self._update_dirty()
        await self._delete_removed()
    
    async def rollback(self):
        self._new_objects.clear()
        self._dirty_objects.clear()
        self._removed_objects.clear()
```

### Event Sourcing Pattern
```python
class Event:
    def __init__(self, event_type: str, data: Dict, timestamp: datetime):
        self.event_type = event_type
        self.data = data
        self.timestamp = timestamp

class TaskEvent(Event):
    def __init__(self, task_id: str, event_type: str, data: Dict):
        super().__init__(event_type, data, datetime.now())
        self.task_id = task_id

class EventStore:
    async def append(self, event: Event) -> None:
        """Append event to store"""
        pass
    
    async def get_events(
        self,
        aggregate_id: str,
        from_version: Optional[int] = None,
    ) -> List[Event]:
        """Get events for aggregate"""
        pass
    
    async def get_events_by_type(
        self,
        event_type: str,
        limit: int = 100,
    ) -> List[Event]:
        """Get events by type"""
        pass
```

---

## 🔧 DATA ACCESS LAYER

### SQLite Data Access
```python
import sqlite3
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager

class SQLiteDataAccess:
    def __init__(self, db_path: str):
        self.db_path = db_path
    
    @asynccontextmanager
    async def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        try:
            yield conn
        finally:
            conn.close()
    
    async def execute_query(
        self,
        query: str,
        params: Optional[Dict] = None,
        fetch: bool = False,
    ) -> Optional[List[Dict]]:
        async with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params or {})
            if fetch:
                columns = [col[0] for col in cursor.description]
                results = [dict(zip(columns, row)) for row in cursor.fetchall()]
                return results
            conn.commit()
            return None
    
    async def insert_task(self, task_data: Dict[str, Any]) -> str:
        query = """
        INSERT INTO tasks 
        (id, command, status, priority, model, cost, estimated_tokens, parent_task_id)
        VALUES (:id, :command, :status, :priority, :model, :cost, :estimated_tokens, :parent_task_id)
        """
        await self.execute_query(query, task_data)
        return task_data["id"]
```

### ChromaDB Data Access
```python
from chromadb import Chroma
from typing import List, Dict, Optional

class ChromaDataAccess:
    def __init__(self, collection_name: str, embedding_model: str = "all-MiniLM-L6-v2"):
        self.chroma = Chroma()
        self.collection_name = collection_name
        self.embedding_model = embedding_model
        self.collection = self.chroma(collection_name)
    
    async def add_documents(
        self,
        documents: List[Dict[str, Any]],
        metadatas: Optional[List[Dict[str, Any]]] = None,
    ) -> List[str]:
        results = self.collection.add(
            documents=documents,
            metadatas=metadatas,
            embedding_function=self._embed_text
        )
        return results.ids
    
    async def search_documents(
        self,
        query: str,
        n_results: int = 10,
        where: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        results = self.collection.query(
            query=query,
            n_results=n_results,
            where=where,
            embedding_function=self._embed_text
        )
        return results.embeddings
    
    def _embed_text(self, text: str) -> List[float]:
        # Use embedding model to create vectors
        pass
```

---

## 📊 DATA MIGRATION STRATEGY

### Migration Files
```python
# migrations/001_initial_schema.py

def upgrade(connection):
    """Upgrade to initial schema"""
    with connection:
        connection.execute("""
        CREATE TABLE tasks (
            id TEXT PRIMARY KEY,
            command TEXT NOT NULL,
            status TEXT NOT NULL,
            priority TEXT NOT NULL,
            model TEXT,
            cost REAL DEFAULT 0.0,
            estimated_tokens INTEGER DEFAULT 0,
            actual_tokens INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            started_at TIMESTAMP,
            completed_at TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            parent_task_id TEXT,
            FOREIGN KEY (parent_task_id) REFERENCES tasks (id) ON DELETE CASCADE
        );
        """)


def downgrade(connection):
    """Downgrade from initial schema"""
    with connection:
        connection.execute("DROP TABLE IF EXISTS tasks;")
```

### Migration Manager
```python
import os
import importlib.util
from typing import List

class MigrationManager:
    def __init__(self, migrations_dir: str, connection):
        self.migrations_dir = migrations_dir
        self.connection = connection
        self.applied_migrations = self._get_applied_migrations()
    
    def _get_applied_migrations(self) -> List[str]:
        """Get list of applied migrations"""
        result = self.connection.execute("SELECT name FROM migrations").fetchall()
        return [row[0] for row in result]
    
    def _get_migration_files(self) -> List[str]:
        """Get list of migration files"""
        files = []
        for file_name in os.listdir(self.migrations_dir):
            if file_name.endswith('.py') and file_name.startswith('001'):
                files.append(file_name)
        return sorted(files)
    
    async def migrate(self) -> None:
        """Run pending migrations"""
        migration_files = self._get_migration_files()
        
        for file_name in migration_files:
            migration_name = file_name.replace('.py', '')
            if migration_name not in self.applied_migrations:
                await self._apply_migration(migration_name, file_name)
    
    async def _apply_migration(self, migration_name: str, file_name: str) -> None:
        """Apply single migration"""
        module_path = os.path.join(self.migrations_dir, file_name)
        spec = importlib.util.spec_from_file_location(migration_name, module_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        
        # Apply upgrade
        module.upgrade(self.connection)
        
        # Record migration
        self.connection.execute(
            "INSERT INTO migrations (name, applied_at) VALUES (?, ?)",
            (migration_name, datetime.now())
        )
```

---

## 🔒 DATA SECURITY

### Encryption
```python
from cryptography.fernet import Fernet
import base64
import os

class DataEncryption:
    def __init__(self, encryption_key: Optional[bytes] = None):
        self.key = encryption_key or self._generate_key()
        self.cipher = Fernet(self.key)
    
    def _generate_key(self) -> bytes:
        """Generate encryption key"""
        return Fernet.generate_key()
    
    def encrypt_data(self, data: str) -> str:
        """Encrypt data"""
        encrypted = self.cipher.encrypt(data.encode())
        return base64.urlsafe_b64encode(encrypted).decode()
    
    def decrypt_data(self, encrypted_data: str) -> str:
        """Decrypt data"""
        decoded = base64.urlsafe_b64decode(encrypted_data.encode())
        decrypted = self.cipher.decrypt(decoded)
        return decrypted.decode()
```

### Access Control
```python
class DataAccessControl:
    def __init__(self):
        self.permissions = {}
    
    def grant_permission(
        self,
        user_id: str,
        resource_type: str,
        resource_id: Optional[str],
        permissions: List[str],
    ) -> None:
        """Grant permissions to user"""
        key = (user_id, resource_type, resource_id)
        self.permissions[key] = permissions
    
    def check_permission(
        self,
        user_id: str,
        resource_type: str,
        resource_id: Optional[str],
        required_permission: str,
    ) -> bool:
        """Check if user has permission"""
        key = (user_id, resource_type, resource_id)
        permissions = self.permissions.get(key, [])
        return required_permission in permissions
```

---

## 📊 DATA ANALYTICS

### Query Examples
```sql
-- Task completion rate
SELECT 
    status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM tasks), 2) as percentage
FROM tasks
GROUP BY status;

-- Average cost per task
SELECT 
    AVG(cost) as average_cost,
    MIN(cost) as min_cost,
    MAX(cost) as max_cost,
    STDDEV(cost) as stddev_cost
FROM tasks
WHERE status = 'completed';

-- Tool usage statistics
SELECT 
    tool_name,
    COUNT(*) as usage_count,
    AVG(execution_time) as avg_execution_time,
    SUM(CASE WHEN success THEN 1 ELSE 0 END) as success_count,
    ROUND(AVG(success) * 100, 2) as success_rate
FROM tool_usage
GROUP BY tool_name
ORDER BY usage_count DESC;

-- Cost trends over time
SELECT 
    DATE(created_at) as date,
    SUM(cost) as daily_cost,
    COUNT(*) as task_count
FROM tasks
WHERE created_at > DATE('now', '-30 days')
GROUP BY DATE(created_at)
ORDER BY date;
```

---

## 🔄 DATA BACKUP & RECOVERY

### Backup Strategy
```python
import shutil
import gzip
from datetime import datetime
from pathlib import Path

class DataBackup:
    def __init__(self, backup_dir: str):
        self.backup_dir = Path(backup_dir)
        self.backup_dir.mkdir(parents=True, exist_ok=True)
    
    def create_backup(self, source_path: str, backup_name: Optional[str] = None) -> str:
        """Create compressed backup"""
        backup_name = backup_name or f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        backup_path = self.backup_dir / f"{backup_name}.tar.gz"
        
        # Create compressed archive
        shutil.make_archive(
            base_name=str(backup_path).replace('.tar.gz', ''),
            format='gztar',
            root_dir=source_path
        )
        
        return str(backup_path)
    
    def restore_backup(self, backup_path: str, restore_path: str) -> None:
        """Restore from backup"""
        shutil.unpack_archive(
            filename=backup_path,
            extract_dir=restore_path,
            format='gztar'
        )
```

---

## 📋 ACCEPTANCE CRITERIA

### Functional Requirements
- [ ] SQLite schema supports all required entities
- [ ] ChromaDB collections configured for semantic search
- [ ] State machine diagrams accurately represent flows
- [ ] Persistence patterns implemented correctly
- [ ] Data access layer provides clean abstractions

### Non-Functional Requirements
- [ ] Database operations complete in <100ms
- [ ] Data encryption implemented for sensitive information
- [ ] Backup and recovery procedures documented
- [ ] Migration system supports forward/backward compatibility
- [ ] Access control patterns implemented

### Performance Requirements
- [ ] Query response time <100ms for simple queries
- [ ] Index coverage for all common query patterns
- [ ] Concurrent read/write operations supported
- [ ] Memory usage <100MB for data access layer
- [ ] Storage efficiency optimized

---

## 🔄 VERSION HISTORY

**1.0.0 (2026-02-15)**: Initial data model design
- Complete SQLite schema with 7 core tables
- ChromaDB collections for semantic search
- State machine diagrams for all flows
- Persistence patterns and data access layer
- Security, backup, and analytics features

---