"""Tests for MCP client module."""

import pytest
import asyncio
from unittest.mock import AsyncMock, patch, MagicMock


class TestMCPClient:
    """Test MCP client functionality."""

    @pytest.mark.asyncio
    async def test_file_read(self):
        """Test file_read tool."""
        from az_os.core.mcp_client import MCPClient

        client = MCPClient()

        with patch('az_os.core.mcp_client.asyncio.create_subprocess_shell') as mock_proc:
            mock_process = AsyncMock()
            mock_process.communicate.return_value = (b"file contents", b"")
            mock_process.returncode = 0
            mock_proc.return_value = mock_process

            result = await client.file_read("test.txt")

            assert result["success"] is True
            assert "file contents" in result["stdout"]

    @pytest.mark.asyncio
    async def test_file_write(self):
        """Test file_write tool."""
        from az_os.core.mcp_client import MCPClient

        client = MCPClient()

        with patch('az_os.core.mcp_client.asyncio.create_subprocess_shell') as mock_proc:
            mock_process = AsyncMock()
            mock_process.communicate.return_value = (b"", b"")
            mock_process.returncode = 0
            mock_proc.return_value = mock_process

            result = await client.file_write("test.txt", "content")

            assert result["success"] is True

    @pytest.mark.asyncio
    async def test_shell_exec(self):
        """Test shell_exec tool."""
        from az_os.core.mcp_client import MCPClient

        client = MCPClient()

        with patch('az_os.core.mcp_client.asyncio.create_subprocess_shell') as mock_proc:
            mock_process = AsyncMock()
            mock_process.communicate.return_value = (b"command output", b"")
            mock_process.returncode = 0
            mock_proc.return_value = mock_process

            result = await client.shell_exec("ls -la")

            assert result["success"] is True
            assert result["exit_code"] == 0

    @pytest.mark.asyncio
    async def test_timeout_handling(self):
        """Test command timeout."""
        from az_os.core.mcp_client import MCPClient

        client = MCPClient()

        with patch('az_os.core.mcp_client.asyncio.create_subprocess_shell') as mock_proc:
            mock_process = AsyncMock()
            mock_process.communicate.side_effect = asyncio.TimeoutError()
            mock_proc.return_value = mock_process

            result = await client.shell_exec("sleep 100", timeout=1)

            assert result["success"] is False
            assert "timeout" in result.get("stderr", "").lower()

    @pytest.mark.asyncio
    async def test_error_handling(self):
        """Test error handling in MCP operations."""
        from az_os.core.mcp_client import MCPClient

        client = MCPClient()

        with patch('az_os.core.mcp_client.asyncio.create_subprocess_shell') as mock_proc:
            mock_process = AsyncMock()
            mock_process.communicate.return_value = (b"", b"error message")
            mock_process.returncode = 1
            mock_proc.return_value = mock_process

            result = await client.shell_exec("invalid_command")

            assert result["success"] is False
            assert result["exit_code"] == 1
            assert "error message" in result["stderr"]


class TestMCPIntegration:
    """Integration tests for MCP client."""

    @pytest.mark.asyncio
    async def test_mcp_with_execution_engine(self):
        """Test MCP client integration with execution engine."""
        from az_os.core.mcp_client import MCPClient
        from az_os.core.execution_engine import ExecutionEngine

        mcp_client = MCPClient()
        engine = ExecutionEngine(mcp_client=mcp_client)

        # Mock MCP operations
        with patch.object(mcp_client, 'shell_exec') as mock_exec:
            mock_exec.return_value = {
                "success": True,
                "stdout": "test output",
                "stderr": "",
                "exit_code": 0
            }

            result = await engine.execute_command("echo test")

            assert result.exit_code == 0

    @pytest.mark.asyncio
    async def test_multiple_mcp_operations(self):
        """Test multiple MCP operations in sequence."""
        from az_os.core.mcp_client import MCPClient

        client = MCPClient()

        with patch('az_os.core.mcp_client.asyncio.create_subprocess_shell') as mock_proc:
            mock_process = AsyncMock()
            mock_process.communicate.return_value = (b"output", b"")
            mock_process.returncode = 0
            mock_proc.return_value = mock_process

            # Multiple operations
            result1 = await client.file_read("file1.txt")
            result2 = await client.file_read("file2.txt")
            result3 = await client.shell_exec("ls")

            assert result1["success"] is True
            assert result2["success"] is True
            assert result3["success"] is True


@pytest.mark.parametrize("command,expected_success", [
    ("echo hello", True),
    ("ls -la", True),
    ("pwd", True),
])
@pytest.mark.asyncio
async def test_mcp_commands_parametrized(command, expected_success):
    """Parametrized tests for MCP commands."""
    from az_os.core.mcp_client import MCPClient

    client = MCPClient()

    with patch('az_os.core.mcp_client.asyncio.create_subprocess_shell') as mock_proc:
        mock_process = AsyncMock()
        mock_process.communicate.return_value = (b"output", b"")
        mock_process.returncode = 0
        mock_proc.return_value = mock_process

        result = await client.shell_exec(command)

        assert result["success"] == expected_success
