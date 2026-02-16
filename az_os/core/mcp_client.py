import asyncio
import logging
from typing import Any, Dict, List, Optional, Union
from datetime import datetime
from enum import Enum

import httpx
from pydantic import BaseModel, Field

from az_os.core.interfaces import ToolClient, ToolResponse
from az_os.data.models import Task, TaskStatus
from az_os.data.sqlite_repository import SQLiteRepository

logger = logging.getLogger(__name__)


class MCPTool(BaseModel):
    name: str
    description: str
    inputs: Dict[str, Any]
    outputs: Dict[str, Any]


class MCPClient(ToolClient):
    def __init__(self, mcp_server_url: str = "http://localhost:3000"):
        self.mcp_server_url = mcp_server_url
        self.session = httpx.AsyncClient(timeout=30.0)
        self.tools: Dict[str, MCPTool] = {}
        self.tool_cache: Dict[str, Any] = {}
        self.repository: SQLiteRepository = SQLiteRepository()

    async def connect(self) -> bool:
        """Connect to MCP server and discover tools"""
        try:
            response = await self.session.get(f"{self.mcp_server_url}/tools")
            response.raise_for_status()
            tools_data = response.json()
            
            for tool_data in tools_data:
                tool = MCPTool(**tool_data)
                self.tools[tool.name] = tool
                logger.info(f"Discovered MCP tool: {tool.name}")
            
            return True
        except Exception as e:
            logger.error(f"Failed to connect to MCP server: {e}")
            return False

    async def list_tools(self) -> List[Dict[str, Any]]:
        """List available MCP tools"""
        return [{
            "name": tool.name,
            "description": tool.description,
            "inputs": tool.inputs,
            "outputs": tool.outputs
        } for tool in self.tools.values()]

    async def execute_tool(self, tool_name: str, inputs: Dict[str, Any]) -> ToolResponse:
        """Execute a tool via MCP protocol"""
        if tool_name not in self.tools:
            raise ValueError(f"Tool '{tool_name}' not found")
        
        tool = self.tools[tool_name]
        task_id = f"mcp-{tool_name}-{datetime.now().isoformat()}"
        
        # Create task record
        task = Task(
            id=task_id,
            command=f"MCP: {tool_name}",
            status=TaskStatus.RUNNING,
            created_at=datetime.now(),
            started_at=datetime.now()
        )
        await self.repository.create_task(task)
        
        try:
            # Execute tool
            response = await self.session.post(
                f"{self.mcp_server_url}/tools/{tool_name}",
                json=inputs
            )
            response.raise_for_status()
            
            result = response.json()
            
            # Update task as completed
            task.status = TaskStatus.COMPLETED
            task.completed_at = datetime.now()
            await self.repository.update_task(task)
            
            return ToolResponse(
                success=True,
                result=result,
                tool=tool_name,
                task_id=task_id
            )
            
        except Exception as e:
            # Update task as failed
            task.status = TaskStatus.FAILED
            task.completed_at = datetime.now()
            await self.repository.update_task(task)
            
            logger.error(f"MCP tool execution failed: {e}")
            return ToolResponse(
                success=False,
                error=str(e),
                tool=tool_name,
                task_id=task_id
            )

    async def execute_shell_command(self, command: str) -> ToolResponse:
        """Execute shell command via MCP filesystem tool"""
        return await self.execute_tool("shell.execute", {"command": command})

    async def read_file(self, file_path: str) -> ToolResponse:
        """Read file contents via MCP filesystem tool"""
        return await self.execute_tool("filesystem.read", {"path": file_path})

    async def write_file(self, file_path: str, content: str) -> ToolResponse:
        """Write content to file via MCP filesystem tool"""
        return await self.execute_tool("filesystem.write", {"path": file_path, "content": content})

    async def list_directory(self, directory_path: str) -> ToolResponse:
        """List directory contents via MCP filesystem tool"""
        return await self.execute_tool("filesystem.list", {"path": directory_path})

    async def create_directory(self, directory_path: str) -> ToolResponse:
        """Create directory via MCP filesystem tool"""
        return await self.execute_tool("filesystem.create", {"path": directory_path, "type": "directory"})

    async def delete_file(self, file_path: str) -> ToolResponse:
        """Delete file via MCP filesystem tool"""
        return await self.execute_tool("filesystem.delete", {"path": file_path})

    async def close(self) -> None:
        """Close MCP client connection"""
        await self.session.aclose()


# CLI Commands
async def tools_list() -> None:
    """List available MCP tools"""
    from az_os.cli import app
    
    mcp_client = MCPClient()
    await mcp_client.connect()
    
    tools = await mcp_client.list_tools()
    
    from rich.console import Console
    from rich.table import Table
    
    console = Console()
    table = Table(title="MCP Tools")
    table.add_column("Name", style="cyan", no_wrap=True)
    table.add_column("Description", style="magenta")
    table.add_column("Inputs", style="green")
    table.add_column("Outputs", style="yellow")
    
    for tool in tools:
        table.add_row(
            tool["name"],
            tool["description"],
            str(tool["inputs"]),
            str(tool["outputs"])
        )
    
    console.print(table)


async def tools_info(tool_name: str) -> None:
    """Get detailed information about a specific MCP tool"""
    from az_os.cli import app
    
    mcp_client = MCPClient()
    await mcp_client.connect()
    
    tools = await mcp_client.list_tools()
    tool = next((t for t in tools if t["name"] == tool_name), None)
    
    if not tool:
        print(f"Tool '{tool_name}' not found")
        return
    
    from rich.console import Console
    from rich.panel import Panel
    
    console = Console()
    console.print(Panel(
        f"[bold]Name:[/] {tool['name']}\n" 
        f"[bold]Description:[/] {tool['description']}\n"
        f"[bold]Inputs:[/] {tool['inputs']}\n"
        f"[bold]Outputs:[/] {tool['outputs']}",
        title=f"MCP Tool: {tool_name}"
    ))


# Register CLI commands
async def register_mcp_commands() -> None:
    from az_os.cli import app
    
    @app.command()
    async def tools_list():
        """List available MCP tools"""
        await az_os.core.mcp_client.tools_list()
    
    @app.command()
    async def tools_info(tool_name: str):
        """Get detailed information about a specific MCP tool"""
        await az_os.core.mcp_client.tools_info(tool_name)