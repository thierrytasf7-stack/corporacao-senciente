"""
CLI Interface para Hallucination Monitoring
Interface de linha de comando para revisão de alucinações
"""

import asyncio
import json
from typing import Optional, List
from datetime import datetime
from tabulate import tabulate
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


class HallucinationCLI:
    """Interface CLI para monitoramento de alucinações"""

    def __init__(self):
        self.db = None
        self.repository = None
        self.monitor = None
        self.retraining = None

    async def initialize(self):
        """Inicializar conexões"""
        self.db = get_database_connection()
        await self.db.connect()
        self.repository = HallucinationRepository(self.db)
        self.monitor = HallucinationMonitor(self.db)
        self.retraining = HallucinationRetrainingWorkflow(self.db)

    async def close(self):
        """Fechar conexões"""
        if self.db:
            await self.db.disconnect()

    async def show_weekly_review(self):
        """Mostrar revisão semanal interativa"""
        print("\n" + "="*80)
        print("📊 HALLUCINATION MONITORING - WEEKLY REVIEW")
        print("="*80 + "\n")

        # Obter logs não revisados
        unreviewed = await self.repository.get_unreviewed(limit=10)

        if not unreviewed:
            print("✅ Todos os logs foram revisados!")
            return

        print(f"Found {len(unreviewed)} unreviewed logs\n")

        for i, log in enumerate(unreviewed, 1):
            self._display_log_detail(log, i)
            action = input("\nAction (r=review, s=skip, q=quit): ").strip().lower()

            if action == 'q':
                break
            elif action == 'r':
                feedback = input("Enter feedback: ").strip()
                if feedback:
                    await self.repository.update_feedback(log.id, feedback, reviewed=True)
                    print("✅ Log revisado e armazenado\n")
            elif action == 's':
                print("⏭️  Próximo log\n")

    async def show_low_confidence_alerts(self, threshold: float = 0.7):
        """Mostrar alertas de baixa confiança"""
        print("\n" + "="*80)
        print(f"⚠️  LOW CONFIDENCE ALERTS (< {threshold:.0%})")
        print("="*80 + "\n")

        low_confidence = await self.repository.get_low_confidence(threshold, limit=20)

        if not low_confidence:
            print(f"✅ Sem logs com confiança abaixo de {threshold:.0%}")
            return

        table_data = []
        for log in low_confidence:
            table_data.append([
                log.id,
                log.agent_name,
                log.error_type,
                f"{log.confidence_score:.2%}",
                log.created_at.strftime("%Y-%m-%d %H:%M:%S") if hasattr(log.created_at, 'strftime') else log.created_at,
                "✅" if log.reviewed else "❌"
            ])

        headers = ["ID", "Agent", "Type", "Confidence", "Created At", "Reviewed"]
        print(tabulate(table_data, headers=headers, tablefmt="grid"))

    async def show_weekly_stats(self):
        """Mostrar estatísticas da semana"""
        print("\n" + "="*80)
        print("📈 WEEKLY STATISTICS")
        print("="*80 + "\n")

        summary = await self.monitor.get_weekly_summary()

        stats = summary['statistics']
        print(f"Total Logs: {stats.get('total_logs', 0)}")
        print(f"Reviewed: {stats.get('reviewed_count', 0)}")
        print(f"Unreviewed: {stats.get('unreviewed_count', 0)}")
        print(f"Low Confidence (<70%): {stats.get('low_confidence_count', 0)}")
        print(f"Average Confidence: {stats.get('avg_confidence', 0):.2%}")
        print(f"Min Confidence: {stats.get('min_confidence', 0):.2%}")
        print(f"Max Confidence: {stats.get('max_confidence', 0):.2%}\n")

        # Breakdown por tipo de erro
        if summary['error_breakdown']:
            print("Error Type Breakdown:")
            table_data = []
            for error in summary['error_breakdown']:
                table_data.append([
                    error['error_type'],
                    error['count'],
                    error['reviewed_count'],
                    f"{error['avg_confidence']:.2%}",
                    error['low_confidence_count']
                ])

            headers = ["Error Type", "Count", "Reviewed", "Avg Confidence", "Low Confidence"]
            print(tabulate(table_data, headers=headers, tablefmt="grid"))

    async def show_monthly_report(self):
        """Gerar relatório mensal"""
        print("\n" + "="*80)
        print("📋 MONTHLY STABILITY REPORT")
        print("="*80 + "\n")

        report = await self.monitor.get_monthly_report()

        print(f"Stability Score: {report['stability_score']:.1f}%")
        print(f"Generated: {report['timestamp']}\n")

        stats = report['statistics']
        print("Monthly Statistics:")
        print(f"  Total Logs: {stats.get('total_logs', 0)}")
        print(f"  Reviewed: {stats.get('reviewed_count', 0)}")
        print(f"  Unreviewed: {stats.get('unreviewed_count', 0)}")
        print(f"  Low Confidence: {stats.get('low_confidence_count', 0)}")
        print(f"  Avg Confidence: {stats.get('avg_confidence', 0):.2%}\n")

        # Error breakdown
        if report['error_breakdown']:
            print("Error Distribution:")
            table_data = []
            for error in report['error_breakdown']:
                table_data.append([
                    error['error_type'].upper(),
                    error['count'],
                    f"{error['avg_confidence']:.2%}",
                ])

            headers = ["Type", "Count", "Avg Confidence"]
            print(tabulate(table_data, headers=headers, tablefmt="grid"))

        print("\n" + "="*80)
        if report['stability_score'] >= 90:
            print("✅ System stability is EXCELLENT")
        elif report['stability_score'] >= 80:
            print("✅ System stability is GOOD")
        elif report['stability_score'] >= 70:
            print("⚠️  System stability is ACCEPTABLE but needs improvement")
        else:
            print("🚨 System stability is POOR - Immediate retraining recommended")
        print("="*80)

    async def show_worker_stats(self, worker_id: str):
        """Mostrar estatísticas de um worker específico"""
        print("\n" + "="*80)
        print(f"📊 WORKER STATISTICS: {worker_id}")
        print("="*80 + "\n")

        logs = await self.repository.get_by_worker(worker_id, limit=50)

        if not logs:
            print(f"No logs found for worker: {worker_id}")
            return

        # Calcular estatísticas
        total = len(logs)
        reviewed = sum(1 for log in logs if log.reviewed)
        low_confidence = sum(1 for log in logs if log.confidence_score < 0.7)
        avg_confidence = sum(log.confidence_score for log in logs) / total if total > 0 else 0

        print(f"Total Logs: {total}")
        print(f"Reviewed: {reviewed} ({reviewed/total*100:.1f}%)")
        print(f"Low Confidence (<70%): {low_confidence}")
        print(f"Average Confidence: {avg_confidence:.2%}\n")

        # Logs recentes
        print("Recent Logs:")
        table_data = []
        for log in logs[:10]:
            table_data.append([
                log.id,
                log.error_type,
                f"{log.confidence_score:.2%}",
                log.created_at.strftime("%Y-%m-%d") if hasattr(log.created_at, 'strftime') else log.created_at,
                "✅" if log.reviewed else "❌"
            ])

        headers = ["ID", "Type", "Confidence", "Date", "Reviewed"]
        print(tabulate(table_data, headers=headers, tablefmt="grid"))

    def _display_log_detail(self, log: HallucinationLog, index: int):
        """Exibir detalhes de um log"""
        print(f"\n--- Log #{index} (ID: {log.id}) ---")
        print(f"Worker: {log.worker_id} | Agent: {log.agent_name}")
        print(f"Type: {log.error_type.upper()} | Severity: {log.severity}")
        print(f"Confidence: {log.confidence_score:.2%}")
        print(f"Tags: {', '.join(log.tags) if log.tags else 'None'}")
        print(f"Created: {log.created_at}")
        print(f"\nOutput:\n{log.output[:200]}...")
        if log.expected_output:
            print(f"\nExpected:\n{log.expected_output[:200]}...")
        print(f"\nContext: {json.dumps(log.context, indent=2)}")

    async def run_interactive_menu(self):
        """Menu interativo"""
        while True:
            print("\n" + "="*80)
            print("🧠 DIANA HALLUCINATION MONITOR")
            print("="*80)
            print("1. Weekly Review (Interactive)")
            print("2. Weekly Statistics")
            print("3. Low Confidence Alerts")
            print("4. Monthly Report")
            print("5. Worker Statistics")
            print("6. Retraining Queue")
            print("0. Exit")
            print("="*80)

            choice = input("\nSelect option: ").strip()

            try:
                if choice == '1':
                    await self.show_weekly_review()
                elif choice == '2':
                    await self.show_weekly_stats()
                elif choice == '3':
                    await self.show_low_confidence_alerts()
                elif choice == '4':
                    await self.show_monthly_report()
                elif choice == '5':
                    worker_id = input("Enter worker ID (GENESIS/TRABALHADOR/REVISADOR): ").strip()
                    if worker_id:
                        await self.show_worker_stats(worker_id)
                elif choice == '6':
                    await self._show_retraining_queue()
                elif choice == '0':
                    break
                else:
                    print("Invalid option")
            except Exception as e:
                print(f"❌ Error: {e}")

    async def _show_retraining_queue(self):
        """Mostrar fila de retreino"""
        print("\n" + "="*80)
        print("🔄 RETRAINING QUEUE")
        print("="*80 + "\n")

        queue = self.retraining.retraining_queue

        if not queue:
            print("Queue is empty")
            return

        print(f"Total items in queue: {len(queue)}\n")

        for i, item in enumerate(queue[:10], 1):
            print(f"{i}. Worker: {item['worker_id']} | Agent: {item['agent_name']}")
            print(f"   Error Type: {item['error_type']}")
            print(f"   Feedback: {item['feedback'][:100]}...\n")


async def main():
    """Função principal"""
    cli = HallucinationCLI()

    try:
        await cli.initialize()
        await cli.run_interactive_menu()
    finally:
        await cli.close()


if __name__ == "__main__":
    asyncio.run(main())
