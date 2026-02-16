"""
============================================
Qwen Service - Integração com Qwen via OpenRouter
Corporação Senciente - A Escriba
============================================

Serviço para executar comandos de documentação via Qwen
usando OpenRouter API.
"""

import os
import asyncio
import aiohttp
from typing import Dict, Any, List, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class QwenService:
    """
    Serviço de integração com Qwen 2.5 Coder (A Escriba).
    
    Responsabilidades:
    - Gerar documentação (READMEs, docstrings)
    - Traduzir interfaces
    - Criar componentes repetitivos
    - Gerar testes unitários
    """
    
    def __init__(self):
        # DashScope (Alibaba Cloud) agora é o provedor exclusivo
        self.api_key = os.getenv("DASHSCOPE_API_KEY")
        self.api_url = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
        
        # Pool de modelos em ordem de preferência (Melhor para o Pior/Mais simples)
        self.models_pool = [
            "qwen-max",     # O mais inteligente
            "qwen-plus",    # Equilíbrio
            "qwen-turbo",   # Mais rápido
            "qwen-long",    # Para contextos gigantes
            "qwen2.5-coder-32b-instruct", # Específico para código
            "qwen2.5-72b-instruct",       # Código Aberto 72B
            "qwen2.5-7b-instruct"         # Leve
        ]
        
        # Iniciar com o melhor disponível
        self.current_model = self.models_pool[0]
        
        if not self.api_key:
            logger.warning("DASHSCOPE_API_KEY não configurada! QwenService operará em modo degradado.")
        else:
            logger.info(f"QwenService inicializado com pool de modelos Alibaba (Iniciando com: {self.current_model})")
        
        self.instructions_file = ".qwen.instructions.md"
        
        # Carregar instruções
        self.instructions = self._load_instructions()
    
    def _load_instructions(self) -> str:
        """Carrega instruções do arquivo."""
        try:
            with open(self.instructions_file, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            logger.warning(f"{self.instructions_file} não encontrado")
            return ""
    
    async def execute(self, task: str, context: Optional[str] = None, mode: str = "task") -> Dict[str, Any]:
        """
        [AIDER-ONLY REDIRECT] Executa tarefa via AiderService (Maestro).
        """
        from backend.core.services.aider_service import AiderService
        aider = AiderService()
        
        # Como o QwenService é usado principalmente para documentação/análise
        # vamos mapear para a PLANNING_CHAIN
        logger.info(f"Redirecting QwenService call to Aider (Maestro) Planning Chain")
        
        full_prompt = task
        if context:
            full_prompt = f"{task}\n\nCONTEXTO:\n{context}"
            
        return await aider.execute(full_prompt, mode=mode, chain_type="planning")
    
    async def _call_api(self, prompt: str, model: str) -> Dict[str, Any]:
        """[DEPRECATED] Mantido apenas para evitar erros de importação."""
        return {"success": False, "error": "QwenService desativado. Use AiderService."}
    
    async def document_file(self, file_path: str) -> Dict[str, Any]:
        """
        Documenta um arquivo específico.
        
        Args:
            file_path: Caminho do arquivo a documentar
            
        Returns:
            Documentação gerada
        """
        # Ler arquivo
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                code = f.read()
        except FileNotFoundError:
            return {
                "success": False,
                "error": f"Arquivo não encontrado: {file_path}"
            }
        
        # Gerar documentação
        task = f"Gerar README.md completo para o arquivo {file_path}"
        context = f"Código do arquivo:\n\n```\n{code}\n```"
        
        return await self.execute(task, context)
    
    async def translate_ui(self, component_path: str, target_lang: str = "pt") -> Dict[str, Any]:
        """
        Traduz componente de UI.
        
        Args:
            component_path: Caminho do componente
            target_lang: Idioma alvo (pt ou en)
            
        Returns:
            Componente traduzido
        """
        task = f"Traduzir componente {component_path} para {target_lang}"
        
        # Ler componente
        try:
            with open(component_path, 'r', encoding='utf-8') as f:
                code = f.read()
        except FileNotFoundError:
            return {
                "success": False,
                "error": f"Componente não encontrado: {component_path}"
            }
        
        context = f"Código do componente:\n\n```tsx\n{code}\n```"
        
        return await self.execute(task, context)


# Instância global
qwen_service = QwenService()
