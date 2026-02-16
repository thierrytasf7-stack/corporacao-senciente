import asyncio
import unittest
from unittest.mock import Mock, patch
from datetime import datetime
from pathlib import Path

from az_os.core.execution_engine import (
    CommandExecutionEngine,
    ExecutionResult,
    ExecutionConfig,
    ExecutionStatus,
    PythonExecutor,
    BashExecutor,
    NodeExecutor,
    ExecutorFactory
)


class TestCommandExecutionEngine(unittest.IsolatedAsyncioTestCase):
    async def test_python_execution_success(self):
        """Test successful Python execution"""
        engine = CommandExecutionEngine()
        python_executor = PythonExecutor(engine)
        
        result = await python_executor.execute('print(1+1)')
        
        self.assertEqual(result.exit_code, 0)
        self.assertEqual(result.status, ExecutionStatus.COMPLETED)
        self.assertIn("2", result.stdout)
        self.assertEqual(result.stderr, "")
        self.assertGreater(result.duration, 0)
        
    async def test_bash_execution_success(self):
        """Test successful Bash execution"""
        engine = CommandExecutionEngine()
        bash_executor = BashExecutor(engine)
        
        result = await bash_executor.execute('echo hello')
        
        self.assertEqual(result.exit_code, 0)
        self.assertEqual(result.status, ExecutionStatus.COMPLETED)
        self.assertIn("hello", result.stdout)
        self.assertEqual(result.stderr, "")
        self.assertGreater(result.duration, 0)
        
    async def test_node_execution_success(self):
        """Test successful Node.js execution"""
        engine = CommandExecutionEngine()
        node_executor = NodeExecutor(engine)
        
        result = await node_executor.execute('console.log("test")')
        
        self.assertEqual(result.exit_code, 0)
        self.assertEqual(result.status, ExecutionStatus.COMPLETED)
        self.assertIn("test", result.stdout)
        self.assertEqual(result.stderr, "")
        self.assertGreater(result.duration, 0)
        
    async def test_python_execution_failure(self):
        """Test Python execution with error"""
        engine = CommandExecutionEngine()
        python_executor = PythonExecutor(engine)
        
        result = await python_executor.execute('raise ValueError("test error")')
        
        self.assertNotEqual(result.exit_code, 0)
        self.assertEqual(result.status, ExecutionStatus.FAILED)
        self.assertIn("Traceback", result.stderr)
        self.assertGreater(result.duration, 0)
        
    async def test_bash_execution_failure(self):
        """Test Bash execution with error"""
        engine = CommandExecutionEngine()
        bash_executor = BashExecutor(engine)
        
        result = await bash_executor.execute('false')
        
        self.assertNotEqual(result.exit_code, 0)
        self.assertEqual(result.status, ExecutionStatus.FAILED)
        self.assertEqual(result.stdout, "")
        self.assertGreater(result.duration, 0)
        
    async def test_timeout_handling(self):
        """Test command timeout"""
        engine = CommandExecutionEngine(ExecutionConfig(timeout=1))
        bash_executor = BashExecutor(engine)
        
        result = await bash_executor.execute('sleep 2')
        
        self.assertEqual(result.exit_code, -9)
        self.assertEqual(result.status, ExecutionStatus.TIMED_OUT)
        self.assertIn("timed out", result.stderr.lower())
        self.assertGreaterEqual(result.duration, 1)
        
    async def test_working_directory(self):
        """Test execution in specific working directory"""
        engine = CommandExecutionEngine()
        bash_executor = BashExecutor(engine)
        
        # Create a test directory
        test_dir = Path("test_dir")
        test_dir.mkdir(exist_ok=True)
        
        try:
            # Create a file in the test directory
            (test_dir / "test_file.txt").write_text("test content")
            
            # Execute command in that directory
            result = await bash_executor.execute(
                'cat test_file.txt',
                ExecutionConfig(working_directory=str(test_dir))
            )
            
            self.assertEqual(result.exit_code, 0)
            self.assertIn("test content", result.stdout)
            
        finally:
            # Clean up
            for f in test_dir.glob("*"):
                f.unlink()
            test_dir.rmdir()
            
    async def test_stream_output(self):
        """Test streaming output"""
        engine = CommandExecutionEngine(ExecutionConfig(stream_output=True))
        bash_executor = BashExecutor(engine)
        
        result = await bash_executor.execute('echo line1 && echo line2')
        
        self.assertEqual(result.exit_code, 0)
        self.assertIn("line1", result.stdout)
        self.assertIn("line2", result.stdout)
        self.assertEqual(result.stderr, "")
        
    async def test_signal_handling(self):
        """Test signal handling (SIGTERM)"""
        engine = CommandExecutionEngine()
        bash_executor = BashExecutor(engine)
        
        # Test that process can be terminated
        process = await asyncio.create_subprocess_shell(
            'sleep 10',
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        await asyncio.sleep(0.1)
        process.terminate()
        
        await asyncio.wait_for(process.wait(), timeout=2)
        
        self.assertIsNotNone(process.returncode)
        


class TestExecutorFactory(unittest.TestCase):
    def test_get_python_executor(self):
        """Test getting Python executor"""
        engine = CommandExecutionEngine()
        executor = ExecutorFactory.get_executor("python", engine)
        
        self.assertIsInstance(executor, PythonExecutor)
        
    def test_get_bash_executor(self):
        """Test getting Bash executor"""
        engine = CommandExecutionEngine()
        executor = ExecutorFactory.get_executor("bash", engine)
        
        self.assertIsInstance(executor, BashExecutor)
        
    def test_get_node_executor(self):
        """Test getting Node.js executor"""
        engine = CommandExecutionEngine()
        executor = ExecutorFactory.get_executor("node", engine)
        
        self.assertIsInstance(executor, NodeExecutor)
        
    def test_get_invalid_executor(self):
        """Test getting invalid executor"""
        engine = CommandExecutionEngine()
        
        with self.assertRaises(ValueError):
            ExecutorFactory.get_executor("invalid", engine)


if __name__ == '__main__':
    unittest.main()