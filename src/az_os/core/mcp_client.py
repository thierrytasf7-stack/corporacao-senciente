from typing import Dict, Any, Optional, AsyncIterator, List
from datetime import datetime
import asyncio
import httpx
import logging
from pydantic import BaseModel, Field
from aiosqlite import Connection
from pathlib import Path

logger = logging.getLogger(__name__)


class MCPRequest(BaseModel):
    id: str = Field(..., description="Unique request identifier")
    method: str = Field(..., description="MCP method name")
    params: Dict[str, Any] = Field(default_factory=dict, description="Request parameters")


class MCPResponse(BaseModel):
    id: str = Field(..., description="Request identifier")
    result: Optional[Any] = Field(default=None, description="Response result")
    error: Optional[Dict[str, Any]] = Field(default=None, description="Error information")


class MCPClient:
    def __init__(
        self,
        base_url: str = "http://localhost:8080",
        timeout: int = 30,
        max_retries: int = 3,
        retry_delay: float = 1.0,
        db_conn: Optional[Connection] = None,
    ):
        self.base_url = base_url
        self.timeout = timeout
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        self.db_conn = db_conn
        self.client = httpx.AsyncClient(timeout=timeout)

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()

    async def close(self):
        await self.client.aclose()

    async def call(self, method: str, params: Dict[str, Any] = None) -> Any:
        """Make an MCP call with retry logic"""
        if params is None:
            params = {}
        
        request_id = str(datetime.now().timestamp())
        request = MCPRequest(id=request_id, method=method, params=params)
        
        for attempt in range(self.max_retries):
            try:
                response = await self._make_request(request)
                logger.info(f"MCP call {method} succeeded on attempt {attempt + 1}")
                return response
            except Exception as e:
                logger.warning(f"MCP call {method} failed on attempt {attempt + 1}: {e}")
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(self.retry_delay * (attempt + 1))
                else:
                    logger.error(f"MCP call {method} failed after {self.max_retries} attempts")
                    raise

    async def _make_request(self, request: MCPRequest) -> Any:
        """Make a single MCP request"""
        url = f"{self.base_url}/2026-05-01/tool"
        
        logger.debug(f"Sending MCP request: {request.json()}")
        
        response = await self.client.post(
            url,
            json=request.json(),
            timeout=self.timeout
        )
        
        response.raise_for_status()
        
        data = response.json()
        mcp_response = MCPResponse(**data)
        
        if mcp_response.error:
            logger.error(f"MCP error: {mcp_response.error}")
            raise Exception(f"MCP error: {mcp_response.error}")
        
        logger.debug(f"Received MCP response: {mcp_response.result}")
        return mcp_response.result

    # Filesystem tools
    async def read_file(self, path: str) -> str:
        """Read file contents"""
        return await self.call("filesystem.read", {"path": path})

    async def write_file(self, path: str, content: str) -> bool:
        """Write file contents"""
        return await self.call("filesystem.write", {"path": path, "content": content})

    async def list_directory(self, path: str) -> List[Dict[str, Any]]:
        """List directory contents"""
        return await self.call("filesystem.list", {"path": path})

    async def create_directory(self, path: str) -> bool:
        """Create directory"""
        return await self.call("filesystem.create_directory", {"path": path})

    async def delete_file(self, path: str) -> bool:
        """Delete file"""
        return await self.call("filesystem.delete", {"path": path})

    # Shell execution tools
    async def shell_exec(self, command: str, timeout: int = 30) -> Dict[str, Any]:
        """Execute shell command"""
        return await self.call("shell_exec.run", {"command": command, "timeout": timeout})

    async def web_fetch(self, url: str, method: str = "GET", timeout: int = 30) -> Dict[str, Any]:
        """Fetch web content"""
        return await self.call("web_fetch.fetch", {"url": url, "method": method, "timeout": timeout})


class MCPFilesystem:
    def __init__(self, mcp_client: MCPClient):
        self.client = mcp_client

    async def read(self, path: str) -> str:
        return await self.client.read_file(path)

    async def write(self, path: str, content: str) -> bool:
        return await self.client.write_file(path, content)

    async def list(self, path: str) -> List[Dict[str, Any]]:
        return await self.client.list_directory(path)

    async def create_directory(self, path: str) -> bool:
        return await self.client.create_directory(path)

    async def delete(self, path: str) -> bool:
        return await self.client.delete_file(path)


class MCPShellExecutor:
    def __init__(self, mcp_client: MCPClient):
        self.client = mcp_client

    async def execute(self, command: str, timeout: int = 30) -> Dict[str, Any]:
        return await self.client.shell_exec(command, timeout)


class MCPWebFetcher:
    def __init__(self, mcp_client: MCPClient):
        self.client = mcp_client

    async def fetch(self, url: str, method: str = "GET", timeout: int = 30) -> Dict[str, Any]:
        return await self.client.web_fetch(url, method, timeout)
