import pytest
import os
import tempfile
import logging
from pathlib import Path
from az_os.utils.logger import TaskScopedLogger, SystemLogger, StructuredMessage


class TestTaskScopedLogger:
    def setup_method(self):
        """Setup test logger"""
        self.temp_dir = tempfile.TemporaryDirectory()
        self.task_id = "test-task-123"
        self.logger = TaskScopedLogger(self.task_id, log_dir=self.temp_dir.name)
    
    def teardown_method(self):
        """Teardown test logger"""
        self.temp_dir.cleanup()
    
    def test_logger_creation(self):
        """Test logger creation and file path"""
        assert self.logger.task_id == "test-task-123"
        assert self.logger.log_dir == self.temp_dir.name
        assert self.logger.log_file.endswith("test-task-123.log")
    
    def test_log_levels(self):
        """Test different log levels"""
        # Test debug
        self.logger.debug("This is a debug message")
        
        # Test info
        self.logger.info("This is an info message")
        
        # Test warning
        self.logger.warning("This is a warning message")
        
        # Test error
        self.logger.error("This is an error message")
        
        # Test exception
        try:
            raise ValueError("Test exception")
        except ValueError:
            self.logger.exception("Exception occurred")
    
    def test_structured_logging(self):
        """Test structured logging with extra fields"""
        # Test with StructuredMessage
        msg = StructuredMessage("Structured log message", 
                              user_id="123", 
                              action="test")
        self.logger.info(msg)
        
        # Test with extra kwargs
        self.logger.info("Log with extra fields", 
                        user_id="456", 
                        action="another-test")
    
    def test_log_rotation(self):
        """Test log rotation"""
        # Write enough data to trigger rotation
        for i in range(10000):
            self.logger.info(f"Log message {i}")
        
        # Check if rotation happened
        log_size = os.path.getsize(self.logger.log_file)
        assert log_size <= 10 * 1024 * 1024  # Should be <= 10MB
        
        # Check backup files
        backup_files = [f for f in os.listdir(self.temp_dir.name) 
                       if f.startswith("test-task-123") and f != "test-task-123.log"]
        assert len(backup_files) <= 5  # Should have <= 5 backups
    
    def test_get_logs(self):
        """Test getting log lines"""
        # Write some test logs
        self.logger.info("First log message")
        self.logger.info("Second log message")
        self.logger.info("Third log message")
        
        # Get last 2 lines
        logs = self.logger.get_logs(lines=2)
        log_lines = logs.split('\n')
        
        assert "Second log message" in log_lines
        assert "Third log message" in log_lines
        assert "First log message" not in log_lines
    
    def test_log_format(self):
        """Test log format"""
        self.logger.info("Test format")
        
        # Read the log file and check format
        with open(self.logger.log_file, 'r', encoding='utf-8') as f:
            first_line = f.readline().strip()
        
        # Format should be: timestamp | logger_name | level | message
        parts = first_line.split(" | ")
        assert len(parts) == 4
        assert parts[2] in ["INFO", "WARNING", "ERROR", "DEBUG"]
        assert "Test format" in parts[3]


class TestSystemLogger:
    def setup_method(self):
        """Setup test system logger"""
        self.temp_dir = tempfile.TemporaryDirectory()
        self.logger = SystemLogger(log_dir=self.temp_dir.name)
    
    def teardown_method(self):
        """Teardown test system logger"""
        self.temp_dir.cleanup()
    
    def test_system_logger_creation(self):
        """Test system logger creation"""
        assert self.logger.log_dir == self.temp_dir.name
        assert os.path.exists(os.path.join(self.temp_dir.name, "system.log"))
    
    def test_system_log_levels(self):
        """Test system logger log levels"""
        # Test debug
        self.logger.debug("System debug message")
        
        # Test info
        self.logger.info("System info message")
        
        # Test warning
        self.logger.warning("System warning message")
        
        # Test error
        self.logger.error("System error message")
        
        # Test exception
        try:
            raise RuntimeError("System test exception")
        except RuntimeError:
            self.logger.exception("System exception occurred")
    
    def test_system_structured_logging(self):
        """Test system structured logging"""
        # Test with StructuredMessage
        msg = StructuredMessage("System structured log", 
                              component="test", 
                              version="1.0")
        self.logger.info(msg)
        
        # Test with extra kwargs
        self.logger.info("System log with extra", 
                        component="another", 
                        status="ok")
    
    def test_system_log_rotation(self):
        """Test system log rotation"""
        # Write enough data to trigger rotation
        for i in range(10000):
            self.logger.info(f"System log message {i}")
        
        # Check if rotation happened
        log_size = os.path.getsize(os.path.join(self.temp_dir.name, "system.log"))
        assert log_size <= 10 * 1024 * 1024  # Should be <= 10MB
        
        # Check backup files
        backup_files = [f for f in os.listdir(self.temp_dir.name) 
                       if f.startswith("system") and f != "system.log"]
        assert len(backup_files) <= 5  # Should have <= 5 backups
    
    def test_system_log_format(self):
        """Test system log format"""
        self.logger.info("System test format")
        
        # Read the log file and check format
        with open(os.path.join(self.temp_dir.name, "system.log"), 'r', encoding='utf-8') as f:
            first_line = f.readline().strip()
        
        # Format should be: timestamp | logger_name | level | message
        parts = first_line.split(" | ")
        assert len(parts) == 4
        assert parts[2] in ["INFO", "WARNING", "ERROR", "DEBUG"]
        assert "System test format" in parts[3]


class TestStructuredMessage:
    def test_structured_message(self):
        """Test StructuredMessage class"""
        msg = StructuredMessage("Test message", 
                              user_id="123", 
                              action="test", 
                              status="ok")
        
        # Test message attribute
        assert msg.message == "Test message"
        
        # Test kwargs
        assert msg.kwargs["user_id"] == "123"
        assert msg.kwargs["action"] == "test"
        assert msg.kwargs["status"] == "ok"
        
        # Test to_dict method
        msg_dict = msg.to_dict()
        assert msg_dict["message"] == "Test message"
        assert msg_dict["user_id"] == "123"
        assert msg_dict["action"] == "test"
        assert msg_dict["status"] == "ok"
    
    def test_structured_message_empty_kwargs(self):
        """Test StructuredMessage with no extra fields"""
        msg = StructuredMessage("Simple message")
        
        assert msg.message == "Simple message"
        assert msg.kwargs == {}
        
        msg_dict = msg.to_dict()
        assert msg_dict["message"] == "Simple message"
        assert len(msg_dict) == 1


class TestLoggerIntegration:
    def test_task_logger_in_task_context(self):
        """Test task logger in task context"""
        task_id = "integration-test"
        task_logger = TaskScopedLogger(task_id)
        
        # Log some messages
        task_logger.info("Task started")
        task_logger.debug("Debug info", debug_id="123")
        task_logger.warning("Warning message", warning_code="WARN001")
        
        # Get logs and verify
        logs = task_logger.get_logs(lines=10)
        assert "Task started" in logs
        assert "Debug info" in logs
        assert "Warning message" in logs
    
    def test_system_logger_in_application(self):
        """Test system logger in application context"""
        system_logger = SystemLogger()
        
        # Log application-level messages
        system_logger.info("Application started")
        system_logger.error("Application error", error_code="APP001")
        
        # Verify log file exists
        log_path = os.path.join(system_logger.log_dir, "system.log")
        assert os.path.exists(log_path)
        
        # Check log content
        with open(log_path, 'r', encoding='utf-8') as f:
            content = f.read()
        assert "Application started" in content
        assert "Application error" in content


# CLI Command Tests
class TestCLICommands:
    def test_logs_show_command(self):
        """Test logs show command"""
        # This would require mocking rich console and actual log files
        # For now, just test that the function exists and can be called
        from az_os.utils.logger import logs_show
        
        # Should not raise exceptions
        logs_show()
    
    def test_logs_export_command(self):
        """Test logs export command"""
        from az_os.utils.logger import logs_export
        
        # Test with a sample task ID
        task_id = "export-test"
        
        # Should not raise exceptions (even if log file doesn't exist)
        logs_export(task_id)