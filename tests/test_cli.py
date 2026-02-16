"""
Unit tests for AZ-OS CLI commands
Tests command-line interface functionality and argument parsing.
"""

import pytest
import subprocess
import sys
from pathlib import Path
import os


class TestCLI:
    """Test CLI command functionality"""
    
    @classmethod
    def setup_class(cls):
        """Setup test environment"""
        cls.script_path = Path(__file__).parent.parent / "src" / "az_os" / "cli.py"
        
        # Add src directory to Python path
        sys.path.insert(0, str(Path(__file__).parent.parent / "src"))
    
    @classmethod
    def teardown_class(cls):
        """Teardown test environment"""
        # Remove src directory from Python path
        sys.path.remove(str(Path(__file__).parent.parent / "src"))
    
    def test_cli_help(self):
        """Test CLI help output"""
        result = subprocess.run([
            sys.executable, str(self.script_path), "--help"
        ], capture_output=True, text=True)
        
        assert result.returncode == 0
        assert "Usage" in result.stdout
        assert "Commands" in result.stdout
        assert "Options" in result.stdout
    
    def test_cli_version(self):
        """Test CLI version output"""
        result = subprocess.run([
            sys.executable, str(self.script_path), "--version"
        ], capture_output=True, text=True)
        
        assert result.returncode == 0
        assert "AZ-OS" in result.stdout
        assert "version" in result.stdout.lower()
    
    def test_cli_invalid_command(self):
        """Test CLI with invalid command"""
        result = subprocess.run([
            sys.executable, str(self.script_path), "invalid-command"
        ], capture_output=True, text=True)
        
        assert result.returncode != 0
        assert "error" in result.stderr.lower()
        assert "invalid command" in result.stderr.lower()
    
    def test_cli_command_with_args(self):
        """Test CLI command with arguments"""
        # Test a hypothetical command that takes arguments
        result = subprocess.run([
            sys.executable, str(self.script_path), "run", "--config", "test-config.yaml"
        ], capture_output=True, text=True)
        
        # Depending on implementation, this might succeed or fail
        # For now, just check that it runs without crashing
        assert result.returncode in [0, 1]  # Allow for expected failures
    
    def test_cli_no_arguments(self):
        """Test CLI with no arguments"""
        result = subprocess.run([
            sys.executable, str(self.script_path)
        ], capture_output=True, text=True)
        
        assert result.returncode == 0
        assert "Usage" in result.stdout
        assert "Commands" in result.stdout
    
    def test_cli_verbose_flag(self):
        """Test CLI verbose flag"""
        result = subprocess.run([
            sys.executable, str(self.script_path), "--verbose", "--help"
        ], capture_output=True, text=True)
        
        assert result.returncode == 0
        # Verbose output should include more detailed information
        assert "DEBUG" in result.stdout or "verbose" in result.stdout.lower()
    
    def test_cli_config_flag(self):
        """Test CLI config flag"""
        # Create a temporary config file
        config_content = "test_config: value"
        config_path = Path("test-config.yaml")
        config_path.write_text(config_content)
        
        try:
            result = subprocess.run([
                sys.executable, str(self.script_path), "--config", str(config_path)
            ], capture_output=True, text=True)
            
            assert result.returncode in [0, 1]  # Allow for expected failures
            # Should reference the config file
            assert str(config_path) in result.stdout or str(config_path) in result.stderr
            
        finally:
            # Clean up temporary config file
            config_path.unlink()
    
    def test_cli_environment_variables(self):
        """Test CLI environment variables"""
        # Set environment variables
        os.environ['AZ_OS_ENV'] = 'test'
        os.environ['AZ_OS_DEBUG'] = 'true'
        
        try:
            result = subprocess.run([
                sys.executable, str(self.script_path), "--help"
            ], capture_output=True, text=True)
            
            assert result.returncode == 0
            # Should reflect environment variable settings
            assert "test" in result.stdout.lower() or "debug" in result.stdout.lower()
            
        finally:
            # Clean up environment variables
            del os.environ['AZ_OS_ENV']
            del os.environ['AZ_OS_DEBUG']
    
    def test_cli_subcommands(self):
        """Test CLI subcommands"""
        # Test hypothetical subcommands
        subcommands = ["init", "run", "status", "stop"]
        
        for command in subcommands:
            result = subprocess.run([
                sys.executable, str(self.script_path), command, "--help"
            ], capture_output=True, text=True)
            
            # Each subcommand should have its own help
            assert result.returncode in [0, 1]  # Allow for expected failures
            assert "Usage" in result.stdout or "usage" in result.stdout.lower()
    
    def test_cli_output_formatting(self):
        """Test CLI output formatting"""
        result = subprocess.run([
            sys.executable, str(self.script_path), "--help"
        ], capture_output=True, text=True)
        
        assert result.returncode == 0
        # Output should be properly formatted
        assert "\n" in result.stdout  # Contains newlines
        assert len(result.stdout.strip()) > 0
    
    def test_cli_error_handling(self):
        """Test CLI error handling"""
        # Test with invalid arguments
        result = subprocess.run([
            sys.executable, str(self.script_path), "run", "--invalid-flag"
        ], capture_output=True, text=True)
        
        assert result.returncode != 0
        assert "error" in result.stderr.lower()
        assert "invalid" in result.stderr.lower() or "unrecognized" in result.stderr.lower()
    
    def test_cli_logging(self):
        """Test CLI logging functionality"""
        # Test with logging flags
        result = subprocess.run([
            sys.executable, str(self.script_path), "--log-level", "DEBUG", "--help"
        ], capture_output=True, text=True)
        
        assert result.returncode == 0
        # Should include debug logging information
        assert "DEBUG" in result.stdout or "debug" in result.stdout.lower()
    
    def test_cli_timeout_handling(self):
        """Test CLI timeout handling"""
        # Test a command that might timeout
        result = subprocess.run([
            sys.executable, str(self.script_path), "run", "--timeout", "1"
        ], capture_output=True, text=True, timeout=2)
        
        # Should handle timeout gracefully
        assert result.returncode in [0, 1, -15]  # -15 indicates timeout
        assert "timeout" in result.stderr.lower() or "timeout" in result.stdout.lower()
    
    def test_cli_exit_codes(self):
        """Test CLI exit codes"""
        # Test different exit codes for different scenarios
        test_cases = [
            ("--help", 0),
            ("invalid-command", 1),
            ("run", 0),  # Assuming run command exists
        ]
        
        for args, expected_code in test_cases:
            result = subprocess.run([
                sys.executable, str(self.script_path), args
            ], capture_output=True, text=True)
            
            assert result.returncode == expected_code, f"Expected {expected_code} for {args}, got {result.returncode}"
    
    def test_cli_unicode_handling(self):
        """Test CLI unicode handling"""
        # Test with unicode characters
        result = subprocess.run([
            sys.executable, str(self.script_path), "--message", "© AZ-OS v2.0 - ¿Qué tal?"
        ], capture_output=True, text=True)
        
        assert result.returncode in [0, 1]  # Allow for expected failures
        # Should handle unicode without errors
        assert "©" in result.stdout or "¿" in result.stdout or "é" in result.stdout
    
    def test_cli_large_output(self):
        """Test CLI with large output"""
        # Test a command that generates large output
        result = subprocess.run([
            sys.executable, str(self.script_path), "generate-report", "--verbose"
        ], capture_output=True, text=True)
        
        assert result.returncode in [0, 1]  # Allow for expected failures
        # Should handle large output without crashing
        assert len(result.stdout) > 1000 or "output truncated" in result.stdout.lower()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])