"""
Hallucination Monitor Service
Monitora e registra alucinações em tempo real
"""

import json
import functools
from datetime import datetime
from typing import Any, Optional, Dict, List, Callable
from backend.infrastructure.database.hallucination_logs import (
    HallucinationLog,
    HallucinationErrorType,
    HallucinationSeverity,
    HallucinationRepository
)


class HallucinationMonitor:
    """Monitor de alucinações em tempo real"""

    def __init__(self, db_connection):
        """Inicializar monitor"""
        self.db = db_connection
        self.repository = HallucinationRepository(db_connection)
        self.confidence_threshold = 0.7
        self.alert_callbacks = []

    def register_alert_callback(self, callback: Callable):
        """Registrar callback para alertas"""
        self.alert_callbacks.append(callback)

    async def _trigger_alerts(self, log: HallucinationLog):
        """Disparar alertas se necessário"""
        # Alerta se confiança baixa
        if log.confidence_score < self.confidence_threshold:
            alert_msg = f"🚨 LOW CONFIDENCE ALERT: {log.agent_name} - Score: {log.confidence_score:.2%}"
            print(alert_msg)
            for callback in self.alert_callbacks:
                try:
                    await callback(alert_msg, log)
                except Exception as e:
                    print(f"❌ Error in alert callback: {e}")

        # Alerta se severidade alta
        if log.severity <= 2:  # CRITICAL ou HIGH
            alert_msg = f"⚠️  HIGH SEVERITY HALLUCINATION: {log.error_type} - {log.agent_name}"
            print(alert_msg)
            for callback in self.alert_callbacks:
                try:
                    await callback(alert_msg, log)
                except Exception as e:
                    print(f"❌ Error in alert callback: {e}")

    async def log_hallucination(
        self,
        worker_id: str,
        task_id: str,
        agent_name: str,
        output: str,
        error_type: HallucinationErrorType,
        severity: HallucinationSeverity,
        confidence_score: float,
        tags: Optional[List[str]] = None,
        expected_output: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> HallucinationLog:
        """
        Registrar uma alucinação

        Args:
            worker_id: ID do worker (GENESIS, TRABALHADOR, REVISADOR)
            task_id: ID da task
            agent_name: Nome do agente
            output: Output gerado (potencialmente alucinado)
            error_type: Tipo de erro
            severity: Severidade
            confidence_score: Score de confiança (0.0-1.0)
            tags: Tags adicionais
            expected_output: Output esperado (se conhecido)
            context: Contexto adicional

        Returns:
            HallucinationLog registrado
        """
        log = HallucinationLog(
            worker_id=worker_id,
            task_id=task_id,
            agent_name=agent_name,
            output=output,
            expected_output=expected_output,
            error_type=error_type,
            severity=severity,
            confidence_score=confidence_score,
            tags=tags or [],
            context=context or {}
        )

        # Salvar no banco
        log_id = await self.repository.create(log)
        log.id = log_id

        # Disparar alertas
        await self._trigger_alerts(log)

        return log

    async def get_weekly_summary(self) -> Dict[str, Any]:
        """Obter resumo da última semana"""
        stats = await self.repository.get_weekly_stats()
        error_breakdown = await self.repository.get_stats_by_error_type()

        return {
            'period': 'weekly',
            'statistics': stats,
            'error_breakdown': error_breakdown,
            'timestamp': datetime.utcnow().isoformat()
        }

    async def get_monthly_report(self) -> Dict[str, Any]:
        """Gerar relatório mensal de estabilidade"""
        stats = await self.repository.get_monthly_stats()
        error_breakdown = await self.repository.get_stats_by_error_type()

        # Calcular estabilidade (% de confiança alta)
        total = stats.get('total_logs', 0)
        if total > 0:
            stability_score = ((total - stats.get('low_confidence_count', 0)) / total) * 100
        else:
            stability_score = 100.0

        return {
            'period': 'monthly',
            'stability_score': stability_score,
            'statistics': stats,
            'error_breakdown': error_breakdown,
            'timestamp': datetime.utcnow().isoformat()
        }

    async def review_unreviewed(self, feedback: str, reviewed_id: int) -> bool:
        """Revisar um log de alucinação"""
        return await self.repository.update_feedback(reviewed_id, feedback, reviewed=True)

    async def get_pending_reviews(self, limit: int = 20) -> List[HallucinationLog]:
        """Obter logs pendentes de revisão"""
        return await self.repository.get_unreviewed(limit)


def log_hallucination(
    error_type: HallucinationErrorType,
    severity: HallucinationSeverity,
    worker_id: str = "UNKNOWN",
    task_id: str = "UNKNOWN",
    expected_output: str = None,
    context: dict = None
):
    """
    Decorator para monitorar outputs de funções e persistir no banco

    @log_hallucination(error_type=HallucinationErrorType.FACTUAL, severity=HallucinationSeverity.HIGH)
    async def generate_response(prompt: str) -> str:
        # função que pode alucinar
        pass
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            import asyncio
            from ..infrastructure.database.hallucination_logs import HallucinationLog, HallucinationRepository

            try:
                result = await func(*args, **kwargs)

                # Calcular confiança baseado em heurísticas
                confidence_score = _calculate_confidence(result, expected_output)

                # Registrar apenas se confiança baixa ou exceção
                if confidence_score < 0.7:
                    # Criar instância do monitor (necessita db_connection)
                    from ...infrastructure.database.db_pool import get_db_connection, DatabaseConnection
                    pool = await get_db_connection()
                    db = DatabaseConnection(pool)
                    repository = HallucinationRepository(db)

                    log = HallucinationLog(
                        worker_id=worker_id,
                        task_id=task_id,
                        agent_name=func.__name__,
                        output=str(result)[:5000],  # Limitar tamanho
                        expected_output=expected_output,
                        error_type=error_type,
                        severity=severity,
                        confidence_score=confidence_score,
                        tags=_extract_tags(result, error_type),
                        context=context or {}
                    )

                    await repository.create(log)

                return result
            except Exception as e:
                # Registrar exceção como hallucination
                from ..infrastructure.database.hallucination_logs import HallucinationLog, HallucinationRepository
                from ...infrastructure.database.db_pool import get_db_connection, DatabaseConnection

                pool = await get_db_connection()
                db = DatabaseConnection(pool)
                repository = HallucinationRepository(db)

                log = HallucinationLog(
                    worker_id=worker_id,
                    task_id=task_id,
                    agent_name=func.__name__,
                    output=f"EXCEPTION: {str(e)}",
                    expected_output=expected_output,
                    error_type=HallucinationErrorType.TECHNICAL,
                    severity=HallucinationSeverity.CRITICAL,
                    confidence_score=0.0,
                    tags=["exception", str(type(e).__name__)],
                    context=context or {}
                )

                await repository.create(log)
                print(f"⚠️  Exception in {func.__name__}: {e}")
                raise

        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs):
            from ..infrastructure.database.hallucination_logs import HallucinationLog, HallucinationRepository

            try:
                result = func(*args, **kwargs)

                # Calcular confiança
                confidence_score = _calculate_confidence(result, expected_output)

                # Registrar se confiança baixa (síncrono - não ideal, mas funcional)
                if confidence_score < 0.7:
                    print(f"⚠️  Low confidence ({confidence_score:.2f}) in {func.__name__}")
                    # TODO: Implementar registro síncrono ou usar asyncio.run()

                return result
            except Exception as e:
                print(f"⚠️  Exception in {func.__name__}: {e}")
                # TODO: Registrar exceção síncrona
                raise

        # Retornar wrapper apropriado
        if hasattr(func, '__call__') and hasattr(func, '__code__'):
            import asyncio
            if asyncio.iscoroutinefunction(func):
                return async_wrapper
        return sync_wrapper

    return decorator


def _calculate_confidence(output: str, expected: str = None) -> float:
    """
    Calcular score de confiança baseado em heurísticas simples

    Returns: float entre 0.0 e 1.0
    """
    if not output:
        return 0.0

    confidence = 1.0
    output_str = str(output).lower()

    # Penalizar por markers de incerteza
    uncertainty_markers = ['talvez', 'possivelmente', 'pode ser', 'não tenho certeza',
                           'maybe', 'possibly', 'might be', "i'm not sure"]
    for marker in uncertainty_markers:
        if marker in output_str:
            confidence -= 0.15

    # Penalizar por outputs muito curtos ou muito longos
    if len(output_str) < 10:
        confidence -= 0.2
    elif len(output_str) > 10000:
        confidence -= 0.1

    # Penalizar por conteúdo repetitivo
    words = output_str.split()
    if len(words) > 0 and len(set(words)) / len(words) < 0.3:
        confidence -= 0.3

    # Se tem output esperado, comparar similaridade básica
    if expected:
        expected_str = str(expected).lower()
        # Similaridade básica por palavras comuns
        output_words = set(output_str.split())
        expected_words = set(expected_str.split())
        if expected_words:
            overlap = len(output_words & expected_words) / len(expected_words)
            if overlap < 0.3:
                confidence -= 0.25

    return max(0.0, min(1.0, confidence))


def _extract_tags(output: str, error_type: HallucinationErrorType) -> List[str]:
    """
    Extrair tags relevantes do output

    Returns: Lista de tags
    """
    tags = [error_type.value]
    output_str = str(output).lower()

    # Tags por conteúdo
    if 'erro' in output_str or 'error' in output_str:
        tags.append('contains_error')
    if 'exception' in output_str:
        tags.append('exception_mentioned')
    if len(output_str) < 20:
        tags.append('short_output')
    if len(output_str) > 5000:
        tags.append('long_output')

    return tags


class HallucinationRetrainingWorkflow:
    """Workflow para retreino baseado em feedback"""

    def __init__(self, db_connection):
        """Inicializar workflow"""
        self.db = db_connection
        self.repository = HallucinationRepository(db_connection)
        self.retraining_queue = []

    async def queue_for_retraining(self, log_id: int, feedback: str) -> bool:
        """Colocar log na fila de retreino"""
        log = await self.repository.get_by_id(log_id)
        if not log:
            return False

        retraining_item = {
            'log_id': log_id,
            'worker_id': log.worker_id,
            'agent_name': log.agent_name,
            'error_type': log.error_type,
            'output': log.output,
            'expected_output': log.expected_output,
            'feedback': feedback,
            'queued_at': datetime.utcnow().isoformat()
        }

        self.retraining_queue.append(retraining_item)
        await self.repository.mark_reviewed(log_id)

        return True

    async def get_retraining_batch(self, batch_size: int = 10) -> List[Dict[str, Any]]:
        """Obter batch de items para retreino"""
        batch = self.retraining_queue[:batch_size]
        self.retraining_queue = self.retraining_queue[batch_size:]
        return batch

    async def apply_retraining(self, batch: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Aplicar retreino (integração com modelo)
        Isto seria integrado com o pipeline de treinamento real
        """
        result = {
            'batch_size': len(batch),
            'applied_at': datetime.utcnow().isoformat(),
            'items': batch
        }
        return result
