"""
Metrics Collector for Corporação Senciente
Sistema de coleta de métricas customizadas para integração com Prometheus
"""

import time
import psutil
from typing import Dict, Any, Optional
from prometheus_client import Counter, Gauge, Histogram, Summary, CollectorRegistry
import asyncio
from datetime import datetime, timedelta

class MetricsCollector:
    """
    Coletor de métricas customizadas para monitoramento da Corporação Senciente
    """

    def __init__(self):
        self.registry = CollectorRegistry()

        # Business Metrics
        self.holding_total_revenue = Gauge(
            'holding_total_revenue',
            'Total revenue of the holding',
            registry=self.registry
        )

        self.holding_total_profit = Gauge(
            'holding_total_profit',
            'Total profit of the holding',
            registry=self.registry
        )

        self.holding_cash_position = Gauge(
            'holding_cash_position',
            'Cash position of the holding',
            registry=self.registry
        )

        self.holding_portfolio_health = Gauge(
            'holding_portfolio_health_score',
            'Portfolio health score (0-100)',
            registry=self.registry
        )

        # Subsidiary Metrics
        self.subsidiary_count = Gauge(
            'subsidiary_count',
            'Total number of subsidiaries',
            registry=self.registry
        )

        self.subsidiary_health_score = Gauge(
            'subsidiary_health_score',
            'Health score of subsidiary',
            ['subsidiary_id'],
            registry=self.registry
        )

        self.subsidiary_monthly_revenue = Gauge(
            'subsidiary_monthly_revenue',
            'Monthly recurring revenue of subsidiary',
            ['subsidiary_id'],
            registry=self.registry
        )

        # Pipeline Metrics
        self.pipeline_friction_score = Gauge(
            'pipeline_friction_score',
            'Overall pipeline friction score (0-100)',
            registry=self.registry
        )

        self.data_ingestion_friction = Gauge(
            'data_ingestion_friction_score',
            'Data ingestion friction score',
            registry=self.registry
        )

        self.llb_storage_friction = Gauge(
            'llb_storage_friction_score',
            'L.L.B. storage friction score',
            registry=self.registry
        )

        self.infrastructure_friction = Gauge(
            'infrastructure_friction_score',
            'Infrastructure friction score',
            registry=self.registry
        )

        # AI/ML Metrics
        self.ai_model_inference_time = Histogram(
            'ai_model_inference_time_seconds',
            'Time spent on AI model inference',
            ['model'],
            registry=self.registry
        )

        self.ai_model_success_rate = Gauge(
            'ai_model_success_rate',
            'Success rate of AI model inferences (0-1)',
            ['model'],
            registry=self.registry
        )

        self.ai_tokens_used = Counter(
            'ai_tokens_used_total',
            'Total number of AI tokens used',
            ['model', 'operation'],
            registry=self.registry
        )

        self.ai_model_inference_failures = Counter(
            'ai_model_inference_failures_total',
            'Total number of AI model inference failures',
            ['model', 'error_type'],
            registry=self.registry
        )

        # Business Process Metrics
        self.subsidiary_creation_attempts = Counter(
            'subsidiary_creation_attempts_total',
            'Total subsidiary creation attempts',
            ['status'],  # success, failed
            registry=self.registry
        )

        self.subsidiary_creation_success_rate = Gauge(
            'subsidiary_creation_success_rate',
            'Success rate of subsidiary creation (0-1)',
            registry=self.registry
        )

        self.opportunity_identified = Counter(
            'opportunities_identified_total',
            'Total opportunities identified',
            ['source', 'status'],
            registry=self.registry
        )

        # System Performance Metrics
        self.request_processing_time = Histogram(
            'corporacao_request_processing_seconds',
            'Time spent processing requests',
            ['endpoint', 'method'],
            registry=self.registry
        )

        self.database_query_time = Histogram(
            'database_query_duration_seconds',
            'Time spent on database queries',
            ['query_type', 'table'],
            registry=self.registry
        )

        self.cache_hit_rate = Gauge(
            'cache_hit_rate',
            'Cache hit rate (0-1)',
            ['cache_type'],
            registry=self.registry
        )

        # Security Metrics
        self.failed_login_attempts = Counter(
            'failed_login_attempts_total',
            'Total failed login attempts',
            ['reason'],
            registry=self.registry
        )

        self.active_sessions = Gauge(
            'active_sessions',
            'Number of active user sessions',
            registry=self.registry
        )

        # Resource Pool Metrics
        self.resource_pool_available = Gauge(
            'resource_pool_available',
            'Number of available resources in pool',
            ['pool_type'],
            registry=self.registry
        )

        self.resource_pool_allocated = Gauge(
            'resource_pool_allocated',
            'Number of allocated resources in pool',
            ['pool_type'],
            registry=self.registry
        )

        self.resource_pool_utilization = Gauge(
            'resource_pool_utilization',
            'Resource pool utilization rate (0-1)',
            ['pool_type'],
            registry=self.registry
        )

        # Auto-scaling Metrics
        self.scaling_actions = Counter(
            'auto_scaling_actions_total',
            'Total auto-scaling actions performed',
            ['action_type', 'resource_type'],
            registry=self.registry
        )

        self.scaling_failures = Counter(
            'auto_scaling_failures_total',
            'Total auto-scaling action failures',
            ['resource_type', 'failure_reason'],
            registry=self.registry
        )

        # Error Tracking
        self.application_errors = Counter(
            'application_errors_total',
            'Total application errors',
            ['error_type', 'component'],
            registry=self.registry
        )

        # Performance Summary
        self.request_summary = Summary(
            'http_request_duration_seconds',
            'HTTP request duration in seconds',
            ['method', 'endpoint', 'status_code'],
            registry=self.registry
        )

        # Inicializar métricas com valores padrão
        self._initialize_default_values()

    def _initialize_default_values(self):
        """Initialize metrics with default values"""
        # Business metrics defaults
        self.holding_total_revenue.set(25000)
        self.holding_total_profit.set(10000)
        self.holding_cash_position.set(860000)
        self.holding_portfolio_health.set(49.27)

        # Subsidiary metrics defaults
        self.subsidiary_count.set(1)

        # Pipeline friction defaults
        self.pipeline_friction_score.set(69.07)
        self.data_ingestion_friction.set(75.0)
        self.llb_storage_friction.set(72.0)
        self.infrastructure_friction.set(60.21)

        # AI metrics defaults
        self.ai_model_success_rate.labels(model='gpt-4').set(0.95)
        self.ai_model_success_rate.labels(model='claude-3').set(0.92)

        # Business process defaults
        self.subsidiary_creation_success_rate.set(1.0)

        # Resource pool defaults
        self.resource_pool_available.labels(pool_type='database_connections').set(5)
        self.resource_pool_available.labels(pool_type='cache_instances').set(2)
        self.resource_pool_available.labels(pool_type='worker_threads').set(10)

    def update_business_metrics(self, holding_data: Dict[str, Any]):
        """Update business metrics from holding data"""
        self.holding_total_revenue.set(holding_data.get('total_revenue', 0))
        self.holding_total_profit.set(holding_data.get('total_profit', 0))
        self.holding_cash_position.set(holding_data.get('cash_position', 0))
        self.holding_portfolio_health.set(holding_data.get('portfolio_health_score', 0))
        self.subsidiary_count.set(holding_data.get('portfolio_size', 0))

    def update_subsidiary_metrics(self, subsidiaries: list):
        """Update subsidiary-specific metrics"""
        for sub in subsidiaries:
            sub_id = str(sub.get('id', 'unknown'))
            self.subsidiary_health_score.labels(subsidiary_id=sub_id).set(
                sub.get('health_score', 0)
            )
            self.subsidiary_monthly_revenue.labels(subsidiary_id=sub_id).set(
                sub.get('monthly_recurring_revenue', 0)
            )

    def update_pipeline_metrics(self, pipeline_data: Dict[str, Any]):
        """Update pipeline optimization metrics"""
        self.pipeline_friction_score.set(pipeline_data.get('combined_friction_score', 75))
        self.data_ingestion_friction.set(pipeline_data.get('data_ingestion', {}).get('current_friction_score', 75))
        self.llb_storage_friction.set(pipeline_data.get('llb_storage', {}).get('current_friction_score', 72))
        self.infrastructure_friction.set(pipeline_data.get('infrastructure', {}).get('current_friction_score', 70))

    def record_ai_inference(self, model: str, duration: float, success: bool, tokens_used: int = 0):
        """Record AI model inference metrics"""
        self.ai_model_inference_time.labels(model=model).observe(duration)

        if success:
            # Update success rate (simplified moving average)
            current_rate = self.ai_model_success_rate.labels(model=model)._value
            new_rate = (current_rate * 0.9) + (1.0 * 0.1)  # Simple exponential moving average
            self.ai_model_success_rate.labels(model=model).set(new_rate)
        else:
            # Record failure
            self.ai_model_inference_failures.labels(model=model, error_type='inference_error').inc()
            current_rate = self.ai_model_success_rate.labels(model=model)._value
            new_rate = (current_rate * 0.9) + (0.0 * 0.1)
            self.ai_model_success_rate.labels(model=model).set(new_rate)

        if tokens_used > 0:
            self.ai_tokens_used.labels(model=model, operation='inference').inc(tokens_used)

    def record_business_event(self, event_type: str, **kwargs):
        """Record business-related events"""
        if event_type == 'subsidiary_creation_attempt':
            status = kwargs.get('status', 'unknown')
            self.subsidiary_creation_attempts.labels(status=status).inc()

            # Update success rate
            total_attempts = sum(
                self.subsidiary_creation_attempts.labels(status=s)._value
                for s in ['success', 'failed']
            )
            success_attempts = self.subsidiary_creation_attempts.labels(status='success')._value

            if total_attempts > 0:
                rate = success_attempts / total_attempts
                self.subsidiary_creation_success_rate.set(rate)

        elif event_type == 'opportunity_identified':
            source = kwargs.get('source', 'unknown')
            status = kwargs.get('status', 'identified')
            self.opportunity_identified.labels(source=source, status=status).inc()

    def record_request_metrics(self, method: str, endpoint: str, duration: float, status_code: int):
        """Record HTTP request metrics"""
        self.request_processing_time.labels(
            endpoint=endpoint,
            method=method
        ).observe(duration)

        self.request_summary.labels(
            method=method,
            endpoint=endpoint,
            status_code=str(status_code)
        ).observe(duration)

    def record_database_metrics(self, query_type: str, table: str, duration: float):
        """Record database query metrics"""
        self.database_query_time.labels(
            query_type=query_type,
            table=table
        ).observe(duration)

    def record_resource_pool_metrics(self, pool_type: str, available: int, allocated: int):
        """Record resource pool utilization metrics"""
        total = available + allocated
        utilization = allocated / total if total > 0 else 0

        self.resource_pool_available.labels(pool_type=pool_type).set(available)
        self.resource_pool_allocated.labels(pool_type=pool_type).set(allocated)
        self.resource_pool_utilization.labels(pool_type=pool_type).set(utilization)

    def record_scaling_event(self, action_type: str, resource_type: str, success: bool, failure_reason: str = None):
        """Record auto-scaling events"""
        if success:
            self.scaling_actions.labels(
                action_type=action_type,
                resource_type=resource_type
            ).inc()
        else:
            self.scaling_failures.labels(
                resource_type=resource_type,
                failure_reason=failure_reason or 'unknown'
            ).inc()

    def record_error(self, error_type: str, component: str):
        """Record application errors"""
        self.application_errors.labels(
            error_type=error_type,
            component=component
        ).inc()

    def record_security_event(self, event_type: str, **kwargs):
        """Record security-related events"""
        if event_type == 'failed_login':
            reason = kwargs.get('reason', 'unknown')
            self.failed_login_attempts.labels(reason=reason).inc()

    def get_metrics_text(self) -> str:
        """Get metrics in Prometheus text format"""
        from prometheus_client import generate_latest
        return generate_latest(self.registry).decode('utf-8')

    def get_business_metrics_text(self) -> str:
        """Get business-specific metrics in Prometheus format"""
        # Create a subset registry with only business metrics
        business_registry = CollectorRegistry()

        # Clone business-relevant metrics
        business_gauges = [
            ('holding_total_revenue', 'holding_total_revenue'),
            ('holding_total_profit', 'holding_total_profit'),
            ('holding_cash_position', 'holding_cash_position'),
            ('holding_portfolio_health', 'holding_portfolio_health_score'),
            ('subsidiary_count', 'subsidiary_count'),
            ('pipeline_friction_score', 'pipeline_friction_score'),
            ('subsidiary_creation_success_rate', 'subsidiary_creation_success_rate'),
        ]

        for gauge_name, metric_name in business_gauges:
            if hasattr(self, gauge_name):
                gauge = getattr(self, gauge_name)
                # This is a simplified approach - in production, you'd properly clone metrics
                pass

        return "# Business metrics endpoint - implement full cloning logic here\n"

    async def collect_system_metrics(self):
        """Collect system-level metrics periodically"""
        while True:
            try:
                # CPU and memory metrics are collected by node exporter
                # Here we collect application-specific metrics

                # Record active sessions (mock)
                self.active_sessions.set(5)  # Would come from session store

                # Record cache hit rate (mock)
                self.cache_hit_rate.labels(cache_type='redis').set(0.85)

                await asyncio.sleep(30)  # Collect every 30 seconds

            except Exception as e:
                print(f"Error collecting system metrics: {e}")
                await asyncio.sleep(60)

# Global metrics collector instance
metrics_collector = MetricsCollector()