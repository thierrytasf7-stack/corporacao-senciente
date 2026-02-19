"""Task execution engine for AZ-OS."""
import asyncio
import time
from dataclasses import dataclass
from typing import Optional, Dict, Any
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

    def create_task(self, command: str, model: str = None, priority: str = "medium") -> Dict[str, Any]:
        """Create a task record."""
        import uuid
        task_id = str(uuid.uuid4())[:8]
        return {
            "id": task_id,
            "command": command,
            "model": model,
            "priority": priority,
            "status": "pending"
        }

    def list_tasks(self, status=None, priority=None, limit=20, offset=0):
        """List tasks (stub)."""
        return []

    def pause_task(self, task_id: str):
        """Pause a task (stub)."""
        return True

    def execute_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a task using the LLM client."""
        if not self.llm_client:
            return {"status": "error", "message": "LLM client not initialized"}
        
        # Run the async generation in the current event loop or a new one
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

        if loop.is_running():
            # If we are inside an existing loop (unlikely for this CLI but possible)
            # we would need a different approach, but for Typer/CLI it's usually fine.
            import threading
            from queue import Queue
            
            q = Queue()
            def run_in_thread():
                new_loop = asyncio.new_event_loop()
                asyncio.set_event_loop(new_loop)
                res = new_loop.run_until_complete(self.llm_client.generate_text(task["command"]))
                q.put(res)
            
            t = threading.Thread(target=run_in_thread)
            t.start()
            t.join()
            response = q.get()
        else:
            response = loop.run_until_complete(self.llm_client.generate_text(task["command"]))
            
        # Extract content from response (LiteLLM format)
        try:
            content = response.choices[0].message.content
        except:
            content = str(response)

        return {"status": "success", "response": content}
