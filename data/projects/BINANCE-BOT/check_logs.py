#!/usr/bin/env python3
"""
Script para verificar se os logs estão sendo gerados pelo sistema
"""

import os
import glob
import json
import time
from datetime import datetime

def check_log_files():
    """Verifica se há arquivos de log sendo gerados"""
    print("🔍 Verificando arquivos de log...")
    
    # Procurar por arquivos LOG-CONSOLE-*.json
    log_files = glob.glob("LOG-CONSOLE-*.json")
    
    if log_files:
        print(f"✅ Encontrados {len(log_files)} arquivos de log:")
        for file in sorted(log_files, reverse=True):
            file_size = os.path.getsize(file)
            file_time = datetime.fromtimestamp(os.path.getmtime(file))
            print(f"   📄 {file} ({file_size} bytes) - {file_time.strftime('%H:%M:%S')}")
            
            # Ler e analisar o último arquivo
            if file == sorted(log_files, reverse=True)[0]:
                try:
                    with open(file, 'r', encoding='utf-8') as f:
                        log_data = json.load(f)
                    
                    print(f"\n📊 Análise do último log ({file}):")
                    print(f"   Session ID: {log_data.get('sessionId', 'N/A')}")
                    print(f"   Total de logs: {log_data.get('totalLogs', 0)}")
                    print(f"   Erros: {log_data.get('errors', 0)}")
                    print(f"   Warnings: {log_data.get('warnings', 0)}")
                    print(f"   Início: {log_data.get('startTime', 'N/A')}")
                    print(f"   Fim: {log_data.get('endTime', 'N/A')}")
                    
                    # Mostrar alguns logs de exemplo
                    logs = log_data.get('logs', [])
                    if logs:
                        print(f"\n📝 Últimos 5 logs:")
                        for i, log in enumerate(logs[-5:], 1):
                            timestamp = log.get('timestamp', 'N/A')
                            level = log.get('level', 'N/A').upper()
                            message = log.get('message', 'N/A')[:100]
                            print(f"   {i}. [{timestamp}] {level}: {message}...")
                    
                except Exception as e:
                    print(f"   ❌ Erro ao ler arquivo: {e}")
    else:
        print("❌ Nenhum arquivo de log encontrado")
        print("💡 Certifique-se de que:")
        print("   1. O arquivo test-log.html foi aberto no navegador")
        print("   2. Os testes foram executados")
        print("   3. O sistema de log está funcionando")

def monitor_logs():
    """Monitora a criação de novos logs"""
    print("\n👀 Monitorando criação de novos logs...")
    print("   (Pressione Ctrl+C para parar)")
    
    initial_files = set(glob.glob("LOG-CONSOLE-*.json"))
    
    try:
        while True:
            time.sleep(2)
            current_files = set(glob.glob("LOG-CONSOLE-*.json"))
            new_files = current_files - initial_files
            
            if new_files:
                for file in new_files:
                    file_size = os.path.getsize(file)
                    print(f"🆕 Novo arquivo de log: {file} ({file_size} bytes)")
                    
                    # Ler o novo arquivo
                    try:
                        with open(file, 'r', encoding='utf-8') as f:
                            log_data = json.load(f)
                        
                        print(f"   📊 Logs: {log_data.get('totalLogs', 0)}, Erros: {log_data.get('errors', 0)}")
                        
                        # Mostrar último log
                        logs = log_data.get('logs', [])
                        if logs:
                            last_log = logs[-1]
                            print(f"   📝 Último: [{last_log.get('level', 'N/A').upper()}] {last_log.get('message', 'N/A')[:80]}...")
                    
                    except Exception as e:
                        print(f"   ❌ Erro ao ler: {e}")
                
                initial_files = current_files
            
    except KeyboardInterrupt:
        print("\n⏹️ Monitoramento interrompido")

def main():
    """Função principal"""
    print("🚀 Verificador de Sistema de Log - AURA Bot")
    print("=" * 50)
    
    # Verificar arquivos existentes
    check_log_files()
    
    # Perguntar se quer monitorar
    print("\n" + "=" * 50)
    choice = input("Deseja monitorar novos logs? (s/n): ").lower().strip()
    
    if choice in ['s', 'sim', 'y', 'yes']:
        monitor_logs()
    else:
        print("✅ Verificação concluída!")

if __name__ == "__main__":
    main()
