#!/usr/bin/env python3
"""
LIST-DIANA-PROCS - CORPORAÇÃO SENCIENTE
Script para listar detalhes completos dos processos Diana.
"""

import psutil
import subprocess
import sys
from pathlib import Path
from datetime import datetime

def get_diana_process_details():
    """Obter detalhes completos dos processos Diana"""
    diana_procs = []
    for proc in psutil.process_iter(['pid', 'name', 'status', 'cpu_percent', 'memory_percent',
                                     'create_time', 'num_threads', 'open_files', 'connections']):
        try:
            if 'diana' in proc.info['name'].lower():
                # Obter tempo de criação
                create_time = datetime.fromtimestamp(proc.info['create_time']).strftime('%Y-%m-%d %H:%M:%S')
                proc.info['create_time'] = create_time

                # Obter arquivos abertos
                try:
                    open_files = len(proc.open_files())
                except (psutil.AccessDenied, psutil.NoSuchProcess):
                    open_files = 'N/A'

                proc.info['open_files'] = open_files

                # Obter conexões de rede
                try:
                    connections = len(proc.connections())
                except (psutil.AccessDenied, psutil.NoSuchProcess):
                    connections = 'N/A'

                proc.info['connections'] = connections

                diana_procs.append(proc.info)
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue
    return diana_procs

def get_diana_service_details():
    """Obter detalhes dos serviços Diana"""
    try:
        # Para Windows
        result = subprocess.run(
            ['sc', 'query', 'type=', 'service', 'name=', '*diana*'],
            capture_output=True, text=True, timeout=10
        )
        services = result.stdout
    except (subprocess.TimeoutExpired, FileNotFoundError):
        try:
            # Para Linux/macOS
            result = subprocess.run(
                ['systemctl', 'list-units', '--type=service', '*diana*'],
                capture_output=True, text=True, timeout=10
            )
            services = result.stdout
        except (subprocess.TimeoutExpired, FileNotFoundError):
            services = ""

    return services

def main():
    print("CORPORAÇÃO SENCIENTE - LIST DIANA PROCESSES")
    print("=" * 70)

    # Verificar processos Diana
    print("\n[1/2] DETALHES DOS PROCESSOS DIANA:")
    diana_procs = get_diana_process_details()

    if diana_procs:
        print(f"{'PID':<8} {'Nome':<20} {'Status':<12} {'CPU %':<8} {'Mem %':<8} {'Desde':<20} {'Threads':<10} {'Arquivos':<10} {'Conexões'}")
        print("-" * 100)
        for proc in diana_procs:
            print(f"{proc['pid']:<8} {proc['name']:<20} {proc['status']:<12} {proc['cpu_percent']:<8.1f} {proc['memory_percent']:<8.1f} "
                  f"{proc['create_time']:<20} {proc['num_threads']:<10} {str(proc['open_files']):<10} {proc['connections']}")
    else:
        print("  Nenhum processo Diana encontrado")

    # Verificar serviços Diana
    print("\n[2/2] DETALHES DOS SERVIÇOS DIANA:")
    services = get_diana_service_details()

    if services:
        print(services)
    else:
        print("  Nenhum serviço Diana encontrado")

    # Resumo
    total_procs = len(diana_procs)
    print("\n" + "=" * 70)
    print(f"RESUMO: {total_procs} processo(s) Diana encontrado(s)")

    if total_procs > 0:
        print("STATUS: DIANA ATIVO")
        return 0
    else:
        print("STATUS: DIANA INATIVO")
        return 1

if __name__ == "__main__":
    sys.exit(main())
