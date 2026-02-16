"""
Telemetry and monitoring module for AZ-OS v2.0
Handles system health checks, service availability, performance monitoring,
and alerting with configurable thresholds.
"""

import psutil
import time
import logging
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum


class AlertLevel(Enum):
    """Alert severity levels"""
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


@dataclass
class HealthCheckResult:
    """Result of a health check"""
    component: str
    status: str
    message: str
    timestamp: datetime
    duration: float


@dataclass
class Metric:
    """Performance metric"""
    name: str
    value: float
    unit: str
    timestamp: datetime


@dataclass
class Alert:
    """Alert definition"""
    name: str
    metric: str
    threshold: float
    condition: str
    level: AlertLevel
    message: str
    duration: int = 60  # seconds


class Telemetry:
    """Telemetry and monitoring system for AZ-OS"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.alerts: List[Alert] = []
        self.metrics: List[Metric] = []
        self.health_checks: List[HealthCheckResult] = []
        self.alert_history: List[Dict[str, Any]] = []
        
        # Default alerts
        self._setup_default_alerts()
    
    def _setup_default_alerts(self) -> None:
        """Setup default alerting rules"""
        self.alerts = [
            Alert(
                name="High Error Rate",
                metric="error_rate",
                threshold=0.1,
                condition=">",
                level=AlertLevel.CRITICAL,
                message="Error rate exceeded 10%"
            ),
            Alert(
                name="High Latency",
                metric="p95_latency",
                threshold=2000.0,
                condition=">",
                level=AlertLevel.WARNING,
                message="95th percentile latency exceeded 2 seconds"
            ),
            Alert(
                name="Cost Spike",
                metric="cost",
                threshold=100.0,
                condition=">",
                level=AlertLevel.WARNING,
                message="Cost exceeded $100 in last hour"
            ),
            Alert(
                name="High CPU Usage",
                metric="cpu_percent",
                threshold=80.0,
                condition=">",
                level=AlertLevel.WARNING,
                message="CPU usage exceeded 80%"
            ),
            Alert(
                name="Low Memory",
                metric="memory_percent",
                threshold=90.0,
                condition=">",
                level=AlertLevel.CRITICAL,
                message="Memory usage exceeded 90%"
            )
        ]
    
    def check_health(self) -> List[HealthCheckResult]:
        """Perform comprehensive system health checks"""
        self.health_checks = []
        
        # System health checks
        self.health_checks.append(self._check_system_resources())
        self.health_checks.append(self._check_disk_space())
        self.health_checks.append(self._check_memory())
        
        # Service availability checks
        self.health_checks.append(self._check_database())
        self.health_checks.append(self._check_llm_api())
        
        return self.health_checks
    
    def _check_system_resources(self) -> HealthCheckResult:
        """Check overall system resource usage"""
        start_time = time.time()
        
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            load_avg = psutil.getloadavg()
            
            if cpu_percent > 80:
                status = "WARNING"
                message = f"High CPU usage: {cpu_percent}%"
            else:
                status = "OK"
                message = f"CPU usage: {cpu_percent}%"
            
            duration = time.time() - start_time
            return HealthCheckResult(
                component="system_resources",
                status=status,
                message=message,
                timestamp=datetime.utcnow(),
                duration=duration
            )
            
        except Exception as e:
            return HealthCheckResult(
                component="system_resources",
                status="ERROR",
                message=f"Failed to check system resources: {str(e)}",
                timestamp=datetime.utcnow(),
                duration=time.time() - start_time
            )
    
    def _check_disk_space(self) -> HealthCheckResult:
        """Check disk space availability"""
        start_time = time.time()
        
        try:
            disk_usage = psutil.disk_usage('/')
            free_percent = disk_usage.percent
            
            if free_percent > 90:
                status = "CRITICAL"
                message = f"Low disk space: {free_percent}% used"
            elif free_percent > 80:
                status = "WARNING"
                message = f"High disk usage: {free_percent}% used"
            else:
                status = "OK"
                message = f"Disk usage: {free_percent}% used"
            
            duration = time.time() - start_time
            return HealthCheckResult(
                component="disk_space",
                status=status,
                message=message,
                timestamp=datetime.utcnow(),
                duration=duration
            )
            
        except Exception as e:
            return HealthCheckResult(
                component="disk_space",
                status="ERROR",
                message=f"Failed to check disk space: {str(e)}",
                timestamp=datetime.utcnow(),
                duration=time.time() - start_time
            )
    
    def _check_memory(self) -> HealthCheckResult:
        """Check memory usage"""
        start_time = time.time()
        
        try:
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            
            if memory_percent > 90:
                status = "CRITICAL"
                message = f"High memory usage: {memory_percent}%"
            elif memory_percent > 80:
                status = "WARNING"
                message = f"High memory usage: {memory_percent}%"
            else:
                status = "OK"
                message = f"Memory usage: {memory_percent}%"
            
            duration = time.time() - start_time
            return HealthCheckResult(
                component="memory",
                status=status,
                message=message,
                timestamp=datetime.utcnow(),
                duration=duration
            )
            
        except Exception as e:
            return HealthCheckResult(
                component="memory",
                status="ERROR",
                message=f"Failed to check memory: {str(e)}",
                timestamp=datetime.utcnow(),
                duration=time.time() - start_time
            )
    
    def _check_database(self) -> HealthCheckResult:
        """Check database connectivity"""
        start_time = time.time()
        
        try:
            # In production, check actual database connection
            # For now, simulate a check
            status = "OK"
            message = "Database connection healthy"
            
            duration = time.time() - start_time
            return HealthCheckResult(
                component="database",
                status=status,
                message=message,
                timestamp=datetime.utcnow(),
                duration=duration
            )
            
        except Exception as e:
            return HealthCheckResult(
                component="database",
                status="ERROR",
                message=f"Database check failed: {str(e)}",
                timestamp=datetime.utcnow(),
                duration=time.time() - start_time
            )
    
    def _check_llm_api(self) -> HealthCheckResult:
        """Check LLM API connectivity"""
        start_time = time.time()
        
        try:
            # In production, check actual LLM API
            # For now, simulate a check
            status = "OK"
            message = "LLM API connection healthy"
            
            duration = time.time() - start_time
            return HealthCheckResult(
                component="llm_api",
                status=status,
                message=message,
                timestamp=datetime.utcnow(),
                duration=duration
            )
            
        except Exception as e:
            return HealthCheckResult(
                component="llm_api",
                status="ERROR",
                message=f"LLM API check failed: {str(e)}",
                timestamp=datetime.utcnow(),
                duration=time.time() - start_time
            )
    
    def get_metrics(self) -> List[Metric]:
        """Collect performance metrics"""
        self.metrics = []
        
        # System metrics
        self.metrics.append(self._get_cpu_metrics())
        self.metrics.append(self._get_memory_metrics())
        self.metrics.append(self._get_disk_metrics())
        
        # Application metrics
        self.metrics.append(self._get_request_metrics())
        self.metrics.append(self._get_error_metrics())
        
        return self.metrics
    
    def _get_cpu_metrics(self) -> Metric:
        """Get CPU-related metrics"""
        cpu_percent = psutil.cpu_percent()
        return Metric(
            name="cpu_percent",
            value=cpu_percent,
            unit="%",
            timestamp=datetime.utcnow()
        )
    
    def _get_memory_metrics(self) -> Metric:
        """Get memory-related metrics"""
        memory = psutil.virtual_memory()
        return Metric(
            name="memory_percent",
            value=memory.percent,
            unit="%",
            timestamp=datetime.utcnow()
        )
    
    def _get_disk_metrics(self) -> Metric:
        """Get disk-related metrics"""
        disk = psutil.disk_usage('/')
        return Metric(
            name="disk_percent",
            value=disk.percent,
            unit="%",
            timestamp=datetime.utcnow()
        )
    
    def _get_request_metrics(self) -> Metric:
        """Get request-related metrics"""
        # In production, track actual request metrics
        # For now, simulate
        return Metric(
            name="request_rate",
            value=10.0,  # requests per second
            unit="req/s",
            timestamp=datetime.utcnow()
        )
    
    def _get_error_metrics(self) -> Metric:
        """Get error-related metrics"""
        # In production, track actual error metrics
        # For now, simulate
        return Metric(
            name="error_rate",
            value=0.01,  # 1% error rate
            unit="%",
            timestamp=datetime.utcnow()
        )
    
    def should_alert(self) -> List[Alert]:
        """Check if any alerts should be triggered"""
        triggered_alerts = []
        
        # Get current metrics
        metrics = self.get_metrics()
        
        # Check each alert condition
        for alert in self.alerts:
            # Find the metric for this alert
            metric = next((m for m in metrics if m.name == alert.metric), None)
            
            if metric:
                # Check condition
                if alert.condition == ">" and metric.value > alert.threshold:
                    triggered_alerts.append(alert)
                elif alert.condition == "<" and metric.value < alert.threshold:
                    triggered_alerts.append(alert)
                elif alert.condition == ">=" and metric.value >= alert.threshold:
                    triggered_alerts.append(alert)
                elif alert.condition == "<=" and metric.value <= alert.threshold:
                    triggered_alerts.append(alert)
                elif alert.condition == "==" and metric.value == alert.threshold:
                    triggered_alerts.append(alert)
        
        # Check if alerts should be triggered based on duration
        current_time = datetime.utcnow()
        for alert in triggered_alerts:
            # Check if this alert was already triggered recently
            recent_triggers = [
                a for a in self.alert_history 
                if a['name'] == alert.name and 
                   (current_time - a['timestamp']).total_seconds() < alert.duration
            ]
            
            if not recent_triggers:
                # Trigger the alert
                self._trigger_alert(alert)
        
        return triggered_alerts
    
    def _trigger_alert(self, alert: Alert) -> None:
        """Trigger an alert"""
        alert_event = {
            'name': alert.name,
            'level': alert.level.value,
            'message': alert.message,
            'timestamp': datetime.utcnow(),
            'metric': alert.metric,
            'value': self._get_current_metric_value(alert.metric)
        }
        
        self.alert_history.append(alert_event)
        self.logger.warning(f"ALERT: {alert.message} (Level: {alert.level.value})")
        
        # In production, send to alerting system
        # For now, just log
    
    def _get_current_metric_value(self, metric_name: str) -> float:
        """Get current value for a metric"""
        metrics = self.get_metrics()
        metric = next((m for m in metrics if m.name == metric_name), None)
        return metric.value if metric else 0.0
    
    def suggest_actions(self, alert: Alert) -> List[str]:
        """Suggest actions based on alert type"""
        actions = []
        
        if alert.name == "High Error Rate":
            actions.extend([
                "Check application logs for error details",
                "Verify database connectivity",
                "Check external service dependencies",
                "Review recent code changes"
            ])
        elif alert.name == "High Latency":
            actions.extend([
                "Check system resource usage",
                "Review database query performance",
                "Check network connectivity",
                "Consider scaling resources"
            ])
        elif alert.name == "Cost Spike":
            actions.extend([
                "Review recent API usage",
                "Check for inefficient queries",
                "Review third-party service costs",
                "Consider implementing usage limits"
            ])
        elif alert.name == "High CPU Usage":
            actions.extend([
                "Check for CPU-intensive processes",
                "Review application performance",
                "Consider scaling compute resources",
                "Check for infinite loops or recursion"
            ])
        elif alert.name == "Low Memory":
            actions.extend([
                "Check for memory leaks",
                "Review application memory usage",
                "Consider scaling memory resources",
                "Check for large data structures"
            ])
        
        return actions
    
    def get_health_dashboard_data(self) -> Dict[str, Any]:
        """Get data for health dashboard"""
        health_checks = self.check_health()
        metrics = self.get_metrics()
        alerts = self.should_alert()
        
        return {
            'timestamp': datetime.utcnow().isoformat(),
            'health_checks': {
                'total': len(health_checks),
                'healthy': len([hc for hc in health_checks if hc.status == 'OK']),
                'warning': len([hc for hc in health_checks if hc.status == 'WARNING']),
                'critical': len([hc for hc in health_checks if hc.status == 'CRITICAL']),
                'error': len([hc for hc in health_checks if hc.status == 'ERROR'])
            },
            'metrics': {
                'cpu_percent': next((m.value for m in metrics if m.name == 'cpu_percent'), 0),
                'memory_percent': next((m.value for m in metrics if m.name == 'memory_percent'), 0),
                'disk_percent': next((m.value for m in metrics if m.name == 'disk_percent'), 0),
                'request_rate': next((m.value for m in metrics if m.name == 'request_rate'), 0),
                'error_rate': next((m.value for m in metrics if m.name == 'error_rate'), 0)
            },
            'alerts': {
                'total': len(alerts),
                'critical': len([a for a in alerts if a.level == AlertLevel.CRITICAL]),
                'warning': len([a for a in alerts if a.level == AlertLevel.WARNING]),
                'info': len([a for a in alerts if a.level == AlertLevel.INFO])
            }
        }
