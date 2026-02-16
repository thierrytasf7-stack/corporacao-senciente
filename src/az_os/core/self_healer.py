from typing import Any, Dict, List, Optional, Tuple
import time
import random
from dataclasses import dataclass
from enum import Enum
from .storage import TaskState, TaskResult, RecoveryAttempt


class ErrorType(Enum):
    TRANSIENT = "transient"
    PERMANENT = "permanent"
    UNKNOWN = "unknown"


class RecoveryStrategy(Enum):
    EXPONENTIAL_BACKOFF = "exponential_backoff"
    DIFFERENT_MODEL = "different_model"
    ALTERNATIVE_APPROACH = "alternative_approach"
    MANUAL_INTERVENTION = "manual_intervention"


@dataclass
class ErrorDetection:
    error_type: ErrorType
    error_message: str
    timestamp: float
    context: Dict[str, Any]


@dataclass
class RecoveryAttempt:
    strategy: RecoveryStrategy
    timestamp: float
    success: bool
    error_message: Optional[str]
    duration: float


class SelfHealer:
    def __init__(
        self,
        max_retries: int = 3,
        initial_backoff: float = 1.0,
        max_backoff: float = 60.0,
        recovery_models: List[str] = ["mistral", "gemini", "claude"]
    ):
        self.max_retries = max_retries
        self.initial_backoff = initial_backoff
        self.max_backoff = max_backoff
        self.recovery_models = recovery_models
        self.attempts: List[RecoveryAttempt] = []
        self.current_retry = 0

    def detect_error(
        self,
        task: TaskState,
        result: TaskResult
    ) -> Optional[ErrorDetection]:
        """Detect errors in task execution."""
        if result.status == "error":
            error_type = self._classify_error(result.error)
            return ErrorDetection(
                error_type=error_type,
                error_message=result.error,
                timestamp=time.time(),
                context={
                    "task_id": task.task_id,
                    "task_type": task.task_type,
                    "previous_attempts": len(self.attempts),
                    "error_status": result.status
                }
            )
        
        # Check for other error indicators
        if result.status == "failed" and "error" in result.output.lower():
            return ErrorDetection(
                error_type=ErrorType.UNKNOWN,
                error_message=f"Task failed with output: {result.output}",
                timestamp=time.time(),
                context={
                    "task_id": task.task_id,
                    "task_type": task.task_type,
                    "previous_attempts": len(self.attempts),
                    "error_status": result.status
                }
            )
        
        return None

    def auto_recover(
        self,
        task: TaskState,
        result: TaskResult
    ) -> Tuple[Optional[TaskResult], List[RecoveryAttempt]]:
        """Attempt automatic recovery of failed task."""
        self.current_retry = 0
        self.attempts = []
        
        while self.current_retry < self.max_retries:
            self.current_retry += 1
            
            # Choose recovery strategy
            strategy = self._choose_recovery_strategy()
            
            attempt = RecoveryAttempt(
                strategy=strategy,
                timestamp=time.time(),
                success=False,
                error_message=None,
                duration=0.0
            )
            
            try:
                # Apply backoff if needed
                if strategy == RecoveryStrategy.EXPONENTIAL_BACKOFF:
                    backoff_time = self._calculate_backoff()
                    time.sleep(backoff_time)
                
                # Execute recovery
                new_result = self._execute_recovery(strategy, task, result)
                attempt.success = new_result.status != "error"
                attempt.duration = time.time() - attempt.timestamp
                
                self.attempts.append(attempt)
                
                if attempt.success:
                    return new_result, self.attempts
                
                attempt.error_message = new_result.error if new_result.error else "Recovery failed"
                
            except Exception as e:
                attempt.error_message = str(e)
                attempt.duration = time.time() - attempt.timestamp
                self.attempts.append(attempt)
                
                # Continue to next retry
                continue
        
        return result, self.attempts

    def learn_from_failure(
        self,
        task: TaskState,
        attempts: List[RecoveryAttempt]
    ) -> Dict[str, Any]:
        """Learn from failure patterns."""
        failure_analysis = {
            "task_id": task.task_id,
            "total_attempts": len(attempts),
            "successful_strategies": [
                a.strategy.name for a in attempts if a.success
            ],
            "failed_strategies": [
                {"strategy": a.strategy.name, "error": a.error_message}
                for a in attempts if not a.success
            ],
            "most_effective_strategy": self._most_effective_strategy(attempts),
            "patterns": self._detect_patterns(attempts)
        }
        
        return failure_analysis

    def _classify_error(self, error_message: str) -> ErrorType:
        """Classify error type based on message."""
        transient_indicators = [
            "timeout", "retry", "temporary", "network", "connection"
        ]
        permanent_indicators = [
            "invalid", "not found", "permission", "authentication"
        ]
        
        error_lower = error_message.lower()
        
        if any(indicator in error_lower for indicator in transient_indicators):
            return ErrorType.TRANSIENT
        elif any(indicator in error_lower for indicator in permanent_indicators):
            return ErrorType.PERMANENT
        else:
            return ErrorType.UNKNOWN

    def _choose_recovery_strategy(self) -> RecoveryStrategy:
        """Choose recovery strategy based on retry count."""
        if self.current_retry == 1:
            return RecoveryStrategy.EXPONENTIAL_BACKOFF
        elif self.current_retry == 2:
            return RecoveryStrategy.DIFFERENT_MODEL
        else:
            return RecoveryStrategy.ALTERNATIVE_APPROACH

    def _calculate_backoff(self) -> float:
        """Calculate exponential backoff time."""
        backoff = self.initial_backoff * (2 ** (self.current_retry - 1))
        return min(backoff, self.max_backoff)

    def _execute_recovery(
        self,
        strategy: RecoveryStrategy,
        task: TaskState,
        original_result: TaskResult
    ) -> TaskResult:
        """Execute specific recovery strategy."""
        if strategy == RecoveryStrategy.EXPONENTIAL_BACKOFF:
            return self._retry_with_backoff(task, original_result)
        elif strategy == RecoveryStrategy.DIFFERENT_MODEL:
            return self._retry_with_different_model(task, original_result)
        elif strategy == RecoveryStrategy.ALTERNATIVE_APPROACH:
            return self._retry_with_alternative_approach(task, original_result)
        else:
            return original_result

    def _retry_with_backoff(
        self,
        task: TaskState,
        original_result: TaskResult
    ) -> TaskResult:
        """Retry task with exponential backoff."""
        # In real implementation, this would re-execute the task
        # Here we simulate success after backoff
        return TaskResult(
            task_id=task.task_id,
            status="completed",
            output=f"Recovered after backoff (attempt {self.current_retry})",
            error=None,
            metrics={}
        )

    def _retry_with_different_model(
        self,
        task: TaskState,
        original_result: TaskResult
    ) -> TaskResult:
        """Retry task with different LLM model."""
        recovery_model = random.choice(self.recovery_models)
        # Simulate different model approach
        return TaskResult(
            task_id=task.task_id,
            status="completed",
            output=f"Recovered using different model: {recovery_model}",
            error=None,
            metrics={"recovery_model": recovery_model}
        )

    def _retry_with_alternative_approach(
        self,
        task: TaskState,
        original_result: TaskResult
    ) -> TaskResult:
        """Retry task with alternative approach."""
        # Simulate alternative approach
        return TaskResult(
            task_id=task.task_id,
            status="completed",
            output=f"Recovered using alternative approach (attempt {self.current_retry})",
            error=None,
            metrics={"approach": "alternative"}
        )

    def _most_effective_strategy(self, attempts: List[RecoveryAttempt]) -> Optional[RecoveryStrategy]:
        """Determine most effective recovery strategy."""
        successful_attempts = [a for a in attempts if a.success]
        if successful_attempts:
            return successful_attempts[0].strategy
        return None

    def _detect_patterns(self, attempts: List[RecoveryAttempt]) -> List[str]:
        """Detect patterns in recovery attempts."""
        patterns = []
        
        # Check if backoff was effective
        backoff_attempts = [a for a in attempts if a.strategy == RecoveryStrategy.EXPONENTIAL_BACKOFF]
        if backoff_attempts and any(a.success for a in backoff_attempts):
            patterns.append("exponential_backoff_effective")
        
        # Check if different models help
        model_attempts = [a for a in attempts if a.strategy == RecoveryStrategy.DIFFERENT_MODEL]
        if model_attempts and any(a.success for a in model_attempts):
            patterns.append("model_switching_effective")
        
        return patterns
