import asyncio
import uuid
import os
import shutil
import logging
import subprocess
import random
import time
from typing import List, Dict, Any, Optional
from datetime import datetime
from dotenv import load_dotenv

# Carregar Envs
env_path = r"c:\Users\User\Desktop\Sencient-Coorporation\Diana-Corporacao-Senciente\.env"
load_dotenv(dotenv_path=env_path, override=True)

# Adicionar raiz ao path
import sys
sys.path.append(os.getcwd())

from backend.scripts.review_task_squad import ReviewSquad
from backend.core.services.aider_service import AiderService

# Configuração de Logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("matrix")

class MatrixOrchestrator:
    """
    Orquestrador de Concorrência Cognitiva (Matrix).
    Instancia múltiplos Squads isolados em workspaces efêmeros.
    """
    def __init__(self, base_project_path: str, whatsapp_notifier=None):
        self.base_path = os.path.abspath(base_project_path)
        self.matrix_dir = os.path.join(self.base_path, ".matrix_workspaces")
        self.logs_dir = os.path.join(self.base_path, "backend", "logs", "matrix")
        os.makedirs(self.matrix_dir, exist_ok=True)
        os.makedirs(self.logs_dir, exist_ok=True)
        os.makedirs(self.matrix_dir, exist_ok=True)
        os.makedirs(self.logs_dir, exist_ok=True)
        self.whatsapp_notifier = whatsapp_notifier
        # Import retardado para evitar circularidade se houver
        from backend.scripts.review_task_squad import ReviewSquad
        self.review_squad = ReviewSquad(whatsapp_notifier=whatsapp_notifier)

    async def _notify(self, msg: str):
        if self.whatsapp_notifier:
            await self.whatsapp_notifier(msg)
        else:
            import aiohttp
            try:
                async with aiohttp.ClientSession() as session:
                    await session.post("http://localhost:3005/api/send", json={"message": msg})
            except:
                pass

    async def spawn_worker(self, worker_id: str, task_description: str, target_files: List[str]) -> Dict[str, Any]:
        """
        Executa uma tarefa em um workspace isolado com revisão automática.
        """
        workspace_path = os.path.join(self.matrix_dir, f"worker_{worker_id}")
        worker_log_file = os.path.join(self.logs_dir, f"worker_{worker_id}.log")
        start_time = datetime.now()
        
        try:
            # Jitter inicial para evitar conflitos de arquivo/disco no Windows
            await asyncio.sleep(random.uniform(0.5, 3.0))
            
            logger.info(f"🧬 [MATRIX] Instanciando DNA em {worker_id}...")
            
            # 1. LIMPEZA RESILIENTE
            for attempt in range(3):
                try:
                    if os.path.exists(workspace_path):
                        # rmdir /s /q é mais rápido e agressivo no Windows
                        subprocess.run(f'rmdir /s /q "{workspace_path}"', shell=True, check=False)
                        time.sleep(1) # Gap para o OS liberar handles
                    break
                except Exception as e:
                    if attempt == 2: raise e
                    await asyncio.sleep(2)

            os.makedirs(workspace_path, exist_ok=True)
            
            # 2. DNA CLONE (Robocopy robusto)
            exclude_dirs = ".git .matrix_workspaces venv* node_modules .antigravity .byterover"
            robocopy_cmd = f'robocopy "{self.base_path}" "{workspace_path}" /S /E /XD {exclude_dirs} /R:1 /W:1 /MT:32 /NFL /NDL /NJH /NJS'
            subprocess.run(robocopy_cmd, shell=True, check=False)

            # 3. EXECUÇÃO MAESTRO (Aider)
            from backend.core.services.aider_service import AiderService
            aider = AiderService()
            
            # Salvar diretório original para retorno
            original_cwd = os.getcwd()
            os.chdir(workspace_path)
            
            try:
                # Loop de Insistência (Areté persistence)
                max_retries = 3
                attempt_count = 0
                all_changed_files = set()
                current_task = task_description

                while attempt_count < max_retries:
                    attempt_count += 1
                    logger.info(f"🚀 [MATRIX] {worker_id}: Tentativa {attempt_count} de execução/revisão...")
                    
                    result = await aider.execute(current_task, files=target_files, mode="task", chain_type="execution")
                    
                    if not result.get("success") and not result.get("files_modified") and not result.get("files_created"):
                        logger.error(f"❌ [MATRIX] {worker_id}: Falha total na execução do Aider.")
                        break

                    # Detecção Nativa de Mudanças (Backup do Parser)
                    current_mods = set(result.get("files_modified", []) + result.get("files_created", []))
                    if not current_mods:
                        logger.info(f"🔍 [MATRIX] {worker_id}: Aider não reportou arquivos. Escaneando workspace...")
                        for target in target_files:
                            # Se o arquivo existe e o Aider terminou com sucesso, assumimos que ele PODE ter mudado
                            # Em um cenário ideal, checaríamos hash. Aqui vamos confiar no target_files.
                            if os.path.exists(os.path.join(workspace_path, target)):
                                current_mods.add(target)
                    
                    all_changed_files.update(current_mods)
                    
                    output = result.get("output", "")
                    review_res = await self.review_squad.review_task(worker_id, task_description, output, files=list(current_mods))
                    
                    if review_res.get("success"):
                        logger.info(f"✅ [MATRIX] {worker_id}: APROVADO pela Dike na tentativa {attempt_count}!")
                        break
                    else:
                        logger.warning(f"⚠️ [MATRIX] {worker_id}: REPROVADO (Tentativa {attempt_count}). Sophia gerando blueprint...")
                        current_task = f"{task_description}\n\n⚠️ CORREÇÃO SOPHIA (FOLLOW RIGIDLY):\n{review_res.get('refactor_content')}"
                        # Se for a última tentativa e falhar, ainda sincroniza o que foi feito? 
                        # O ideal é parar por aqui e deixar o último estado.
            finally:
                os.chdir(original_cwd)

            # 4. LIMPEZA E ROTAÇÃO DE LOGS (Prevenção de I/O contention)
            self._rotate_logs()

            # 5. SINCRONIZAÇÃO ATÔMICA (Código + Logs)
            if result.get("success") or all_changed_files:
                logger.info(f"✨ [MATRIX] {worker_id} Sincronizando resultados...")
                for file_path in all_changed_files:
                    src = os.path.join(workspace_path, file_path)
                    dst = os.path.join(self.base_path, file_path)
                    if os.path.exists(src):
                        os.makedirs(os.path.dirname(dst), exist_ok=True)
                        shutil.copy2(src, dst)
                
                # Sincronizar Logs de Revisão
                src_log = os.path.join(workspace_path, "backend", "logs", "REVIEW_SQUAD_LOGS.md")
                dst_log = os.path.join(self.base_path, "backend", "logs", "REVIEW_SQUAD_LOGS.md")
                if os.path.exists(src_log):
                    self._rotate_logs(dst_log) # Garante que o destino não está gigante
                    with open(src_log, "r", encoding="utf-8") as f_src:
                        content = f_src.read()
                    with open(dst_log, "a", encoding="utf-8") as f_dst:
                        f_dst.write(f"\n\n--- WORKER {worker_id} SYNC ---\n{content}")

                await self._notify(f"🌌 *[MATRIX]* Braço {worker_id} cumpriu a missão paralelo!")
                return {"worker_id": worker_id, "success": True, "files": result.get("files_modified", [])}
            
            return {"worker_id": worker_id, "success": False, "error": result.get("error", "Falha na execução ou revisão")}

        except Exception as e:
            logger.error(f"💥 [MATRIX] Erro fatal no worker {worker_id}: {e}")
            return {"worker_id": worker_id, "success": False, "error": str(e)}
        finally:
            # Limpeza final Opcional
            pass

    async def run_parallel(self, task_bundles: List[Dict[str, Any]]):
        """
        Dispara múltiplos workers em paralelo.
        task_bundles: list of {'id': str, 'task': str, 'files': list}
        """
        await self._notify(f"🌌 *[MATRIX]* Disparando concorrência cognitiva: {len(task_bundles)} instâncias.")
        
    def _rotate_logs(self, log_path: Optional[str] = None):
        """Sistema de limpeza de logs para evitar arquivos gigantes."""
        target = log_path or os.path.join(self.base_path, "backend", "logs", "REVIEW_SQUAD_LOGS.md")
        if os.path.exists(target) and os.path.getsize(target) > 10 * 1024 * 1024: # 10MB limit
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            archive_path = target.replace(".md", f"_ARCHIVE_{timestamp}.md")
            try:
                shutil.move(target, archive_path)
                logger.info(f"📁 [MATRIX] Log rotacionado: {target} -> {archive_path}")
            except Exception as e:
                logger.error(f"⚠️ Erro ao rotacionar log: {e}")

    async def run_parallel(self, task_bundles: List[Dict[str, Any]]):
        """
        Dispara múltiplos workers em paralelo total.
        """
        await self._notify(f"🌌 *[MATRIX]* Disparando concorrência cognitiva TOTAL: {len(task_bundles)} instâncias.")
        
        workers = [
            self.spawn_worker(b['id'], b['task'], b['files']) 
            for b in task_bundles
        ]
        
        results = await asyncio.gather(*workers)
        
        success_count = sum(1 for r in results if r['success'])
        await self._notify(f"📊 *[MATRIX]* Sincronização final completa: {success_count}/{len(task_bundles)} braços integrados.")
        return results

if __name__ == "__main__":
    # Exemplo de uso
    async def test():
        matrix = MatrixOrchestrator(".")
        bundles = [
            {"id": "DOC-04", "task": "Evolua o documento para o padrão Areté", "files": ["METRICAS_DIRECAO_EVOLUCAO/04_Evolucao_Sonhador_Senciencia.md"]},
            {"id": "DOC-05", "task": "Evolua o documento para o padrão Areté", "files": ["METRICAS_DIRECAO_EVOLUCAO/05_Evolucao_Cerebro_Senciencia.md"]}
        ]
        await matrix.run_parallel(bundles)
    
    asyncio.run(test())
