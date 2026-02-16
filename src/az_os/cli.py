import argparse
import sys
import logging
from typing import Any, Dict, List, Optional
from src.az_os.core.security import Security
from src.az_os.core.error_handler import ErrorHandler
from src.az_os.core.telemetry import Telemetry

def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Advanced Zero-OS - Enterprise Operating System",
        prog="az-os"
    )
    
    parser.add_argument(
        "--version",
        action="version",
        version=f"%(prog)s {__import__('src.az_os').__version__}"
    )
    
    subparsers = parser.add_subparsers(dest="command", required=True, help="Available commands")
    
    # Run command
    run_parser = subparsers.add_parser("run", help="Run AZ-OS services")
    run_parser.add_argument("--config", help="Configuration file path")
    run_parser.add_argument("--verbose", action="store_true", help="Enable verbose logging")
    run_parser.add_argument("--timeout", type=int, default=300, help="Command timeout in seconds")
    
    # Status command
    status_parser = subparsers.add_parser("status", help="Show system status")
    status_parser.add_argument("--format", choices=["text", "json"], default="text", help="Output format")
    
    # Health command
    health_parser = subparsers.add_parser("health", help="Check system health")
    health_parser.add_argument("--detailed", action="store_true", help="Show detailed health info")
    
    # Security command
    security_parser = subparsers.add_parser("security", help="Security operations")
    security_parser.add_argument("action", choices=["audit", "rate-limit", "validate"], help="Security action")
    security_parser.add_argument("--user", help="User ID for security operations")
    
    # Telemetry command
    telemetry_parser = subparsers.add_parser("telemetry", help="Telemetry operations")
    telemetry_parser.add_argument("action", choices=["metrics", "alerts", "status"], help="Telemetry action")
    
    # Error command
    error_parser = subparsers.add_parser("error", help="Error handling operations")
    error_parser.add_argument("action", choices=["stats", "retry", "simulate"], help="Error action")
    
    args = parser.parse_args()
    
    # Configure logging
    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    try:
        if args.command == "run":
            run_command(args)
        elif args.command == "status":
            status_command(args)
        elif args.command == "health":
            health_command(args)
        elif args.command == "security":
            security_command(args)
        elif args.command == "telemetry":
            telemetry_command(args)
        elif args.command == "error":
            error_command(args)
        else:
            parser.print_help()
            sys.exit(1)
    
    except Exception as e:
        logging.error(f"Command failed: {str(e)}")
        sys.exit(1)

def run_command(args: argparse.Namespace):
    """Run AZ-OS services."""
    logging.info("Starting AZ-OS services...")
    
    # Initialize core components
    security = Security(db_path=":memory:", encryption_key="cli-run-key")
    error_handler = ErrorHandler()
    telemetry = Telemetry(db_path=":memory:", api_key="cli-run-key")
    
    # Simulate service startup
    logging.info("Initializing security module...")
    logging.info("Initializing error handler...")
    logging.info("Initializing telemetry...")
    
    # Check system health
    health = telemetry.check_health()
    if health["system"]["status"] != "healthy":
        logging.warning("System health check failed!")
        sys.exit(1)
    
    logging.info("All services started successfully")
    logging.info("AZ-OS is running")

def status_command(args: argparse.Namespace):
    """Show system status."""
    logging.info("Retrieving system status...")
    
    # Mock status data
    status_data = {
        "version": __import__('src.az_os').__version__,
        "status": "running",
        "services": {
            "security": "active",
            "error_handler": "active",
            "telemetry": "active"
        },
        "uptime": "0d 0h 0m 0s",
        "load": "normal"
    }
    
    if args.format == "json":
        import json
        print(json.dumps(status_data, indent=2))
    else:
        print("AZ-OS Status:")
        print(f"  Version: {status_data['version']}")
        print(f"  Status: {status_data['status']}")
        print("  Services:")
        for service, state in status_data["services"].items():
            print(f"    {service}: {state}")

def health_command(args: argparse.Namespace):
    """Check system health."""
    logging.info("Performing system health check...")
    
    telemetry = Telemetry(db_path=":memory:", api_key="health-check-key")
    health = telemetry.check_health()
    
    if args.detailed:
        print("Detailed Health Report:")
        print(f"System: {health['system']['status']}")
        print(f"  CPU: {health['system']['cpu']}%")
        print(f"  Memory: {health['system']['memory']}%")
        print(f"  Disk: {health['system']['disk']}%")
        print("Services:")
        for service, status in health["services"].items():
            print(f"  {service}: {status}")
        print("Performance:")
        print(f"  Latency: {health['performance']['latency']}ms")
        print(f"  Throughput: {health['performance']['throughput']} req/s")
    else:
        print(f"System Health: {health['system']['status']}")

def security_command(args: argparse.Namespace):
    """Security operations."""
    security = Security(db_path=":memory:", encryption_key="security-cmd-key")
    
    if args.action == "audit":
        logs = security.get_audit_logs()
        print(f"Audit Logs ({len(logs)} entries):")
        for log in logs[:10]:  # Show first 10
            print(f"  {log['timestamp']} - {log['event_type']}")
    
    elif args.action == "rate-limit":
        if not args.user:
            print("Error: --user is required for rate limit check")
            sys.exit(1)
        
        endpoint = "/api/test"
        result = security.check_rate_limit(args.user, endpoint)
        print(f"Rate limit check for {args.user}: {'Allowed' if result else 'Denied'}")
    
    elif args.action == "validate":
        schema = {"test": {"type": str, "required": True}}
        data = {"test": "valid-data"}
        
        try:
            result = security.validate_input(data, schema)
            print("Input validation successful")
            print(f"Validated data: {result}")
        except Exception as e:
            print(f"Input validation failed: {str(e)}")

def telemetry_command(args: argparse.Namespace):
    """Telemetry operations."""
    telemetry = Telemetry(db_path=":memory:", api_key="telemetry-cmd-key")
    
    if args.action == "metrics":
        metrics = telemetry.get_metrics()
        print("System Metrics:")
        for key, value in metrics.items():
            print(f"  {key}: {value}")
    
    elif args.action == "alerts":
        metrics = telemetry.get_metrics()
        alert = telemetry.should_alert(metrics)
        print(f"Alert status: {'Active' if alert else 'Normal'}")
        if alert:
            suggestions = telemetry.suggest_actions(metrics)
            print("Suggested actions:")
            for action in suggestions:
                print(f"  - {action}")
    
    elif args.action == "status":
        status = telemetry.get_status()
        print("Telemetry Status:")
        print(f"  Status: {status['status']}")
        print(f"  Last check: {status['last_check']}")
        print(f"  Error rate: {status['error_rate']}%")

def error_command(args: argparse.Namespace):
    """Error handling operations."""
    error_handler = ErrorHandler()
    
    if args.action == "stats":
        stats = error_handler.get_error_stats()
        print("Error Statistics:")
        print(f"  Total errors: {stats['total_errors']}")
        print(f"  Retryable errors: {stats['retryable_errors']}")
        print(f"  Fatal errors: {stats['fatal_errors']}")
        print("Error types:")
        for error_id, data in stats["error_types"].items():
            print(f"  {error_id}: {data['count']} occurrences")
    
    elif args.action == "retry":
        class TestRetryableError(Exception):
            pass
        
        context = {"retry_count": 0}
        result = error_handler.handle_error(TestRetryableError("Test retryable error"), context)
        print("Retryable error handling:")
        print(f"  Should retry: {result['should_retry']}")
        print(f"  Message: {result['message']}")
    
    elif args.action == "simulate":
        class TestFatalError(Exception):
            pass
        
        context = {"retry_count": 0}
        result = error_handler.handle_error(TestFatalError("Test fatal error"), context)
        print("Fatal error handling:")
        print(f"  Category: {result['category']}")
        print(f"  Message: {result['message']}")