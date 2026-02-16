#!/usr/bin/env python3
"""
AUDIT DEPENDENCIES - CORPORAÇÃO SENCIENTE
Script para auditoria completa de dependências em todos os workspaces do monorepo.
"""

import os
import subprocess
import json
from pathlib import Path
from datetime import datetime

def run_command(command, cwd=None):
    """Executa um comando e retorna o resultado"""
    try:
        result = subprocess.run(command, cwd=cwd, capture_output=True, text=True, check=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        return e.stderr.strip()

def audit_workspace(workspace):
    """Executa auditoria em um workspace específico"""
    print(f"\n{'='*60}")
    print(f"AUDITANDO WORKSPACE: {workspace}")
    print(f"{'='*60}")

    workspace_path = Path(workspace)

    if not workspace_path.exists():
        print(f"[ERRO] Workspace {workspace} não encontrado")
        return None

    # Verificar se é um projeto npm
    if not (workspace_path / "package.json").exists():
        print(f"[AVISO] {workspace} não é um projeto npm")
        return None

    # 1. Rodar npm audit
    print(f"\n[1/4] Executando npm audit em {workspace}...")
    audit_output = run_command(["npm", "audit"], cwd=workspace)

    # 2. Aplicar npm audit fix
    print(f"\n[2/4] Aplicando correções automáticas com npm audit fix...")
    fix_output = run_command(["npm", "audit", "fix"], cwd=workspace)

    # 3. Verificar se ainda há vulnerabilidades
    print(f"\n[3/4] Verificando vulnerabilidades remanescentes...")
    final_audit_output = run_command(["npm", "audit"], cwd=workspace)

    # 4. Verificar se o projeto ainda funciona
    print(f"\n[4/4] Verificando se o projeto ainda funciona...")
    test_output = run_command(["npm", "test"], cwd=workspace)
    build_output = run_command(["npm", "run", "build"], cwd=workspace)

    return {
        "workspace": workspace,
        "audit_output": audit_output,
        "fix_output": fix_output,
        "final_audit_output": final_audit_output,
        "test_output": test_output,
        "build_output": build_output,
        "timestamp": datetime.now().isoformat()
    }

def generate_report(results):
    """Gera relatório resumido das correções aplicadas"""
    report = f"""
RELATÓRIO DE AUDITORIA DE DEPENDÊNCIAS
{datetime.now().strftime('%d/%m/%Y %H:%M:%S')}
{'='*60}

"""

    total_vulnerabilities = 0
    fixed_vulnerabilities = 0
    remaining_vulnerabilities = 0
    failed_workspaces = 0

    for result in results:
        if result is None:
            continue

        report += f"\n{'-'*60}\n"
        report += f"WORKSPACE: {result['workspace']}\n"
        report += f"{'-'*60}\n"

        # Analisar audit output
        if "found 0 vulnerabilities" in result["audit_output"].lower():
            report += "✓ NENHUMA VULNERABILIDADE ENCONTRADA\n"
        else:
            # Extrair número de vulnerabilidades
            lines = result["audit_output"].split("\n")
            for line in lines:
                if "found" in line.lower() and "vulnerabilities" in line.lower():
                    total_vulnerabilities += int(line.split()[1])
                    break

            report += "⚠ VULNERABILIDADES ENCONTRADAS:\n"
            report += result["audit_output"] + "\n"

        # Analisar fix output
        if "fixed" in result["fix_output"].lower():
            fixed_count = int(result["fix_output"].split()[1])
            fixed_vulnerabilities += fixed_count
            report += f"✓ CORRIGIDAS AUTOMATICAMENTE: {fixed_count} vulnerabilidades\n"
        else:
            report += "✓ NENHUMA CORREÇÃO AUTOMÁTICA APLICADA\n"

        # Analisar vulnerabilidades remanescentes
        if "found 0 vulnerabilities" in result["final_audit_output"].lower():
            report += "✓ NENHUMA VULNERABILIDADE REMANESCENTE\n"
        else:
            remaining_vulnerabilities += int(result["final_audit_output"].split()[1])
            report += "⚠ VULNERABILIDADES REMANESCENTES:\n"
            report += result["final_audit_output"] + "\n"

        # Verificar se testes/build passaram
        if "error" in result["test_output"].lower() or "error" in result["build_output"].lower():
            failed_workspaces += 1
            report += "❌ ERRO: Testes ou build falharam após correções\n"
        else:
            report += "✓ TESTES E BUILD PASSARAM\n"

    # Resumo final
    report += f"\n{'='*60}\n"
    report += "RESUMO FINAL\n"
    report += f"{'='*60}\n"
    report += f"Total de workspaces auditados: {len([r for r in results if r is not None])}\n"
    report += f"Total de vulnerabilidades encontradas: {total_vulnerabilities}\n"
    report += f"Total de vulnerabilidades corrigidas automaticamente: {fixed_vulnerabilities}\n"
    report += f"Total de vulnerabilidades remanescentes: {remaining_vulnerabilities}\n"
    report += f"Workspaces com falhas após correções: {failed_workspaces}\n"

    return report

def main():
    print("CORPORAÇÃO SENCIENTE - AUDITORIA DE DEPENDÊNCIAS")
    print("=" * 60)

    # Definir workspaces a serem auditados
    workspaces = [
        ".",
        "apps/dashboard",
        "apps/monitor-server"
    ]

    results = []

    # Executar auditoria em cada workspace
    for workspace in workspaces:
        result = audit_workspace(workspace)
        if result:
            results.append(result)

    # Gerar relatório
    report = generate_report(results)

    # Salvar relatório
    report_path = Path("docs/auditoria-dependencias-report.md")
    report_path.write_text(report)

    print("\n" + "=" * 60)
    print("AUDITORIA CONCLUÍDA!")
    print(f"Relatório salvo em: {report_path.absolute()}")
    print("\n" + report)

if __name__ == "__main__":
    main()
