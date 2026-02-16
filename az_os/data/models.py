from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class Task(BaseModel):
    id: str = Field(..., description="Unique task identifier")
    command: str = Field(..., description="Command to execute")
    status: str = Field(default="initialized", description="Task status")
    priority: str = Field(default="medium", description="Task priority")
    model: Optional[str] = Field(default=None, description="AI model to use")
    cost: float = Field(default=0.0, description="Execution cost in USD")
    estimated_tokens: int = Field(default=0, description="Estimated token count")
    actual_tokens: int = Field(default=0, description="Actual token count")
    created_at: Optional[datetime] = Field(default=None, description="Creation timestamp")
    started_at: Optional[datetime] = Field(default=None, description="Start timestamp")
    completed_at: Optional[datetime] = Field(default=None, description="Completion timestamp")
    updated_at: Optional[datetime] = Field(default=None, description="Last update timestamp")
    parent_task_id: Optional[str] = Field(default=None, description="Parent task ID for sub-tasks")


class Cost(BaseModel):
    id: str = Field(..., description="Unique cost identifier")
    task_id: str = Field(..., description="Associated task ID")
    tokens: int = Field(..., description="Number of tokens")
    model: str = Field(..., description="AI model used")
    provider: str = Field(..., description="Provider name")
    cost: float = Field(..., description="Cost in USD")
    timestamp: datetime = Field(default_factory=datetime.now, description="Cost recording timestamp")


class Budget(BaseModel):
    amount: float = Field(..., description="Budget amount in USD")
    alert_percentage: float = Field(default=80.0, description="Alert threshold percentage")
    last_checked: Optional[datetime] = Field(default=None, description="Last budget check timestamp")


class ModelPricing(BaseModel):
    model: str = Field(..., description="Model name")
    provider: str = Field(..., description="Provider name")
    input_cost: float = Field(..., description="Input token cost per 1K tokens")
    output_cost: float = Field(default=0.0, description="Output token cost per 1K tokens")
    cache_cost: float = Field(default=0.0, description="Cache token cost per 1K tokens")
    updated_at: datetime = Field(default_factory=datetime.now, description="Pricing update timestamp")


class Tool(BaseModel):
    name: str = Field(..., description="Tool name")
    description: str = Field(..., description="Tool description")
    inputs: dict = Field(default_factory=dict, description="Input schema")
    outputs: dict = Field(default_factory=dict, description="Output schema")
    category: str = Field(default="general", description="Tool category")
    enabled: bool = Field(default=True, description="Whether tool is enabled")


class ExecutionLog(BaseModel):
    id: str = Field(..., description="Unique log identifier")
    task_id: str = Field(..., description="Associated task ID")
    level: str = Field(default="INFO", description="Log level")
    message: str = Field(..., description="Log message")
    timestamp: datetime = Field(default_factory=datetime.now, description="Log timestamp")
    metadata: dict = Field(default_factory=dict, description="Additional log metadata")


class StateSnapshot(BaseModel):
    id: str = Field(..., description="Unique snapshot identifier")
    task_id: str = Field(..., description="Associated task ID")
    data: dict = Field(..., description="Snapshot data")
    timestamp: datetime = Field(default_factory=datetime.now, description="Snapshot timestamp")
    description: Optional[str] = Field(default=None, description="Snapshot description")


class Config(BaseModel):
    database_url: str = Field(default="sqlite:///az_os.db", description="Database connection URL")
    log_level: str = Field(default="INFO", description="Logging level")
    cost_enabled: bool = Field(default=True, description="Whether cost tracking is enabled")
    budget_amount: float = Field(default=100.0, description="Default budget amount")
    budget_alert_percentage: float = Field(default=80.0, description="Default budget alert percentage")


# Pydantic model for tool discovery response
class ToolDiscoveryResponse(BaseModel):
    tools: List[Tool] = Field(default_factory=list, description="List of available tools")
    timestamp: datetime = Field(default_factory=datetime.now, description="Discovery timestamp")
    total_tools: int = Field(default=0, description="Total number of tools discovered")