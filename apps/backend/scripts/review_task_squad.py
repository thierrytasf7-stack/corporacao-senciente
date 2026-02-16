"""
============================================
Review Task Squad - Controle de Qualidade
Corporação Senciente - OAIOS v3.0
============================================

Este script simula uma "Reunião de Revisão" (Dike, Sophia) para
validar se o resultado de uma task atende ao padrão Areté.

Personas:
1. Dike: Valida se o plano e os padrões técnicos foram seguidos.
2. Sophia: Se reprovado, gera guia de refatoração técnico.
"""

import os
import sys
import logging
import asyncio
from typing import Dict, Any, Optional
from datetime import datetime
from dotenv import load_dotenv

# Carregar Envs
env_path = r"c:\Users\User\Desktop\Sencient-Coorporation\Diana-Corporacao-Senciente\.env"
load_dotenv(dotenv_path=env_path, override=True)

# Adicionar raiz ao path
sys.path.append(os.getcwd())

from backend.core.services.aider_service import AiderService

logger = logging.getLogger("review_squad")

class ReviewSquad:
    def __init__(self, whatsapp_notifier=None):
        self.aider = AiderService()
        self.whatsapp_notifier = whatsapp_notifier
        self.log_file = "backend/logs/REVIEW_SQUAD_LOGS.md"
        os.makedirs("backend/logs", exist_ok=True)

    async def _notify(self, msg: str):
        if self.whatsapp_notifier:
            await self.whatsapp_notifier(msg)
        else:
            # Fallback direto se não fornecido
            import aiohttp
            try:
                async with aiohttp.ClientSession() as session:
                    await session.post("http://localhost:3005/api/send", json={"message": msg})
            except:
                pass

    def log_review(self, agent: str, content: str):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        entry = f"\n\n### 🛡️ {agent} [{timestamp}]\n{content}\n---\n"
        with open(self.log_file, "a", encoding="utf-8") as f:
            f.write(entry)

    async def review_task(self, task_id: str, description: str, output: str, files: Optional[list] = None) -> Dict[str, Any]:
        """
        Avalia o resultado de uma task, lendo o conteúdo dos arquivos se fornecidos.
        """
        await self._notify(f"🔍 *[SQUAD REVISÃO]* Iniciando análise da task: {task_id}")
        
        # Coletar conteúdo dos arquivos para a Dike
        code_content = ""
        if files:
            for file_path in files:
                if os.path.exists(file_path):
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            content = f.read()
                            code_content += f"\nFILE: {file_path}\n---\n{content}\n---\n"
                    except Exception as e:
                        logger.error(f"Erro ao ler arquivo {file_path} para revisão: {e}")

        # 1. DIKE - Validação de Padrão
        dike_prompt = f"""
        ATUE COMO DIKE, A DEUSA DA JUSTIÇA E PADRÕES ARETÉ. Sua missão é garantir EXCELÊNCIA TÉCNICA.
        
        TASK ORIGINAL: {description}
        
        ARQUIVOS MODIFICADOS/CRIADOS:
        {code_content if code_content else "Nenhum arquivo fornecido para análise direta."}
        
        LOG DA CLI:
        ---
        {output[:2000]} # Limitando log para não estourar contexto
        ---
        
        CRITÉRIOS ARETÉ:
        1. O código segue padrões C4 Atómico (Responsabilidade Única)?
        2. Há tipagem estrita (Type Hints no Python ou Tipos no TS)?
        3. NOMES DE VARIÁVEIS devem ser semânticos. Evite a, b, c.
        4. O resultado resolve EXATAMENTE o que foi pedido?
        
        Responda EXCLUSIVAMENTE em formato JSON:
        {{
            "aprovado": true/false,
            "motivo": "resumo conciso do veredito",
            "falhas": ["lista detalhada de falhas se houver"]
        }}
        """
        
        logger.info(f"Dike revisando task {task_id} com acesso aos arquivos...")
        res_dike = await self.aider.execute(dike_prompt, mode="chat", chain_type="planning")
        
        import json
        try:
            content = res_dike.get("content", "{}")
            # Limpeza de markdown se necessário
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
                
            json_str = content[content.find('{'):content.rfind('}')+1]
            evaluation = json.loads(json_str)
        except Exception as e:
            logger.error(f"Erro ao parsear avaliação da Dike: {e}. Content: {res_dike.get('content')}")
            evaluation = {"aprovado": False, "motivo": "Erro no processamento da revisão.", "falhas": [str(e)]}

        self.log_review("DIKE", f"Resultado: {'APROVADO' if evaluation['aprovado'] else 'REPROVADO'}\nMotivo: {evaluation['motivo']}\nFalhas: {evaluation.get('falhas')}")

        if evaluation["aprovado"]:
            await self._notify(f"✅ *[DIKE]* Task {task_id} APROVADA!")
            return {"success": True, "evaluation": evaluation}
        
        # 2. SOPHIA - Guia de Refatoração (Se reprovado)
        await self._notify(f"❌ *[DIKE]* Task {task_id} REPROVADA: {evaluation['motivo']}")
        
        sophia_prompt = f"""
        ATUE COMO SOPHIA, A ANALISTA SÁBIA.
        A task {task_id} foi REPROVADA pela Dike.
        
        TASK: {description}
        ERROS: {evaluation['motivo']}
        FALHAS: {", ".join(evaluation.get('falhas', []))}
        
        GERE UM GUIA DE ARQUITETURA (BLUEPRINT) PARA O MAESTRO CORRIGIR ESTA TASK.
        Seja específica: 'Renomeie a variável x para total_items', 'Adicione Type Hints :int'.
        Responda como um Blueprint Técnico.
        """
        
        logger.info(f"Sophia gerando guia de refatoração para {task_id}...")
        res_sophia = await self.aider.execute(sophia_prompt, mode="chat", chain_type="planning")
        refactor_guide = res_sophia.get("content", "Falha ao gerar guia.")
        
        self.log_review("SOPHIA", refactor_guide)
        
        return {
            "success": False,
            "evaluation": evaluation,
            "refactor_content": refactor_guide
        }

if __name__ == "__main__":
    # Teste rápido se rodado direto
    async def test():
        squad = ReviewSquad()
        await squad.review_task("TEST-001", "Criar função soma", "def soma(a,b): return a+b")
    
    asyncio.run(test())
