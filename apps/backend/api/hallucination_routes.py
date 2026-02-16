"""
REST API Routes para Hallucination Monitoring
Endpoints para gerenciar alucinações via API
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
from typing import Dict, Any
from backend.infrastructure.database.connection import get_database_connection
from backend.infrastructure.database.hallucination_logs import (
    HallucinationRepository,
    HallucinationLog,
    HallucinationErrorType,
    HallucinationSeverity
)
from backend.core.services.hallucination_monitor import (
    HallucinationMonitor,
    HallucinationRetrainingWorkflow
)


# Blueprint de rotas
hallucination_bp = Blueprint('hallucination', __name__, url_prefix='/api/v1/hallucinations')

# Variáveis globais (inicializadas na startup)
db_connection = None
repository = None
monitor = None
retraining_workflow = None


async def init_hallucination_api(db):
    """Inicializar API com conexão de banco"""
    global db_connection, repository, monitor, retraining_workflow
    db_connection = db
    repository = HallucinationRepository(db)
    monitor = HallucinationMonitor(db)
    retraining_workflow = HallucinationRetrainingWorkflow(db)


# ============================================================================
# Endpoints para registrar alucinações
# ============================================================================

@hallucination_bp.route('/log', methods=['POST'])
async def log_hallucination():
    """
    Registrar uma alucinação
    POST /api/v1/hallucinations/log

    Body:
    {
        "worker_id": "TRABALHADOR",
        "task_id": "task-123",
        "agent_name": "dev-agent",
        "output": "generated output...",
        "error_type": "factual",
        "severity": 2,
        "confidence_score": 0.65,
        "tags": ["bug", "code-gen"],
        "expected_output": "what should have been output",
        "context": { "prompt": "...", "model": "..." }
    }
    """
    try:
        data = request.get_json()

        # Validar campos obrigatórios
        required_fields = ['worker_id', 'task_id', 'agent_name', 'output',
                          'error_type', 'severity', 'confidence_score']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        # Registrar alucinação
        log = await monitor.log_hallucination(
            worker_id=data['worker_id'],
            task_id=data['task_id'],
            agent_name=data['agent_name'],
            output=data['output'],
            error_type=HallucinationErrorType[data['error_type'].upper()],
            severity=HallucinationSeverity(int(data['severity'])),
            confidence_score=float(data['confidence_score']),
            tags=data.get('tags', []),
            expected_output=data.get('expected_output'),
            context=data.get('context', {})
        )

        return jsonify({
            'success': True,
            'log_id': log.id,
            'timestamp': log.created_at.isoformat()
        }), 201

    except ValueError as e:
        return jsonify({'error': f'Invalid value: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================================================
# Endpoints para obter logs
# ============================================================================

@hallucination_bp.route('/<int:log_id>', methods=['GET'])
async def get_log(log_id: int):
    """Obter um log específico"""
    try:
        log = await repository.get_by_id(log_id)
        if not log:
            return jsonify({'error': 'Log not found'}), 404

        return jsonify(log.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@hallucination_bp.route('/worker/<worker_id>', methods=['GET'])
async def get_worker_logs(worker_id: str):
    """Obter todos os logs de um worker"""
    try:
        limit = request.args.get('limit', 50, type=int)
        logs = await repository.get_by_worker(worker_id, limit=limit)

        return jsonify({
            'worker_id': worker_id,
            'count': len(logs),
            'logs': [log.to_dict() for log in logs]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@hallucination_bp.route('/type/<error_type>', methods=['GET'])
async def get_logs_by_type(error_type: str):
    """Obter logs por tipo de erro"""
    try:
        limit = request.args.get('limit', 50, type=int)
        logs = await repository.get_by_error_type(error_type, limit=limit)

        return jsonify({
            'error_type': error_type,
            'count': len(logs),
            'logs': [log.to_dict() for log in logs]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@hallucination_bp.route('/unreviewed', methods=['GET'])
async def get_unreviewed_logs():
    """Obter logs não revisados"""
    try:
        limit = request.args.get('limit', 50, type=int)
        logs = await repository.get_unreviewed(limit=limit)

        return jsonify({
            'unreviewed_count': len(logs),
            'logs': [log.to_dict() for log in logs]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@hallucination_bp.route('/low-confidence', methods=['GET'])
async def get_low_confidence_logs():
    """Obter logs com confiança baixa"""
    try:
        threshold = request.args.get('threshold', 0.7, type=float)
        limit = request.args.get('limit', 50, type=int)
        logs = await repository.get_low_confidence(threshold=threshold, limit=limit)

        return jsonify({
            'threshold': threshold,
            'count': len(logs),
            'logs': [log.to_dict() for log in logs]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================================================
# Endpoints para review e feedback
# ============================================================================

@hallucination_bp.route('/<int:log_id>/review', methods=['POST'])
async def review_log(log_id: int):
    """Revisar um log e fornecer feedback"""
    try:
        data = request.get_json()
        feedback = data.get('feedback', '')

        if not feedback:
            return jsonify({'error': 'Feedback is required'}), 400

        success = await repository.update_feedback(log_id, feedback, reviewed=True)

        if success:
            return jsonify({
                'success': True,
                'log_id': log_id,
                'message': 'Log reviewed successfully'
            }), 200
        else:
            return jsonify({'error': 'Failed to review log'}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@hallucination_bp.route('/<int:log_id>/queue-retraining', methods=['POST'])
async def queue_for_retraining(log_id: int):
    """Colocar log na fila de retreino"""
    try:
        data = request.get_json()
        feedback = data.get('feedback', '')

        success = await retraining_workflow.queue_for_retraining(log_id, feedback)

        if success:
            return jsonify({
                'success': True,
                'log_id': log_id,
                'message': 'Log queued for retraining'
            }), 200
        else:
            return jsonify({'error': 'Log not found'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================================================
# Endpoints para estatísticas
# ============================================================================

@hallucination_bp.route('/stats/weekly', methods=['GET'])
async def get_weekly_stats():
    """Obter estatísticas da semana"""
    try:
        summary = await monitor.get_weekly_summary()
        return jsonify(summary), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@hallucination_bp.route('/stats/monthly', methods=['GET'])
async def get_monthly_stats():
    """Obter estatísticas do mês"""
    try:
        report = await monitor.get_monthly_report()
        return jsonify(report), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@hallucination_bp.route('/stats/by-error-type', methods=['GET'])
async def get_stats_by_error_type():
    """Obter estatísticas por tipo de erro"""
    try:
        stats = await repository.get_stats_by_error_type()
        return jsonify({
            'error_types': [dict(row) for row in stats]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================================================
# Endpoints para retraining
# ============================================================================

@hallucination_bp.route('/retraining/batch', methods=['GET'])
async def get_retraining_batch():
    """Obter batch de items para retreino"""
    try:
        batch_size = request.args.get('batch_size', 10, type=int)
        batch = await retraining_workflow.get_retraining_batch(batch_size=batch_size)

        return jsonify({
            'batch_size': len(batch),
            'items': batch
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@hallucination_bp.route('/retraining/apply', methods=['POST'])
async def apply_retraining():
    """Aplicar retreino"""
    try:
        data = request.get_json()
        batch = data.get('batch', [])

        if not batch:
            return jsonify({'error': 'Empty batch'}), 400

        result = await retraining_workflow.apply_retraining(batch)

        return jsonify({
            'success': True,
            'applied': result['batch_size'],
            'timestamp': result['applied_at']
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================================================
# Endpoints de saúde
# ============================================================================

@hallucination_bp.route('/health', methods=['GET'])
async def health_check():
    """Health check"""
    try:
        health = await db_connection.health_check()
        return jsonify({
            'status': 'healthy',
            'database': health,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 503
