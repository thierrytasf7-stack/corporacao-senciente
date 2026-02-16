import pytest
import asyncio
from unittest.mock import Mock, patch
from datetime import datetime, timedelta
from src.az_os.core.error_handler import ErrorHandler, ErrorCategory, ErrorResponse


class TestErrorHandler:
    """Test ErrorHandler functionality"""
    
    def test_error_handler_initialization(self):
        """Test ErrorHandler initialization"""
        error_handler = ErrorHandler()
        assert error_handler.error_categories is not None
        assert error_handler.error_log is not None
        assert error_handler.metrics is not None
    
    def test_error_category(self):
        """Test ErrorCategory enum"""
        assert ErrorCategory.INTERNAL.value == "internal_error"
        assert ErrorCategory.VALIDATION.value == "validation_error"
        assert ErrorCategory.AUTHENTICATION.value == "authentication_error"
        assert ErrorCategory.THROTTLING.value == "throttling_error"
        assert ErrorCategory.NOT_FOUND.value == "not_found_error"
        assert ErrorCategory.CONFLICT.value == "conflict_error"
    
    def test_error_response(self):
        """Test ErrorResponse dataclass"""
        error_response = ErrorResponse(
            code=500,
            message="Internal Server Error",
            category="internal_error",
            timestamp=datetime.now(),
            details="Additional error details"
        )
        
        assert error_response.code == 500
        assert error_response.message == "Internal Server Error"
        assert error_response.category == "internal_error"
        assert isinstance(error_response.timestamp, datetime)
        assert error_response.details == "Additional error details"


class TestErrorHandlerMethods:
    """Test ErrorHandler methods"""
    
    def test_handle_error(self):
        """Test error handling"""
        error_handler = ErrorHandler()
        
        # Test internal error
        error = Exception("Test error")
        response = error_handler.handle_error(error)
        
        assert response.code == 500
        assert response.category == "internal_error"
        assert "Test error" in response.message
        
        # Test validation error
        validation_error = ValueError("Invalid input")
        response = error_handler.handle_error(validation_error, category=ErrorCategory.VALIDATION)
        
        assert response.code == 400
        assert response.category == "validation_error"
        assert "Invalid input" in response.message
    
    def test_log_error(self):
        """Test error logging"""
        error_handler = ErrorHandler()
        
        error = Exception("Test error")
        error_handler.log_error(error, category=ErrorCategory.INTERNAL)
        
        # Verify error was logged
        assert len(error_handler.error_log) == 1
        assert error_handler.error_log[0]["message"] == "Test error"
        assert error_handler.error_log[0]["category"] == "internal_error"
    
    def test_get_error_metrics(self):
        """Test error metrics"""
        error_handler = ErrorHandler()
        
        # Simulate errors
        error_handler.log_error(Exception("Error 1"), category=ErrorCategory.INTERNAL)
        error_handler.log_error(ValueError("Error 2"), category=ErrorCategory.VALIDATION)
        error_handler.log_error(Exception("Error 3"), category=ErrorCategory.INTERNAL)
        
        metrics = error_handler.get_error_metrics()
        
        assert metrics["total_errors"] == 3
        assert metrics["internal_errors"] == 2
        assert metrics["validation_errors"] == 1
        assert metrics["error_rate"] > 0
    
    def test_get_error_log(self):
        """Test error log retrieval"""
        error_handler = ErrorHandler()
        
        error = Exception("Test error")
        error_handler.log_error(error, category=ErrorCategory.INTERNAL)
        
        error_log = error_handler.get_error_log()
        
        assert len(error_log) == 1
        assert error_log[0]["message"] == "Test error"
        assert error_log[0]["category"] == "internal_error"
    
    def test_clear_error_log(self):
        """Test error log clearing"""
        error_handler = ErrorHandler()
        
        error = Exception("Test error")
        error_handler.log_error(error, category=ErrorCategory.INTERNAL)
        
        assert len(error_handler.error_log) == 1
        
        error_handler.clear_error_log()
        assert len(error_handler.error_log) == 0
    
    def test_get_error_statistics(self):
        """Test error statistics"""
        error_handler = ErrorHandler()
        
        # Simulate errors over time
        error_handler.log_error(Exception("Error 1"), category=ErrorCategory.INTERNAL)
        time.sleep(0.1)
        error_handler.log_error(ValueError("Error 2"), category=ErrorCategory.VALIDATION)
        time.sleep(0.1)
        error_handler.log_error(Exception("Error 3"), category=ErrorCategory.INTERNAL)
        
        stats = error_handler.get_error_statistics()
        
        assert stats["total_errors"] == 3
        assert stats["unique_errors"] == 2  # 2 unique error types
        assert stats["error_frequency"] > 0
        assert stats["average_response_time"] > 0


class TestErrorHandlerCategories:
    """Test ErrorHandler categories"""
    
    def test_internal_error_handling(self):
        """Test internal error handling"""
        error_handler = ErrorHandler()
        
        error = Exception("Database connection failed")
        response = error_handler.handle_error(error, category=ErrorCategory.INTERNAL)
        
        assert response.code == 500
        assert response.category == "internal_error"
        assert "Database connection failed" in response.message
    
    def test_validation_error_handling(self):
        """Test validation error handling"""
        error_handler = ErrorHandler()
        
        error = ValueError("Invalid email format")
        response = error_handler.handle_error(error, category=ErrorCategory.VALIDATION)
        
        assert response.code == 400
        assert response.category == "validation_error"
        assert "Invalid email format" in response.message
    
    def test_authentication_error_handling(self):
        """Test authentication error handling"""
        error_handler = ErrorHandler()
        
        error = PermissionError("Unauthorized access")
        response = error_handler.handle_error(error, category=ErrorCategory.AUTHENTICATION)
        
        assert response.code == 401
        assert response.category == "authentication_error"
        assert "Unauthorized access" in response.message
    
    def test_throttling_error_handling(self):
        """Test throttling error handling"""
        error_handler = ErrorHandler()
        
        error = RuntimeError("Rate limit exceeded")
        response = error_handler.handle_error(error, category=ErrorCategory.THROTTLING)
        
        assert response.code == 429
        assert response.category == "throttling_error"
        assert "Rate limit exceeded" in response.message
    
    def test_not_found_error_handling(self):
        """Test not found error handling"""
        error_handler = ErrorHandler()
        
        error = FileNotFoundError("Resource not found")
        response = error_handler.handle_error(error, category=ErrorCategory.NOT_FOUND)
        
        assert response.code == 404
        assert response.category == "not_found_error"
        assert "Resource not found" in response.message
    
    def test_conflict_error_handling(self):
        """Test conflict error handling"""
        error_handler = ErrorHandler()
        
        error = RuntimeError("Resource already exists")
        response = error_handler.handle_error(error, category=ErrorCategory.CONFLICT)
        
        assert response.code == 409
        assert response.category == "conflict_error"
        assert "Resource already exists" in response.message


class TestErrorHandlerIntegration:
    """Test ErrorHandler integration"""
    
    def test_error_handling_pipeline(self):
        """Test complete error handling pipeline"""
        error_handler = ErrorHandler()
        
        # Test complete error handling
        try:
            # Simulate error
            raise ValueError("Invalid input data")
        except Exception as e:
            response = error_handler.handle_error(e, category=ErrorCategory.VALIDATION)
            error_handler.log_error(e, category=ErrorCategory.VALIDATION)
            
            # Verify response
            assert response.code == 400
            assert response.category == "validation_error"
            assert "Invalid input data" in response.message
            
            # Verify log
            assert len(error_handler.error_log) == 1
            assert error_handler.error_log[0]["message"] == "Invalid input data"
            assert error_handler.error_log[0]["category"] == "validation_error"
    
    def test_error_metrics_integration(self):
        """Test error metrics integration"""
        error_handler = ErrorHandler()
        
        # Simulate multiple errors
        error_types = [
            (Exception("Internal error"), ErrorCategory.INTERNAL),
            (ValueError("Validation error"), ErrorCategory.VALIDATION),
            (PermissionError("Auth error"), ErrorCategory.AUTHENTICATION),
            (RuntimeError("Throttling error"), ErrorCategory.THROTTLING)
        ]
        
        for error, category in error_types:
            error_handler.log_error(error, category=category)
        
        # Get metrics
        metrics = error_handler.get_error_metrics()
        
        assert metrics["total_errors"] == 4
        assert metrics["internal_errors"] == 1
        assert metrics["validation_errors"] == 1
        assert metrics["authentication_errors"] == 1
        assert metrics["throttling_errors"] == 1
    
    def test_error_statistics_integration(self):
        """Test error statistics integration"""
        error_handler = ErrorHandler()
        
        # Simulate errors over time
        error_handler.log_error(Exception("Error 1"), category=ErrorCategory.INTERNAL)
        time.sleep(0.1)
        error_handler.log_error(ValueError("Error 2"), category=ErrorCategory.VALIDATION)
        time.sleep(0.1)
        error_handler.log_error(Exception("Error 3"), category=ErrorCategory.INTERNAL)
        
        stats = error_handler.get_error_statistics()
        
        assert stats["total_errors"] == 3
        assert stats["unique_errors"] == 2
        assert stats["error_frequency"] > 0
        assert stats["average_response_time"] > 0
    
    def test_error_recovery(self):
        """Test error recovery"""
        error_handler = ErrorHandler()
        
        # Test error recovery
        try:
            # Simulate recoverable error
            raise RuntimeError("Temporary failure")
        except Exception as e:
            response = error_handler.handle_error(e, category=ErrorCategory.INTERNAL)
            
            # Verify retryable error
            assert response.code == 500
            assert "Temporary failure" in response.message
            assert response.category == "internal_error"
            
            # Log error
            error_handler.log_error(e, category=ErrorCategory.INTERNAL)
            
            # Verify error was logged
            assert len(error_handler.error_log) == 1


class TestErrorHandlerPerformance:
    """Test ErrorHandler performance"""
    
    def test_error_handler_performance(self):
        """Test error handler performance"""
        error_handler = ErrorHandler()
        
        # Test performance with many errors
        start_time = time.time()
        
        for i in range(1000):
            error = Exception(f"Error {i}")
            error_handler.log_error(error, category=ErrorCategory.INTERNAL)
        
        elapsed_time = time.time() - start_time
        
        # Verify performance is acceptable
        assert elapsed_time < 1.0  # Should process 1000 errors in under 1 second
        
        # Verify memory usage is reasonable
        assert len(error_handler.error_log) == 1000
        assert len(error_handler.metrics) > 0
    
    def test_error_metrics_performance(self):
        """Test error metrics performance"""
        error_handler = ErrorHandler()
        
        # Test metrics calculation performance
        start_time = time.time()
        
        for i in range(10000):
            error = Exception(f"Error {i}")
            error_handler.log_error(error, category=ErrorCategory.INTERNAL if i % 2 == 0 else ErrorCategory.VALIDATION)
        
        # Get metrics
        metrics = error_handler.get_error_metrics()
        
        elapsed_time = time.time() - start_time
        
        # Verify performance is acceptable
        assert elapsed_time < 2.0  # Should process 10000 errors in under 2 seconds
        
        # Verify metrics are correct
        assert metrics["total_errors"] == 10000
        assert metrics["internal_errors"] == 5000
        assert metrics["validation_errors"] == 5000
        assert metrics["error_rate"] > 0