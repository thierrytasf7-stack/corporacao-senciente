#!/usr/bin/env python3
"""
Script para verificar logs salvos automaticamente pelo sistema
"""

import os
import glob
import json
import time
from datetime import datetime

def check_local_storage_logs():
    """Verifica logs salvos no localStorage (via navegador)"""
    print("🔍 Verificando logs no localStorage...")
    
    # Verificar se há arquivos de backup do localStorage
    backup_files = glob.glob("*.json")
    localStorage_files = [f for f in backup_files if "console-log" in f.lower()]
    
    if localStorage_files:
        print(f"✅ Encontrados {len(localStorage_files)} arquivos de backup:")
        for file in sorted(localStorage_files, reverse=True):
            file_size = os.path.getsize(file)
            file_time = datetime.fromtimestamp(os.path.getmtime(file))
            print(f"   📄 {file} ({file_size} bytes) - {file_time.strftime('%H:%M:%S')}")
    else:
        print("❌ Nenhum arquivo de backup do localStorage encontrado")

def check_backend_logs():
    """Verifica logs salvos no backend"""
    print("\n🔍 Verificando logs no backend...")
    
    # Verificar diretório de logs do backend
    backend_logs_dir = "backend/logs"
    if os.path.exists(backend_logs_dir):
        log_files = glob.glob(f"{backend_logs_dir}/LOG-CONSOLE-*.json")
        
        if log_files:
            print(f"✅ Encontrados {len(log_files)} arquivos de log no backend:")
            for file in sorted(log_files, reverse=True):
                file_size = os.path.getsize(file)
                file_time = datetime.fromtimestamp(os.path.getmtime(file))
                print(f"   📄 {os.path.basename(file)} ({file_size} bytes) - {file_time.strftime('%H:%M:%S')}")
                
                # Ler e analisar o último arquivo
                if file == sorted(log_files, reverse=True)[0]:
                    try:
                        with open(file, 'r', encoding='utf-8') as f:
                            log_data = json.load(f)
                        
                        print(f"\n📊 Análise do último log do backend:")
                        print(f"   Session ID: {log_data.get('sessionId', 'N/A')}")
                        print(f"   Total de logs: {log_data.get('totalLogs', 0)}")
                        print(f"   Erros: {log_data.get('errors', 0)}")
                        print(f"   Warnings: {log_data.get('warnings', 0)}")
                        print(f"   Início: {log_data.get('startTime', 'N/A')}")
                        print(f"   Fim: {log_data.get('endTime', 'N/A')}")
                        
                        # Mostrar alguns logs de exemplo
                        logs = log_data.get('logs', [])
                        if logs:
                            print(f"\n📝 Últimos 5 logs do backend:")
                            for i, log in enumerate(logs[-5:], 1):
                                timestamp = log.get('timestamp', 'N/A')
                                level = log.get('level', 'N/A').upper()
                                message = log.get('message', 'N/A')[:100]
                                print(f"   {i}. [{timestamp}] {level}: {message}...")
                    
                    except Exception as e:
                        print(f"   ❌ Erro ao ler arquivo: {e}")
        else:
            print("❌ Nenhum arquivo de log encontrado no backend")
    else:
        print("❌ Diretório de logs do backend não encontrado")

def check_all_logs():
    """Verifica todos os tipos de logs"""
    print("🚀 Verificador de Logs Automáticos - AURA Bot")
    print("=" * 60)
    
    # Verificar localStorage
    check_local_storage_logs()
    
    # Verificar backend
    check_backend_logs()
    
    # Verificar logs gerais
    print("\n🔍 Verificando logs gerais...")
    all_log_files = glob.glob("**/LOG-CONSOLE-*.json", recursive=True)
    
    if all_log_files:
        print(f"✅ Total de {len(all_log_files)} arquivos de log encontrados:")
        for file in sorted(all_log_files, reverse=True):
            file_size = os.path.getsize(file)
            file_time = datetime.fromtimestamp(os.path.getmtime(file))
            print(f"   📄 {file} ({file_size} bytes) - {file_time.strftime('%H:%M:%S')}")
    else:
        print("❌ Nenhum arquivo de log encontrado em todo o projeto")
        print("\n💡 Para testar o sistema:")
        print("   1. Abra o arquivo test-log.html no navegador")
        print("   2. Execute os testes clicando nos botões")
        print("   3. Os logs serão salvos automaticamente a cada 5 segundos")

def monitor_new_logs():
    """Monitora a criação de novos logs"""
    print("\n👀 Monitorando criação de novos logs...")
    print("   (Pressione Ctrl+C para parar)")
    
    initial_files = set(glob.glob("**/LOG-CONSOLE-*.json", recursive=True))
    
    try:
        while True:
            time.sleep(3)
            current_files = set(glob.glob("**/LOG-CONSOLE-*.json", recursive=True))
            new_files = current_files - initial_files
            
            if new_files:
                for file in new_files:
                    file_size = os.path.getsize(file)
                    file_time = datetime.fromtimestamp(os.path.getmtime(file))
                    print(f"🆕 Novo arquivo de log: {file} ({file_size} bytes) - {file_time.strftime('%H:%M:%S')}")
                    
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
    check_all_logs()
    
    print("\n" + "=" * 60)
    choice = input("Deseja monitorar novos logs? (s/n): ").lower().strip()
    
    if choice in ['s', 'sim', 'y', 'yes']:
        monitor_new_logs()
    else:
        print("✅ Verificação concluída!")

if __name__ == "__main__":
    main()
