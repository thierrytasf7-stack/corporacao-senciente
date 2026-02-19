import asyncio
import logging
import os
from typing import Optional, List, Dict, Any, AsyncIterator
from datetime import datetime
import litellm
from dotenv import load_dotenv

# Forçar carregamento do .env
load_dotenv()

logger = logging.getLogger(__name__)

class LLMClient:
    def __init__(self, config=None, db=None, cache_enabled: bool = True):
        # Configuração direta para garantir o Trinity via OpenRouter
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.default_model = "openrouter/arcee-ai/trinity-large-preview:free"
        self.models = [self.default_model]
        
        if self.api_key:
            os.environ["OPENROUTER_API_KEY"] = self.api_key
            # Desativar logs chatos do litellm que poluem o terminal
            litellm.set_verbose = False
        
    async def initialize(self) -> None:
        pass
        
    async def generate_text(
        self,
        prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        stream: bool = False,
        task_id: Optional[str] = None,
    ) -> Any:
        # Forçar sempre o modelo Trinity se nenhum for passado
        target_model = model or self.default_model

        try:
            # Chamada direta ao LiteLLM com o provedor OpenRouter forçado
            response = await litellm.acompletion(
                model=target_model,
                messages=[{"role": "user", "content": prompt}],
                temperature=temperature,
                max_tokens=max_tokens,
                api_key=self.api_key
            )
            return response
        except Exception as e:
            logger.error(f"Erro no modelo {target_model}: {e}")
            raise
    
    async def _generate_with_model(self, *args, **kwargs):
        return await self.generate_text(*args, **kwargs)

    def _calculate_cost(self, *args, **kwargs):
        return 0.0
    
    async def check(self) -> Dict[str, Any]:
        return {"status": "connected", "model": self.default_model}
