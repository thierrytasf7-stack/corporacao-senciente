"""Telemetry and monitoring for AZ-OS v2.0.

Provides system health checks, service availability monitoring,
performance metrics, and alerting for production deployments.
"""

import os
import time
import psutil
import logging
import platform
from typing import Dict, List, Optional, Callable, Any
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from enum import Enum

logger = logging.getLogger(__name__)


class HealthStatus(Enum):
    """Health check status."""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    UNKNOWN = "unknown"


class AlertLevel(Enum):
    """Alert severity levels."""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


@dataclass
class HealthCheck:
    """Health check result."""
    name: str
    status: HealthStatus
    message: str
    timestamp: float
    duration_ms: float
    details: Dict[str, Any]


@dataclass
class PerformanceMetrics:
    """System performance metrics."""
    cpu_percent: float
    memory_percent: float
    memory_available_mb: float
    disk_percent: float
    disk_free_gb: float
    load_average: List[float]
    process_count: int
    thread_count: int
    open_files: int
    timestamp: float


@dataclass
class ServiceMetrics:
    """AZ-OS service metrics."""
    tasks_completed: int
    tasks_failed: int
    tasks_in_progress: int
    average_task_duration_s: float
    total_cost_usd: float
    api_calls_count: int
    cache_hit_rate: float
    uptime_seconds: float
    timestamp: float


class HealthChecker:
    """System health monitoring."""

    def __init__(self):
        self.checks: Dict[str, Callable] = {}
        self.last_results: Dict[str, HealthCheck] = {}

        # Register default checks
        self.register_check("cpu", self._check_cpu)
        self.register_check("memory", self._check_memory)
        self.register_check("disk", self._check_disk)
        self.register_check("database", self._check_database)
        self.register_check("llm_api", self._check_llm_api)

    def register_check(self, name: str, check_func: Callable):
        """Register a health check function."""
        self.checks[name] = check_func

    def run_check(self, name: str) -> HealthCheck:
        """Run a specific health check."""
        if name not in self.checks:
            return HealthCheck(
                name=name,
                status=HealthStatus.UNKNOWN,
                message=f"Unknown check: {name}",
                timestamp=time.time(),
                duration_ms=0,
                details={}
            )

        start = time.time()
        try:
            result = self.checks[name]()
            duration_ms = (time.time() - start) * 1000

            check_result = HealthCheck(
                name=name,
                status=result.get("status", HealthStatus.UNKNOWN),
                message=result.get("message", ""),
                timestamp=time.time(),
                duration_ms=duration_ms,
                details=result.get("details", {})
            )

            self.last_results[name] = check_result
            return check_result

        except Exception as e:
            logger.error(f"Health check {name} failed: {e}")
            return HealthCheck(
                name=name,
                status=HealthStatus.UNHEALTHY,
                message=f"Check failed: {e}",
                timestamp=time.time(),
                duration_ms=(time.time() - start) * 1000,
                details={"error": str(e)}
            )

    def run_all_checks(self) -> Dict[str, HealthCheck]:
        """Run all registered health checks."""
        results = {}
        for name in self.checks:
            results[name] = self.run_check(name)
        return results

    def get_overall_status(self) -> HealthStatus:
        """Get overall system health status."""
        if not self.last_results:
            return HealthStatus.UNKNOWN

        statuses = [check.status for check in self.last_results.values()]

        if any(s == HealthStatus.UNHEALTHY for s in statuses):
            return HealthStatus.UNHEALTHY
        elif any(s == HealthStatus.DEGRADED for s in statuses):
            return HealthStatus.DEGRADED
        elif all(s == HealthStatus.HEALTHY for s in statuses):
            return HealthStatus.HEALTHY
        else:
            return HealthStatus.UNKNOWN

    # Default health checks

    def _check_cpu(self) -> dict:
        """Check CPU usage."""
        cpu_percent = psutil.cpu_percent(interval=1)

        if cpu_percent > 90:
            status = HealthStatus.UNHEALTHY
            message = f"CPU usage critical: {cpu_percent}%"
        elif cpu_percent > 70:
            status = HealthStatus.DEGRADED
            message = f"CPU usage high: {cpu_percent}%"
        else:
            status = HealthStatus.HEALTHY
            message = f"CPU usage normal: {cpu_percent}%"

        return {
            "status": status,
            "message": message,
            "details": {
                "cpu_percent": cpu_percent,
                "cpu_count": psutil.cpu_count(),
                "load_average": list(psutil.getloadavg())
            }
        }

    def _check_memory(self) -> dict:
        """Check memory usage."""
        memory = psutil.virtual_memory()

        if memory.percent > 90:
            status = HealthStatus.UNHEALTHY
            message = f"Memory usage critical: {memory.percent}%"
        elif memory.percent > 75:
            status = HealthStatus.DEGRADED
            message = f"Memory usage high: {memory.percent}%"
        else:
            status = HealthStatus.HEALTHY
            message = f"Memory usage normal: {memory.percent}%"

        return {
            "status": status,
            "message": message,
            "details": {
                "memory_percent": memory.percent,
                "memory_available_mb": memory.available / (1024**2),
                "memory_total_mb": memory.total / (1024**2)
            }
        }

    def _check_disk(self) -> dict:
        """Check disk usage."""
        disk = psutil.disk_usage('/')

        if disk.percent > 95:
            status = HealthStatus.UNHEALTHY
            message = f"Disk usage critical: {disk.percent}%"
        elif disk.percent > 85:
            status = HealthStatus.DEGRADED
            message = f"Disk usage high: {disk.percent}%"
        else:
            status = HealthStatus.HEALTHY
            message = f"Disk usage normal: {disk.percent}%"

        return {
            "status": status,
            "message": message,
            "details": {
                "disk_percent": disk.percent,
                "disk_free_gb": disk.free / (1024**3),
                "disk_total_gb": disk.total / (1024**3)
            }
        }

    def _check_database(self) -> dict:
        """Check database connectivity."""
        try:
            from .storage import TaskStorage
            storage = TaskStorage()
            # Try to read from database
            storage.list_tasks(limit=1)

            return {
                "status": HealthStatus.HEALTHY,
                "message": "Database accessible",
                "details": {"connection": "ok"}
            }
        except Exception as e:
            return {
                "status": HealthStatus.UNHEALTHY,
                "message": f"Database error: {e}",
                "details": {"error": str(e)}
            }

    def _check_llm_api(self) -> dict:
        """Check LLM API connectivity."""
        try:
            # Simple connectivity check (not full API call)
            import socket
            socket.create_connection(("api.openrouter.ai", 443), timeout=5)

            return {
                "status": HealthStatus.HEALTHY,
                "message": "LLM API reachable",
                "details": {"connectivity": "ok"}
            }
        except Exception as e:
            return {
                "status": HealthStatus.DEGRADED,
                "message": f"LLM API unreachable: {e}",
                "details": {"error": str(e)}
            }


class MetricsCollector:
    """Collect and aggregate system and service metrics."""

    def __init__(self):
        self.start_time = time.time()

    def collect_system_metrics(self) -> PerformanceMetrics:
        """Collect current system performance metrics."""
        cpu_percent = psutil.cpu_percent(interval=0.1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')

        # Get process info
        process = psutil.Process()
        open_files = len(process.open_files())

        return PerformanceMetrics(
            cpu_percent=cpu_percent,
            memory_percent=memory.percent,
            memory_available_mb=memory.available / (1024**2),
            disk_percent=disk.percent,
            disk_free_gb=disk.free / (1024**3),
            load_average=list(psutil.getloadavg()) if hasattr(psutil, 'getloadavg') else [0, 0, 0],
            process_count=len(psutil.pids()),
            thread_count=process.num_threads(),
            open_files=open_files,
            timestamp=time.time()
        )

    def collect_service_metrics(self, storage=None) -> ServiceMetrics:
        """Collect AZ-OS service metrics."""
        # TODO: Get real metrics from storage
        # For now, return mock data
        uptime = time.time() - self.start_time

        return ServiceMetrics(
            tasks_completed=0,
            tasks_failed=0,
            tasks_in_progress=0,
            average_task_duration_s=0.0,
            total_cost_usd=0.0,
            api_calls_count=0,
            cache_hit_rate=0.0,
            uptime_seconds=uptime,
            timestamp=time.time()
        )


class AlertManager:
    """Manage alerts and notifications."""

    def __init__(self):
        self.alerts: List[Dict[str, Any]] = []
        self.alert_cooldowns: Dict[str, float] = {}
        self.cooldown_period = 300  # 5 minutes

    def trigger_alert(
        self,
        alert_id: str,
        level: AlertLevel,
        message: str,
        details: Optional[Dict[str, Any]] = None
    ):
        """Trigger an alert."""
        now = time.time()

        # Check cooldown to prevent alert spam
        if alert_id in self.alert_cooldowns:
            if now - self.alert_cooldowns[alert_id] < self.cooldown_period:
                logger.debug(f"Alert {alert_id} in cooldown, skipping")
                return

        alert = {
            "id": alert_id,
            "level": level.value,
            "message": message,
            "details": details or {},
            "timestamp": now,
            "datetime": datetime.fromtimestamp(now).isoformat()
        }

        self.alerts.append(alert)
        self.alert_cooldowns[alert_id] = now

        # Log alert
        log_func = {
            AlertLevel.INFO: logger.info,
            AlertLevel.WARNING: logger.warning,
            AlertLevel.ERROR: logger.error,
            AlertLevel.CRITICAL: logger.critical
        }.get(level, logger.info)

        log_func(f"[ALERT:{level.value.upper()}] {message}")

        # TODO: Send to external alerting system (email, Slack, PagerDuty)

    def get_recent_alerts(self, minutes: int = 60) -> List[Dict[str, Any]]:
        """Get alerts from last N minutes."""
        cutoff = time.time() - (minutes * 60)
        return [a for a in self.alerts if a["timestamp"] > cutoff]

    def clear_alerts(self):
        """Clear all alerts."""
        self.alerts.clear()
        self.alert_cooldowns.clear()


# Global instances
health_checker = HealthChecker()
metrics_collector = MetricsCollector()
alert_manager = AlertManager()
