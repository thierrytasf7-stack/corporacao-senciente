import asyncio
import logging
from typing import Optional, List, Dict, Any, AsyncIterator
from datetime import datetime
import litellm
from litellm import ChatCompletionRequest, ChatCompletionResponse
from litellm import ChatCompletionRequest, ChatCompletionResponse
from litellm import ChatCompletionRequest, ChatCompletionResponse
from litellm import ChatCompletionRequest, ChatCompletionResponse

from az_os.core.config import Config
from az_os.core.storage import Database, TaskStatus, TaskPriority, LogLevel
from az_os.core.models import Task, TaskLog, CostTracking

logger = logging.getLogger(__name__)


class LLMClient:
    def __init__(self, config: Config, db: Database):
        self.config = config
        self.db = db
        self.models = self.config.settings.llm.models
        self.default_model = self.config.settings.llm.default_model
        self.rate_limit_backoff = self.config.settings.llm.rate_limit_backoff
        self.max_retries = self.config.settings.llm.max_retries
        
    async def initialize(self) -> None:
        """Initialize the LLM client."""
        await self.db.initialize()
        
    async def generate_text(
        self,
        prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
        stream: bool = False,
        task_id: Optional[str] = None,
    ) -> ChatCompletionResponse:
        """Generate text using the LLM with cascade fallback."""
        if not model:
            model = self.default_model
        
        # Try models in cascade order
        for model_name in self.models:
            try:
                response = await self._generate_with_model(
                    model_name,
                    prompt,
                    temperature,
                    max_tokens,
                    stream,
                    task_id,
                )
                return response
            except litellm.errors.RateLimitError:
                logger.warning(f"Rate limit reached for {model_name}, retrying...")
                await asyncio.sleep(self.rate_limit_backoff)
            except Exception as e:
                logger.error(f"Error with {model_name}: {e}")
                continue
        
        raise Exception("All models failed")
    
    async def _generate_with_model(
        self,
        model_name: str,
        prompt: str,
        temperature: float,
        max_tokens: int,
        stream: bool,
        task_id: Optional[str],
    ) -> ChatCompletionResponse:
        """Generate text with a specific model."""
        # Track cost
        cost_tracking = CostTracking(
            task_id=task_id,
            provider="litellm",
            model=model_name,
            tokens_used=0,
            cost=0.0,
            timestamp=datetime.now(),
        )
        
        try:
            # Make the API call
            response = await litellm.chat_completion(
                model=model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=temperature,
                max_tokens=max_tokens,
                stream=stream,
                **self.config.settings.llm.api_keys,
            )
            
            # Update cost tracking
            cost_tracking.tokens_used = response.token_usage.total_tokens
            cost_tracking.cost = self._calculate_cost(model_name, response.token_usage.total_tokens)
            
            # Save to database
            if task_id:
                await self.db.create_cost_tracking(cost_tracking)
                
                # Update task with actual tokens and cost
                task = await self.db.get_task(task_id)
                if task:
                    task.actual_tokens = cost_tracking.tokens_used
                    task.cost = cost_tracking.cost
                    await self.db.update_task(task)
            
            return response
            
        except Exception as e:
            # Log error
            if task_id:
                await self.db.create_log(TaskLog(
                    task_id=task_id,
                    log_level=LogLevel.ERROR,
                    message=f"LLM error: {str(e)}",
                    timestamp=datetime.now(),
                    metadata={"model": model_name},
                ))
            
            raise
    
    def _calculate_cost(self, model_name: str, tokens: int) -> float:
        """Calculate cost based on model and tokens."""
        # Cost rates (example rates, should be configurable)
        cost_rates = {
            "claude-3-5-sonnet-20241022": 0.00003,  # $0.03 per 1K tokens
            "gpt-4-turbo": 0.00030,                  # $0.30 per 1K tokens
            "gemini-1.5-pro": 0.00020,               # $0.20 per 1K tokens
            "deepseek-coder": 0.00010,               # $0.10 per 1K tokens
        }
        
        rate = cost_rates.get(model_name, 0.00010)  # Default to $0.10 per 1K tokens
        return (tokens / 1000) * rate
    
    async def check(self) -> Dict[str, Any]:
        """Check LLM client status."""
        try:
            # Test connection with a simple prompt
            response = await self.generate_text("Hello, how are you?", model="claude-3-5-sonnet-20241022")
            return {
                "status": "connected",
                "models": self.models,
                "default_model": self.default_model,
                "response": response.choices[0].message.content[:100] + "...",
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
            }