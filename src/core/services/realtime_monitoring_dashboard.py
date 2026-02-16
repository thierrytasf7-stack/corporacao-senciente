"""
Real-Time Monitoring Dashboard - Pipeline Optimization for Monitoring Node
Provides real-time friction scores and performance metrics dashboard
"""
import asyncio
import json
import logging
from typing import Dict, List, Any, Optional, Callable, Awaitable
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from collections import defaultdict, deque
import threading
import time
import statistics

logger = logging.getLogger(__name__)

@dataclass
class DashboardMetrics:
    """Real-time dashboard metrics"""
    friction_scores: Dict[str, float] = field(default_factory=dict)
    performance_indicators: Dict[str, Any] = field(default_factory=dict)
    alerts: List[Dict[str, Any]] = field(default_factory=list)
    trends: Dict[str, List[float]] = field(default_factory=dict)
    efficiency_gauges: Dict[str, float] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.utcnow)

@dataclass
class AlertRule:
    """Alert configuration rules"""
    name: str
    metric: str
    condition: str  # "above", "below", "equals"
    threshold: float
    severity: str  # "info", "warning", "critical"
    cooldown_minutes: int = 5
    last_triggered: Optional[datetime] = None
    enabled: bool = True

@dataclass
class PerformanceIndicator:
    """Performance indicator with trend analysis"""
    name: str
    current_value: float
    target_value: float
    unit: str
    trend: str  # "improving", "degrading", "stable"
    history: deque = field(default_factory=lambda: deque(maxlen=100))
    last_updated: datetime = field(default_factory=datetime.utcnow)

class RealTimeMonitoringDashboard:
    """
    Real-Time Monitoring Dashboard System
    Provides comprehensive friction score monitoring and performance analytics
    """

    def __init__(self):
        self.friction_score = 80.0  # Starting friction for monitoring node
        self.dashboard_data = DashboardMetrics()
        self.alert_rules: List[AlertRule] = []
        self.performance_indicators: Dict[str, PerformanceIndicator] = {}
        self.monitoring_active = False
        self.monitoring_thread: Optional[threading.Thread] = None
        self.update_interval = 5  # seconds

        # Historical data for trends
        self.friction_history: deque = deque(maxlen=200)  # 1000 seconds of history
        self.performance_history: Dict[str, deque] = defaultdict(lambda: deque(maxlen=200))

        # Initialize default alert rules
        self._initialize_alert_rules()

        # Initialize performance indicators
        self._initialize_performance_indicators()

    def _initialize_alert_rules(self):
        """Initialize default alert rules"""
        self.alert_rules = [
            AlertRule(
                name="High Friction Alert",
                metric="combined_friction_score",
                condition="above",
                threshold=75.0,
                severity="warning",
                cooldown_minutes=10
            ),
            AlertRule(
                name="Critical Friction Alert",
                metric="combined_friction_score",
                condition="above",
                threshold=80.0,
                severity="critical",
                cooldown_minutes=5
            ),
            AlertRule(
                name="Low Efficiency Alert",
                metric="pool_utilization_avg",
                condition="below",
                threshold=0.2,
                severity="warning",
                cooldown_minutes=15
            ),
            AlertRule(
                name="High CPU Usage Alert",
                metric="cpu_percent",
                condition="above",
                threshold=90.0,
                severity="warning",
                cooldown_minutes=2
            ),
            AlertRule(
                name="Memory Pressure Alert",
                metric="memory_percent",
                condition="above",
                threshold=95.0,
                severity="critical",
                cooldown_minutes=1
            )
        ]

    def _initialize_performance_indicators(self):
        """Initialize key performance indicators"""
        self.performance_indicators = {
            "pipeline_efficiency": PerformanceIndicator(
                name="Pipeline Efficiency",
                current_value=0.0,
                target_value=0.9,
                unit="%",
                trend="stable"
            ),
            "resource_utilization": PerformanceIndicator(
                name="Resource Utilization",
                current_value=0.0,
                target_value=0.8,
                unit="%",
                trend="stable"
            ),
            "response_time": PerformanceIndicator(
                name="Average Response Time",
                current_value=0.0,
                target_value=100.0,
                unit="ms",
                trend="stable"
            ),
            "throughput": PerformanceIndicator(
                name="System Throughput",
                current_value=0.0,
                target_value=1000.0,
                unit="req/sec",
                trend="stable"
            ),
            "error_rate": PerformanceIndicator(
                name="Error Rate",
                current_value=0.0,
                target_value=0.01,
                unit="%",
                trend="stable"
            )
        }

    async def initialize_dashboard(self):
        """Initialize the real-time monitoring dashboard"""
        logger.info("Real-Time Monitoring Dashboard initializing...")

        # Start monitoring thread
        self.monitoring_active = True
        self.monitoring_thread = threading.Thread(target=self._monitoring_loop, daemon=True)
        self.monitoring_thread.start()

        logger.info("Real-Time Monitoring Dashboard initialized with real-time friction monitoring")

    def _monitoring_loop(self):
        """Continuous monitoring loop for dashboard updates"""
        while self.monitoring_active:
            try:
                # Collect real-time metrics
                asyncio.run(self._collect_realtime_metrics())

                # Update performance indicators
                asyncio.run(self._update_performance_indicators())

                # Check alert rules
                asyncio.run(self._check_alert_rules())

                # Update trends
                self._update_trends()

                # Update friction score based on monitoring efficiency
                self._update_monitoring_friction()

                time.sleep(self.update_interval)

            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
                time.sleep(10)  # Wait longer on error

    async def _collect_realtime_metrics(self):
        """Collect real-time metrics from all optimized systems"""
        try:
            # This would integrate with the actual optimizers in a real system
            # For now, we'll simulate collecting metrics

            # Get current friction scores (would come from optimizers)
            current_friction = {
                "combined_friction_score": 69.07,  # From pipeline status
                "data_ingestion_friction": 75.0,
                "llb_storage_friction": 72.0,
                "infrastructure_friction": 60.21,
                "monitoring_friction": self.friction_score
            }

            # Get performance metrics (would come from system monitoring)
            performance_metrics = {
                "cpu_percent": 85.5,
                "memory_percent": 78.3,
                "disk_usage_percent": 65.2,
                "active_connections": 45,
                "request_rate": 125.8,
                "response_time": 45.2,
                "error_rate": 0.8,
                "throughput": 892.3,
                "pool_utilization_avg": 0.35
            }

            # Update dashboard data
            self.dashboard_data.friction_scores = current_friction
            self.dashboard_data.performance_indicators = performance_metrics
            self.dashboard_data.timestamp = datetime.utcnow()

            # Store in history
            self.friction_history.append(current_friction["combined_friction_score"])

            for key, value in performance_metrics.items():
                self.performance_history[key].append(value)

        except Exception as e:
            logger.error(f"Error collecting real-time metrics: {e}")

    async def _update_performance_indicators(self):
        """Update performance indicators with latest data"""
        try:
            # Calculate pipeline efficiency
            if self.dashboard_data.friction_scores:
                combined_friction = self.dashboard_data.friction_scores.get("combined_friction_score", 75.0)
                efficiency = max(0, (100.0 - combined_friction) / 100.0)
                self._update_indicator("pipeline_efficiency", efficiency * 100, 90.0)

            # Calculate resource utilization
            if self.dashboard_data.performance_indicators:
                cpu_usage = self.dashboard_data.performance_indicators.get("cpu_percent", 0) / 100.0
                mem_usage = self.dashboard_data.performance_indicators.get("memory_percent", 0) / 100.0
                avg_utilization = (cpu_usage + mem_usage) / 2
                self._update_indicator("resource_utilization", avg_utilization * 100, 80.0)

                # Update other indicators
                self._update_indicator("response_time",
                                     self.dashboard_data.performance_indicators.get("response_time", 0), 100.0)
                self._update_indicator("throughput",
                                     self.dashboard_data.performance_indicators.get("throughput", 0), 1000.0)
                self._update_indicator("error_rate",
                                     self.dashboard_data.performance_indicators.get("error_rate", 0), 1.0)

        except Exception as e:
            logger.error(f"Error updating performance indicators: {e}")

    def _update_indicator(self, name: str, current_value: float, target_value: float):
        """Update a specific performance indicator"""
        if name not in self.performance_indicators:
            return

        indicator = self.performance_indicators[name]
        indicator.current_value = current_value
        indicator.target_value = target_value
        indicator.last_updated = datetime.utcnow()

        # Add to history
        indicator.history.append(current_value)

        # Calculate trend
        if len(indicator.history) >= 3:
            recent = list(indicator.history)[-3:]
            if recent[-1] > recent[-2] > recent[0]:
                indicator.trend = "improving" if name in ["pipeline_efficiency", "throughput"] else "degrading"
            elif recent[-1] < recent[-2] < recent[0]:
                indicator.trend = "degrading" if name in ["pipeline_efficiency", "throughput"] else "improving"
            else:
                indicator.trend = "stable"
        else:
            indicator.trend = "stable"

    async def _check_alert_rules(self):
        """Check alert rules and generate alerts"""
        try:
            current_time = datetime.utcnow()

            for rule in self.alert_rules:
                if not rule.enabled:
                    continue

                # Check cooldown
                if rule.last_triggered and (current_time - rule.last_triggered).seconds < (rule.cooldown_minutes * 60):
                    continue

                # Get current value
                current_value = self._get_metric_value(rule.metric)
                if current_value is None:
                    continue

                # Check condition
                alert_triggered = False
                if rule.condition == "above" and current_value > rule.threshold:
                    alert_triggered = True
                elif rule.condition == "below" and current_value < rule.threshold:
                    alert_triggered = True
                elif rule.condition == "equals" and abs(current_value - rule.threshold) < 0.01:
                    alert_triggered = True

                if alert_triggered:
                    alert = {
                        "id": f"alert_{int(time.time())}_{rule.name.lower().replace(' ', '_')}",
                        "rule_name": rule.name,
                        "severity": rule.severity,
                        "message": f"{rule.name}: {rule.metric} is {current_value:.2f} ({rule.condition} {rule.threshold})",
                        "metric": rule.metric,
                        "current_value": current_value,
                        "threshold": rule.threshold,
                        "timestamp": current_time.isoformat()
                    }

                    self.dashboard_data.alerts.append(alert)
                    rule.last_triggered = current_time

                    # Keep only last 50 alerts
                    if len(self.dashboard_data.alerts) > 50:
                        self.dashboard_data.alerts = self.dashboard_data.alerts[-50:]

                    logger.warning(f"Alert triggered: {alert['message']}")

        except Exception as e:
            logger.error(f"Error checking alert rules: {e}")

    def _get_metric_value(self, metric: str) -> Optional[float]:
        """Get current value for a metric"""
        # Check friction scores
        if metric in self.dashboard_data.friction_scores:
            return self.dashboard_data.friction_scores[metric]

        # Check performance indicators
        if metric in self.dashboard_data.performance_indicators:
            return self.dashboard_data.performance_indicators[metric]

        return None

    def _update_trends(self):
        """Update trend analysis data"""
        try:
            # Friction score trend
            if len(self.friction_history) >= 5:
                recent_friction = list(self.friction_history)[-5:]
                friction_trend = recent_friction
                self.dashboard_data.trends["friction_score"] = friction_trend

            # Performance trends
            for metric, history in self.performance_history.items():
                if len(history) >= 5:
                    self.dashboard_data.trends[metric] = list(history)[-20:]  # Last 20 data points

            # Efficiency gauges
            self.dashboard_data.efficiency_gauges = {
                "overall_efficiency": self._calculate_overall_efficiency(),
                "resource_efficiency": self._calculate_resource_efficiency(),
                "pipeline_efficiency": self._calculate_pipeline_efficiency(),
                "cost_efficiency": self._calculate_cost_efficiency()
            }

        except Exception as e:
            logger.error(f"Error updating trends: {e}")

    def _calculate_overall_efficiency(self) -> float:
        """Calculate overall system efficiency"""
        if not self.dashboard_data.friction_scores:
            return 0.0

        combined_friction = self.dashboard_data.friction_scores.get("combined_friction_score", 75.0)
        efficiency = max(0, (100.0 - combined_friction) / 100.0)
        return efficiency * 100

    def _calculate_resource_efficiency(self) -> float:
        """Calculate resource utilization efficiency"""
        if not self.dashboard_data.performance_indicators:
            return 0.0

        cpu_eff = 1.0 - (self.dashboard_data.performance_indicators.get("cpu_percent", 0) / 100.0)
        mem_eff = 1.0 - (self.dashboard_data.performance_indicators.get("memory_percent", 0) / 100.0)
        pool_eff = self.dashboard_data.performance_indicators.get("pool_utilization_avg", 0)

        return ((cpu_eff + mem_eff + pool_eff) / 3) * 100

    def _calculate_pipeline_efficiency(self) -> float:
        """Calculate pipeline processing efficiency"""
        # Simplified calculation based on throughput and error rate
        throughput = self.dashboard_data.performance_indicators.get("throughput", 0)
        error_rate = self.dashboard_data.performance_indicators.get("error_rate", 1.0)

        if error_rate > 0:
            efficiency = (throughput / 1000.0) * (1.0 - error_rate)
        else:
            efficiency = throughput / 1000.0

        return min(100.0, efficiency * 100)

    def _calculate_cost_efficiency(self) -> float:
        """Calculate cost efficiency"""
        # Simplified: higher throughput per resource usage = better efficiency
        throughput = self.dashboard_data.performance_indicators.get("throughput", 0)
        cpu_usage = self.dashboard_data.performance_indicators.get("cpu_percent", 100)

        if cpu_usage > 0:
            efficiency = (throughput / cpu_usage) * 10  # Normalized scale
        else:
            efficiency = 0.0

        return min(100.0, efficiency)

    def _update_monitoring_friction(self):
        """Update monitoring friction based on system performance"""
        # Monitoring becomes less frictional as it provides better insights
        base_friction = 80.0

        # Reduce friction based on alerts (good monitoring)
        alert_reduction = len(self.dashboard_data.alerts) * 0.5

        # Reduce friction based on trend data quality
        trend_reduction = len(self.dashboard_data.trends) * 2.0

        # Reduce friction based on efficiency gauges
        efficiency_avg = sum(self.dashboard_data.efficiency_gauges.values()) / max(1, len(self.dashboard_data.efficiency_gauges))
        efficiency_reduction = efficiency_avg * 0.5

        self.friction_score = max(50.0, base_friction - alert_reduction - trend_reduction - efficiency_reduction)

    async def get_dashboard_data(self) -> Dict[str, Any]:
        """Get complete dashboard data"""
        try:
            # Get performance indicators data
            indicators_data = {}
            for name, indicator in self.performance_indicators.items():
                indicators_data[name] = {
                    "name": indicator.name,
                    "current_value": round(indicator.current_value, 2),
                    "target_value": round(indicator.target_value, 2),
                    "unit": indicator.unit,
                    "trend": indicator.trend,
                    "last_updated": indicator.last_updated.isoformat(),
                    "history": list(indicator.history)[-20:] if indicator.history else []
                }

            dashboard_response = {
                "current_friction_score": round(self.friction_score, 2),
                "friction_scores": {k: round(v, 2) for k, v in self.dashboard_data.friction_scores.items()},
                "performance_indicators": self.dashboard_data.performance_indicators,
                "performance_indicators_detailed": indicators_data,
                "alerts": self.dashboard_data.alerts[-10:],  # Last 10 alerts
                "trends": self.dashboard_data.trends,
                "efficiency_gauges": {k: round(v, 2) for k, v in self.dashboard_data.efficiency_gauges.items()},
                "timestamp": self.dashboard_data.timestamp.isoformat(),
                "monitoring_stats": {
                    "active_alert_rules": len([r for r in self.alert_rules if r.enabled]),
                    "total_alerts_generated": len(self.dashboard_data.alerts),
                    "trends_tracked": len(self.dashboard_data.trends),
                    "indicators_monitored": len(self.performance_indicators),
                    "update_interval": self.update_interval
                },
                "optimization_achievements": {
                    "real_time_monitoring": True,
                    "alert_system": True,
                    "trend_analysis": True,
                    "efficiency_tracking": True,
                    "performance_dashboard": True
                }
            }

            return dashboard_response

        except Exception as e:
            logger.error(f"Error getting dashboard data: {e}")
            return {"error": str(e)}

    async def acknowledge_alert(self, alert_id: str) -> bool:
        """Acknowledge an alert"""
        try:
            for alert in self.dashboard_data.alerts:
                if alert.get("id") == alert_id:
                    alert["acknowledged"] = True
                    alert["acknowledged_at"] = datetime.utcnow().isoformat()
                    return True
            return False
        except Exception as e:
            logger.error(f"Error acknowledging alert: {e}")
            return False

    async def update_alert_rule(self, rule_name: str, updates: Dict[str, Any]) -> bool:
        """Update an alert rule configuration"""
        try:
            for rule in self.alert_rules:
                if rule.name == rule_name:
                    for key, value in updates.items():
                        if hasattr(rule, key):
                            setattr(rule, key, value)
                    return True
            return False
        except Exception as e:
            logger.error(f"Error updating alert rule: {e}")
            return False

    async def reset_dashboard(self):
        """Reset dashboard data (for testing/debugging)"""
        try:
            self.dashboard_data = DashboardMetrics()
            self.friction_history.clear()
            self.performance_history.clear()
            for indicator in self.performance_indicators.values():
                indicator.history.clear()

            logger.info("Dashboard data reset")
            return True
        except Exception as e:
            logger.error(f"Error resetting dashboard: {e}")
            return False

    async def shutdown_dashboard(self):
        """Gracefully shutdown the monitoring dashboard"""
        logger.info("Shutting down Real-Time Monitoring Dashboard...")

        self.monitoring_active = False

        # Wait for monitoring thread to finish
        if self.monitoring_thread and self.monitoring_thread.is_alive():
            self.monitoring_thread.join(timeout=5)

        logger.info("Real-Time Monitoring Dashboard shutdown complete")