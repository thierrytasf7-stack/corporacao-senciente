# 📋 AZ-OS API DESIGN

**Project:** AZ-OS (Agent Zero Operating System)
**Version:** 1.0.0
**Date:** 2026-02-15
**Status:** API Design Complete

---

## 🎯 CLI COMMAND STRUCTURE

### Command Syntax
```bash
az <command> <subcommand> [options]
```

### Root Commands
```bash
az task      # Task management and execution
az db        # Database operations
az cost      # Cost tracking and management
az dashboard # TUI dashboard
az tools     # Tool management and discovery
az config    # Configuration management
az log       # Logging and monitoring
az state     # State management
```

### Command Examples
```bash
# Task execution
az task run "create function isPrime" --model claude --priority high

# Database operations
az db init --force
az db migrate --version 1.2.3

# Cost management
az cost show --period daily
az cost budget set --amount 100 --alert 80

# Dashboard
az dashboard --theme dark --metrics all

# Tool discovery
az tools list --category ai
az tools info --name filesystem

# Configuration
az config set llm.provider=gemini
az config get --all

# Logging
az log show --level error --since "2024-01-01"
az log export --format json --output logs.json

# State management
az state save --name checkpoint-1
az state restore --name checkpoint-1
```

---

## 🐍 PYTHON API INTERFACES

### Core Interfaces (`az_os.core.interfaces`)

```python
from typing import AsyncIterator, Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class TaskStatus(Enum):
    INITIALIZED = "initialized"
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class TaskPriority(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class Task:
    def __init__(
        self,
        id: str,
        command: str,
        status: TaskStatus = TaskStatus.INITIALIZED,
        priority: TaskPriority = TaskPriority.MEDIUM,
        model: Optional[str] = None,
        cost: float = 0.0,
        estimated_tokens: int = 0,
        actual_tokens: int = 0,
        created_at: datetime = None,
        started_at: datetime = None,
        completed_at: datetime = None,
        updated_at: datetime = None,
        parent_task_id: Optional[str] = None,
    ) -> None:
        pass

class TaskRepository:
    async def create(self, task: Task) -> Task:
        """Create a new task"""
        pass
    
    async def get(self, task_id: str) -> Optional[Task]:
        """Get task by ID"""
        pass
    
    async def update(self, task: Task) -> Task:
        """Update existing task"""
        pass
    
    async def list(
        self,
        status: Optional[TaskStatus] = None,
        priority: Optional[TaskPriority] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[Task]:
        """List tasks with filters"""
        pass
    
    async def delete(self, task_id: str) -> bool:
        """Delete task by ID"""
        pass

class ExecutionEngine:
    async def execute(
        self,
        task: Task,
        tools: Optional[List[str]] = None,
    ) -> Task:
        """Execute task with optional tools"""
        pass
    
    async def execute_stream(
        self,
        task: Task,
        tools: Optional[List[str]] = None,
    ) -> AsyncIterator[Dict[str, Any]]:
        """Execute task with streaming output"""
        pass

class CostTracker:
    async def track(
        self,
        task_id: str,
        cost: float,
        model: str,
        tokens: int,
    ) -> None:
        """Track cost for task execution"""
        pass
    
    async def get_total_cost(self, period: str = "daily") -> float:
        """Get total cost for period"""
        pass
    
    async def get_cost_by_task(self, task_id: str) -> float:
        """Get cost for specific task"""
        pass

class StateManager:
    async def save_snapshot(
        self,
        task_id: str,
        state: Dict[str, Any],
        checkpoint_name: Optional[str] = None,
    ) -> str:
        """Save state snapshot"""
        pass
    
    async def load_snapshot(
        self,
        task_id: str,
        checkpoint_name: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """Load state snapshot"""
        pass
    
    async def list_snapshots(self, task_id: str) -> List[str]:
        """List available snapshots"""
        pass

class ConfigManager:
    async def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value"""
        pass
    
    async def set(self, key: str, value: Any) -> None:
        """Set configuration value"""
        pass
    
    async def get_all(self) -> Dict[str, Any]:
        """Get all configuration"""
        pass
    
    async def delete(self, key: str) -> bool:
        """Delete configuration"""
        pass
```

### AI Interfaces (`az_os.ai.interfaces`)

```python
from typing import Dict, Any, List, Optional, AsyncIterator

class LiteLLMClient:
    async def generate(
        self,
        prompt: str,
        model: str,
        temperature: float = 0.7,
        max_tokens: int = 2048,
        tools: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Generate text using LiteLLM"""
        pass
    
    async def chat(
        self,
        messages: List[Dict[str, Any]],
        model: str,
        temperature: float = 0.7,
        max_tokens: int = 2048,
        tools: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Chat completion using LiteLLM"""
        pass
    
    async def stream_generate(
        self,
        prompt: str,
        model: str,
        temperature: float = 0.7,
        max_tokens: int = 2048,
        tools: Optional[List[str]] = None,
    ) -> AsyncIterator[str]:
        """Stream text generation"""
        pass

class MCPClient:
    async def call_tool(
        self,
        tool_name: str,
        arguments: Dict[str, Any],
        timeout: Optional[float] = None,
    ) -> Dict[str, Any]:
        """Call MCP tool"""
        pass
    
    async def list_tools(self) -> List[Dict[str, Any]]:
        """List available MCP tools"""
        pass
    
    async def get_tool_info(self, tool_name: str) -> Optional[Dict[str, Any]]:
        """Get tool information"""
        pass

class ReActEngine:
    async def execute_react(
        self,
        task: Task,
        initial_thought: str,
    ) -> Task:
        """Execute complete ReAct loop"""
        pass
    
    async def reason(
        self,
        task: Task,
        observation: str,
    ) -> str:
        """Generate reasoning"""
        pass
    
    async def act(
        self,
        task: Task,
        action: str,
        arguments: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Execute action"""
        pass
    
    async def observe(
        self,
        task: Task,
        result: Dict[str, Any],
    ) -> str:
        """Generate observation"""
        pass

class RoutingEngine:
    async def get_optimal_provider(
        self,
        task: Task,
        estimated_tokens: int,
    ) -> str:
        """Get optimal provider based on routing rules"""
        pass
    
    async def execute_with_routing(
        self,
        task: Task,
        prompt: str,
        estimated_tokens: int,
    ) -> Dict[str, Any]:
        """Execute with automatic routing"""
        pass
    
    async def update_routing_rules(
        self,
        new_rules: List[Dict[str, Any]],
    ) -> None:
        """Update routing rules dynamically"""
        pass
```

### Data Interfaces (`az_os.data.interfaces`)

```python
from typing import AsyncIterator, Optional, List, Dict, Any
from datetime import datetime

class SQLiteRepository:
    async def execute(self, query: str, params: Optional[Dict] = None) -> Any:
        """Execute SQL query"""
        pass
    
    async def fetch_all(self, query: str, params: Optional[Dict] = None) -> List[Dict]:
        """Fetch all results"""
        pass
    
    async def fetch_one(self, query: str, params: Optional[Dict] = None) -> Optional[Dict]:
        """Fetch single result"""
        pass
    
    async def insert(self, table: str, data: Dict[str, Any]) -> int:
        """Insert data into table"""
        pass
    
    async def update(self, table: str, data: Dict[str, Any], where: str, params: Dict) -> int:
        """Update data in table"""
        pass
    
    async def delete(self, table: str, where: str, params: Dict) -> int:
        """Delete data from table"""
        pass

class ChromaDBRepository:
    async def add_documents(
        self,
        collection: str,
        documents: List[Dict[str, Any]],
        metadatas: Optional[List[Dict[str, Any]]] = None,
    ) -> List[str]:
        """Add documents to collection"""
        pass
    
    async def search(
        self,
        collection: str,
        query: str,
        n_results: int = 5,
        where: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Search documents"""
        pass
    
    async def get_document(self, collection: str, doc_id: str) -> Optional[Dict[str, Any]]:
        """Get document by ID"""
        pass
    
    async def delete_document(self, collection: str, doc_id: str) -> bool:
        """Delete document"""
        pass

class GitRepository:
    async def init(self, path: str) -> bool:
        """Initialize git repository"""
        pass
    
    async def commit(
        self,
        message: str,
        files: Optional[List[str]] = None,
    ) -> str:
        """Create git commit"""
        pass
    
    async def checkout(self, branch: str) -> bool:
        """Checkout branch"""
        pass
    
    async def create_branch(self, branch: str) -> bool:
        """Create new branch"""
        pass
    
    async def get_log(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get commit log"""
        pass
```

---

## 🔧 MCP TOOL DEFINITIONS

### MCP Tool Schema

```python
from typing import Dict, Any, List, Optional, Union
from pydantic import BaseModel, Field

class ToolArgument(BaseModel):
    name: str = Field(..., description="Argument name")
    type: str = Field(..., description="Argument type (string, number, boolean, array, object)")
    description: str = Field(..., description="Argument description")
    required: bool = Field(True, description="Whether argument is required")
    default: Optional[Any] = Field(None, description="Default value")
    
class MCPTool(BaseModel):
    name: str = Field(..., description="Tool name")
    description: str = Field(..., description="Tool description")
    arguments: List[ToolArgument] = Field(default_factory=list, description="Tool arguments")
    returns: str = Field(..., description="Return type")
    category: str = Field("general", description="Tool category")
    
class MCPToolResult(BaseModel):
    success: bool = Field(..., description="Whether tool execution succeeded")
    result: Optional[Any] = Field(None, description="Tool execution result")
    error: Optional[str] = Field(None, description="Error message if failed")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")
```

### Built-in MCP Tools

#### Filesystem Tools
```python
filesystem_list = MCPTool(
    name="filesystem.list",
    description="List files and directories",
    arguments=[
        ToolArgument(name="path", type="string", description="Directory path", required=True),
        ToolArgument(name="recursive", type="boolean", description="List recursively", required=False, default=False),
        ToolArgument(name="include_hidden", type="boolean", description="Include hidden files", required=False, default=False),
    ],
    returns="array",
    category="filesystem"
)

filesystem_read = MCPTool(
    name="filesystem.read",
    description="Read file contents",
    arguments=[
        ToolArgument(name="path", type="string", description="File path", required=True),
        ToolArgument(name="encoding", type="string", description="File encoding", required=False, default="utf-8"),
    ],
    returns="string",
    category="filesystem"
)

filesystem_write = MCPTool(
    name="filesystem.write",
    description="Write to file",
    arguments=[
        ToolArgument(name="path", type="string", description="File path", required=True),
        ToolArgument(name="content", type="string", description="File content", required=True),
        ToolArgument(name="encoding", type="string", description="File encoding", required=False, default="utf-8"),
        ToolArgument(name="append", type="boolean", description="Append to file", required=False, default=False),
    ],
    returns="boolean",
    category="filesystem"
)
```

#### Shell Tools
```python
shell_execute = MCPTool(
    name="shell.execute",
    description="Execute shell command",
    arguments=[
        ToolArgument(name="command", type="string", description="Shell command", required=True),
        ToolArgument(name="timeout", type="number", description="Command timeout in seconds", required=False),
        ToolArgument(name="env", type="object", description="Environment variables", required=False),
    ],
    returns="object",
    category="shell"
)

process_list = MCPTool(
    name="process.list",
    description="List running processes",
    arguments=[
        ToolArgument(name="filter", type="string", description="Process name filter", required=False),
        ToolArgument(name="user", type="string", description="User filter", required=False),
    ],
    returns="array",
    category="system"
)
```

#### AI Tools
```python
aichat_complete = MCPTool(
    name="aichat.complete",
    description="Generate text completion",
    arguments=[
        ToolArgument(name="prompt", type="string", description="Input prompt", required=True),
        ToolArgument(name="model", type="string", description="Model name", required=False),
        ToolArgument(name="temperature", type="number", description="Sampling temperature", required=False, default=0.7),
        ToolArgument(name="max_tokens", type="number", description="Maximum tokens", required=False, default=2048),
    ],
    returns="string",
    category="ai"
)

semantic_search = MCPTool(
    name="semantic.search",
    description="Semantic document search",
    arguments=[
        ToolArgument(name="query", type="string", description="Search query", required=True),
        ToolArgument(name="collection", type="string", description="Collection name", required=False),
        ToolArgument(name="n_results", type="number", description="Number of results", required=False, default=5),
    ],
    returns="array",
    category="ai"
)
```

---

## 🔌 LITELLM INTEGRATION POINTS

### LiteLLM Configuration

```python
from typing import Dict, List, Optional

class LiteLLMConfig:
    def __init__(
        self,
        providers: List[Dict[str, Any]],
        default_provider: str = "claude",
        routing_rules: Optional[List[Dict[str, Any]]] = None,
        cost_tracking: bool = True,
        fallback_enabled: bool = True,
    ):
        self.providers = providers
        self.default_provider = default_provider
        self.routing_rules = routing_rules or []
        self.cost_tracking = cost_tracking
        self.fallback_enabled = fallback_enabled
```

### Provider Configuration

```python
lite_llm_providers = [
    {
        "name": "claude",
        "provider": "anthropic",
        "api_key": "sk-ant-...",
        "model": "claude-3-sonnet-20240229",
        "cost_per_token": 0.0005,
        "max_tokens": 4096,
        "features": ["chat", "tools", "streaming"]
    },
    {
        "name": "gemini",
        "provider": "google",
        "api_key": "AIza...",
        "model": "gemini-1.5-flash",
        "cost_per_token": 0.0003,
        "max_tokens": 8192,
        "features": ["chat", "tools", "function_calling"]
    },
    {
        "name": "deepseek",
        "provider": "deepseek",
        "api_key": "sk-deepseek-...",
        "model": "deepseek-coder",
        "cost_per_token": 0.0001,
        "max_tokens": 16384,
        "features": ["chat", "code_generation", "reasoning"]
    },
    {
        "name": "gpt4",
        "provider": "openai",
        "api_key": "sk-openai-...",
        "model": "gpt-4-turbo",
        "cost_per_token": 0.003,
        "max_tokens": 4096,
        "features": ["chat", "tools", "vision"]
    }
]
```

### Routing Rules

```python
lite_llm_routing_rules = [
    {
        "condition": "tokens < 500",
        "provider": "deepseek",
        "reason": "Free model for simple tasks"
    },
    {
        "condition": "complexity == 'code' and tokens < 2000",
        "provider": "gemini",
        "reason": "Fast code generation"
    },
    {
        "condition": "complexity == 'reasoning' and tokens < 1000",
        "provider": "claude",
        "reason": "Best reasoning capabilities"
    },
    {
        "condition": "tokens >= 2000",
        "provider": "gpt4",
        "reason": "High quality for long tasks"
    },
    {
        "condition": "fallback",
        "provider": "deepseek",
        "reason": "Always have fallback"
    }
]
```

### Integration Points

```python
class LiteLLMIntegration:
    async def get_optimal_provider(
        self,
        task: Task,
        estimated_tokens: int,
    ) -> str:
        """Get optimal provider based on routing rules"""
        pass
    
    async def execute_with_routing(
        self,
        task: Task,
        prompt: str,
        estimated_tokens: int,
    ) -> Dict[str, Any]:
        """Execute with automatic routing"""
        pass
    
    async def track_cost(
        self,
        task_id: str,
        provider: str,
        tokens_used: int,
        cost: float,
    ) -> None:
        """Track cost for routing decisions"""
        pass
    
    async def update_routing_rules(
        self,
        new_rules: List[Dict[str, Any]],
    ) -> None:
        """Update routing rules dynamically"""
        pass
```

---

## 📊 API METRICS & MONITORING

### API Performance Metrics
- **Latency**: Command execution time
- **Throughput**: Requests per second
- **Error Rate**: API error percentage
- **Cost**: Cost per API call

### Monitoring Endpoints
```bash
# API health check
GET /api/health

# API metrics
GET /api/metrics

# Cost tracking
GET /api/cost

# Tool usage
GET /api/tools/usage

# Performance stats
GET /api/performance
```

---

## 🔄 API VERSIONING

### Version Strategy
- **Semantic Versioning**: MAJOR.MINOR.PATCH
- **Backward Compatibility**: Maintained within major versions
- **Deprecation Policy**: 3-month deprecation period

### API Evolution
- **v1.0.0**: Initial stable release
- **v1.x.x**: Feature additions, backward compatible
- **v2.0.0**: Breaking changes, new architecture

---

## 📋 ACCEPTANCE CRITERIA

### Functional Requirements
- [ ] CLI commands follow `az <command> <subcommand> [options]` pattern
- [ ] Python API interfaces are type-safe and complete
- [ ] MCP tools follow standardized schema
- [ ] LiteLLM integration supports 4+ providers
- [ ] Routing rules are configurable and dynamic

### Non-Functional Requirements
- [ ] API latency <100ms for simple commands
- [ ] Error handling with descriptive messages
- [ ] Documentation for all endpoints and tools
- [ ] Backward compatibility within major versions
- [ ] Security patterns implemented (input validation, auth)

### Performance Requirements
- [ ] Cost tracking accuracy within 5%
- [ ] Tool execution time <500ms
- [ ] API response time <100ms
- [ ] Concurrent requests: 100+ active
- [ ] Memory usage: <100MB per API instance

---

## 🔄 VERSION HISTORY

**1.0.0 (2026-02-15)**: Initial API design
- Complete CLI command structure
- Python API interfaces with type hints
- MCP tool definitions and schema
- LiteLLM integration points and routing
- Performance metrics and monitoring

---