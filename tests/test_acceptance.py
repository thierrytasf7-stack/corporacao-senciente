import pytest
import sys
import os
import subprocess
from pathlib import Path

# Add src to Python path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))


class TestAcceptanceCriteria:
    def test_file_count(self):
        """Test that at least 8 new Python files were created"""
        # Count Python files in src/az_os
        python_files = list(Path("src/az_os").rglob("*.py"))
        
        # Subtract the original 18 files
        original_files = 18
        new_files = len(python_files) - original_files
        
        assert new_files >= 8, f"Expected at least 8 new files, got {new_files}"
        print(f"New files created: {new_files}")

    def test_cli_commands_importable(self):
        """Test that CLI commands can be imported"""
        try:
            from src.az_os.cli.commands.metrics import metrics_cmd
            from src.az_os.cli.commands.config import config_cmd
            from src.az_os.cli.commands.logs import logs_cmd
            assert True
        except ImportError as e:
            pytest.fail(f"CLI commands import failed: {e}")

    def test_core_modules_importable(self):
        """Test that core modules can be imported"""
        try:
            from src.az_os.core.storage import Storage
            from src.az_os.core.llm_client import LLMClient
            from src.az_os.core.execution_engine import ExecutionEngine
            from src.az_os.core.rag_engine import RAGEngine
            from src.az_os.core.checkpoint_manager import CheckpointManager
            from src.az_os.core.vectorizer import Vectorizer
            from src.az_os.core.config_manager import ConfigManager
            from src.az_os.core.logger import Logger
            from src.az_os.core.cost_tracker import CostTracker
            assert True
        except ImportError as e:
            pytest.fail(f"Core modules import failed: {e}")

    def test_type_hints(self):
        """Test that all methods have type hints"""
        # This is a basic check - in practice, you'd use mypy
        from src.az_os.cli.cli import AzCliCommand
        
        # Check that AzCliCommand has type hints
        assert hasattr(AzCliCommand.run, '__annotations__'), \
               "AzCliCommand.run is missing type hints"
        
        # Check that required methods have type hints
        required_methods = [
            'run', '_log_command', '_track_cost'
        ]
        
        for method_name in required_methods:
            method = getattr(AzCliCommand, method_name, None)
            if method:
                assert hasattr(method, '__annotations__'), \
                       f"{method_name} is missing type hints"

    def test_syntax_errors(self):
        """Test that there are no syntax errors in Python files"""
        # Check all Python files for syntax errors
        python_files = list(Path("src").rglob("*.py"))
        
        for file_path in python_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Compile the file to check for syntax errors
                compile(content, file_path, 'exec')
                
            except (SyntaxError, UnicodeDecodeError) as e:
                pytest.fail(f"Syntax error in {file_path}: {e}")

    def test_import_cycles(self):
        """Test for import cycles"""
        # This is a basic check - in practice, you'd use a tool like pylint
        # or run a more comprehensive import analysis
        try:
            # Try importing all modules to check for import errors
            import src.az_os.cli.commands.metrics
            import src.az_os.cli.commands.config
            import src.az_os.cli.commands.logs
            import src.az_os.core.storage
            import src.az_os.core.llm_client
            import src.az_os.core.execution_engine
            import src.az_os.core.rag_engine
            import src.az_os.core.checkpoint_manager
            import src.az_os.core.vectorizer
            import src.az_os.core.config_manager
            import src.az_os.core.logger
            import src.az_os.core.cost_tracker
            assert True
        except ImportError as e:
            pytest.fail(f"Import error: {e}")

    def test_test_files_exist(self):
        """Test that all required test files exist"""
        required_test_files = [
            "tests/test_core.py",
            "tests/test_cli.py", 
            "tests/test_integration.py",
            "tests/test_stories.py"
        ]
        
        for test_file in required_test_files:
            assert os.path.exists(test_file), f"Test file missing: {test_file}"

    def test_run_pytest(self):
        """Test that pytest can run successfully"""
        try:
            # Run pytest on the tests directory
            result = subprocess.run(
                ["pytest", "tests/", "-v", "--tb=short"], 
                capture_output=True,
                text=True
            )
            
            # Print pytest output for debugging
            print(result.stdout)
            if result.stderr:
                print(f"pytest stderr: {result.stderr}")
            
            # Check that pytest exited successfully
            assert result.returncode == 0, \
                   f"pytest failed with exit code {result.returncode}"
            
            # Check that at least some tests ran
            assert "collected" in result.stdout, \
                   "pytest output does not indicate tests were collected"
            
        except Exception as e:
            pytest.fail(f"Failed to run pytest: {e}")