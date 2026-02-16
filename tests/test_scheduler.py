import pytest
from datetime import datetime, timedelta
from unittest.mock import MagicMock
from src.az_os.core import TaskScheduler, ScheduledTask, TaskExecution, TaskPriority, TaskStatus
import time


class TestTaskScheduler:
    def setup_method(self):
        self.scheduler = TaskScheduler(max_concurrent_tasks=5)
    
    def test_schedule_task(self):
        """Test scheduling a new task."""
        def demo_task():
            return "Task completed"
        
        result = self.scheduler.schedule(
            task_func=demo_task,
            task_id="test_task",
            priority=TaskPriority.MEDIUM
        )
        
        assert result == True
        assert self.scheduler.task_queue.qsize() == 1
    
    def test_schedule_duplicate_task(self):
        """Test scheduling a task with duplicate ID."""
        def demo_task():
            return "Task completed"
        
        # Schedule first task
        self.scheduler.schedule(
            task_func=demo_task,
            task_id="test_task",
            priority=TaskPriority.MEDIUM
        )
        
        # Try to schedule duplicate
        result = self.scheduler.schedule(
            task_func=demo_task,
            task_id="test_task",
            priority=TaskPriority.HIGH
        )
        
        assert result == False
        assert self.scheduler.task_queue.qsize() == 1
    
    def test_execute_scheduled_tasks(self):
        """Test execution of scheduled tasks."""
        def demo_task(name):
            time.sleep(0.1)
            return f"Task {name} completed"
        
        # Schedule tasks
        self.scheduler.schedule(
            task_func=demo_task,
            task_id="task_1",
            priority=TaskPriority.HIGH,
            args=("High Priority",)
        )
        
        self.scheduler.schedule(
            task_func=demo_task,
            task_id="task_2",
            priority=TaskPriority.LOW,
            args=("Low Priority",)
        )
        
        # Execute tasks
        executed = self.scheduler.execute_scheduled()
        
        assert len(executed) == 2
        assert executed[0].status == TaskStatus.COMPLETED
        assert executed[1].status == TaskStatus.COMPLETED
        assert executed[0].result == "Task High Priority completed"
        assert executed[1].result == "Task Low Priority completed"
    
    def test_task_dependencies(self):
        """Test task dependencies are respected."""
        def demo_task(name):
            time.sleep(0.1)
            return f"Task {name} completed"
        
        # Schedule tasks with dependencies
        self.scheduler.schedule(
            task_func=demo_task,
            task_id="task_1",
            priority=TaskPriority.HIGH,
            args=("Task 1",)
        )
        
        self.scheduler.schedule(
            task_func=demo_task,
            task_id="task_2",
            priority=TaskPriority.HIGH,
            args=("Task 2",),
            dependencies=["task_1"]
        )
        
        # Execute tasks
        executed = self.scheduler.execute_scheduled()
        
        # Only task_1 should execute (task_2 waiting for dependency)
        assert len(executed) == 1
        assert executed[0].task_id == "task_1"
        assert executed[0].status == TaskStatus.COMPLETED
        
        # Mark task_1 as completed
        self.scheduler.completed_tasks["task_1"] = TaskExecution(
            task_id="task_1",
            status=TaskStatus.COMPLETED
        )
        
        # Execute again, task_2 should now run
        executed = self.scheduler.execute_scheduled()
        assert len(executed) == 1
        assert executed[0].task_id == "task_2"
    
    def test_max_concurrent_tasks(self):
        """Test max concurrent tasks limit."""
        def demo_task():
            time.sleep(0.2)
            return "Task completed"
        
        # Schedule more tasks than max concurrent
        for i in range(10):
            self.scheduler.schedule(
                task_func=demo_task,
                task_id=f"task_{i}",
                priority=TaskPriority.MEDIUM
            )
        
        # Execute tasks
        executed = self.scheduler.execute_scheduled()
        
        # Should execute up to max concurrent (5)
        assert len(executed) <= 5
        assert len(executed) > 0
    
    def test_cancel_task(self):
        """Test task cancellation."""
        def demo_task():
            time.sleep(1)
            return "Task completed"
        
        # Schedule task
        self.scheduler.schedule(
            task_func=demo_task,
            task_id="test_task",
            priority=TaskPriority.MEDIUM
        )
        
        # Cancel task
        result = self.scheduler.cancel_task("test_task")
        
        assert result == True
        assert self.scheduler.task_queue.qsize() == 0
        assert "test_task" not in self.scheduler.running_tasks
        assert "test_task" not in self.scheduler.completed_tasks
    
    def test_cancel_nonexistent_task(self):
        """Test cancellation of non-existent task."""
        result = self.scheduler.cancel_task("nonexistent_task")
        
        assert result == False
    
    def test_get_queue_status(self):
        """Test getting queue status."""
        def demo_task():
            return "Task completed"
        
        # Schedule some tasks
        self.scheduler.schedule(
            task_func=demo_task,
            task_id="task_1",
            priority=TaskPriority.HIGH
        )
        
        self.scheduler.schedule(
            task_func=demo_task,
            task_id="task_2",
            priority=TaskPriority.LOW
        )
        
        status = self.scheduler.get_queue_status()
        
        assert status["total_tasks"] == 2
        assert status["pending_tasks"] == 2
        assert status["running_tasks"] == 0
        assert status["max_concurrent"] == 5
    
    def test_get_all_tasks(self):
        """Test getting all tasks with their status."""
        def demo_task():
            return "Task completed"
        
        # Schedule tasks
        self.scheduler.schedule(
            task_func=demo_task,
            task_id="task_1",
            priority=TaskPriority.HIGH
        )
        
        # Execute one task
        self.scheduler.execute_scheduled()
        
        tasks = self.scheduler.get_all_tasks()
        
        assert len(tasks) == 1
        assert tasks[0]["task_id"] == "task_1"
        assert tasks[0]["status"] == "completed"
        assert tasks[0]["type"] == "completed"
    
    def test_interval_scheduling(self):
        """Test interval-based scheduling."""
        execution_count = 0
        
        def interval_task():
            nonlocal execution_count
            execution_count += 1
            return f"Executed {execution_count} times"
        
        # Schedule task with interval
        self.scheduler.schedule(
            task_func=interval_task,
            task_id="interval_task",
            priority=TaskPriority.MEDIUM,
            interval=timedelta(seconds=0.1)
        )
        
        # Run scheduler for a short time
        self.scheduler.start_scheduler(run_once=True)
        time.sleep(0.3)
        self.scheduler.stop_scheduler()
        
        # Should have executed multiple times
        assert execution_count >= 2
    
    def test_scheduled_time(self):
        """Test scheduling at specific time."""
        def scheduled_task():
            return "Scheduled task executed"
        
        # Schedule task for near future
        future_time = datetime.now() + timedelta(seconds=0.1)
        
        self.scheduler.schedule(
            task_func=scheduled_task,
            task_id="future_task",
            priority=TaskPriority.HIGH,
            schedule_time=future_time
        )
        
        # Run scheduler
        self.scheduler.start_scheduler(run_once=True)
        time.sleep(0.2)
        self.scheduler.stop_scheduler()
        
        # Task should have been executed
        tasks = self.scheduler.get_all_tasks()
        executed_tasks = [t for t in tasks if t["status"] == "completed"]
        assert len(executed_tasks) == 1
    
    def test_resource_limits(self):
        """Test resource limit checking."""
        def demo_task():
            return "Task completed"
        
        # Set low resource limit
        self.scheduler.resource_limits = {"memory": 100}
        
        # Schedule task (should still work as we're not actually checking real resources)
        result = self.scheduler.schedule(
            task_func=demo_task,
            task_id="resource_task",
            priority=TaskPriority.MEDIUM
        )
        
        assert result == True
        assert self.scheduler._check_resource_limits() == True
    
    def test_task_execution_with_error(self):
        """Test task execution that fails."""
        def failing_task():
            raise ValueError("Task failed")
        
        # Schedule failing task
        self.scheduler.schedule(
            task_func=failing_task,
            task_id="failing_task",
            priority=TaskPriority.HIGH
        )
        
        # Execute task
        executed = self.scheduler.execute_scheduled()
        
        assert len(executed) == 1
        assert executed[0].status == TaskStatus.FAILED
        assert "ValueError" in executed[0].error
    
    def test_task_execution_metrics(self):
        """Test task execution metrics."""
        def demo_task():
            time.sleep(0.1)
            return "Task completed"
        
        # Schedule task
        self.scheduler.schedule(
            task_func=demo_task,
            task_id="metrics_task",
            priority=TaskPriority.MEDIUM
        )
        
        # Execute task
        executed = self.scheduler.execute_scheduled()
        
        assert len(executed) == 1
        execution = executed[0]
        
        # Check execution metrics
        assert execution.start_time is not None
        assert execution.end_time is not None
        assert execution.end_time > execution.start_time
        assert execution.resources_used["memory"] > 0
        assert execution.resources_used["cpu_time"] > 0
    
    def test_priority_queueing(self):
        """Test priority-based task queueing."""
        def demo_task(name):
            return f"Task {name} completed"
        
        # Schedule tasks with different priorities
        self.scheduler.schedule(
            task_func=demo_task,
            task_id="high_priority",
            priority=TaskPriority.HIGH,
            args=("High",)
        )
        
        self.scheduler.schedule(
            task_func=demo_task,
            task_id="low_priority",
            priority=TaskPriority.LOW,
            args=("Low",)
        )
        
        self.scheduler.schedule(
            task_func=demo_task,
            task_id="medium_priority",
            priority=TaskPriority.MEDIUM,
            args=("Medium",)
        )
        
        # Execute tasks
        executed = self.scheduler.execute_scheduled()
        
        # Tasks should be executed in priority order
        task_ids = [t.task_id for t in executed]
        assert task_ids[0] == "high_priority"
        assert task_ids[1] == "medium_priority"
        assert task_ids[2] == "low_priority"
