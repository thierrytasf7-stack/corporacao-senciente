"""
Hallucination Logger - Versão Síncrona para Workers Python
Interface simplificada para registro de alucinações sem async/await
"""

import os
import sys
import json
import psycopg2
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List

# Adicionar paths para imports
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.insert(0, ROOT)


class HallucinationLoggerSync:
    """Logger síncrono de alucinações para workers Python"""

    def __init__(self):
        """Inicializar logger"""
        self.db_host = os.getenv('DB_HOST', 'localhost')
        self.db_port = int(os.getenv('DB_PORT', '5432'))
        self.db_name = os.getenv('DB_NAME', 'diana_db')
        self.db_user = os.getenv('DB_USER', 'postgres')
        self.db_password = os.getenv('DB_PASSWORD', 'postgres')
        self._conn = None

    def _get_connection(self):
        """Obter conexão ao banco (lazy connection)"""
        if self._conn is None or self._conn.closed:
            try:
                self._conn = psycopg2.connect(
                    host=self.db_host,
                    port=self.db_port,
                    database=self.db_name,
                    user=self.db_user,
                    password=self.db_password
                )
            except Exception as e:
                print(f"⚠️  Failed to connect to database: {e}")
                return None
        return self._conn

    def log_hallucination(
        self,
        worker_id: str,
        task_id: str,
        agent_name: str,
        output: str,
        expected_output: Optional[str] = None,
        error_type: str = "factual",
        severity: int = 3,
        confidence_score: float = 0.5,
        tags: List[str] = None,
        context: Dict[str, Any] = None
    ) -> Optional[int]:
        """
        Registrar alucinação no banco de dados

        Args:
            worker_id: ID do worker (GENESIS, TRABALHADOR, REVISADOR)
            task_id: ID da task sendo processada
            agent_name: Nome do agente/função
            output: Output gerado
            expected_output: Output esperado (opcional)
            error_type: Tipo de erro (factual, logical, tone, etc)
            severity: 1=CRITICAL, 2=HIGH, 3=MEDIUM, 4=LOW
            confidence_score: Score de confiança (0.0 a 1.0)
            tags: Lista de tags
            context: Contexto adicional

        Returns:
            ID do log criado ou None se falhou
        """
        conn = self._get_connection()
        if conn is None:
            return None

        try:
            cursor = conn.cursor()

            query = """
            INSERT INTO hallucination_logs
            (worker_id, task_id, agent_name, output, expected_output,
             error_type, severity, confidence_score, tags, context, reviewed, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
            """

            # Limitar tamanho do output
            output_truncated = str(output)[:5000] if output else ""

            cursor.execute(query, (
                worker_id,
                task_id,
                agent_name,
                output_truncated,
                expected_output,
                error_type,
                severity,
                confidence_score,
                tags or [],
                json.dumps(context or {}),
                False,
                datetime.now(timezone.utc)
            ))

            result = cursor.fetchone()
            log_id = result[0] if result else None

            conn.commit()
            cursor.close()

            return log_id

        except Exception as e:
            print(f"⚠️  Failed to log hallucination: {e}")
            if conn:
                conn.rollback()
            return None

    def log_low_confidence(
        self,
        worker_id: str,
        task_id: str,
        output: str,
        confidence_score: float,
        context: Dict[str, Any] = None
    ) -> Optional[int]:
        """
        Registrar output com confiança baixa

        Shortcut para log_hallucination com erro de tipo CONSISTENCY
        """
        return self.log_hallucination(
            worker_id=worker_id,
            task_id=task_id,
            agent_name="confidence_monitor",
            output=output,
            error_type="consistency",
            severity=2,  # HIGH
            confidence_score=confidence_score,
            tags=["low_confidence", f"confidence_{int(confidence_score*100)}"],
            context=context
        )

    def log_exception(
        self,
        worker_id: str,
        task_id: str,
        function_name: str,
        exception: Exception,
        context: Dict[str, Any] = None
    ) -> Optional[int]:
        """
        Registrar exceção como alucinação técnica

        Args:
            worker_id: ID do worker
            task_id: ID da task
            function_name: Nome da função que gerou exceção
            exception: Exceção capturada
            context: Contexto adicional
        """
        return self.log_hallucination(
            worker_id=worker_id,
            task_id=task_id,
            agent_name=function_name,
            output=f"EXCEPTION: {str(exception)}",
            error_type="technical",
            severity=1,  # CRITICAL
            confidence_score=0.0,
            tags=["exception", type(exception).__name__],
            context=context or {}
        )

    def close(self):
        """Fechar conexão ao banco"""
        if self._conn and not self._conn.closed:
            self._conn.close()


# Singleton global
_logger_instance: Optional[HallucinationLoggerSync] = None


def get_hallucination_logger() -> HallucinationLoggerSync:
    """Obter instância singleton do logger"""
    global _logger_instance
    if _logger_instance is None:
        _logger_instance = HallucinationLoggerSync()
    return _logger_instance


# Função helper para uso rápido
def log_hallucination(worker_id: str, task_id: str, output: str, **kwargs) -> Optional[int]:
    """
    Helper function para logging rápido

    Uso:
        from hallucination_logger_sync import log_hallucination
        log_hallucination("GENESIS", "task_1", output_text, confidence_score=0.6)
    """
    logger = get_hallucination_logger()
    return logger.log_hallucination(
        worker_id=worker_id,
        task_id=task_id,
        agent_name=kwargs.get('agent_name', 'worker'),
        output=output,
        **{k: v for k, v in kwargs.items() if k != 'agent_name'}
    )


if __name__ == "__main__":
    # Teste standalone
    logger = get_hallucination_logger()

    # Testar log de confiança baixa
    log_id = logger.log_low_confidence(
        worker_id="TEST_WORKER",
        task_id="test_task_1",
        output="Este é um output de teste com confiança baixa",
        confidence_score=0.55,
        context={"test": True, "timestamp": datetime.now(timezone.utc).isoformat()}
    )

    if log_id:
        print(f"[OK] Hallucination logged successfully with ID: {log_id}")
    else:
        print("[ERROR] Failed to log hallucination")

    logger.close()
