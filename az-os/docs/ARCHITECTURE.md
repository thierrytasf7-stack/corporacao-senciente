# AZ-OS v2.0 - Architecture

## Overview

AZ-OS (Agent Zero Operating System) is a production-grade cognitive operating system for autonomous task execution with multi-model LLM orchestration, cost optimization, and enterprise security.

## Design Principles

1. **CLI First**: All functionality accessible via command line
2. **Cost Optimization**: Free-tier models with intelligent cascade
3. **Zero Friction**: <100ms startup latency
4. **Production Ready**: Security, monitoring, error recovery
5. **Extensible**: Plugin architecture for tools and models

## System Architecture

```
┌────────────────────────────────────────────────────────────┐
│                        CLI Layer                            │
│  (Typer + Rich) - User-facing commands and TUI dashboard   │
└─────────────────┬──────────────────────────────────────────┘
                  │
┌─────────────────▼──────────────────────────────────────────┐
│                    Core Engine                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ ReAct Loop   │  │ Model Router │  │ Execution    │    │
│  │ (Reasoning)  │  │ (Selection)  │  │ (Commands)   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────┬──────────────────────────────────────────┘
                  │
┌─────────────────▼──────────────────────────────────────────┐
│                   Service Layer                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   LLM    │  │  Storage │  │ Security │  │Telemetry │  │
│  │  Client  │  │ (SQLite) │  │ (Crypto) │  │ (Health) │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────┬──────────────────────────────────────────┘
                  │
┌─────────────────▼──────────────────────────────────────────┐
│                Infrastructure Layer                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   MCP    │  │   RAG    │  │ Memory   │  │Checkpoint│  │
│  │  Tools   │  │(ChromaDB)│  │ Manager  │  │ Manager  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└───────────────────────────────────────────────────────────┘
```

## Core Components

### 1. CLI Layer

**Technology**: Typer + Rich

**Components**:
- `az_os.cli.main` - Entry point and command router
- `az_os.cli.commands.*` - Command implementations
- `az_os.tui.dashboard` - Textual 60 FPS TUI

**Features**:
- Auto-completion (bash/zsh)
- Rich formatting (colors, tables, progress bars)
- Interactive prompts
- Real-time updates

### 2. ReAct Loop

**File**: `src/az_os/core/react_loop.py`

**Flow**:
```
1. Reasoning → Analyze task and plan action
2. Action    → Execute (read, write, query, etc)
3. Observation → Capture result
4. Reflection → Learn and adjust
5. Repeat until task complete (max 5 turns)
```

**Action Types**:
- `READ_FILE` - Read file contents
- `WRITE_FILE` - Write to file
- `EXECUTE_COMMAND` - Run shell command
- `QUERY_LLM` - Ask language model
- `SEARCH_MEMORY` - Retrieve past learnings

### 3. Model Router

**File**: `src/az_os/core/model_router.py`

**Strategy**: Complexity-based routing

**Models**:
1. **Trinity** (free) - Simple tasks (<100 tokens)
2. **Gemini Pro** (free) - Medium tasks (100-500 tokens)
3. **Mistral** (free) - Complex tasks (>500 tokens)
4. **Claude Sonnet** (paid) - Critical tasks only

**Cost Calculation**:
```python
score = quality * 0.5 + success_rate * 0.3 + (1/cost) * 0.2
```

### 4. Storage Layer

**File**: `src/az_os/core/storage.py`

**Database**: SQLite 3.35+

**Schema**:
```sql
-- Tasks
tasks (
    id TEXT PRIMARY KEY,
    description TEXT,
    model TEXT,
    status TEXT,
    created_at REAL,
    completed_at REAL,
    result TEXT,
    cost_usd REAL
)

-- Logs
task_logs (
    id INTEGER PRIMARY KEY,
    task_id TEXT,
    timestamp REAL,
    level TEXT,
    message TEXT,
    FOREIGN KEY (task_id) REFERENCES tasks(id)
)

-- Costs
cost_tracking (
    id INTEGER PRIMARY KEY,
    task_id TEXT,
    model TEXT,
    input_tokens INTEGER,
    output_tokens INTEGER,
    cost_usd REAL,
    timestamp REAL,
    FOREIGN KEY (task_id) REFERENCES tasks(id)
)

-- State
task_state (
    id INTEGER PRIMARY KEY,
    task_id TEXT UNIQUE,
    state_json TEXT,
    checkpoint_id TEXT,
    updated_at REAL,
    FOREIGN KEY (task_id) REFERENCES tasks(id)
)

-- Tool Usage
tool_usage (
    id INTEGER PRIMARY KEY,
    task_id TEXT,
    tool_name TEXT,
    invocation_count INTEGER,
    total_duration_ms REAL,
    FOREIGN KEY (task_id) REFERENCES tasks(id)
)
```

### 5. Security Module

**File**: `src/az_os/core/security.py`

**Features**:
- Input validation (regex patterns)
- SQL injection prevention (parameterized queries)
- API key encryption (Fernet + PBKDF2)
- Rate limiting (token bucket)
- Audit logging (rotating file)

**Encryption**:
```python
# Master password → PBKDF2 (100k iterations) → AES-256
key = PBKDF2(password, salt, iterations=100000)
cipher = Fernet(key)
encrypted = cipher.encrypt(api_key)
```

### 6. Error Handling

**File**: `src/az_os/core/error_handler.py`

**Categories**:
- Network (recoverable)
- Rate Limit (recoverable)
- Authentication (non-recoverable)
- Validation (non-recoverable)
- Database, Filesystem, Timeout

**Retry Strategy**:
```
Attempt 1: 1s delay
Attempt 2: 2s delay (2^1)
Attempt 3: 4s delay (2^2)
Max: 60s delay cap
```

### 7. Telemetry

**File**: `src/az_os/core/telemetry.py`

**Health Checks**:
- CPU usage (>70% = degraded, >90% = unhealthy)
- Memory (>75% = degraded, >90% = unhealthy)
- Disk (>85% = degraded, >95% = unhealthy)
- Database connectivity
- LLM API reachability

**Metrics**:
- System: CPU, memory, disk, load average
- Service: tasks (completed/failed/in-progress), cost, duration
- Alerts: Configurable thresholds with cooldown (5min)

### 8. RAG Engine

**File**: `src/az_os/core/rag_engine.py`

**Technology**: ChromaDB

**Features**:
- Document indexing (README, docs, code)
- Semantic search (cosine similarity)
- Context retrieval (top-k results)
- Auto-indexing on startup

### 9. Memory Manager

**File**: `src/az_os/core/memory_manager.py`

**Storage**: `~/.az-os/memory.json`

**Structure**:
```json
{
  "id": "mem-123",
  "task_id": "task-456",
  "lesson": "Use pandas for CSV parsing",
  "category": "best_practice",
  "success": true,
  "score": 9.0,
  "timestamp": 1706123456.789,
  "access_count": 5
}
```

**Operations**:
- Add memory
- Search (semantic + keyword)
- Consolidate (merge similar)
- Cleanup (remove old)

### 10. Checkpoint Manager

**File**: `src/az_os/core/checkpoint_manager.py`

**Storage**: `~/.az-os/checkpoints/{task_id}.json`

**Features**:
- Save task state
- Git auto-commit (on checkpoint)
- Restore from checkpoint
- Rollback (git revert)
- Delete checkpoint

## Data Flow

### Task Execution Flow

```
1. User: az-os run "Parse CSV"
        ↓
2. CLI parses command
        ↓
3. Storage: Create task (status=pending)
        ↓
4. ModelRouter: Select best model
        ↓
5. ReActLoop: Initialize (max 5 turns)
        ↓
6. Turn 1:
   - Reasoning: "Need to read CSV file"
   - Action: READ_FILE
   - Observation: File contents
   - Reflection: "Data has headers"
        ↓
7. Turn 2:
   - Reasoning: "Use pandas to parse"
   - Action: EXECUTE_COMMAND
   - Observation: DataFrame created
        ↓
8. Turn 3:
   - Reasoning: "Calculate statistics"
   - Action: QUERY_LLM
   - Observation: Statistics generated
        ↓
9. Checkpoint: Save state
        ↓
10. Storage: Update (status=completed)
        ↓
11. MemoryManager: Store learnings
        ↓
12. Telemetry: Record metrics
        ↓
13. Return result to user
```

## Performance Characteristics

| Metric | Target | Actual |
|--------|--------|--------|
| Startup latency | <100ms | ~45ms |
| Task creation | <50ms | ~20ms |
| Database query | <10ms | ~5ms |
| Model selection | <20ms | ~8ms |
| Health check (all) | <500ms | ~300ms |
| Memory footprint | <100MB | ~65MB |

## Scalability

### Vertical Scaling
- SQLite handles 100k+ tasks efficiently
- Memory usage: ~1KB per task metadata
- Disk: ~10MB per 1000 tasks (with logs)

### Horizontal Scaling
- Stateless CLI (can run multiple instances)
- Shared SQLite database (file locking)
- For high concurrency: migrate to PostgreSQL

## Technology Stack

| Layer | Technology | Version | License |
|-------|-----------|---------|---------|
| Runtime | Python | 3.8+ | PSF |
| CLI | Typer | 0.9+ | MIT |
| TUI | Textual | 0.47+ | MIT |
| Database | SQLite | 3.35+ | Public Domain |
| LLM | LiteLLM | 1.23+ | MIT |
| Crypto | Cryptography | 41.0+ | Apache 2.0 |
| Monitoring | psutil | 5.9+ | BSD |
| RAG | ChromaDB | 0.4+ | Apache 2.0 |

## Security Architecture

See [SECURITY.md](SECURITY.md) for detailed security design.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment guide.

## Future Enhancements

1. **Plugin System**: Custom tools and models
2. **Distributed Execution**: Celery/Ray for parallel tasks
3. **Web Dashboard**: Flask/FastAPI UI
4. **Multi-tenancy**: User isolation and quotas
5. **Advanced RAG**: Hybrid search (dense + sparse)
