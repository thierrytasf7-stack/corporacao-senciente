"""
============================================
Aider Service - Integração com Aider CLI
Corporação Senciente - O Maestro
============================================

Serviço para executar comandos via Aider CLI
e processar resultados, com suporte a Docker.
"""

import asyncio
import os
import re
import sys
import aiohttp
from typing import Dict, Any, List, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class AiderService:
    """
    Serviço de integração com Aider CLI (O Maestro).
    Suporta execução nativa ou via Docker.
    """
    
    # Pool de Chaves Estático (Persistente entre instâncias)
    _api_key = os.getenv("OPENROUTER_API_KEY")
    _free_keys = [k.strip() for k in os.getenv("OPENROUTER_FREE_KEYS", "").split(",") if k.strip()]
    _current_free_key_index = 0

    def __init__(self):
        self.api_key = self._api_key
        self.free_keys = self._free_keys
        
        if not self.api_key:
            logger.warning("OPENROUTER_API_KEY (Primary/Paid) não configurada!")
        if not self.free_keys:
            logger.info("Nenhuma OPENROUTER_FREE_KEYS detectada. Usando primária para tudo.")
        
        # Modo de execução: 'native' ou 'docker'
        self.mode = "native"
        
        # Cadeias de Modelos (User Request)
        self.PLANNING_CHAIN = ["deepseek/deepseek-chat", "deepseek/deepseek-r1:free"]
        self.EXECUTION_CHAIN = ["arcee-ai/trinity-large-preview:free", "qwen/qwen-2.5-coder-32b-instruct:free"]
        
        # Modelo atual (Padrão)
        self.model = self.PLANNING_CHAIN[0]
        self.editor_model = self.PLANNING_CHAIN[0]
        self.instructions_file = ".aider.instructions.md"
        
        # Detecção de VENV (Busca absoluta no projeto base)
        base_dir = r"c:\Users\User\Desktop\Sencient-Coorporation\Diana-Corporacao-Senciente"
        self.venv_python = os.path.join(base_dir, "venv_maestro", "Scripts", "python.exe")
        if not os.path.exists(self.venv_python):
            # Tentar venv (padrão)
            self.venv_python = os.path.join(base_dir, "venv", "Scripts", "python.exe")
            if not os.path.exists(self.venv_python):
                self.venv_python = sys.executable 
        
    async def execute(self, command: str, files: Optional[List[str]] = None, mode: str = "task", chain_type: str = "planning") -> Dict[str, Any]:
        """
        Executa comando via Aider CLI com fallback automático na cadeia de modelos.
        """
        start_time = datetime.now()
        
        # Selecionar Cadeia
        chain = self.PLANNING_CHAIN if chain_type == "planning" else self.EXECUTION_CHAIN
        
        # Injeção de Prompt para Modo Task (Garante Qualidade Areté)
        final_command = command
        if mode == "task":
             blueprint_prompt = (
                "ATUE COMO ARCHITECT C4 ATOMIC E FILÓSOFO ONTOLÓGICO.\n"
                "REGRA CRÍTICA: JAMAIS simplifique, apague ou encurte o conteúdo. APENAS EXPANDA.\n"
                "Mantenha toda a densidade original. Se o documento tem 170 linhas, o resultado DEVE ter 220+.\n"
                "Use o padrão Areté Nível 22: Terminologia técnica precisa + Profundidade Filosófica.\n"
                "PARA A SOLICITAÇÃO ABAIXO, GERE UM BLUEPRINT TÉCNICO DETALHADO ANTES DE CODAR.\n"
                "SOLICITAÇÃO: "
            )
             final_command = f"{blueprint_prompt} {command}"
        
        # Tentar modelos da cadeia sequencialmente
        last_error = "Nenhuma tentativa realizada"
        
        for current_model in chain:
            try:
                # MODO CHAT: Fallback direto para API
                if mode == "chat":
                    logger.info(f"Modo Chat ({current_model}). Executando via API direta.")
                    result = await self._execute_chat_api(final_command, current_model)
                    if result.get("success"):
                        return result
                    last_error = result.get("error")
                    continue

                # MODO CLI (Native)
                # Atualizar modelos temporariamente para a construção do comando
                self.model = current_model
                self.editor_model = current_model
                
                aider_cmd = self._build_native_command(final_command, files)
                logger.info(f"Tentando Aider [Modelo: {current_model}]: {aider_cmd}")
                
                # Seleção de Chave Dinâmica
                # Regra: Se o modelo termina em ':free', rotacionar entre as free_keys.
                # Caso contrário, usar a api_key primária (pago).
                is_free_model = current_model.endswith(":free") or "/free" in current_model
                
                if is_free_model and self.free_keys:
                    # Round-robin global via variável de classe
                    current_key = self.free_keys[AiderService._current_free_key_index % len(self.free_keys)]
                    AiderService._current_free_key_index += 1
                    logger.info(f"🔑 [AIDER] Usando Chave FREE (Pool Global): {current_key[:10]}...")
                else:
                    current_key = self.api_key
                    logger.info(f"💎 [AIDER] Usando Chave PRIMÁRIA (Pago): {current_key[:10]}...")

                process = await asyncio.create_subprocess_shell(
                    aider_cmd,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                    env={**os.environ, "OPENROUTER_API_KEY": current_key}
                )
                
                stdout, stderr = await process.communicate()
                
                result = self._parse_output(
                    stdout.decode('utf-8', errors='ignore'),
                    stderr.decode('utf-8', errors='ignore'),
                    process.returncode
                )
                
                if result.get("success") or result.get("files_modified") or result.get("files_created"):
                    duration = (datetime.now() - start_time).total_seconds()
                    result["duration_seconds"] = duration
                    result["model"] = current_model
                    logger.info(f"Aider ({current_model}) sucesso!")
                    return result
                
                last_error = result.get("error") or "Erro CLI sem mensagem específica"
                logger.warning(f"Falha no modelo {current_model}: {last_error}")
                
            except Exception as e:
                last_error = str(e)
                logger.error(f"Erro ao tentar modelo {current_model}: {e}")
        
        # Se chegou aqui, todos falharam
        return {
            "success": False,
            "error": f"FALHA_TOTAL_CADEIA_{chain_type.upper()}: {last_error}",
            "cli": "aider",
            "command": command
        }
    
    def _build_native_command(self, message: str, files: Optional[List[str]] = None) -> str:
        # Usa o Python do VENV (ou global) para garantir execução do módulo
        model_name = self.model.replace("openrouter/", "")
        cmd_parts = [
            f'"{self.venv_python}"', "-m", "aider",
            f"--model openrouter/{model_name}",
            f"--editor-model openrouter/{model_name}",
            f"--read {self.instructions_file}",
            "--auto-commits",
            '--commit-prompt "AI: [Maestro]"',
            "--yes",
            "--no-pretty",
            "--no-stream",
            f'--message "{message}"'
        ]
        if files:
            for file in files: cmd_parts.append(f'"{file}"')
        return " ".join(cmd_parts)

    def _parse_output(self, stdout: str, stderr: str, returncode: int) -> Dict[str, Any]:
        result = {
            "success": returncode == 0,
            "cli": "aider",
            "stdout": stdout,
            "stderr": stderr,
            "returncode": returncode,
            "files_created": [],
            "files_modified": [],
            "commit_hash": None
        }
        
        # Padrões de detecção (Versão 0.86.1+ e legados)
        created_pattern = r"(?:Created|Added)\s+([^\s\n\r]+)"
        modified_pattern = r"(?:Applied\s+edit\s+to|Modified)\s+([^\s\n\r]+)"
        
        # Ignorar pontuação no fim do nome do arquivo se houver
        raw_created = re.findall(created_pattern, stdout)
        raw_modified = re.findall(modified_pattern, stdout)
        
        result["files_created"] = [f.rstrip('.,') for f in raw_created]
        result["files_modified"] = [f.rstrip('.,') for f in raw_modified]
        
        commit_pattern = r"Commit\s+([a-f0-9]{7,40})"
        commit_match = re.search(commit_pattern, stdout)
        if commit_match:
            result["commit_hash"] = commit_match.group(1)
            
        # Aider pode ser considerado sucesso se houve alteração de arquivos mesmo com erro de linter (returncode != 0)
        if returncode != 0 and (not result["files_created"] and not result["files_modified"]):
            result["success"] = False
            result["error"] = stderr or stdout
        elif result["files_created"] or result["files_modified"]:
            result["success"] = True # Houve aplicação de código
        
        return result
    
    async def _execute_chat_api(self, message: str, model: str) -> Dict[str, Any]:
        """Executa chat direto via OpenRouter API."""
        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "X-Title": "Corporação Senciente - Maestro Chat"
        }
        
        is_free_model = model.endswith(":free") or "/free" in model
        current_api_key = self.api_key
        if is_free_model and self.free_keys:
             current_api_key = self.free_keys[AiderService._current_free_key_index % len(self.free_keys)]
             AiderService._current_free_key_index += 1
             
        headers["Authorization"] = f"Bearer {current_api_key}"
        
        model_name = model.replace("openrouter/", "")
        
        payload = {
            "model": model_name,
            "messages": [{"role": "user", "content": message}],
            "temperature": 0.7
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, json=payload, timeout=60) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        content = data["choices"][0]["message"]["content"]
                        return {
                            "success": True, 
                            "content": content, 
                            "usage": data.get("usage", {}),
                            "model": model
                        }
                    else:
                        err = await resp.text()
                        return {"success": False, "error": f"API Error {resp.status}: {err}"}
        except Exception as e:
            return {"success": False, "error": f"Erro Conexão API: {str(e)}"}

    async def validate_installation(self) -> bool:
        try:
            cmd = "docker run --rm paulgauthier/aider --version" if self.mode == "docker" else "aider --version"
            process = await asyncio.create_subprocess_shell(
                cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, _ = await process.communicate()
            return process.returncode == 0
        except:
            return False

# Instância global
aider_service = AiderService()
