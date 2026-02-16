"""Tests for telemetry module."""

import pytest
from az_os.core.telemetry import (
    HealthChecker,
    MetricsCollector,
    AlertManager,
    HealthStatus,
    AlertLevel
)


class TestHealthChecker:
    def test_run_cpu_check(self):
        checker = HealthChecker()
        result = checker.run_check("cpu")
        assert result.name == "cpu"
        assert result.status in [HealthStatus.HEALTHY, HealthStatus.DEGRADED, HealthStatus.UNHEALTHY]

    def test_run_memory_check(self):
        checker = HealthChecker()
        result = checker.run_check("memory")
        assert result.name == "memory"
        assert 0 <= result.details["memory_percent"] <= 100

    def test_run_all_checks(self):
        checker = HealthChecker()
        results = checker.run_all_checks()
        assert "cpu" in results
        assert "memory" in results
        assert "disk" in results

    def test_overall_status(self):
        checker = HealthChecker()
        checker.run_all_checks()
        status = checker.get_overall_status()
        assert isinstance(status, HealthStatus)


class TestMetricsCollector:
    def test_collect_system_metrics(self):
        collector = MetricsCollector()
        metrics = collector.collect_system_metrics()
        assert 0 <= metrics.cpu_percent <= 100
        assert 0 <= metrics.memory_percent <= 100
        assert metrics.disk_free_gb >= 0

    def test_collect_service_metrics(self):
        collector = MetricsCollector()
        metrics = collector.collect_service_metrics()
        assert metrics.uptime_seconds >= 0


class TestAlertManager:
    def test_trigger_alert(self):
        manager = AlertManager()
        manager.trigger_alert(
            alert_id="test-alert",
            level=AlertLevel.WARNING,
            message="Test alert",
            details={"key": "value"}
        )
        alerts = manager.get_recent_alerts(minutes=1)
        assert len(alerts) == 1
        assert alerts[0]["id"] == "test-alert"

    def test_cooldown(self):
        manager = AlertManager()
        manager.cooldown_period = 0.1

        # First alert succeeds
        manager.trigger_alert("test", AlertLevel.INFO, "Message 1")
        assert len(manager.alerts) == 1

        # Second alert within cooldown is skipped
        manager.trigger_alert("test", AlertLevel.INFO, "Message 2")
        assert len(manager.alerts) == 1

        # After cooldown, new alert succeeds
        import time
        time.sleep(0.2)
        manager.trigger_alert("test", AlertLevel.INFO, "Message 3")
        assert len(manager.alerts) == 2
