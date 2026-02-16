#!/usr/bin/env python3
"""
CHECK-DIANA-STATUS - CORPORAÇÃO SENCIENTE
Script para verificar o status dos processos Diana no sistema.
"""

import psutil
import subprocess
import sys
from pathlib import Path

def get_diana_processes():
    """Obter processos Diana usando psutil"""
    diana_procs = []
    for proc in psutil.process_iter(['name', 'pid', 'status', 'cpu_percent', 'memory_percent']):
        try:
            if 'diana' in proc.info['name'].lower():
                diana_procs.append(proc.info)
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue
    return diana_procs

def get_diana_services():
    """Obter serviços Diana usando subprocess (cross-platform)"""
    try:
        # Para Windows
        result = subprocess.run(
            ['sc', 'query', 'type=', 'service', 'state=', 'running', 'name=', '*diana*'],
            capture_output=True, text=True, timeout=10
        )
        services = result.stdout
    except (subprocess.TimeoutExpired, FileNotFoundError):
        try:
            # Para Linux/macOS
            result = subprocess.run(
                ['systemctl', 'list-units', '--type=service', '--state=running', '*diana*'],
                capture_output=True, text=True, timeout=10
            )
            services = result.stdout
        except (subprocess.TimeoutExpired, FileNotFoundError):
            services = ""

    return services

def main():
    print("CORPORAÇÃO SENCIENTE - CHECK DIANA STATUS")
    print("=" * 50)

    # Verificar processos Diana
    print("\n[1/2] PROCESSOS DIANA ATIVOS:")
    diana_procs = get_diana_processes()

    if diana_procs:
        for proc in diana_procs:
            print(f"  PID: {proc['pid']} | Nome: {proc['name']} | Status: {proc['status']} | "
                  f"CPU: {proc['cpu_percent']}% | Mem: {proc['memory_percent']:.1f}%")
    else:
        print("  Nenhum processo Diana ativo encontrado")

    # Verificar serviços Diana
    print("\n[2/2] SERVIÇOS DIANA ATIVOS:")
    services = get_diana_services()

    if services:
        print(services)
    else:
        print("  Nenhum serviço Diana ativo encontrado")

    # Resumo
    total_procs = len(diana_procs)
    print("\n" + "=" * 50)
    print(f"RESUMO: {total_procs} processo(s) Diana ativo(s)")

    if total_procs > 0:
        print("STATUS: DIANA ATIVO")
        return 0
    else:
        print("STATUS: DIANA INATIVO")
        return 1

if __name__ == "__main__":
    sys.exit(main())
