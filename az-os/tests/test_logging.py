"""Tests for logging module."""

import pytest
import logging
from pathlib import Path


class TestLogger:
    """Test logging functionality."""

    def test_logger_initialization(self, temp_dir):
        """Test logger can be initialized."""
        from az_os.utils.logger import setup_logger

        log_file = temp_dir / "test.log"
        logger = setup_logger(
            name="test_logger",
            log_file=str(log_file),
            level=logging.DEBUG
        )

        assert logger is not None
        assert logger.level == logging.DEBUG

    def test_log_to_file(self, temp_dir):
        """Test logging to file."""
        from az_os.utils.logger import setup_logger

        log_file = temp_dir / "test.log"
        logger = setup_logger(
            name="test_file_logger",
            log_file=str(log_file),
            level=logging.INFO
        )

        logger.info("Test info message")
        logger.warning("Test warning message")
        logger.error("Test error message")

        # Verify log file created
        assert log_file.exists()

        # Verify content
        content = log_file.read_text()
        assert "Test info message" in content
        assert "Test warning message" in content
        assert "Test error message" in content

    def test_log_levels(self, temp_dir):
        """Test different log levels."""
        from az_os.utils.logger import setup_logger

        log_file = temp_dir / "levels.log"
        logger = setup_logger(
            name="test_levels",
            log_file=str(log_file),
            level=logging.WARNING  # Only WARNING and above
        )

        logger.debug("Debug message")  # Should not appear
        logger.info("Info message")    # Should not appear
        logger.warning("Warning message")  # Should appear
        logger.error("Error message")      # Should appear

        content = log_file.read_text()
        assert "Debug message" not in content
        assert "Info message" not in content
        assert "Warning message" in content
        assert "Error message" in content

    def test_log_rotation(self, temp_dir):
        """Test log rotation on size limit."""
        from az_os.utils.logger import setup_logger

        log_file = temp_dir / "rotation.log"
        logger = setup_logger(
            name="test_rotation",
            log_file=str(log_file),
            level=logging.INFO,
            max_bytes=1024,  # 1KB
            backup_count=3
        )

        # Generate logs to trigger rotation
        for i in range(100):
            logger.info(f"Log message number {i}" * 10)

        # Check backup files created
        backup_files = list(temp_dir.glob("rotation.log.*"))
        assert len(backup_files) > 0

    def test_task_scoped_logging(self, temp_dir):
        """Test task-specific log files."""
        from az_os.utils.logger import setup_logger

        task_id = "task-123"
        log_file = temp_dir / f"{task_id}.log"

        logger = setup_logger(
            name=f"task.{task_id}",
            log_file=str(log_file),
            level=logging.DEBUG
        )

        logger.info("Task started")
        logger.debug("Processing step 1")
        logger.info("Task completed")

        assert log_file.exists()
        content = log_file.read_text()
        assert "Task started" in content
        assert "Task completed" in content


class TestLogFormatting:
    """Test log message formatting."""

    def test_timestamp_format(self, temp_dir):
        """Test log timestamps are formatted correctly."""
        from az_os.utils.logger import setup_logger

        log_file = temp_dir / "timestamp.log"
        logger = setup_logger(
            name="test_timestamp",
            log_file=str(log_file),
            level=logging.INFO
        )

        logger.info("Test message")

        content = log_file.read_text()
        # Should contain timestamp in format: YYYY-MM-DD HH:MM:SS
        import re
        timestamp_pattern = r'\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}'
        assert re.search(timestamp_pattern, content)

    def test_level_in_log(self, temp_dir):
        """Test log level appears in log messages."""
        from az_os.utils.logger import setup_logger

        log_file = temp_dir / "level.log"
        logger = setup_logger(
            name="test_level",
            log_file=str(log_file),
            level=logging.DEBUG
        )

        logger.info("Info message")
        logger.warning("Warning message")
        logger.error("Error message")

        content = log_file.read_text()
        assert "INFO" in content
        assert "WARNING" in content
        assert "ERROR" in content


class TestLoggerIntegration:
    """Integration tests for logging with other components."""

    def test_logging_with_storage(self, mock_storage, temp_dir):
        """Test logging during storage operations."""
        from az_os.utils.logger import setup_logger

        log_file = temp_dir / "storage.log"
        logger = setup_logger(
            name="test_storage_logging",
            log_file=str(log_file),
            level=logging.DEBUG
        )

        # Perform storage operations with logging
        logger.info("Creating task")
        task_id = mock_storage.create_task("Test", "model", "pending")
        logger.debug(f"Task created: {task_id}")

        logger.info("Updating task status")
        mock_storage.update_task_status(task_id, "completed")
        logger.info("Task completed")

        # Verify logs
        content = log_file.read_text()
        assert "Creating task" in content
        assert "Task completed" in content

    def test_logging_errors(self, temp_dir):
        """Test logging exceptions."""
        from az_os.utils.logger import setup_logger

        log_file = temp_dir / "errors.log"
        logger = setup_logger(
            name="test_errors",
            log_file=str(log_file),
            level=logging.ERROR
        )

        try:
            raise ValueError("Test exception")
        except Exception as e:
            logger.error(f"Caught exception: {e}", exc_info=True)

        content = log_file.read_text()
        assert "Test exception" in content
        assert "ValueError" in content


@pytest.mark.parametrize("level_name,level_value", [
    ("DEBUG", logging.DEBUG),
    ("INFO", logging.INFO),
    ("WARNING", logging.WARNING),
    ("ERROR", logging.ERROR),
    ("CRITICAL", logging.CRITICAL),
])
def test_log_level_constants(level_name, level_value):
    """Test log level constants are correct."""
    assert getattr(logging, level_name) == level_value
