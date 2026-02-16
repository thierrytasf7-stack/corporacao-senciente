"""
Hallucination Logs - Database Models and Management
Gerencia tabela de alucinações e operações relacionadas
"""

import json
from datetime import datetime
from typing import Optional, Dict, Any, List
from enum import Enum


class HallucinationErrorType(Enum):
    """Categorias de tipos de erros em alucinações"""
    FACTUAL = "factual"  # Informações factuais incorretas
    LOGICAL = "logical"  # Erros de lógica ou raciocínio
    TONE = "tone"  # Tom ou contexto inapropriado
    CONSISTENCY = "consistency"  # Inconsistência com conhecimento anterior
    HALLUCINATED = "hallucinated"  # Conteúdo completamente inventado
    CONTEXTUAL = "contextual"  # Perda de contexto
    TECHNICAL = "technical"  # Erros técnicos (código, API)


class HallucinationSeverity(Enum):
    """Níveis de severidade"""
    CRITICAL = 1  # Erros críticos que afetam funcionamento
    HIGH = 2  # Erros significativos
    MEDIUM = 3  # Erros moderados
    LOW = 4  # Erros menores


class HallucinationLog:
    """Modelo para log de alucinações"""

    def __init__(
        self,
        worker_id: str,
        task_id: str,
        agent_name: str,
        output: str,
        expected_output: Optional[str],
        error_type: HallucinationErrorType,
        severity: HallucinationSeverity,
        confidence_score: float,
        tags: List[str],
        context: Dict[str, Any],
        feedback: Optional[str] = None,
        reviewed: bool = False,
        created_at: Optional[datetime] = None,
        id: Optional[int] = None
    ):
        self.id = id
        self.worker_id = worker_id
        self.task_id = task_id
        self.agent_name = agent_name
        self.output = output
        self.expected_output = expected_output
        self.error_type = error_type.value if isinstance(error_type, HallucinationErrorType) else error_type
        self.severity = severity.value if isinstance(severity, HallucinationSeverity) else severity
        self.confidence_score = confidence_score
        self.tags = tags
        self.context = context
        self.feedback = feedback
        self.reviewed = reviewed
        self.created_at = created_at or datetime.utcnow()

    def to_dict(self) -> Dict[str, Any]:
        """Converter para dicionário"""
        return {
            'id': self.id,
            'worker_id': self.worker_id,
            'task_id': self.task_id,
            'agent_name': self.agent_name,
            'output': self.output,
            'expected_output': self.expected_output,
            'error_type': self.error_type,
            'severity': self.severity,
            'confidence_score': self.confidence_score,
            'tags': self.tags,
            'context': self.context,
            'feedback': self.feedback,
            'reviewed': self.reviewed,
            'created_at': self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at
        }

    @staticmethod
    def from_dict(data: Dict[str, Any]) -> 'HallucinationLog':
        """Criar a partir de dicionário"""
        created_at = data.get('created_at')
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)

        return HallucinationLog(
            worker_id=data['worker_id'],
            task_id=data['task_id'],
            agent_name=data['agent_name'],
            output=data['output'],
            expected_output=data.get('expected_output'),
            error_type=data['error_type'],
            severity=data['severity'],
            confidence_score=data['confidence_score'],
            tags=data.get('tags', []),
            context=data.get('context', {}),
            feedback=data.get('feedback'),
            reviewed=data.get('reviewed', False),
            created_at=created_at,
            id=data.get('id')
        )


class HallucinationDatabaseMigration:
    """Migration SQL para tabela hallucination_logs"""

    @staticmethod
    def get_create_table_sql() -> str:
        """Retorna SQL para criar a tabela"""
        return """
        CREATE TABLE IF NOT EXISTS hallucination_logs (
            id SERIAL PRIMARY KEY,
            worker_id VARCHAR(255) NOT NULL,
            task_id VARCHAR(255) NOT NULL,
            agent_name VARCHAR(255) NOT NULL,
            output TEXT NOT NULL,
            expected_output TEXT,
            error_type VARCHAR(50) NOT NULL,
            severity INTEGER NOT NULL,
            confidence_score FLOAT NOT NULL,
            tags TEXT[] DEFAULT '{}',
            context JSONB DEFAULT '{}',
            feedback TEXT,
            reviewed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT confidence_score_range CHECK (confidence_score >= 0 AND confidence_score <= 1)
        );

        -- Criar índices para melhor performance
        CREATE INDEX IF NOT EXISTS idx_hallucination_logs_worker_id ON hallucination_logs(worker_id);
        CREATE INDEX IF NOT EXISTS idx_hallucination_logs_task_id ON hallucination_logs(task_id);
        CREATE INDEX IF NOT EXISTS idx_hallucination_logs_error_type ON hallucination_logs(error_type);
        CREATE INDEX IF NOT EXISTS idx_hallucination_logs_severity ON hallucination_logs(severity);
        CREATE INDEX IF NOT EXISTS idx_hallucination_logs_confidence ON hallucination_logs(confidence_score);
        CREATE INDEX IF NOT EXISTS idx_hallucination_logs_reviewed ON hallucination_logs(reviewed);
        CREATE INDEX IF NOT EXISTS idx_hallucination_logs_created_at ON hallucination_logs(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_hallucination_logs_tags ON hallucination_logs USING GIN(tags);
        """

    @staticmethod
    def get_drop_table_sql() -> str:
        """Retorna SQL para dropar a tabela"""
        return "DROP TABLE IF EXISTS hallucination_logs CASCADE;"


class HallucinationRepository:
    """Repository para operações com hallucination_logs"""

    def __init__(self, db_connection):
        """Inicializar com conexão de banco de dados"""
        self.db = db_connection

    async def create(self, log: HallucinationLog) -> int:
        """Criar novo log de alucinação"""
        query = """
        INSERT INTO hallucination_logs
        (worker_id, task_id, agent_name, output, expected_output,
         error_type, severity, confidence_score, tags, context, feedback, reviewed, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id
        """

        result = await self.db.execute_query_single(
            query,
            log.worker_id,
            log.task_id,
            log.agent_name,
            log.output,
            log.expected_output,
            log.error_type,
            log.severity,
            log.confidence_score,
            log.tags,
            json.dumps(log.context),
            log.feedback,
            log.reviewed,
            log.created_at
        )

        return result['id']

    async def get_by_id(self, id: int) -> Optional[HallucinationLog]:
        """Obter log por ID"""
        query = "SELECT * FROM hallucination_logs WHERE id = $1"
        result = await self.db.execute_query_single(query, id)

        if result:
            result['context'] = json.loads(result['context']) if isinstance(result['context'], str) else result['context']
            return HallucinationLog.from_dict(result)
        return None

    async def get_by_worker(self, worker_id: str, limit: int = 100) -> List[HallucinationLog]:
        """Obter logs de um worker específico"""
        query = """
        SELECT * FROM hallucination_logs
        WHERE worker_id = $1
        ORDER BY created_at DESC
        LIMIT $2
        """
        results = await self.db.execute_query(query, worker_id, limit)

        logs = []
        for result in results:
            result['context'] = json.loads(result['context']) if isinstance(result['context'], str) else result['context']
            logs.append(HallucinationLog.from_dict(result))
        return logs

    async def get_by_error_type(self, error_type: str, limit: int = 50) -> List[HallucinationLog]:
        """Obter logs por tipo de erro"""
        query = """
        SELECT * FROM hallucination_logs
        WHERE error_type = $1
        ORDER BY created_at DESC
        LIMIT $2
        """
        results = await self.db.execute_query(query, error_type, limit)

        logs = []
        for result in results:
            result['context'] = json.loads(result['context']) if isinstance(result['context'], str) else result['context']
            logs.append(HallucinationLog.from_dict(result))
        return logs

    async def get_unreviewed(self, limit: int = 50) -> List[HallucinationLog]:
        """Obter logs não revisados"""
        query = """
        SELECT * FROM hallucination_logs
        WHERE reviewed = FALSE
        ORDER BY severity, created_at DESC
        LIMIT $1
        """
        results = await self.db.execute_query(query, limit)

        logs = []
        for result in results:
            result['context'] = json.loads(result['context']) if isinstance(result['context'], str) else result['context']
            logs.append(HallucinationLog.from_dict(result))
        return logs

    async def get_low_confidence(self, confidence_threshold: float = 0.7, limit: int = 50) -> List[HallucinationLog]:
        """Obter logs com confiança baixa (< threshold)"""
        query = """
        SELECT * FROM hallucination_logs
        WHERE confidence_score < $1
        ORDER BY confidence_score, created_at DESC
        LIMIT $2
        """
        results = await self.db.execute_query(query, confidence_threshold, limit)

        logs = []
        for result in results:
            result['context'] = json.loads(result['context']) if isinstance(result['context'], str) else result['context']
            logs.append(HallucinationLog.from_dict(result))
        return logs

    async def update_feedback(self, id: int, feedback: str, reviewed: bool = True) -> bool:
        """Atualizar feedback e status de review"""
        query = """
        UPDATE hallucination_logs
        SET feedback = $1, reviewed = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        """
        await self.db.execute_command(query, feedback, reviewed, id)
        return True

    async def mark_reviewed(self, id: int) -> bool:
        """Marcar como revisado"""
        query = "UPDATE hallucination_logs SET reviewed = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1"
        await self.db.execute_command(query, id)
        return True

    async def get_weekly_stats(self) -> Dict[str, Any]:
        """Estatísticas da última semana"""
        query = """
        SELECT
            COUNT(*) as total_logs,
            COUNT(CASE WHEN reviewed = TRUE THEN 1 END) as reviewed_count,
            COUNT(CASE WHEN reviewed = FALSE THEN 1 END) as unreviewed_count,
            COUNT(CASE WHEN confidence_score < 0.7 THEN 1 END) as low_confidence_count,
            AVG(confidence_score) as avg_confidence,
            MIN(confidence_score) as min_confidence,
            MAX(confidence_score) as max_confidence
        FROM hallucination_logs
        WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
        """
        result = await self.db.execute_query_single(query)
        return result or {}

    async def get_monthly_stats(self) -> Dict[str, Any]:
        """Estatísticas do último mês"""
        query = """
        SELECT
            COUNT(*) as total_logs,
            COUNT(CASE WHEN reviewed = TRUE THEN 1 END) as reviewed_count,
            COUNT(CASE WHEN reviewed = FALSE THEN 1 END) as unreviewed_count,
            COUNT(CASE WHEN confidence_score < 0.7 THEN 1 END) as low_confidence_count,
            AVG(confidence_score) as avg_confidence,
            MIN(confidence_score) as min_confidence,
            MAX(confidence_score) as max_confidence
        FROM hallucination_logs
        WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
        """
        result = await self.db.execute_query_single(query)
        return result or {}

    async def get_stats_by_error_type(self) -> List[Dict[str, Any]]:
        """Estatísticas agrupadas por tipo de erro"""
        query = """
        SELECT
            error_type,
            COUNT(*) as count,
            COUNT(CASE WHEN reviewed = TRUE THEN 1 END) as reviewed_count,
            AVG(confidence_score) as avg_confidence,
            COUNT(CASE WHEN confidence_score < 0.7 THEN 1 END) as low_confidence_count
        FROM hallucination_logs
        WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
        GROUP BY error_type
        ORDER BY count DESC
        """
        results = await self.db.execute_query(query)
        return results or []
