"""Task execution engine for AZ-OS."""
import asyncio
import subprocess
from dataclasses import dataclass
from typing import Optional
from pathlib import Path


@dataclass
class ExecutionResult:
    """Result of a task execution."""
    exit_code: int
    stdout: str
    stderr: str
    elapsed_ms: float


class ExecutionEngine:
    """Execute commands and manage task lifecycle."""

    def __init__(self, db=None, llm_client=None):
        """Initialize execution engine."""
        self.db = db
        self.llm_client = llm_client

    async def execute(
        self,
        command: str,
        timeout: int = 30,
        cwd: Optional[Path] = None,
    ) -> ExecutionResult:
        """Execute a command and return result."""
        import time
        start = time.time()

        try:
            result = await asyncio.wait_for(
                asyncio.create_subprocess_shell(
                    command,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                    cwd=cwd,
                ),
                timeout=timeout,
            )
            stdout_data, stderr_data = await result.communicate()
            elapsed_ms = (time.time() - start) * 1000

            return ExecutionResult(
                exit_code=result.returncode,
                stdout=stdout_data.decode('utf-8', errors='replace'),
                stderr=stderr_data.decode('utf-8', errors='replace'),
                elapsed_ms=elapsed_ms,
            )
        except asyncio.TimeoutError:
            elapsed_ms = (time.time() - start) * 1000
            return ExecutionResult(
                exit_code=124,  # timeout exit code
                stdout="",
                stderr=f"Command timed out after {timeout}s",
                elapsed_ms=elapsed_ms,
            )
        except Exception as e:
            elapsed_ms = (time.time() - start) * 1000
            return ExecutionResult(
                exit_code=1,
                stdout="",
                stderr=str(e),
                elapsed_ms=elapsed_ms,
            )

    def create_task(self, command: str, model: str = None, priority: str = "medium"):
        """Create a task record (stub)."""
        return {"command": command, "model": model, "priority": priority}

    def list_tasks(self, status=None, priority=None, limit=20, offset=0):
        """List tasks (stub)."""
        return []

    def pause_task(self, task_id: str):
        """Pause a task (stub)."""
        return True

    def execute_task(self, task):
        """Execute a task (stub)."""
        return {"status": "success"}
