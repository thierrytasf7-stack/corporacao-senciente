"""
CerebroOrchestrator - Orquestrador Central OAIOS v3.0

Sistema de orquestração inteligente que:
1. Processa a fila de tarefas continuamente
2. Seleciona automaticamente o agente adequado
3. Executa tarefas via CLI (Aider/Qwen)
4. Implementa recovery e retry automático
5. Notifica via WhatsApp ao concluir

Baseado no master-orchestrator.js do aios-core.
"""

import asyncio
import os
import json
import logging
from datetime import datetime
from typing import Optional, Dict, Any, List
from enum import Enum
from pathlib import Path

from backend.core.services.metrics_service import get_metrics_service
from backend.core.services.task_queue import (
    get_task_queue,
    Task,
    TaskStatus,
    TaskPriority
)
from backend.core.services.aider_service import AiderService
from backend.core.services.qwen_service import QwenService

# Import do Squad de Revisão
try:
    from backend.scripts.review_task_squad import ReviewSquad
except ImportError:
    ReviewSquad = None

logger = logging.getLogger(__name__)


class AgentType(str, Enum):
    """Tipos de agentes disponíveis."""
    DEV = "dev"
    ARCHITECT = "architect"
    QA = "qa"
    PM = "pm"
    DEVOPS = "devops"
    ANALYST = "analyst"
    DATA_ENGINEER = "data-engineer"
    UX = "ux-design-expert"


# Mapeamento de palavras-chave para agentes
AGENT_KEYWORDS = {
    AgentType.DEV: ["implementar", "código", "bug", "fix", "feature", "função", "api", "backend", "frontend"],
    AgentType.ARCHITECT: ["arquitetura", "design", "estrutura", "sistema", "integração", "padrão"],
    AgentType.QA: ["teste", "validar", "qualidade", "bug", "erro", "verificar"],
    AgentType.PM: ["planejar", "roadmap", "prioridade", "requisito", "story", "sprint"],
    AgentType.DEVOPS: ["deploy", "ci/cd", "docker", "kubernetes", "infra", "pipeline"],
    AgentType.ANALYST: ["análise", "pesquisa", "dados", "relatório", "métricas"],
    AgentType.DATA_ENGINEER: ["etl", "dados", "pipeline", "banco", "sql", "migração"],
    AgentType.UX: ["interface", "ui", "ux", "design", "usabilidade", "layout"]
}

# Squads pré-configurados
SQUADS = {
    "devops-core": {
        "name": "DevOps Core",
        "agents": [AgentType.ARCHITECT, AgentType.DEVOPS, AgentType.QA],
        "mission": "Infraestrutura e CI/CD"
    },
    "frontend-elite": {
        "name": "Frontend Elite",
        "agents": [AgentType.DEV, AgentType.UX],
        "mission": "UI/UX Premium"
    },
    "ai-research": {
        "name": "AI Research",
        "agents": [AgentType.ARCHITECT, AgentType.DEV, AgentType.ANALYST],
        "mission": "Evolução Autônoma"
    },
    "growth-hacking": {
        "name": "Growth Hacking",
        "agents": [AgentType.ANALYST, AgentType.PM],
        "mission": "Aquisição e Retenção"
    }
}


class OrchestratorState(str, Enum):
    """Estados do orquestrador."""
    IDLE = "idle"
    PROCESSING = "processing"
    PAUSED = "paused"
    ERROR = "error"


class CerebroOrchestrator:
    """
    Orquestrador Central da Corporação Senciente.
    
    Processa tarefas da fila automaticamente, selecionando
    o agente mais adequado e executando via CLI.
    """
    
    def __init__(self, whatsapp_notifier=None):
        """
        Inicializa o CerebroOrchestrator.
        
        Args:
            whatsapp_notifier: Função opcional para enviar notificações WhatsApp
        """
        self.task_queue = get_task_queue()
        self.aider = AiderService()
        self.qwen = QwenService()
        
        # Inicializar Squad de Revisão
        self.whatsapp_notifier = whatsapp_notifier
        if ReviewSquad:
            self.review_squad = ReviewSquad(whatsapp_notifier=self.whatsapp_notifier)
        else:
            self.review_squad = None
            
        self.state = OrchestratorState.IDLE
        self.running = False
        self.current_task: Optional[Task] = None
        self.stats = {
            "tasks_processed": 0,
            "tasks_completed": 0,
            "tasks_failed": 0,
            "total_runtime_seconds": 0,
            "started_at": None
        }
        
        # Configurações
        self.max_retries = 3
        self.retry_delay_seconds = 30
        self.poll_interval_seconds = 10
        
        self.metrics = get_metrics_service()
        logger.info("CerebroOrchestrator inicializado com MetricsService")
    
    def select_agent(self, task: Task) -> AgentType:
        """
        Seleciona automaticamente o agente mais adequado para a tarefa.
        
        Args:
            task: Tarefa a ser processada
        
        Returns:
            AgentType do agente selecionado
        """
        description = task.description.lower()
        
        # Se já tem agente definido, usar ele
        if task.agent_id:
            try:
                return AgentType(task.agent_id)
            except ValueError:
                pass
        
        # Pontuação por keywords
        scores = {agent: 0 for agent in AgentType}
        
        for agent, keywords in AGENT_KEYWORDS.items():
            for keyword in keywords:
                if keyword in description:
                    scores[agent] += 1
        
        # Retornar agente com maior score, ou DEV como padrão
        best_agent = max(scores, key=scores.get)
        if scores[best_agent] == 0:
            best_agent = AgentType.DEV
        
        logger.info(f"Agente selecionado para task {task.id}: {best_agent.value}")
        return best_agent
    
    async def execute_task(self, task: Task) -> Dict[str, Any]:
        """
        Executa uma tarefa usando o Maestro (Aider) com roteamento de modelos especializado.
        """
        agent = self.select_agent(task)
        prompt = self._build_prompt(task, agent)
        
        # Auditoria de início de execução
        logger.info(f"Iniciando execução da task {task.id} via Agente {agent.value}")
        
        # Determinar Cadeia de Modelos (User Request)
        # Planejamento: Architect, PM, Analyst, UX
        # Execução: Dev, DevOps, QA, Data Engineer
        if agent in [AgentType.ARCHITECT, AgentType.PM, AgentType.ANALYST, AgentType.UX]:
            chain_type = "planning"
        else:
            chain_type = "execution"
            
        logger.info(f"Roteando para Aider [Cadeia: {chain_type.upper()}]")
        
        # Execução exclusiva via Aider (O Maestro)
        result = await self.aider.execute(prompt, mode="task", chain_type=chain_type)
        
        return {
            "task_id": task.id,
            "agent": agent.value,
            "success": result.get("success", False),
            "output": result.get("output", result.get("content", "")),
            "error": result.get("error"),
            "duration_seconds": result.get("duration_seconds", 0),
            "model_used": result.get("model", "unknown")
        }
    
    def _build_prompt(self, task: Task, agent: AgentType) -> str:
        """Constrói o prompt para o agente."""
        agent_persona = {
            AgentType.DEV: "Você é Dex, um desenvolvedor Full Stack expert.",
            AgentType.ARCHITECT: "Você é um arquiteto de sistemas sênior.",
            AgentType.QA: "Você é Quinn, especialista em Quality Assurance.",
            AgentType.PM: "Você é um Product Manager experiente.",
            AgentType.DEVOPS: "Você é Gage, especialista DevOps.",
            AgentType.ANALYST: "Você é um analista de negócios sênior.",
            AgentType.DATA_ENGINEER: "Você é um engenheiro de dados expert.",
            AgentType.UX: "Você é um especialista em UX/UI Design."
        }
        
        return f"""
{agent_persona.get(agent, "Você é um especialista.")}

## Tarefa: {task.id}
**Prioridade:** {task.priority}
**Descrição:** {task.description}

Execute esta tarefa com excelência. Seja conciso e eficiente.
"""
    
    async def process_task(self, task: Task) -> bool:
        """
        Processa uma tarefa com retry automático e REVISÃO SQUAD.
        
        Returns:
            True se completou com sucesso, False caso contrário
        """
        self.current_task = task
        last_error = None
        
        # Buffer de instruções adicionais (Sophia)
        extra_instructions = ""
        
        for attempt in range(1, self.max_retries + 1):
            try:
                msg_attempt = f"Processando {task.id} (tentativa {attempt}/{self.max_retries})"
                logger.info(msg_attempt)
                
                # Marcar como em progresso
                await self.task_queue.update_status(
                    task.id, 
                    TaskStatus.IN_PROGRESS,
                    {"attempt": attempt, "started_at": datetime.now().isoformat()}
                )
                
                # Executar (Com instruções extras se houver)
                prompt = self._build_prompt(task, self.select_agent(task))
                if extra_instructions:
                    prompt = f"{prompt}\n\n⚠️ INSTRUÇÕES DE CORREÇÃO (SOPHIA):\n{extra_instructions}"
                
                result = await self.execute_task(task)
                
                if result.get("success"):
                    output = result.get("output", "")
                    
                    # --- FASE DE REVISÃO ARETÉ ---
                    if self.review_squad:
                        # Coletar arquivos modificados e criados para revisão
                        all_hit_files = result.get("files_modified", []) + result.get("files_created", [])
                        review_res = await self.review_squad.review_task(task.id, task.description, output, files=all_hit_files)
                        
                        if review_res.get("success"):
                            # APROVADO!
                            self.stats["tasks_completed"] += 1
                            logger.info(f"✅ Task {task.id} APROVADA pelo ReviewSquad!")
                            
                            self.metrics.record_execution(
                                cli=result.get("cli", "unknown"),
                                duration=result.get("duration_seconds", 0),
                                success=True
                            )
                            
                            await self._notify(f"🏆 Task {task.id} CONCLUÍDA E APROVADA!")
                            return True
                        else:
                            # REPROVADO! Sophia gera novo guia.
                            logger.warning(f"❌ Task {task.id} REPROVADA. Iniciando refatoração.")
                            extra_instructions = review_res.get("refactor_content", "Corrija os erros apontados pela Dike.")
                            
                            if attempt < self.max_retries:
                                logger.info(f"Reiniciando loop para task {task.id} com novo guia.")
                                continue # Próximo attempt usará extra_instructions
                    else:
                        # Sem squad de revisão, aceitar o primeiro sucesso
                        return True
                else:
                    # Falha na execução CLI
                    last_error = result.get('error')
                    logger.warning(f"Task {task.id} falhou na CLI: {last_error}")
                    
                    if attempt < self.max_retries:
                        await asyncio.sleep(self.retry_delay_seconds)
                    
            except Exception as e:
                last_error = str(e)
                logger.error(f"Erro ao processar task {task.id}: {e}")
                
                if attempt < self.max_retries:
                    await asyncio.sleep(self.retry_delay_seconds)
        
        # Esgotou tentativas
        await self.task_queue.update_status(
            task.id,
            TaskStatus.FAILED,
            {"failed_at": datetime.now().isoformat(), "last_error": str(last_error)}
        )
        
        self.stats["tasks_failed"] += 1
        logger.error(f"❌ Task {task.id} falhou após {self.max_retries} tentativas")
        
        # Notificar WhatsApp
        await self._notify(f"❌ Task {task.id} falhou após {self.max_retries} tentativas")
        
        return False
    
    async def _notify(self, message: str):
        """Envia notificação via WhatsApp se configurado."""
        if self.whatsapp_notifier:
            try:
                await self.whatsapp_notifier(message)
            except Exception as e:
                logger.warning(f"Erro ao notificar WhatsApp: {e}")
    
    async def run_loop(self):
        """
        Loop principal de processamento 24/7.
        
        Executa continuamente, buscando tarefas pendentes
        e processando-as na ordem de prioridade.
        """
        self.running = True
        self.state = OrchestratorState.PROCESSING
        self.stats["started_at"] = datetime.now().isoformat()
        
        logger.info("🚀 CerebroOrchestrator iniciando loop 24/7...")
        await self._notify("🚀 Cérebro Orquestrador ONLINE! Processando tarefas 24/7...")
        
        while self.running:
            try:
                # Buscar próxima tarefa
                task = await self.task_queue.get_next()
                
                if task:
                    self.stats["tasks_processed"] += 1
                    await self.process_task(task)
                else:
                    # Sem tarefas, aguardar
                    self.state = OrchestratorState.IDLE
                    await asyncio.sleep(self.poll_interval_seconds)
                    
            except Exception as e:
                logger.error(f"Erro no loop do orquestrador: {e}")
                self.state = OrchestratorState.ERROR
                await asyncio.sleep(self.poll_interval_seconds)
        
        logger.info("CerebroOrchestrator loop encerrado")
    
    def stop(self):
        """Para o loop de processamento."""
        self.running = False
        self.state = OrchestratorState.PAUSED
        logger.info("CerebroOrchestrator parando...")
    
    def get_status(self) -> Dict[str, Any]:
        """Retorna status atual do orquestrador."""
        return {
            "state": self.state.value,
            "running": self.running,
            "current_task": self.current_task.to_dict() if self.current_task else None,
            "stats": self.stats,
            "queue_stats": self.task_queue.get_stats()
        }


# Singleton global
_orchestrator: Optional[CerebroOrchestrator] = None


def get_orchestrator() -> CerebroOrchestrator:
    """Obtém a instância singleton do CerebroOrchestrator."""
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = CerebroOrchestrator()
    return _orchestrator


async def start_orchestrator_background():
    """Inicia o orquestrador em background."""
    orchestrator = get_orchestrator()
    asyncio.create_task(orchestrator.run_loop())
    return orchestrator
