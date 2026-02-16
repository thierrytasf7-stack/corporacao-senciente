"""
============================================
CLI Orchestrator - Gerenciador de CLIs
Corporação Senciente - Orquestra de CLIs
============================================

Responsável por rotear comandos para Aider ou Qwen
e gerenciar o sistema de handoff entre elas.
"""

import asyncio
import subprocess
from typing import Dict, Any, Optional, Literal
from datetime import datetime
import json
import logging

import logging
import os
from backend.core.services.aider_service import aider_service
from backend.core.services.qwen_service import qwen_service

logger = logging.getLogger(__name__)

CLIType = Literal["aider", "qwen"]

class CLIOrchestrator:
    """
    Orquestrador central de CLIs (Aider + Qwen).
    
    Responsabilidades:
    - Rotear comandos para CLI apropriada
    - Gerenciar handoff entre CLIs
    - Logging de operações
    - Validação de comandos
    """
    
    def __init__(self):
        self.state_file = ".cli_state.json"
        self._load_state()
    
    def _load_state(self):
        """Carrega estado das CLIs do arquivo."""
        try:
            with open(self.state_file, 'r') as f:
                self.state = json.load(f)
        except FileNotFoundError:
            self.state = {
                "last_aider_commit": None,
                "last_qwen_commit": None,
                "pending_documentation": [],
                "pending_refactoring": []
            }
    
    def _save_state(self):
        """Salva estado das CLIs no arquivo."""
        with open(self.state_file, 'w') as f:
            json.dump(self.state, f, indent=2)
    
    def route_command(self, command: str) -> CLIType:
        """
        Decide qual CLI deve executar o comando.
        
        Regras:
        - Aider: Mudanças estruturais, novos módulos, lógica complexa
        - Qwen: READMEs, documentação, tradução, componentes repetitivos
        
        Args:
            command: Comando a ser executado
            
        Returns:
            'aider' ou 'qwen'
        """
        command_lower = command.lower()
        
        # Palavras-chave para Qwen (Documentação)
        qwen_keywords = [
            'documentar', 'readme', 'docstring', 'jsdoc',
            'traduzir', 'tradução', 'translate',
            'comentar', 'comment',
            'gerar teste', 'test'
        ]
        
        # Palavras-chave para Aider (Arquitetura)
        aider_keywords = [
            'criar módulo', 'criar agente', 'criar serviço',
            'refatorar', 'refactor',
            'debugar', 'debug', 'bug',
            'integrar', 'integration',
            'arquitetura', 'architecture'
        ]
        
        # Verificar Qwen primeiro
        if any(keyword in command_lower for keyword in qwen_keywords):
            return "qwen"
        
        # Verificar Aider
        if any(keyword in command_lower for keyword in aider_keywords):
            return "aider"
        
        # Default: Aider (Maestro)
        return "aider"
    
    async def execute_command(
        self, 
        command: str, 
        cli: Optional[CLIType] = None,
        mode: str = "task",
        auto_handoff: bool = True
    ) -> Dict[str, Any]:
        """
        Executa comando via CLI apropriada.
        
        Args:
            command: Comando a executar
            cli: CLI específica (ou None para auto-roteamento)
            mode: Modo de execução ('chat' ou 'task')
            auto_handoff: Se True, faz handoff automático após conclusão
            
        Returns:
            Resultado da execução
        """
        # Auto-rotear se CLI não especificada
        if cli is None:
            cli = self.route_command(command)
        
        logger.info(f"Executando comando via {cli.upper()} [Modo: {mode}]: {command}")
        
        try:
            if cli == "aider":
                result = await self._execute_aider(command, mode)
            else:
                result = await self._execute_qwen(command, mode)
            
            # Debug Task Saving
            logger.warning(f"DEBUG: Handoff Check - Auto: {auto_handoff}, Success: {result.get('success')}, Mode: {mode}")

            # Handoff automático (apenas em modo Task)
            if auto_handoff and result.get("success") and mode == "task":
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                task_filename = f"tasks/BLUEPRINT_{timestamp}.md"
                
                # Garantir diretório
                os.makedirs("tasks", exist_ok=True)
                
                # Salvar Blueprint
                with open(task_filename, "w", encoding="utf-8") as f:
                    f.write(result.get("content") or result.get("message") or "Sem conteúdo gerado.")
                
                logger.info(f"Blueprint salvo em {task_filename}")
                result["saved_file"] = task_filename
                
                await self._handle_handoff(cli, result)
            
            # Logging
            self._log_execution(cli, command, result)
            
            return result
            
        except Exception as e:
            logger.error(f"Erro ao executar comando: {e}")
            return {
                "success": False,
                "error": str(e),
                "cli": cli,
                "command": command
            }
    
    async def _execute_aider(self, command: str, mode: str = "task") -> Dict[str, Any]:
        """Executa comando via Aider CLI."""
        try:
            return await aider_service.execute(command, mode=mode)
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "cli": "aider"
            }

    async def _execute_qwen(self, command: str, mode: str = "task") -> Dict[str, Any]:
        """Executa comando via Qwen CLI."""
        try:
            return await qwen_service.execute(command, mode=mode)
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "cli": "qwen"
            }

    async def get_recent_logs(self, lines: int = 20) -> str:
        """Lê as últimas N linhas do log do sistema."""
        try:
            # Tenta ler log do backend
            log_file = "logs/backend.log" # Ajustar path se necessário
            if not os.path.exists(log_file):
                # Fallback para log simulado se arquivo não existir
                return "⚠️ Arquivo de log não encontrado. Monitorando stdout."
            
            # Comando tail simples (funciona em Unix, em Win precisa de adaptação ou leitura manual)
            # Para Python purista (Cross-platform):
            with open(log_file, "r", encoding="utf-8") as f:
                content = f.readlines()
                return "".join(content[-lines:])
        except Exception as e:
            return f"Erro ao ler logs: {str(e)}"

    async def check_frontend_status(self) -> Dict[str, Any]:
        """Verifica status do Mission Control (Frontend)."""
        import aiohttp
        try:
            # Tentar conectar no Frontend (Prioridade: ENV > Localhost)
            urls = []
            env_url = os.getenv("FRONTEND_URL")
            if env_url:
                urls.append(env_url)
            
            urls.extend(["http://localhost:5173", "http://localhost:3000", "http://localhost:3001"]) # Vite + Next.js defaults
            
            for url in urls:
                try:
                    async with aiohttp.ClientSession() as session:
                        async with session.get(url, timeout=3) as resp:
                            if resp.status == 200:
                                return {"status": "online", "url": url, "code": 200}
                except:
                    continue
            
            return {"status": "offline", "error": f"Não foi possível conectar em: {', '.join(urls)}"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    async def start_frontend(self) -> Dict[str, Any]:
        """Inicia o servidor Frontend (Mission Control) em background."""
        import subprocess
        import os
        try:
            frontend_dir = os.path.abspath(os.path.join(os.getcwd(), "frontend"))
            if not os.path.exists(frontend_dir):
                return {"success": False, "error": f"Diretório não encontrado: {frontend_dir}"}
            
            # Comando para rodar em background no Windows
            # Usa 'start' para abrir em nova janela ou 'cmd /c' para rodar e seguir
            cmd = "npm run dev"
            logger.info(f"Iniciando Frontend em: {frontend_dir}")
            
            # Popen para não bloquear o backend
            subprocess.Popen(
                cmd, 
                shell=True, 
                cwd=frontend_dir,
                creationflags=subprocess.CREATE_NEW_CONSOLE if os.name == 'nt' else 0
            )
            
            return {"success": True, "message": "Comando de inicialização disparado em background."}
        except Exception as e:
            logger.error(f"Erro ao iniciar frontend: {e}")
            return {"success": False, "error": str(e)}

    async def generate_proactive_summary(self) -> Dict[str, Any]:
        """Gera resumo do estado atual do sistema (DADOS REAIS)."""
        import subprocess
        
        # 1. Git Status
        try:
            git_status = subprocess.check_output(["git", "status", "-s"]).decode().strip()
            pending_changes = len(git_status.split('\n')) if git_status else 0
        except:
            pending_changes = "N/A"

        # 2. Frontend Check
        fe_status = await self.check_frontend_status()

        return {
            "system_health": "stable" if fe_status["status"] == "online" else "degraded",
            "tasks": {
                "pending_docs": "Verificar via Qwen", # Placeholder intencional
                "pending_refactors": "Verificar via Aider",
                "git_changes": pending_changes,
                "frontend_status": fe_status["status"]
            },
            "alerts": [] if fe_status["status"] == "online" else [{"cli": "frontend", "error": "Mission Control Offline"}],
            "recommendations": [
                "Commitar alterações pendentes" if pending_changes != "N/A" and pending_changes > 0 else "Sistema atualizado",
                "Iniciar Frontend (npm run dev)" if fe_status["status"] == "offline" else "Monitorar latência"
            ]
        }

    
    
    async def _handle_handoff(self, source_cli: CLIType, result: Dict[str, Any]):
        """
        Gerencia handoff entre CLIs.
        
        Regra: Aider cria código → Qwen documenta
        """
        if source_cli == "aider" and result.get("files_created"):
            # Aider criou arquivos, Qwen deve documentar
            files = result["files_created"]
            self.state["pending_documentation"].extend(files)
            self._save_state()
            
            logger.info(f"Handoff: {len(files)} arquivos pendentes de documentação")
            
            # Disparar Qwen automaticamente (opcional)
            # await self.execute_command(f"documentar {', '.join(files)}", cli="qwen")
    
    async def get_proactive_summary(self) -> Dict[str, Any]:
        """
        Gera um resumo proativo consolidado para relatórios.
        """
        # Carregar tarefas pendentes
        self._load_state()
        
        # Analisar logs de erro recentes
        recent_errors = []
        try:
            with open("cli_audit.log", "r") as f:
                lines = f.readlines()[-20:] # Pegar últimos 20 logs
                for line in lines:
                    entry = json.loads(line)
                    if not entry.get("success"):
                        recent_errors.append({
                            "timestamp": entry["timestamp"],
                            "cli": entry["cli"],
                            "error": entry.get("error", "Erro desconhecido")
                        })
        except FileNotFoundError:
            pass

        # Construir Recomendações (Maestria AI)
        recommendations = []
        if self.state["pending_documentation"]:
            recommendations.append(f"Documentar {len(self.state['pending_documentation'])} arquivos novos.")
        if self.state["pending_refactoring"]:
            recommendations.append(f"Refatorar {len(self.state['pending_refactoring'])} módulos identificados.")
        if not recommendations:
            recommendations.append("Sistema equilibrado. Nenhuma ação urgente necessária.")

        return {
            "timestamp": datetime.now().isoformat(),
            "tasks": {
                "pending_docs": len(self.state["pending_documentation"]),
                "pending_refactors": len(self.state["pending_refactoring"])
            },
            "alerts": recent_errors[:3], # Apenas os 3 erros mais recentes para não poluir
            "recommendations": recommendations,
            "system_health": "stable" if len(recent_errors) < 5 else "degraded"
        }

    def _log_execution(self, cli: CLIType, command: str, result: Dict[str, Any]):
        """Registra execução no log de auditoria."""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "cli": cli,
            "command": command,
            "success": result.get("success", False),
            "duration_seconds": result.get("duration_seconds"),
            "files_changed": result.get("files_changed", []),
            "error": result.get("error")
        }
        
        # Salvar em arquivo de log (append)
        with open("cli_audit.log", "a") as f:
            f.write(json.dumps(log_entry) + "\n")


# Instância global
orchestrator = CLIOrchestrator()
