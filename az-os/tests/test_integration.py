"""Integration tests for AZ-OS."""

import pytest
import asyncio
import time


class TestFullPipeline:
    """Test complete task execution pipeline."""

    def test_create_and_execute_task(self, mock_storage, mock_llm_client):
        """Test creating and executing a task end-to-end."""
        # Create task
        task_id = mock_storage.create_task(
            description="Integration test task",
            model="test-model",
            status="pending"
        )

        # Update to running
        mock_storage.update_task_status(task_id, "running")

        # Add logs
        mock_storage.add_log(task_id, "info", "Task started")
        mock_storage.add_log(task_id, "debug", "Processing")
        mock_storage.add_log(task_id, "info", "Task completed")

        # Track cost
        mock_storage.track_cost(
            task_id=task_id,
            model="test-model",
            input_tokens=100,
            output_tokens=50,
            cost_usd=0.01
        )

        # Update to completed
        mock_storage.update_task_status(task_id, "completed")

        # Verify
        task = mock_storage.get_task(task_id)
        assert task["status"] == "completed"

        cost = mock_storage.get_total_cost()
        assert cost >= 0.01

    @pytest.mark.asyncio
    async def test_security_telemetry_integration(self, mock_security, mock_telemetry):
        """Test security + telemetry integration."""
        # Health check
        checker = mock_telemetry["checker"]
        health = checker.run_all_checks()
        assert "cpu" in health

        # Rate limit check
        limiter = mock_security["limiter"]
        assert limiter.is_allowed("user-123")

        # Alert on suspicious activity
        alerts = mock_telemetry["alerts"]
        alerts.trigger_alert(
            alert_id="security-test",
            level="warning",
            message="Test security alert"
        )

        recent = alerts.get_recent_alerts(minutes=1)
        assert len(recent) > 0


class TestErrorRecovery:
    """Test error handling and recovery."""

    def test_retry_on_failure(self):
        """Test automatic retry on transient errors."""
        from az_os.core.error_handler import retry_with_backoff

        attempt_count = 0

        @retry_with_backoff(max_retries=3, base_delay=0.01)
        def flaky_operation():
            nonlocal attempt_count
            attempt_count += 1
            if attempt_count < 3:
                raise ConnectionError("Temporary failure")
            return "success"

        result = flaky_operation()
        assert result == "success"
        assert attempt_count == 3

    def test_graceful_degradation(self, mock_storage):
        """Test graceful degradation on component failure."""
        # Even if LLM fails, storage should still work
        task_id = mock_storage.create_task("Test", "model", "pending")
        mock_storage.update_task_status(task_id, "failed")

        task = mock_storage.get_task(task_id)
        assert task["status"] == "failed"


class TestPerformance:
    """Performance tests."""

    def test_task_creation_performance(self, mock_storage):
        """Test task creation is fast (<50ms)."""
        start = time.time()
        for _ in range(10):
            mock_storage.create_task("Test", "model", "pending")
        elapsed = (time.time() - start) * 1000

        # Should create 10 tasks in <500ms (50ms each)
        assert elapsed < 500

    def test_health_check_performance(self, mock_telemetry):
        """Test health checks are fast (<500ms)."""
        checker = mock_telemetry["checker"]

        start = time.time()
        checker.run_all_checks()
        elapsed = (time.time() - start) * 1000

        assert elapsed < 500
