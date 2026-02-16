import unittest
from unittest.mock import MagicMock, AsyncMock, patch
import logging
import asyncio
from datetime import datetime

# Ajustar path se necessário (assumindo execução da raiz)
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.core.services.cerebro_orchestrator import CerebroOrchestrator, OrchestratorState
from backend.core.services.task_queue import Task, TaskStatus

# Desativar logs durante testes
logging.getLogger("backend.core.services.cerebro_orchestrator").setLevel(logging.CRITICAL)

class TestCerebroRetryLogic(unittest.TestCase):
    
    def setUp(self):
        self.orchestrator = CerebroOrchestrator()
        self.orchestrator.task_queue = MagicMock()
        self.orchestrator.task_queue.update_status = AsyncMock()
        self.orchestrator.aider = MagicMock()
        self.orchestrator.qwen = MagicMock()
        self.orchestrator._notify = AsyncMock()
        
        # Mocking execute_task to avoid calling real services
        # self.orchestrator.execute_task = AsyncMock() 

    @patch('backend.core.services.cerebro_orchestrator.CerebroOrchestrator.execute_task')
    def test_retry_logic_success_on_first_try(self, mock_execute):
        """Testa sucesso na primeira tentativa"""
        
        # Configurar mock para retornar sucesso
        mock_execute.return_value = {
            "success": True, 
            "agent": "dev", 
            "duration_seconds": 1.0
        }
        
        task = Task(id="TASK-TEST-01", description="Test Task")
        self.orchestrator.max_retries = 3
        
        # Executar loop de retry (isolado)
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(self.orchestrator.process_task(task))
        
        self.assertTrue(result)
        # Deve ter chamado update_status para IN_PROGRESS (1 vez) e COMPLETED (1 vez)
        self.orchestrator.task_queue.update_status.assert_any_call(
            "TASK-TEST-01", TaskStatus.IN_PROGRESS, unittest.mock.ANY
        )
        self.orchestrator.task_queue.update_status.assert_any_call(
            "TASK-TEST-01", TaskStatus.COMPLETED, unittest.mock.ANY
        )
        self.assertEqual(mock_execute.call_count, 1)

    @patch('backend.core.services.cerebro_orchestrator.CerebroOrchestrator.execute_task')
    def test_retry_logic_failure_recovery(self, mock_execute):
        """Testa falha na primeira tentativa e sucesso na segunda"""
        
        # Configurar mock: Falha, depois Sucesso
        mock_execute.side_effect = [
            {"success": False, "error": "Simulated Timeout"},
            {"success": True, "agent": "dev", "duration_seconds": 1.0}
        ]
        
        task = Task(id="TASK-TEST-02", description="Test Retry")
        self.orchestrator.max_retries = 3
        self.orchestrator.retry_delay_seconds = 0.1 # Rápido para teste
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(self.orchestrator.process_task(task))
        
        self.assertTrue(result)
        self.assertEqual(mock_execute.call_count, 2)
        # Verifica se notificou sucesso no final
        self.orchestrator._notify.assert_called()

    @patch('backend.core.services.cerebro_orchestrator.CerebroOrchestrator.execute_task')
    def test_retry_logic_exhaustion(self, mock_execute):
        """Testa esgotamento de tentativas"""
        
        # Configurar mock: Sempre falha
        mock_execute.return_value = {"success": False, "error": "Persistent Error"}
        
        task = Task(id="TASK-TEST-03", description="Test Fail")
        self.orchestrator.max_retries = 3
        self.orchestrator.retry_delay_seconds = 0.01
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        # O método deve fazer o update final para FAILED, mas o retorno booleano dele é void? 
        # Não, ele não tem return explícito de False no código original se falhar tudo, 
        # mas eu adicionei o update FAILED.
        
        awaitable = self.orchestrator.process_task(task)
        result = loop.run_until_complete(awaitable)
        
        # Verifica se chamou 3 vezes (max_retries)
        self.assertEqual(mock_execute.call_count, 3)
        
        # Verifica update final para FAILED
        self.orchestrator.task_queue.update_status.assert_called_with(
            "TASK-TEST-03", TaskStatus.FAILED, unittest.mock.ANY
        )

if __name__ == '__main__':
    unittest.main()
