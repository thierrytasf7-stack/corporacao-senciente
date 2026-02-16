#!/usr/bin/env python3
"""
Exemplo de Uso do Sistema de Hallucination Monitoring
Demonstra como integrar o sistema no código existente
"""

import asyncio
from backend.infrastructure.database.connection import get_database_connection
from backend.core.services.hallucination_monitor import (
    HallucinationMonitor,
    log_hallucination
)
from backend.infrastructure.database.hallucination_logs import (
    HallucinationErrorType,
    HallucinationSeverity
)


# ============================================================================
# Exemplo 1: Registrar uma alucinação manualmente
# ============================================================================

async def example_manual_logging():
    """Exemplo de registro manual de alucinação"""
    print("📝 Example 1: Manual Logging\n")

    db = get_database_connection()
    await db.connect()

    monitor = HallucinationMonitor(db)

    # Registrar uma alucinação
    log = await monitor.log_hallucination(
        worker_id="TRABALHADOR",
        task_id="task-2025-001",
        agent_name="dev-agent",
        output="O Python foi inventado em 1985",
        expected_output="Python foi criado por Guido van Rossum em 1989",
        error_type=HallucinationErrorType.FACTUAL,
        severity=HallucinationSeverity.HIGH,
        confidence_score=0.62,
        tags=["date", "history", "factual-error"],
        context={
            "prompt": "Quando Python foi inventado?",
            "model": "claude-opus",
            "temperature": 0.7
        }
    )

    print(f"✅ Log registered: ID={log.id}")
    print(f"   Type: {log.error_type}")
    print(f"   Confidence: {log.confidence_score:.2%}")
    print(f"   Severity: {log.severity}\n")

    await db.disconnect()


# ============================================================================
# Exemplo 2: Usar decorator para monitorar função
# ============================================================================

async def example_decorator_usage():
    """Exemplo usando decorator"""
    print("📝 Example 2: Decorator Usage\n")

    # Simular uma função que pode gerar alucinações
    @log_hallucination(
        error_type=HallucinationErrorType.FACTUAL,
        severity=HallucinationSeverity.HIGH,
        worker_id="TRABALHADOR",
        task_id="task-2025-002"
    )
    async def generate_fact(topic: str) -> str:
        # Simular geração de fato
        return f"Fato sobre {topic}"

    result = await generate_fact("Python")
    print(f"✅ Generated: {result}\n")


# ============================================================================
# Exemplo 3: Verificar alertas de baixa confiança
# ============================================================================

async def example_low_confidence_alerts():
    """Exemplo de alertas de baixa confiança"""
    print("📝 Example 3: Low Confidence Alerts\n")

    db = get_database_connection()
    await db.connect()

    monitor = HallucinationMonitor(db)

    # Registrar múltiplas alucinações com diferentes níveis de confiança
    errors = [
        ("O Brasil tem 50 estados", 0.45),
        ("Python foi criado em 1989", 0.95),
        ("O código está correto", 0.68),
    ]

    for output, confidence in errors:
        log = await monitor.log_hallucination(
            worker_id="TRABALHADOR",
            task_id="task-batch",
            agent_name="fact-generator",
            output=output,
            error_type=HallucinationErrorType.FACTUAL,
            severity=HallucinationSeverity.MEDIUM,
            confidence_score=confidence,
            tags=["batch-test"],
            context={"batch": True}
        )
        print(f"   Log {log.id}: Confidence {confidence:.2%}")

    print()
    await db.disconnect()


# ============================================================================
# Exemplo 4: Obter estatísticas
# ============================================================================

async def example_get_statistics():
    """Exemplo de obtenção de estatísticas"""
    print("📝 Example 4: Get Statistics\n")

    db = get_database_connection()
    await db.connect()

    monitor = HallucinationMonitor(db)

    # Obter resumo semanal
    summary = await monitor.get_weekly_summary()
    print("Weekly Summary:")
    print(f"  Total logs: {summary['statistics'].get('total_logs', 0)}")
    print(f"  Reviewed: {summary['statistics'].get('reviewed_count', 0)}")
    print(f"  Avg confidence: {summary['statistics'].get('avg_confidence', 0):.2%}")
    print()

    # Obter relatório mensal
    report = await monitor.get_monthly_report()
    print("Monthly Report:")
    print(f"  Stability score: {report['stability_score']:.1f}%")
    print(f"  Total logs: {report['statistics'].get('total_logs', 0)}")
    print()

    await db.disconnect()


# ============================================================================
# Exemplo 5: Revisar logs e fornecer feedback
# ============================================================================

async def example_review_and_feedback():
    """Exemplo de revisão e feedback"""
    print("📝 Example 5: Review and Feedback\n")

    db = get_database_connection()
    await db.connect()

    from backend.infrastructure.database.hallucination_logs import HallucinationRepository

    repository = HallucinationRepository(db)

    # Obter logs não revisados
    unreviewed = await repository.get_unreviewed(limit=5)

    if unreviewed:
        for log in unreviewed:
            print(f"Reviewing log {log.id}...")

            # Fornecer feedback
            feedback = f"Este é um erro de {log.error_type}. " \
                      f"O modelo gerou '{log.output[:50]}...' " \
                      f"quando deveria ter gerado '{log.expected_output[:50] if log.expected_output else 'N/A'}'."

            success = await repository.update_feedback(log.id, feedback, reviewed=True)
            print(f"  Feedback: {feedback[:80]}...")
            print(f"  Status: {'✅ Updated' if success else '❌ Failed'}\n")
    else:
        print("No unreviewed logs found\n")

    await db.disconnect()


# ============================================================================
# Exemplo 6: Usar callbacks para alertas customizados
# ============================================================================

async def example_custom_alerts():
    """Exemplo com callbacks customizados para alertas"""
    print("📝 Example 6: Custom Alert Callbacks\n")

    db = get_database_connection()
    await db.connect()

    monitor = HallucinationMonitor(db)

    # Definir callback customizado para alertas
    async def send_slack_alert(message: str, log):
        print(f"  [SLACK] {message}")
        print(f"  [SLACK] Agent: {log.agent_name}, Confidence: {log.confidence_score:.2%}")

    monitor.register_alert_callback(send_slack_alert)

    # Registrar alucinação com baixa confiança (vai disparar alerta)
    log = await monitor.log_hallucination(
        worker_id="TRABALHADOR",
        task_id="task-alert",
        agent_name="code-generator",
        output="function sum(a, b) { return a + b; }",  # Python em vez de JavaScript
        error_type=HallucinationErrorType.TECHNICAL,
        severity=HallucinationSeverity.CRITICAL,
        confidence_score=0.55,  # Baixa confiança
        tags=["language-error"],
        context={"language": "python"}
    )

    print(f"✅ Log {log.id} registered (alert should be sent)\n")

    await db.disconnect()


# ============================================================================
# Exemplo 7: Retraining workflow
# ============================================================================

async def example_retraining():
    """Exemplo de workflow de retreino"""
    print("📝 Example 7: Retraining Workflow\n")

    db = get_database_connection()
    await db.connect()

    from backend.core.services.hallucination_monitor import HallucinationRetrainingWorkflow

    retraining = HallucinationRetrainingWorkflow(db)

    # Adicionar à fila de retreino
    print("Queueing logs for retraining...")
    success = await retraining.queue_for_retraining(
        log_id=1,
        feedback="Este tipo de erro aparece frequentemente. Necessário retreino focado em factualidade."
    )

    if success:
        print("✅ Log queued for retraining\n")

        # Obter batch para retreino
        batch = await retraining.get_retraining_batch(batch_size=5)
        print(f"Batch size: {len(batch)} items")

        if batch:
            # Aplicar retreino
            result = await retraining.apply_retraining(batch)
            print(f"✅ Retraining applied: {result['batch_size']} items")
    else:
        print("❌ Log not found\n")

    await db.disconnect()


# ============================================================================
# Main
# ============================================================================

async def main():
    """Executar exemplos"""
    print("\n" + "="*80)
    print("HALLUCINATION MONITORING - USAGE EXAMPLES")
    print("="*80 + "\n")

    try:
        # await example_manual_logging()
        # await example_decorator_usage()
        # await example_low_confidence_alerts()
        # await example_get_statistics()
        # await example_review_and_feedback()
        # await example_custom_alerts()
        # await example_retraining()

        print("💡 Ejemplos disponibles (descomente na main):")
        print("   1. example_manual_logging()")
        print("   2. example_decorator_usage()")
        print("   3. example_low_confidence_alerts()")
        print("   4. example_get_statistics()")
        print("   5. example_review_and_feedback()")
        print("   6. example_custom_alerts()")
        print("   7. example_retraining()\n")

        print("Para testar, descomente a chamada desejada na função main().\n")

    except Exception as e:
        print(f"❌ Error: {e}\n")


if __name__ == "__main__":
    asyncio.run(main())
