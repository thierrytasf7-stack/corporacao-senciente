from typing import Any, Dict, List, Optional, Callable, Tuple
import time
import threading
from queue import PriorityQueue
from dataclasses import dataclass
from enum import Enum
import sched
import logging
from datetime import datetime, timedelta


class TaskPriority(Enum):
    HIGH = 1
    MEDIUM = 2
    LOW = 3


class TaskStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class ScheduledTask:
    task_id: str
    task_func: Callable
    priority: TaskPriority
    args: Tuple[Any, ...] = ()
    kwargs: Dict[str, Any] = None
    dependencies: List[str] = None
    schedule_time: Optional[datetime] = None
    interval: Optional[timedelta] = None
    max_concurrent: int = 1
    created_at: float = None

    def __post_init__(self):
        if self.kwargs is None:
            self.kwargs = {}
        if self.dependencies is None:
            self.dependencies = []
        if self.created_at is None:
            self.created_at = time.time()


@dataclass
class TaskExecution:
    task_id: str
    status: TaskStatus
    start_time: Optional[float] = None
    end_time: Optional[float] = None
    result: Any = None
    error: Optional[str] = None
    resources_used: Dict[str, Any] = None

    def __post_init__(self):
        if self.resources_used is None:
            self.resources_used = {}


class TaskScheduler:
    def __init__(
        self,
        max_concurrent_tasks: int = 5,
        resource_limits: Dict[str, int] = None
    ):
        self.max_concurrent_tasks = max_concurrent_tasks
        self.resource_limits = resource_limits or {}
        self.task_queue: PriorityQueue = PriorityQueue()
        self.running_tasks: Dict[str, TaskExecution] = {}
        self.completed_tasks: Dict[str, TaskExecution] = {}
        self.task_dependencies: Dict[str, List[str]] = {}
        self.dependency_graph: Dict[str, List[str]] = {}
        self.scheduled_events: Dict[str, sched.Event] = {}
        self.scheduler = sched.scheduler(time.time, time.sleep)
        self.lock = threading.Lock()
        self.logger = logging.getLogger(__name__)
        self.running = False
        self.scheduler_thread = None

    def schedule(
        self,
        task_func: Callable,
        task_id: str,
        priority: TaskPriority = TaskPriority.MEDIUM,
        args: Tuple[Any, ...] = (),
        kwargs: Dict[str, Any] = None,
        dependencies: List[str] = None,
        schedule_time: Optional[datetime] = None,
        interval: Optional[timedelta] = None,
        max_concurrent: int = 1
    ) -> bool:
        """Schedule a new task."""
        if kwargs is None:
            kwargs = {}
        if dependencies is None:
            dependencies = []
        
        task = ScheduledTask(
            task_id=task_id,
            task_func=task_func,
            priority=priority,
            args=args,
            kwargs=kwargs,
            dependencies=dependencies,
            schedule_time=schedule_time,
            interval=interval,
            max_concurrent=max_concurrent
        )
        
        with self.lock:
            # Check if task with same ID already exists
            if self._task_exists(task_id):
                self.logger.warning(f"Task {task_id} already exists")
                return False
            
            # Add to dependency graph
            self._add_to_dependency_graph(task)
            
            # Add to queue
            queue_priority = (priority.value, time.time(), task_id)
            self.task_queue.put((queue_priority, task))
            
            # Schedule if specific time is set
            if schedule_time:
                self._schedule_at_time(task, schedule_time)
            
            self.logger.info(f"Task {task_id} scheduled with priority {priority.name}")
            return True

    def execute_scheduled(self) -> List[TaskExecution]:
        """Execute all ready tasks in the queue."""
        executed = []
        
        with self.lock:
            while not self.task_queue.empty():
                if len(self.running_tasks) >= self.max_concurrent_tasks:
                    break
                
                # Get next task
                queue_priority, task = self.task_queue.get()
                
                # Check if dependencies are met
                if not self._are_dependencies_met(task):
                    # Put back in queue
                    self.task_queue.put((queue_priority, task))
                    continue
                
                # Check resource limits
                if not self._check_resource_limits():
                    # Put back in queue
                    self.task_queue.put((queue_priority, task))
                    continue
                
                # Execute task
                execution = self._execute_task(task)
                executed.append(execution)
                
                # Update running tasks
                self.running_tasks[task.task_id] = execution
                
                # Handle intervals
                if task.interval:
                    self._reschedule_interval(task)
        
        return executed

    def get_queue_status(self) -> Dict[str, Any]:
        """Get current status of the task queue."""
        with self.lock:
            return {
                "total_tasks": self.task_queue.qsize() + len(self.running_tasks),
                "pending_tasks": self.task_queue.qsize(),
                "running_tasks": len(self.running_tasks),
                "completed_tasks": len(self.completed_tasks),
                "queue_size": self.task_queue.qsize(),
                "max_concurrent": self.max_concurrent_tasks,
                "current_concurrent": len(self.running_tasks),
                "resource_limits": self.resource_limits
            }

    def cancel_task(self, task_id: str) -> bool:
        """Cancel a scheduled task."""
        with self.lock:
            # Check if task is running
            if task_id in self.running_tasks:
                execution = self.running_tasks[task_id]
                execution.status = TaskStatus.CANCELLED
                execution.end_time = time.time()
                del self.running_tasks[task_id]
                self.completed_tasks[task_id] = execution
                return True
            
            # Check if task is in queue
            temp_queue = PriorityQueue()
            found = False
            
            while not self.task_queue.empty():
                queue_priority, task = self.task_queue.get()
                if task.task_id == task_id:
                    found = True
                else:
                    temp_queue.put((queue_priority, task))
            
            # Restore queue
            self.task_queue = temp_queue
            
            return found

    def start_scheduler(self, run_once: bool = False):
        """Start the scheduler thread."""
        if self.running:
            return
        
        self.running = True
        self.scheduler_thread = threading.Thread(
            target=self._scheduler_loop,
            args=(run_once,)
        )
        self.scheduler_thread.daemon = True
        self.scheduler_thread.start()

    def stop_scheduler(self):
        """Stop the scheduler."""
        self.running = False
        if self.scheduler_thread:
            self.scheduler_thread.join(timeout=5)

    def _scheduler_loop(self, run_once: bool = False):
        """Main scheduler loop."""
        while self.running:
            self.execute_scheduled()
            
            # Run scheduler events
            self.scheduler.run(blocking=False)
            
            if run_once:
                break
            
            time.sleep(1)

    def _execute_task(self, task: ScheduledTask) -> TaskExecution:
        """Execute a single task."""
        execution = TaskExecution(
            task_id=task.task_id,
            status=TaskStatus.RUNNING,
            start_time=time.time()
        )
        
        try:
            # Execute the task function
            result = task.task_func(*task.args, **task.kwargs)
            execution.result = result
            execution.status = TaskStatus.COMPLETED
            
        except Exception as e:
            execution.error = str(e)
            execution.status = TaskStatus.FAILED
            self.logger.error(f"Task {task.task_id} failed: {e}")
        
        finally:
            execution.end_time = time.time()
            
            # Record resource usage (placeholder)
            execution.resources_used = {
                "memory": random.randint(10, 100),  # MB
                "cpu_time": random.uniform(0.1, 5.0)  # seconds
            }
        
        # Move to completed tasks
        with self.lock:
            if task.task_id in self.running_tasks:
                del self.running_tasks[task.task_id]
            self.completed_tasks[task.task_id] = execution
        
        return execution

    def _task_exists(self, task_id: str) -> bool:
        """Check if task with given ID exists."""
        return (
            task_id in self.running_tasks or
            task_id in self.completed_tasks or
            any(task.task_id == task_id for _, task in self.task_queue.queue)
        )

    def _are_dependencies_met(self, task: ScheduledTask) -> bool:
        """Check if all dependencies for task are met."""
        for dependency in task.dependencies:
            if dependency not in self.completed_tasks:
                return False
        return True

    def _check_resource_limits(self) -> bool:
        """Check if resource limits allow new task."""
        # Simple resource check based on running tasks
        current_concurrent = len(self.running_tasks)
        return current_concurrent < self.max_concurrent_tasks

    def _add_to_dependency_graph(self, task: ScheduledTask):
        """Add task to dependency graph."""
        self.task_dependencies[task.task_id] = task.dependencies
        
        for dependency in task.dependencies:
            if dependency not in self.dependency_graph:
                self.dependency_graph[dependency] = []
            self.dependency_graph[dependency].append(task.task_id)

    def _schedule_at_time(self, task: ScheduledTask, schedule_time: datetime):
        """Schedule task for specific time."""
        delay = (schedule_time - datetime.now()).total_seconds()
        event = self.scheduler.enter(
            delay,
            1,
            self._execute_scheduled_task,
            argument=(task,)
        )
        self.scheduled_events[task.task_id] = event

    def _reschedule_interval(self, task: ScheduledTask):
        """Reschedule task for next interval."""
        next_time = datetime.now() + task.interval
        self._schedule_at_time(task, next_time)

    def _execute_scheduled_task(self, task: ScheduledTask):
        """Execute task that was scheduled for specific time."""
        with self.lock:
            # Add to queue with current time
            queue_priority = (task.priority.value, time.time(), task.task_id)
            self.task_queue.put((queue_priority, task))

    def get_task_history(self, task_id: str) -> List[TaskExecution]:
        """Get execution history for a task."""
        executions = []
        with self.lock:
            if task_id in self.completed_tasks:
                executions.append(self.completed_tasks[task_id])
            # Check for multiple executions (for interval tasks)
            for _, task in self.task_queue.queue:
                if task.task_id == task_id and task.interval:
                    # This would require tracking multiple executions
                    pass
        return executions

    def get_all_tasks(self) -> List[Dict[str, Any]]:
        """Get all tasks with their status."""
        tasks = []
        with self.lock:
            # Running tasks
            for task_id, execution in self.running_tasks.items():
                tasks.append({
                    "task_id": task_id,
                    "status": execution.status.value,
                    "type": "running",
                    "start_time": execution.start_time,
                    "priority": "N/A"
                })
            
            # Completed tasks
            for task_id, execution in self.completed_tasks.items():
                tasks.append({
                    "task_id": task_id,
                    "status": execution.status.value,
                    "type": "completed",
                    "end_time": execution.end_time,
                    "priority": "N/A"
                })
            
            # Pending tasks in queue
            for _, task in self.task_queue.queue:
                tasks.append({
                    "task_id": task.task_id,
                    "status": "pending",
                    "type": "pending",
                    "priority": task.priority.name,
                    "dependencies": task.dependencies
                })
        
        return tasks
