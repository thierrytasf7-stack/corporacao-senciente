import json
import os
from typing import Any, Dict, List, Optional, Tuple
from az_os.core.storage import Storage
from az_os.core.llm_client import LLMClient
from az_os.core.config_manager import ConfigManager


class ExecutionEngine:
    def __init__(self):
        self.storage = Storage()
        self.llm_client = LLMClient()
        self.config = ConfigManager()
        self._load_config()

    def _load_config(self) -> None:
        """Load configuration"""
        model = self.config.get('model', 'gpt-3.5-turbo')
        self.llm_client.set_model(model)

    def execute(self, code: str) -> Dict[str, Any]:
        """Execute Python code"""
        try:
            # Create a safe execution environment
            local_vars = {}
            exec_globals = {
                '__builtins__': __builtins__,
                'print': print,
                'len': len,
                'str': str,
                'int': int,
                'float': float,
                'bool': bool,
                'list': list,
                'dict': dict,
                'set': set,
                'tuple': tuple,
                'range': range,
                'sum': sum,
                'max': max,
                'min': min,
                'abs': abs,
                'round': round,
                'sorted': sorted,
                'zip': zip,
                'enumerate': enumerate,
                'filter': filter,
                'map': map,
                'any': any,
                'all': all,
                'type': type,
                'isinstance': isinstance,
                'dir': dir,
                'help': help,
                'open': open,
                'input': input,
                'exit': exit,
                'quit': quit
            }
            
            # Execute code
            exec(code, exec_globals, local_vars)
            
            # Get output
            output = local_vars.get('_output', None)
            if '_output' in local_vars:
                del local_vars['_output']
            
            return {
                'output': output,
                'variables': local_vars,
                'error': None
            }
            
        except Exception as e:
            return {
                'output': None,
                'variables': {},
                'error': str(e)
            }

    def execute_with_rag(self, code: str, context: str) -> Dict[str, Any]:
        """Execute code with RAG context"""
        try:
            # Generate enhanced code using context
            enhanced_code = self._enhance_code_with_context(code, context)
            
            # Execute the enhanced code
            result = self.execute(enhanced_code)
            
            # Add context information to result
            result['context_used'] = context
            result['original_code'] = code
            result['enhanced_code'] = enhanced_code
            
            return result
            
        except Exception as e:
            return {
                'output': None,
                'variables': {},
                'error': f"RAG execution failed: {e}",
                'context_used': context,
                'original_code': code
            }

    def _enhance_code_with_context(self, code: str, context: str) -> str:
        """Enhance code using context"""
        try:
            # Use LLM to enhance code based on context
            prompt = f"\n".join([
                "You are a code enhancement assistant.",
                "Given a code snippet and context, enhance the code.",
                "The context may contain relevant information, functions, or patterns.",
                "Use the context to improve the code if applicable.",
                "\nContext:",
                context,
                "\n\nOriginal Code:",
                code,
                "\n\nEnhanced Code:"
            ])
            
            enhanced_code = self.llm_client.chat(prompt)
            return enhanced_code
            
        except Exception as e:
            # If enhancement fails, return original code
            return code

    def execute_with_storage(self, code: str, storage_key: str) -> Dict[str, Any]:
        """Execute code with storage access"""
        try:
            # Load storage data
            storage_data = self.storage.get(storage_key, {})
            
            # Create code with storage access
            storage_code = f"""
{code}

# Storage operations
storage_data = {storage_data}

def save_to_storage(data):
    \"\"\"Save data to storage\"\"\"
    self.storage.set('{storage_key}', data)

def load_from_storage():
    \"\"\"Load data from storage\"\"\"
    return self.storage.get('{storage_key}', {{}})
"""
            
            # Execute code
            result = self.execute(storage_code)
            
            # If code modified storage_data, save it
            if 'variables' in result and 'storage_data' in result['variables']:
                self.storage.set(storage_key, result['variables']['storage_data'])
            
            return result
            
        except Exception as e:
            return {
                'output': None,
                'variables': {},
                'error': f"Storage execution failed: {e}"
            }

    def execute_with_config(self, code: str) -> Dict[str, Any]:
        """Execute code with config access"""
        try:
            # Create code with config access
            config_code = f"""
{code}

# Config operations
config = {self.config.get_all()}

def get_config(key, default=None):
    \"\"\"Get config value\"\"\"
    return self.config.get(key, default)

def set_config(key, value):
    \"\"\"Set config value\"\"\"
    self.config.set(key, value)

def get_all_configs():
    \"\"\"Get all configs\"\"\"
    return self.config.get_all()
"""
            
            # Execute code
            return self.execute(config_code)
            
        except Exception as e:
            return {
                'output': None,
                'variables': {},
                'error': f"Config execution failed: {e}"
            }

    def batch_execute(self, code_snippets: List[str]) -> List[Dict[str, Any]]:
        """Execute multiple code snippets"""
        results = []
        for code in code_snippets:
            result = self.execute(code)
            results.append(result)
        return results

    def execute_with_retry(self, code: str, max_retries: int = 3) -> Dict[str, Any]:
        """Execute code with retry on failure"""
        last_error = None
        for attempt in range(max_retries):
            result = self.execute(code)
            if result['error'] is None:
                return result
            last_error = result['error']
        
        return {
            'output': None,
            'variables': {},
            'error': f"All retries failed. Last error: {last_error}"
        }