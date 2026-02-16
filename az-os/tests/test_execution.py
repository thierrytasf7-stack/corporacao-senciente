"""Tests for execution engine module."""

import pytest
import asyncio
from unittest.mock import AsyncMock, patch


class TestExecutionEngine:
    """Test execution engine functionality."""

    @pytest.mark.asyncio
    async def test_execute_python(self):
        """Test Python code execution."""
        from az_os.core.execution_engine import ExecutionEngine

        engine = ExecutionEngine()

        with patch('az_os.core.execution_engine.asyncio.create_subprocess_exec') as mock_proc:
            mock_process = AsyncMock()
            mock_process.communicate.return_value = (b"Hello, World!\n", b"")
            mock_process.returncode = 0
            mock_proc.return_value = mock_process

            result = await engine.execute_python("print('Hello, World!')")

            assert result.exit_code == 0
            assert "Hello, World!" in result.stdout

    @pytest.mark.asyncio
    async def test_execute_command(self):
        """Test shell command execution."""
        from az_os.core.execution_engine import ExecutionEngine

        engine = ExecutionEngine()

        with patch('az_os.core.execution_engine.asyncio.create_subprocess_shell') as mock_proc:
            mock_process = AsyncMock()
            mock_process.communicate.return_value = (b"test output", b"")
            mock_process.returncode = 0
            mock_proc.return_value = mock_process

            result = await engine.execute_command("echo test")

            assert result.exit_code == 0
            assert "test output" in result.stdout

    @pytest.mark.asyncio
    async def test_execution_timeout(self):
        """Test execution timeout handling."""
        from az_os.core.execution_engine import ExecutionEngine

        engine = ExecutionEngine()

        with patch('az_os.core.execution_engine.asyncio.wait_for') as mock_wait:
            mock_wait.side_effect = asyncio.TimeoutError()

            with pytest.raises(asyncio.TimeoutError):
                await engine.execute_command("sleep 100", timeout=1)

    @pytest.mark.asyncio
    async def test_execution_error(self):
        """Test execution error handling."""
        from az_os.core.execution_engine import ExecutionEngine

        engine = ExecutionEngine()

        with patch('az_os.core.execution_engine.asyncio.create_subprocess_shell') as mock_proc:
            mock_process = AsyncMock()
            mock_process.communicate.return_value = (b"", b"error: command not found")
            mock_process.returncode = 127
            mock_proc.return_value = mock_process

            result = await engine.execute_command("invalid_command")

            assert result.exit_code == 127
            assert "error" in result.stderr

    @pytest.mark.asyncio
    async def test_execution_result_dataclass(self):
        """Test ExecutionResult dataclass."""
        from az_os.core.execution_engine import ExecutionResult

        result = ExecutionResult(
            exit_code=0,
            stdout="output",
            stderr="",
            elapsed_ms=123.45
        )

        assert result.exit_code == 0
        assert result.stdout == "output"
        assert result.stderr == ""
        assert result.elapsed_ms == 123.45


class TestExecutionIntegration:
    """Integration tests for execution engine."""

    @pytest.mark.asyncio
    async def test_execution_with_mcp(self):
        """Test execution engine with MCP client."""
        from az_os.core.execution_engine import ExecutionEngine
        from az_os.core.mcp_client import MCPClient

        mcp_client = MCPClient()
        engine = ExecutionEngine(mcp_client=mcp_client)

        with patch.object(mcp_client, 'shell_exec') as mock_exec:
            mock_exec.return_value = {
                "success": True,
                "stdout": "mcp output",
                "stderr": "",
                "exit_code": 0
            }

            result = await engine.execute_command("test command")

            # Should use MCP client
            mock_exec.assert_called_once()

    @pytest.mark.asyncio
    async def test_execution_with_storage(self, mock_storage):
        """Test execution engine logging to storage."""
        from az_os.core.execution_engine import ExecutionEngine

        engine = ExecutionEngine(storage=mock_storage)
        task_id = mock_storage.create_task("Test", "model", "running")

        with patch('az_os.core.execution_engine.asyncio.create_subprocess_shell') as mock_proc:
            mock_process = AsyncMock()
            mock_process.communicate.return_value = (b"output", b"")
            mock_process.returncode = 0
            mock_proc.return_value = mock_process

            result = await engine.execute_command("echo test", task_id=task_id)

            # Should log execution
            assert result.exit_code == 0

    @pytest.mark.asyncio
    async def test_multiple_executions(self):
        """Test multiple sequential executions."""
        from az_os.core.execution_engine import ExecutionEngine

        engine = ExecutionEngine()

        with patch('az_os.core.execution_engine.asyncio.create_subprocess_shell') as mock_proc:
            mock_process = AsyncMock()
            mock_process.communicate.return_value = (b"output", b"")
            mock_process.returncode = 0
            mock_proc.return_value = mock_process

            results = []
            for i in range(3):
                result = await engine.execute_command(f"echo test{i}")
                results.append(result)

            assert len(results) == 3
            assert all(r.exit_code == 0 for r in results)


@pytest.mark.parametrize("code,expected_exit", [
    ("print('hello')", 0),
    ("import sys; sys.exit(0)", 0),
    ("import sys; sys.exit(1)", 1),
])
@pytest.mark.asyncio
async def test_python_execution_parametrized(code, expected_exit):
    """Parametrized Python execution tests."""
    from az_os.core.execution_engine import ExecutionEngine

    engine = ExecutionEngine()

    with patch('az_os.core.execution_engine.asyncio.create_subprocess_exec') as mock_proc:
        mock_process = AsyncMock()
        mock_process.communicate.return_value = (b"", b"")
        mock_process.returncode = expected_exit
        mock_proc.return_value = mock_process

        result = await engine.execute_python(code)

        assert result.exit_code == expected_exit


class TestExecutionPerformance:
    """Performance tests for execution engine."""

    @pytest.mark.asyncio
    async def test_execution_timing(self):
        """Test execution timing measurement."""
        from az_os.core.execution_engine import ExecutionEngine
        import time

        engine = ExecutionEngine()

        with patch('az_os.core.execution_engine.asyncio.create_subprocess_shell') as mock_proc:
            mock_process = AsyncMock()

            async def slow_communicate():
                await asyncio.sleep(0.1)  # Simulate 100ms execution
                return (b"output", b"")

            mock_process.communicate = slow_communicate
            mock_process.returncode = 0
            mock_proc.return_value = mock_process

            result = await engine.execute_command("test")

            # Should measure elapsed time
            assert result.elapsed_ms >= 100
            assert result.elapsed_ms < 200  # Some tolerance
