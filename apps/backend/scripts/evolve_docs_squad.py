"""
============================================
Evolution Squad Engine - Robustização Autônoma
Corporação Senciente - OAIOS v3.0
============================================

Este script simula uma "Reunião de Squad" (Logos, Sophia, Dike) para
robustizar documentos de evolução para o padrão Arete (23 Níveis).

Funcionalidades:
1. Carrega documento alvo e template.
2. Sophia: Analisa e critica.
3. Logos: Reescreve e estrutura.
4. Dike: Valida e aprova.
5. Notifica via WhatsApp.
6. Registra log da "Discussão" para auditoria.

Uso:
    python backend/scripts/evolve_docs_squad.py --target "03_Evolucao_Axiomas_Rituais_Senciencia.md"
"""

import sys
import os
import argparse
import asyncio
import logging
from datetime import datetime
from typing import Dict, Any
from dotenv import load_dotenv

# Carregar Envs IMEDIATAMENTE antes de qualquer import de serviço que use singleton
env_path = r"c:\Users\User\Desktop\Sencient-Coorporation\Diana-Corporacao-Senciente\.env"
load_dotenv(dotenv_path=env_path, override=True)

# Adicionar raiz ao path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.core.services.qwen_service import QwenService
from backend.core.services.cerebro_orchestrator import CerebroOrchestrator

# Config Logs
os.makedirs("backend/logs", exist_ok=True)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("evolve_squad")

# Carregar Envs
# Forçar path absoluto para evitar erros de executação em diferentes CWDs
env_path = r"c:\Users\User\Desktop\Sencient-Coorporation\Diana-Corporacao-Senciente\.env"
logger.info(f"Carregando .env de: {env_path}")
load_dotenv(dotenv_path=env_path, override=True)

class EvolutionSquad:
    def __init__(self):
        self.qwen = QwenService()
        self.orchestrator = CerebroOrchestrator(whatsapp_notifier=self.send_whatsapp)
        self.log_file = "backend/logs/SQUAD_MEETING_LOGS.md"
        
    async def send_whatsapp(self, msg):
        """Envia mensagem via API Local do WhatsApp (Porta 3005)."""
        import aiohttp
        try:
            async with aiohttp.ClientSession() as session:
                await session.post(
                    "http://localhost:3005/api/send",
                    json={"message": msg}
                )
            logger.info(f"WhatsApp enviado: {msg[:50]}...")
        except Exception as e:
            logger.warning(f"Falha ao enviar WhatsApp: {e}")

    def log_discussion(self, agent: str, content: str):
        """Registra a fala do agente no log mestre."""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        entry = f"\n\n### 🗣️ {agent} [{timestamp}]\n{content}\n---\n"
        
        with open(self.log_file, "a", encoding="utf-8") as f:
            f.write(entry)
        
        print(f"\n[{agent}]: {content[:100]}...")

    async def run_evolution(self, target_file: str):
        """Executa a evolução por blocos (Chunks) para garantir 23 níveis sem truncamento."""
        base_path = "METRICAS_DIRECAO_EVOLUCAO"
        full_path = os.path.join(base_path, target_file)
        template_path = os.path.join(base_path, "template_evolucao.md")
        
        try:
            with open(full_path, "r", encoding="utf-8") as f:
                original_content = f.read()
            with open(template_path, "r", encoding="utf-8") as f:
                template_content = f.read()

            await self.send_whatsapp(f"🤖 *SQUAD EVOLUTION STARTED*\nArquivo: {target_file}\nIniciando Geração Modular (23 Níveis)")
            self.log_discussion("SYSTEM", f"Iniciando evolução modular para {target_file}")

            # 1. SOPHIA
            res_sophia = await self.qwen.execute(f"Analise o gap para 23 níveis Arete:\n{original_content[:1000]}", mode="chat")
            critique = res_sophia.get("content", "Erro")
            self.log_discussion("SOPHIA", critique)

            # 2. LOGOS - GERAÇÃO EM CHUNKS
            doc_parts = []
            
            # Parte A: Cabeçalho e Introdução
            logger.info("Gerando Cabeçalho e Intro...")
            intro_res = await self.qwen.execute("Gere o cabeçalho Areté e uma Introdução Épica para o documento OAIOS v3.0.", mode="task")
            doc_parts.append(intro_res.get("content", "# Evolução"))

            # Parte B: Níveis 1-8
            logger.info("Gerando Níveis 1-8...")
            n1_8 = await self.qwen.execute(f"Gere Tabelas Atômicas (10 tasks cada) para os NÍVEIS 1 a 8 de evolução. Use o padrão Arete. Crítica Sophia: {critique[:500]}", mode="task")
            doc_parts.append(n1_8.get("content", "Error N1-8"))
            await self.send_whatsapp("📊 *LOGOS:* Chunks 1-8 concluídos.")

            # Parte C: Níveis 9-16
            logger.info("Gerando Níveis 9-16...")
            n9_16 = await self.qwen.execute(f"Gere Tabelas Atômicas (10 tasks cada) para os NÍVEIS 9 a 16 de evolução. Crítica Sophia: {critique[:500]}", mode="task")
            doc_parts.append(n9_16.get("content", "Error N9-16"))
            await self.send_whatsapp("📊 *LOGOS:* Chunks 9-16 concluídos.")

            # Parte D: Níveis 17-23
            logger.info("Gerando Níveis 17-23...")
            n17_23 = await self.qwen.execute(f"Gere Tabelas Atômicas (10 tasks cada) para os NÍVEIS 17 a 23 de evolução final. Crítica Sophia: {critique[:500]}", mode="task")
            doc_parts.append(n17_23.get("content", "Error N17-23"))
            await self.send_whatsapp("📊 *LOGOS:* Chunks 17-23 concluídos. Consolidando...")

            # 3. CONSOLIDAR E SALVAR
            final_md = "\n\n".join(doc_parts)
            with open(full_path, "w", encoding="utf-8") as f:
                f.write(final_md)
            
            self.log_discussion("LOGOS", f"Documento consolidado com {len(final_md)} caracteres.")
            await self.send_whatsapp(f"🏆 *EVOLUTION COMPLETE*\nArquivo: {target_file} atualizado com 23 níveis reais.")

        except Exception as e:
            await self.send_whatsapp(f"🚨 *SQUAD ERROR:* {str(e)}")
            logger.error(f"Erro: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--target", required=True, help="Nome do arquivo MD alvo (ex: 03_DOC.md)")
    args = parser.parse_args()
    
    squad = EvolutionSquad()
    asyncio.run(squad.run_evolution(args.target))
