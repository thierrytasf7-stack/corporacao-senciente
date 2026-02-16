"""
Integration tests for AZ-OS
Tests end-to-end functionality across multiple components.
"""

import pytest
import asyncio
import time
import os
from pathlib import Path
from unittest.mock import Mock, patch
from datetime import datetime, timedelta

from src.az_os.core.security import Security
from src.az_os.core.error_handler import ErrorHandler
from src.az_os.core.telemetry import Telemetry


class TestIntegration:
    """End-to-end integration tests"""
    
    @pytest.fixture(autouse=True)
    def setup_teardown(self):
        """Setup and teardown for integration tests"""
        # Setup
        self.security = Security(encryption_key=None)
        self.error_handler = ErrorHandler(max_retries=2, base_delay=0.1)
        self.telemetry = Telemetry()
        
        yield
        
        # Teardown
        # Clean up any test artifacts
        test_files = [f for f in os.listdir() if f.startswith("test_")]
        for file in test_files:
            try:
                os.remove(file)
            except:
                pass
    
    def test_full_security_pipeline(self):
        """Test complete security pipeline from validation to logging"""
        # Define schema
        schema = {
            'username': {'type': str, 'min_length': 3, 'max_length': 20, 'pattern': r'^[a-zA-Z0-9_]+$'},
            'password': {'type': str, 'min_length': 8, 'max_length': 50},
            'email': {'type': str, 'pattern': r'^[^@]+@[^@]+\.[^@]+$'}
        }
        
        # Test case 1: Valid input
        valid_data = {
            'username': 'valid_user',
            'password': 'StrongPass123',
            'email': 'valid@example.com'
        }
        
        is_valid, errors = self.security.validate_input(valid_data, schema)
        assert is_valid is True
        assert errors == ""
        
        # Test case 2: Invalid input
        invalid_data = {
            'username': 'in',  # Too short
            'password': 'weak',
            'email': 'invalid-email'
        }
        
        is_valid, errors = self.security.validate_input(invalid_data, schema)
        assert is_valid is False
        assert "Field 'username' must be at least 3 characters" in errors
        assert "Field 'email' format is invalid" in errors
        
        # Test case 3: SQL injection attempt
        malicious_data = {
            'username': "admin'; DROP TABLE users; --",
            'password': "pass' OR '1'='1",
            'email': "test@example.com"
        }
        
        is_valid, errors = self.security.validate_input(malicious_data, schema)
        assert is_valid is True  # Validation passes, but sanitization occurs
        
        sanitized = self.security._sanitize_string(malicious_data['username'])
        assert "DROP TABLE" not in sanitized
        assert "--" not in sanitized
        
        # Test case 4: Rate limiting
        endpoint = "/api/login"
        
        # First 100 requests should be allowed
        for i in range(100):
            assert self.security.check_rate_limit(endpoint) is True
        
        # 101st request should be denied
        assert self.security.check_rate_limit(endpoint) is False
        
        # Test case 5: Audit logging
        event_type = "authentication"
        details = {
            'user_id': 'test_user',
            'source_ip': '127.0.0.1',
            'success': True,
            'attempt': 1
        }
        
        self.security.log_security_event(event_type, details)
        
        assert len(self.security.audit_log) == 1
        event = self.security.audit_log[0]
        
        assert event['event_type'] == event_type
        assert event['details'] == details
        assert event['severity'] == 'INFO'
        assert event['source_ip'] == '127.0.0.1'
        assert event['user_id'] == 'test_user'
    
    def test_error_handling_pipeline(self):
        """Test complete error handling pipeline"""
        # Test case 1: Retryable error
        class RetryableError(Exception):
            pass
        
        error = RetryableError("Database connection failed")
        context = {'operation': 'database_query', 'query': 'SELECT * FROM users'}
        
        error_info = self.error_handler.handle_error(error, context)
        
        assert error_info['category'] == 'retryable'
        assert error_info['should_retry'] is True
        assert error_info['retry_count'] == 2
        assert "Temporary issue" in error_info['user_message']
        
        # Test case 2: Transient error
        class TransientError(Exception):
            pass
        
        error = TransientError("Rate limit exceeded")
        context = {'operation': 'api_call', 'endpoint': '/api/data'}
        
        error_info = self.error_handler.handle_error(error, context)
        
        assert error_info['category'] == 'transient'
        assert error_info['should_retry'] is True
        assert error_info['retry_count'] == 2
        assert "Service temporarily unavailable" in error_info['user_message']
        
        # Test case 3: Fatal error
        class FatalError(Exception):
            pass
        
        error = FatalError("Invalid operation")
        context = {'operation': 'data_processing', 'step': 'validation'}
        
        error_info = self.error_handler.handle_error(error, context)
        
        assert error_info['category'] == 'fatal'
        assert error_info['should_retry'] is False
        assert "unexpected error" in error_info['user_message'].lower()
        
        # Test case 4: Exponential backoff
        for attempt in range(3):
            should_retry, delay = self.error_handler.should_retry(error, attempt)
            
            if attempt < 2:  # max_retries is 2
                assert should_retry is True
                assert delay >= 0.1 * (2 ** attempt)  # base_delay * 2^attempt
            else:
                assert should_retry is False
                assert delay == 0
        
        # Test case 5: Error reporting
        # Mock telemetry reporting
        with patch.object(self.error_handler, '_report_to_telemetry') as mock_report:
            self.error_handler.handle_error(error, context)
            mock_report.assert_called_once()
    
    def test_telemetry_pipeline(self):
        """Test complete telemetry pipeline"""
        # Test case 1: Health checks
        health_checks = self.telemetry.check_health()
        
        assert len(health_checks) == 5
        
        for check in health_checks:
            assert check.component in ['system_resources', 'disk_space', 'memory', 'database', 'llm_api']
            assert check.status in ['OK', 'WARNING', 'CRITICAL', 'ERROR']
            assert isinstance(check.duration, float)
            assert isinstance(check.timestamp, datetime)
        
        # Test case 2: Metrics collection
        metrics = self.telemetry.get_metrics()
        
        assert len(metrics) >= 5
        
        metric_names = [m.name for m in metrics]
        expected_names = ['cpu_percent', 'memory_percent', 'disk_percent', 'request_rate', 'error_rate']
        
        for name in expected_names:
            assert name in metric_names
            metric = next(m for m in metrics if m.name == name)
            assert isinstance(metric.value, (int, float))
            assert metric.unit in ['%', 'req/s']
            assert isinstance(metric.timestamp, datetime)
        
        # Test case 3: Alert triggering
        # Simulate high CPU usage
        with patch('psutil.cpu_percent', return_value=85):
            alerts = self.telemetry.should_alert()
            
            high_cpu_alert = next((a for a in alerts if a.name == "High CPU Usage"), None)
            assert high_cpu_alert is not None
            assert high_cpu_alert.level == AlertLevel.WARNING
            assert "CPU usage exceeded 80%" in high_cpu_alert.message
        
        # Test case 4: Alert suggestions
        for alert in self.telemetry.alerts:
            suggestions = self.telemetry.suggest_actions(alert)
            assert len(suggestions) > 0
            
            if alert.name == "High Error Rate":
                assert "Check application logs" in suggestions
            elif alert.name == "High Latency":
                assert "Check system resource usage" in suggestions
            elif alert.name == "Cost Spike":
                assert "Review recent API usage" in suggestions
            elif alert.name == "High CPU Usage":
                assert "Check for CPU-intensive processes" in suggestions
            elif alert.name == "Low Memory":
                assert "Check for memory leaks" in suggestions
        
        # Test case 5: Health dashboard
        dashboard_data = self.telemetry.get_health_dashboard_data()
        
        assert 'timestamp' in dashboard_data
        assert 'health_checks' in dashboard_data
        assert 'metrics' in dashboard_data
        assert 'alerts' in dashboard_data
        
        assert 'total' in dashboard_data['health_checks']
        assert 'healthy' in dashboard_data['health_checks']
        assert 'warning' in dashboard_data['health_checks']
        assert 'critical' in dashboard_data['health_checks']
        assert 'error' in dashboard_data['health_checks']
        
        assert 'cpu_percent' in dashboard_data['metrics']
        assert 'memory_percent' in dashboard_data['metrics']
        assert 'disk_percent' in dashboard_data['metrics']
        assert 'request_rate' in dashboard_data['metrics']
        assert 'error_rate' in dashboard_data['metrics']
        
        assert 'total' in dashboard_data['alerts']
        assert 'critical' in dashboard_data['alerts']
        assert 'warning' in dashboard_data['alerts']
        assert 'info' in dashboard_data['alerts']
    
    def test_end_to_end_scenario(self):
        """Test end-to-end scenario with all components"""
        # Simulate a user login attempt
        
        # Step 1: Validate input
        schema = {
            'username': {'type': str, 'min_length': 3, 'max_length': 20},
            'password': {'type': str, 'min_length': 8, 'max_length': 50}
        }
        
        user_input = {
            'username': 'test_user',
            'password': 'SecurePass123'
        }
        
        is_valid, errors = self.security.validate_input(user_input, schema)
        assert is_valid is True
        
        # Step 2: Check rate limiting
        endpoint = "/api/login"
        assert self.security.check_rate_limit(endpoint) is True
        
        # Step 3: Simulate database operation with error handling
        try:
            # Simulate a database operation that might fail
            raise ConnectionError("Database connection failed")
        except Exception as e:
            error_info = self.error_handler.handle_error(e, {
                'operation': 'database_query',
                'query': 'SELECT * FROM users WHERE username = :username',
                'user_id': 'test_user'
            })
            
            assert error_info['category'] == 'retryable'
            assert error_info['should_retry'] is True
        
        # Step 4: Log security event
        event_type = "login_attempt"
        details = {
            'user_id': 'test_user',
            'source_ip': '127.0.0.1',
            'success': False,
            'error': 'database_connection_failed'
        }
        
        self.security.log_security_event(event_type, details, severity="WARNING")
        
        assert len(self.security.audit_log) == 1
        event = self.security.audit_log[0]
        assert event['severity'] == 'WARNING'
        
        # Step 5: Collect telemetry data
        health_checks = self.telemetry.check_health()
        metrics = self.telemetry.get_metrics()
        
        assert len(health_checks) > 0
        assert len(metrics) > 0
        
        # Step 6: Check for alerts
        alerts = self.telemetry.should_alert()
        
        # No alerts should be triggered in this normal scenario
        assert len(alerts) == 0
    
    def test_performance_under_load(self):
        """Test performance under simulated load"""
        import concurrent.futures
        
        # Simulate 100 concurrent requests
        num_requests = 100
        
        def simulate_request():
            # Simulate a request that uses all components
            try:
                # Validate input
                schema = {'username': {'type': str, 'min_length': 3}}
                data = {'username': 'user' + str(time.time())}
                is_valid, errors = self.security.validate_input(data, schema)
                assert is_valid is True
                
                # Check rate limiting
                endpoint = "/api/test"
                assert self.security.check_rate_limit(endpoint) is True
                
                # Collect metrics
                metrics = self.telemetry.get_metrics()
                assert len(metrics) > 0
                
                return True
            except Exception as e:
                return False
        
        start_time = time.time()
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(simulate_request) for _ in range(num_requests)]
            results = [f.result() for f in futures]
        
        duration = time.time() - start_time
        
        # All requests should succeed
        assert all(results)
        
        # Performance check: should complete within reasonable time
        assert duration < 10.0  # 10 seconds for 100 requests
    
    def test_error_recovery(self):
        """Test error recovery with retries"""
        class SimulatedError(Exception):
            pass
        
        # Simulate an operation that fails twice then succeeds
        def unreliable_operation(attempt):
            if attempt < 2:
                raise SimulatedError("Temporary failure")
            return "success"
        
        # Test with error handler
        max_retries = 3
        base_delay = 0.1
        handler = ErrorHandler(max_retries=max_retries, base_delay=base_delay)
        
        attempt = 0
        success = False
        
        while attempt <= max_retries and not success:
            try:
                result = unreliable_operation(attempt)
                success = True
            except Exception as e:
                should_retry, delay = handler.should_retry(e, attempt)
                
                if should_retry:
                    time.sleep(delay)
                    attempt += 1
                else:
                    break
        
        assert success is True
        assert attempt == 2  # Failed twice, succeeded on third attempt
    
    def test_security_under_attack(self):
        """Test security under simulated attack"""
        # Test SQL injection attempts
        malicious_inputs = [
            "' OR '1'='1",
            "'; DROP TABLE users; --",
            "' UNION SELECT * FROM users --",
            "' AND 1=1--",
            "' OR 1=1 LIMIT 1--"
        ]
        
        schema = {'query': {'type': str}}
        
        for malicious in malicious_inputs:
            data = {'query': malicious}
            is_valid, errors = self.security.validate_input(data, schema)
            
            # Input should be valid (it's a string), but sanitization should remove dangerous parts
            assert is_valid is True
            
            sanitized = self.security._sanitize_string(malicious)
            assert "DROP" not in sanitized
            assert "UNION" not in sanitized
            assert "--" not in sanitized
            assert "OR" not in sanitized
        
        # Test XSS attempts
        xss_inputs = [
            "<script>alert('xss')</script>",
            "<img src=x onerror=alert('xss')>",
            "javascript:alert('xss')",
            "<iframe src=javascript:alert('xss')>",
            "<svg onload=alert('xss')>"
        ]
        
        for xss in xss_inputs:
            sanitized = self.security._sanitize_string(xss)
            assert "<script>" not in sanitized
            assert "<img" not in sanitized
            assert "javascript:" not in sanitized
            assert "<iframe>" not in sanitized
            assert "<svg>" not in sanitized


if __name__ == "__main__":
    pytest.main([__file__, "-v"])