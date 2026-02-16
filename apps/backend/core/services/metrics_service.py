import time
from typing import Dict, List, Any
from datetime import datetime

class MetricsService:
    """Serviço centralizado de métricas para o OAIOS."""
    
    def __init__(self):
        self.start_time = datetime.now()
        self.cli_performance = {
            "aider": {"total_calls": 0, "total_duration": 0, "success_rate": 0},
            "qwen": {"total_calls": 0, "total_duration": 0, "success_rate": 0}
        }
        self.squad_stats = {}

    def record_execution(self, cli: str, duration: float, success: bool, squad: str = "default"):
        """Registra o resultado de uma execução de CLI."""
        if cli not in self.cli_performance:
            self.cli_performance[cli] = {"total_calls": 0, "total_duration": 0, "success_rate": 0, "errors": 0}
        
        perf = self.cli_performance[cli]
        perf["total_calls"] += 1
        perf["total_duration"] += duration
        
        if not success:
            perf.setdefault("errors", 0)
            perf["errors"] += 1
            
        success_count = perf["total_calls"] - perf.get("errors", 0)
        perf["success_rate"] = (success_count / perf["total_calls"]) * 100

    def get_summary(self) -> Dict[str, Any]:
        """Retorna um resumo das métricas."""
        return {
            "uptime_seconds": (datetime.now() - self.start_time).total_seconds(),
            "cli_performance": self.cli_performance,
            "timestamp": datetime.now().isoformat()
        }

_metrics_instance = MetricsService()

def get_metrics_service():
    return _metrics_instance
