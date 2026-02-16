import pytest
from datetime import datetime
from src.az_os.core import SelfHealer, ErrorType, RecoveryStrategy, ErrorDetection, RecoveryAttempt
from src.az_os.core import TaskState, TaskResult
from unittest.mock import MagicMock


class TestSelfHealer:
    def setup_method(self):
        self.healer = SelfHealer(
            max_retries=3,
            initial_backoff=1.0,
            max_backoff=60.0
        )
    
    def test_detect_error_permanent(self):
        """Test detection of permanent error."""
        task = TaskState(
            task_id="test_task",
            task_type="test",
            description="Test task",
            created_at=time.time(),
            priority="medium"
        )
        
        result = TaskResult(
            task_id="test_task",
            status="error",
            output="",
            error="Permission denied: file not accessible",
            metrics={}
        )
        
        error = self.healer.detect_error(task, result)
        
        assert error is not None
        assert error.error_type == ErrorType.PERMANENT
        assert "permission" in error.error_message.lower()
        assert error.context["task_id"] == "test_task"
    
    def test_detect_error_transient(self):
        """Test detection of transient error."""
        task = TaskState(
            task_id="test_task",
            task_type="test",
            description="Test task",
            created_at=time.time(),
            priority="medium"
        )
        
        result = TaskResult(
            task_id="test_task",
            status="error",
            output="",
            error="Connection timeout: server not responding",
            metrics={}
        )
        
        error = self.healer.detect_error(task, result)
        
        assert error is not None
        assert error.error_type == ErrorType.TRANSIENT
        assert "timeout" in error.error_message.lower()
    
    def test_detect_error_unknown(self):
        """Test detection of unknown error type."""
        task = TaskState(
            task_id="test_task",
            task_type="test",
            description="Test task",
            created_at=time.time(),
            priority="medium"
        )
        
        result = TaskResult(
            task_id="test_task",
            status="error",
            output="",
            error="Unexpected error: something went wrong",
            metrics={}
        )
        
        error = self.healer.detect_error(task, result)
        
        assert error is not None
        assert error.error_type == ErrorType.UNKNOWN
    
    def test_auto_recover_success(self):
        """Test successful recovery."""
        task = TaskState(
            task_id="test_task",
            task_type="test",
            description="Test task",
            created_at=time.time(),
            priority="medium"
        )
        
        result = TaskResult(
            task_id="test_task",
            status="error",
            output="",
            error="Simulated failure",
            metrics={}
        )
        
        # Mock recovery to succeed on first attempt
        original_auto_recover = self.healer._execute_recovery
        
        def mock_recovery(strategy, task, original_result):
            return TaskResult(
                task_id=task.task_id,
                status="completed",
                output=f"Recovered using {strategy.value}",
                error=None,
                metrics={}
            )
        
        self.healer._execute_recovery = mock_recovery
        
        new_result, attempts = self.healer.auto_recover(task, result)
        
        assert new_result.status == "completed"
        assert len(attempts) == 1
        assert attempts[0].success == True
        assert attempts[0].strategy == RecoveryStrategy.EXPONENTIAL_BACKOFF
        
        # Restore original method
        self.healer._execute_recovery = original_auto_recover
    
    def test_auto_recover_all_failures(self):
        """Test recovery when all attempts fail."""
        task = TaskState(
            task_id="test_task",
            task_type="test",
            description="Test task",
            created_at=time.time(),
            priority="medium"
        )
        
        result = TaskResult(
            task_id="test_task",
            status="error",
            output="",
            error="Simulated failure",
            metrics={}
        )
        
        # Mock all recoveries to fail
        original_auto_recover = self.healer._execute_recovery
        
        def mock_recovery(strategy, task, original_result):
            return TaskResult(
                task_id=task.task_id,
                status="error",
                output="",
                error=f"Recovery {strategy.value} failed",
                metrics={}
            )
        
        self.healer._execute_recovery = mock_recovery
        
        new_result, attempts = self.healer.auto_recover(task, result)
        
        assert new_result.status == "error"
        assert len(attempts) == 3
        assert all(not attempt.success for attempt in attempts)
        
        # Restore original method
        self.healer._execute_recovery = original_auto_recover
    
    def test_learn_from_failure(self):
        """Test learning from failure patterns."""
        task = TaskState(
            task_id="test_task",
            task_type="test",
            description="Test task",
            created_at=time.time(),
            priority="medium"
        )
        
        # Create mock attempts
        attempts = [
            RecoveryAttempt(
                strategy=RecoveryStrategy.EXPONENTIAL_BACKOFF,
                timestamp=time.time(),
                success=False,
                error_message="Backoff failed",
                duration=1.0
            ),
            RecoveryAttempt(
                strategy=RecoveryStrategy.DIFFERENT_MODEL,
                timestamp=time.time(),
                success=True,
                error_message=None,
                duration=2.0
            )
        ]
        
        analysis = self.healer.learn_from_failure(task, attempts)
        
        assert analysis["task_id"] == "test_task"
        assert analysis["total_attempts"] == 2
        assert analysis["successful_strategies"] == ["different_model"]
        assert analysis["failed_strategies"] == [
            {"strategy": "exponential_backoff", "error": "Backoff failed"}
        ]
        assert analysis["most_effective_strategy"] == "different_model"
        assert "exponential_backoff_effective" not in analysis["patterns"]
        assert "model_switching_effective" in analysis["patterns"]
    
    def test_classify_error(self):
        """Test error classification."""
        # Transient errors
        transient_errors = [
            "Connection timeout",
            "Network error: retry",
            "Temporary failure",
            "Server unavailable"
        ]
        
        for error_msg in transient_errors:
            assert self.healer._classify_error(error_msg) == ErrorType.TRANSIENT
        
        # Permanent errors
        permanent_errors = [
            "Permission denied",
            "File not found",
            "Invalid credentials",
            "Authentication failed"
        ]
        
        for error_msg in permanent_errors:
            assert self.healer._classify_error(error_msg) == ErrorType.PERMANENT
        
        # Unknown errors
        unknown_errors = [
            "Unexpected error",
            "Something went wrong",
            "Unknown failure"
        ]
        
        for error_msg in unknown_errors:
            assert self.healer._classify_error(error_msg) == ErrorType.UNKNOWN
    
    def test_calculate_backoff(self):
        """Test exponential backoff calculation."""
        # Test backoff calculation
        assert self.healer._calculate_backoff() == 1.0  # initial backoff
        
        self.healer.current_retry = 2
        assert self.healer._calculate_backoff() == 4.0  # 1 * 2^(2-1) = 2
        
        self.healer.current_retry = 3
        assert self.healer._calculate_backoff() == 8.0  # 1 * 2^(3-1) = 4
        
        # Test max backoff
        self.healer.current_retry = 10
        assert self.healer._calculate_backoff() == 60.0  # capped at max_backoff
    
    def test_choose_recovery_strategy(self):
        """Test recovery strategy selection."""
        self.healer.current_retry = 1
        assert self.healer._choose_recovery_strategy() == RecoveryStrategy.EXPONENTIAL_BACKOFF
        
        self.healer.current_retry = 2
        assert self.healer._choose_recovery_strategy() == RecoveryStrategy.DIFFERENT_MODEL
        
        self.healer.current_retry = 3
        assert self.healer._choose_recovery_strategy() == RecoveryStrategy.ALTERNATIVE_APPROACH
    
    def test_most_effective_strategy(self):
        """Test determination of most effective strategy."""
        # Test with successful attempts
        successful_attempts = [
            RecoveryAttempt(
                strategy=RecoveryStrategy.EXPONENTIAL_BACKOFF,
                timestamp=time.time(),
                success=True,
                error_message=None,
                duration=1.0
            ),
            RecoveryAttempt(
                strategy=RecoveryStrategy.DIFFERENT_MODEL,
                timestamp=time.time(),
                success=False,
                error_message="Failed",
                duration=2.0
            )
        ]
        
        assert self.healer._most_effective_strategy(successful_attempts) == RecoveryStrategy.EXPONENTIAL_BACKOFF
        
        # Test with no successful attempts
        failed_attempts = [
            RecoveryAttempt(
                strategy=RecoveryStrategy.EXPONENTIAL_BACKOFF,
                timestamp=time.time(),
                success=False,
                error_message="Failed",
                duration=1.0
            )
        ]
        
        assert self.healer._most_effective_strategy(failed_attempts) == None
    
    def test_detect_patterns(self):
        """Test pattern detection in recovery attempts."""
        # Test with effective backoff
        backoff_attempts = [
            RecoveryAttempt(
                strategy=RecoveryStrategy.EXPONENTIAL_BACKOFF,
                timestamp=time.time(),
                success=True,
                error_message=None,
                duration=1.0
            )
        ]
        
        patterns = self.healer._detect_patterns(backoff_attempts)
        assert "exponential_backoff_effective" in patterns
        
        # Test with effective model switching
        model_attempts = [
            RecoveryAttempt(
                strategy=RecoveryStrategy.DIFFERENT_MODEL,
                timestamp=time.time(),
                success=True,
                error_message=None,
                duration=1.0
            )
        ]
        
        patterns = self.healer._detect_patterns(model_attempts)
        assert "model_switching_effective" in patterns
        
        # Test with no effective strategies
        failed_attempts = [
            RecoveryAttempt(
                strategy=RecoveryStrategy.EXPONENTIAL_BACKOFF,
                timestamp=time.time(),
                success=False,
                error_message="Failed",
                duration=1.0
            )
        ]
        
        patterns = self.healer._detect_patterns(failed_attempts)
        assert len(patterns) == 0
