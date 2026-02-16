import json
import time
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BaseAgent(ABC):
    """
    Classe base para todos os agentes inteligentes da Corporação.
    Define a interface padrão para interação com LLMs.
    """
    
    def __init__(self, agent_name: str, config_path: str = "config/llm_config.json"):
        self.agent_name = agent_name
        self.config = self._load_config(config_path)
        self.provider = self.config.get("default_provider", "mock")
        
    def _load_config(self, path: str) -> Dict[str, Any]:
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}

    @abstractmethod
    def generate_response(self, prompt: str, context: Optional[Dict] = None) -> str:
        """Gera uma resposta baseada no prompt."""
        pass

    def count_tokens(self, text: str) -> int:
        """Estimativa simples de tokens (1 token ~= 4 chars)."""
        return len(text) // 4

class MockAgent(BaseAgent):
    """Agente de simulação para testes sem custo."""
    
    def generate_response(self, prompt: str, context: Optional[Dict] = None) -> str:
        time.sleep(self.config.get("providers", {}).get("mock", {}).get("latency", 0.1))
        return f"[{self.agent_name}] Mock Response to: {prompt[:50]}..."
