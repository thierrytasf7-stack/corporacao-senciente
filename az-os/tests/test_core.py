"""Tests for core modules."""

import pytest
import asyncio
from az_os.core.storage import TaskStorage
from az_os.core.error_handler import (
    retry_with_backoff,
    ErrorHandler,
    categorize_error,
    ErrorCategory
)


class TestTaskStorage:
    def test_create_task(self, mock_storage):
        task_id = mock_storage.create_task(
            description="Test task",
            model="test-model",
            status="pending"
        )
        assert task_id is not None
        assert task_id.startswith("task-")

    def test_get_task(self, mock_storage):
        task_id = mock_storage.create_task("Test", "model", "pending")
        task = mock_storage.get_task(task_id)
        assert task["id"] == task_id
        assert task["description"] == "Test"

    def test_list_tasks(self, mock_storage):
        for i in range(5):
            mock_storage.create_task(f"Task {i}", "model", "pending")

        tasks = mock_storage.list_tasks(limit=3)
        assert len(tasks) <= 3

    def test_update_status(self, mock_storage):
        task_id = mock_storage.create_task("Test", "model", "pending")
        mock_storage.update_task_status(task_id, "completed")

        task = mock_storage.get_task(task_id)
        assert task["status"] == "completed"

    def test_add_log(self, mock_storage):
        task_id = mock_storage.create_task("Test", "model", "pending")
        mock_storage.add_log(task_id, "info", "Test log message")

        # Log added successfully (no exception)
        assert True

    def test_track_cost(self, mock_storage):
        task_id = mock_storage.create_task("Test", "model", "pending")
        mock_storage.track_cost(
            task_id=task_id,
            model="test-model",
            input_tokens=100,
            output_tokens=50,
            cost_usd=0.005
        )

        cost = mock_storage.get_total_cost()
        assert cost >= 0.005


class TestErrorHandler:
    def test_categorize_network_error(self):
        error = ConnectionError("Network timeout")
        category = categorize_error(error)
        assert category == ErrorCategory.NETWORK

    def test_categorize_rate_limit(self):
        error = Exception("429 Too Many Requests")
        category = categorize_error(error)
        assert category == ErrorCategory.RATE_LIMIT

    def test_retry_decorator_success(self):
        call_count = 0

        @retry_with_backoff(max_retries=3, base_delay=0.01)
        def flaky_function():
            nonlocal call_count
            call_count += 1
            if call_count < 2:
                raise ConnectionError("Temporary network issue")
            return "success"

        result = flaky_function()
        assert result == "success"
        assert call_count == 2

    def test_retry_decorator_max_retries(self):
        @retry_with_backoff(max_retries=2, base_delay=0.01)
        def always_fails():
            raise ConnectionError("Always fails")

        with pytest.raises(ConnectionError):
            always_fails()

    def test_error_handler_statistics(self):
        handler = ErrorHandler()

        try:
            raise ValueError("Test error")
        except Exception as e:
            handler.handle(e, context="test", raise_on_error=False)

        stats = handler.get_error_stats()
        assert len(stats) > 0


@pytest.mark.asyncio
class TestLLMClient:
    async def test_generate(self, mock_llm_client):
        response = await mock_llm_client.generate("Test prompt")
        assert "Mock response" in response

    async def test_chat(self, mock_llm_client):
        messages = [{"role": "user", "content": "Hello"}]
        response = await mock_llm_client.chat(messages)
        assert response == "Mock chat response"
