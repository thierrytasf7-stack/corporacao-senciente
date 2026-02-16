import pytest
import asyncio
from unittest.mock import Mock, patch
from datetime import datetime, timedelta
from src.az_os.core.telemetry import Telemetry, HealthCheckResult, Metric, Alert, AlertLevel


class TestTelemetry:
    """Test Telemetry functionality"""
    
    def test_telemetry_initialization(self):
        """Test telemetry initialization"""
        telemetry = Telemetry()
        assert telemetry.alerts is not None
        assert telemetry.metrics is not None
        assert telemetry.health_checks is not None
        assert telemetry.alert_history is not None
        assert len(telemetry.alerts) == 5  # Default alerts
    
    def test_default_alerts_setup(self):
        """Test default alerts setup"""
        telemetry = Telemetry()
        
        # Check default alerts
        alert_names = [alert.name for alert in telemetry.alerts]
        assert "High Error Rate" in alert_names
        assert "High Latency" in alert_names
        assert "Cost Spike" in alert_names
        assert "High CPU Usage" in alert_names
        assert "Low Memory" in alert_names
    
    def test_health_check_result(self):
        """Test HealthCheckResult dataclass"""
        result = HealthCheckResult(
            component="test_component",
            status="healthy",
            message="All good",
            timestamp=datetime.now(),
            duration=0.123
        )
        
        assert result.component == "test_component"
        assert result.status == "healthy"
        assert result.message == "All good"
        assert isinstance(result.timestamp, datetime)
        assert result.duration == 0.123
    
    def test_metric(self):
        """Test Metric dataclass"""
        metric = Metric(
            name="test_metric",
            value=123.45,
            unit="ms",
            timestamp=datetime.now()
        )
        
        assert metric.name == "test_metric"
        assert metric.value == 123.45
        assert metric.unit == "ms"
        assert isinstance(metric.timestamp, datetime)
    
    def test_alert(self):
        """Test Alert dataclass"""
        alert = Alert(
            name="test_alert",
            metric="test_metric",
            threshold=100.0,
            condition=">",
            level=AlertLevel.WARNING,
            message="Test alert message",
            duration=60
        )
        
        assert alert.name == "test_alert"
        assert alert.metric == "test_metric"
        assert alert.threshold == 100.0
        assert alert.condition == ">"
        assert alert.level == AlertLevel.WARNING
        assert alert.message == "Test alert message"
        assert alert.duration == 60
    
    def test_alert_level_enum(self):
        """Test AlertLevel enum"""
        assert AlertLevel.INFO.value == "info"
        assert AlertLevel.WARNING.value == "warning"
        assert AlertLevel.CRITICAL.value == "critical"


class TestTelemetryMethods:
    """Test Telemetry methods"""
    
    def test_check_health(self):
        """Test health check method"""
        telemetry = Telemetry()
        
        # Mock health check
        with patch.object(telemetry, '_perform_system_checks', return_value=[
            HealthCheckResult("cpu", "healthy", "CPU usage normal", datetime.now(), 0.1),
            HealthCheckResult("memory", "healthy", "Memory usage normal", datetime.now(), 0.2)
        ]):
            results = telemetry.check_health()
            assert len(results) == 2
            assert results[0].component == "cpu"
            assert results[1].component == "memory"
    
    def test_record_metric(self):
        """Test metric recording"""
        telemetry = Telemetry()
        
        metric = Metric("test_metric", 123.45, "ms", datetime.now())
        telemetry.metrics.append(metric)
        
        assert len(telemetry.metrics) == 1
        assert telemetry.metrics[0].name == "test_metric"
    
    def test_add_alert(self):
        """Test alert addition"""
        telemetry = Telemetry()
        
        alert = Alert("test_alert", "test_metric", 100.0, ">", AlertLevel.WARNING, "Test message")
        telemetry.alerts.append(alert)
        
        assert len(telemetry.alerts) == 6  # 5 default + 1 added
        assert telemetry.alerts[-1].name == "test_alert"
    
    def test_trigger_alert(self):
        """Test alert triggering"""
        telemetry = Telemetry()
        
        # Mock alert trigger
        with patch.object(telemetry, '_send_alert_notification', return_value=None):
            telemetry.trigger_alert("High CPU Usage", "cpu_percent", 85.0)
            
            # Check alert history
            assert len(telemetry.alert_history) == 1
            assert telemetry.alert_history[0]["name"] == "High CPU Usage"
    
    def test_get_alerts(self):
        """Test getting alerts"""
        telemetry = Telemetry()
        
        alerts = telemetry.get_alerts()
        assert len(alerts) == 5  # Default alerts
        assert isinstance(alerts[0], Alert)
    
    def test_get_metrics(self):
        """Test getting metrics"""
        telemetry = Telemetry()
        
        # Add test metric
        metric = Metric("test_metric", 123.45, "ms", datetime.now())
        telemetry.metrics.append(metric)
        
        metrics = telemetry.get_metrics()
        assert len(metrics) == 1
        assert metrics[0].name == "test_metric"
    
    def test_get_health_checks(self):
        """Test getting health checks"""
        telemetry = Telemetry()
        
        # Mock health check
        with patch.object(telemetry, '_perform_system_checks', return_value=[
            HealthCheckResult("cpu", "healthy", "CPU usage normal", datetime.now(), 0.1)
        ]):
            results = telemetry.get_health_checks()
            assert len(results) == 1
            assert results[0].component == "cpu"


class TestTelemetryAlertLogic:
    """Test Telemetry alert logic"""
    
    def test_alert_condition_evaluation(self):
        """Test alert condition evaluation"""
        telemetry = Telemetry()
        
        # Test greater than condition
        alert = Alert("test_alert", "test_metric", 100.0, ">", AlertLevel.WARNING, "Test message")
        assert telemetry._evaluate_condition(alert, 150.0) is True  # 150 > 100
        assert telemetry._evaluate_condition(alert, 50.0) is False   # 50 > 100
        
        # Test less than condition
        alert = Alert("test_alert", "test_metric", 100.0, "<", AlertLevel.WARNING, "Test message")
        assert telemetry._evaluate_condition(alert, 50.0) is True   # 50 < 100
        assert telemetry._evaluate_condition(alert, 150.0) is False  # 150 < 100
        
        # Test equal to condition
        alert = Alert("test_alert", "test_metric", 100.0, "==", AlertLevel.WARNING, "Test message")
        assert telemetry._evaluate_condition(alert, 100.0) is True  # 100 == 100
        assert telemetry._evaluate_condition(alert, 150.0) is False # 150 == 100
    
    def test_alert_threshold_check(self):
        """Test alert threshold checking"""
        telemetry = Telemetry()
        
        # Test CPU usage alert
        cpu_alert = next(a for a in telemetry.alerts if a.name == "High CPU Usage")
        assert telemetry._check_threshold(cpu_alert, 85.0) is True  # 85 > 80
        assert telemetry._check_threshold(cpu_alert, 75.0) is False # 75 > 80
        
        # Test memory usage alert
        memory_alert = next(a for a in telemetry.alerts if a.name == "Low Memory")
        assert telemetry._check_threshold(memory_alert, 95.0) is True  # 95 > 90
        assert telemetry._check_threshold(memory_alert, 85.0) is False # 85 > 90
    
    def test_alert_duration_check(self):
        """Test alert duration checking"""
        telemetry = Telemetry()
        
        # Test alert duration
        alert = Alert("test_alert", "test_metric", 100.0, ">", AlertLevel.WARNING, "Test message", duration=10)
        
        # First trigger - should trigger
        assert telemetry._check_duration(alert, 1) is True  # 1 < 10
        
        # After duration - should not trigger again
        assert telemetry._check_duration(alert, 11) is False  # 11 >= 10
    
    def test_alert_suppression(self):
        """Test alert suppression"""
        telemetry = Telemetry()
        
        # Test alert suppression
        alert = Alert("test_alert", "test_metric", 100.0, ">", AlertLevel.WARNING, "Test message", duration=60)
        
        # First trigger - should trigger
        assert telemetry._should_trigger_alert(alert, 150.0, last_triggered=None) is True
        
        # Recent trigger - should not trigger
        assert telemetry._should_trigger_alert(alert, 150.0, last_triggered=datetime.now()) is False
        
        # Old trigger - should trigger again
        old_time = datetime.now() - timedelta(minutes=2)
        assert telemetry._should_trigger_alert(alert, 150.0, last_triggered=old_time) is True


class TestTelemetryIntegration:
    """Test Telemetry integration"""
    
    def test_system_health_check(self):
        """Test system health check integration"""
        telemetry = Telemetry()
        
        # Mock system checks
        with patch('psutil.cpu_percent', return_value=50.0):
            with patch('psutil.virtual_memory', return_value=Mock(percent=40.0)):
                results = telemetry.check_health()
                
                # Verify results
                cpu_result = next(r for r in results if r.component == "cpu")
                memory_result = next(r for r in results if r.component == "memory")
                
                assert cpu_result.status == "healthy"
                assert memory_result.status == "healthy"
    
    def test_metric_collection(self):
        """Test metric collection"""
        telemetry = Telemetry()
        
        # Mock metric collection
        with patch.object(telemetry, '_collect_system_metrics', return_value=[
            Metric("cpu_percent", 50.0, "%", datetime.now()),
            Metric("memory_percent", 40.0, "%", datetime.now())
        ]):
            metrics = telemetry.collect_metrics()
            
            # Verify metrics
            assert len(metrics) == 2
            assert metrics[0].name == "cpu_percent"
            assert metrics[1].name == "memory_percent"
    
    def test_alert_monitoring(self):
        """Test alert monitoring"""
        telemetry = Telemetry()
        
        # Mock alert monitoring
        with patch.object(telemetry, '_monitor_alerts', return_value=[
            {"name": "High CPU Usage", "triggered": True, "level": "warning"}
        ]):
            alerts = telemetry.monitor_alerts()
            
            # Verify alerts
            assert len(alerts) == 1
            assert alerts[0]["name"] == "High CPU Usage"
            assert alerts[0]["triggered"] is True
            assert alerts[0]["level"] == "warning"


class TestTelemetryPerformance:
    """Test Telemetry performance"""
    
    def test_telemetry_performance(self):
        """Test telemetry performance characteristics"""
        telemetry = Telemetry()
        
        # Test performance with large number of metrics
        start_time = time.time()
        for i in range(1000):
            metric = Metric(f"metric_{i}", i * 1.0, "units", datetime.now())
            telemetry.metrics.append(metric)
        
        # Test performance with large number of health checks
        for i in range(100):
            result = HealthCheckResult(
                f"component_{i}",
                "healthy",
                "All good",
                datetime.now(),
                0.01
            )
            telemetry.health_checks.append(result)
        
        # Verify performance is acceptable
        elapsed_time = time.time() - start_time
        assert elapsed_time < 1.0  # Should complete in under 1 second
        
        # Verify memory usage is reasonable
        assert len(telemetry.metrics) == 1000
        assert len(telemetry.health_checks) == 100