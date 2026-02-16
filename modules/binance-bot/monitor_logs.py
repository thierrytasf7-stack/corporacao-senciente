#!/usr/bin/env python3
"""
Monitor de Logs do Frontend - Sistema AURA
Monitora logs em tempo real para debug de erros de posições
"""

import json
import time
import os
from datetime import datetime
from pathlib import Path

def load_logs():
    """Carrega logs do arquivo JSON"""
    log_file = Path("logs/LOGS-CONSOLE-FRONTEND.JSON")
    if not log_file.exists():
        return {"logs": [], "totalLogs": 0}
    
    try:
        with open(log_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ Erro ao carregar logs: {e}")
        return {"logs": [], "totalLogs": 0}

def print_log_entry(log_entry):
    """Imprime uma entrada de log formatada"""
    timestamp = log_entry.get('timestamp', '')
    level = log_entry.get('level', 'info')
    category = log_entry.get('category', 'general')
    message = log_entry.get('message', '')
    
    # Cores para diferentes níveis
    colors = {
        'error': '\033[91m',  # Vermelho
        'warn': '\033[93m',   # Amarelo
        'info': '\033[94m',   # Azul
        'debug': '\033[90m',  # Cinza
        'trading': '\033[92m', # Verde
        'position': '\033[95m', # Magenta
        'api': '\033[96m'     # Ciano
    }
    
    reset = '\033[0m'
    color = colors.get(level, colors.get(category, '\033[0m'))
    
    # Formatar timestamp
    try:
        dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        formatted_time = dt.strftime('%H:%M:%S')
    except:
        formatted_time = timestamp
    
    # Ícones para categorias
    icons = {
        'trading': '📈',
        'position': '💼',
        'api': '🌐',
        'error': '❌',
        'warn': '⚠️',
        'info': 'ℹ️',
        'debug': '🔍'
    }
    
    icon = icons.get(category, icons.get(level, '📝'))
    
    print(f"{color}{icon} [{formatted_time}] {level.upper()}/{category.upper()}: {message}{reset}")

def monitor_logs():
    """Monitora logs em tempo real"""
    print("🔧 Monitor de Logs do Frontend - Sistema AURA")
    print("=" * 60)
    print("📊 Monitorando logs em tempo real...")
    print("🎯 Foco em erros de posições e trading")
    print("=" * 60)
    
    last_log_count = 0
    last_modified = 0
    
    while True:
        try:
            log_file = Path("logs/LOGS-CONSOLE-FRONTEND.JSON")
            
            # Verificar se arquivo foi modificado
            if log_file.exists():
                current_modified = log_file.stat().st_mtime
                
                if current_modified > last_modified:
                    logs_data = load_logs()
                    logs = logs_data.get('logs', [])
                    current_log_count = len(logs)
                    
                    # Mostrar apenas novos logs
                    if current_log_count > last_log_count:
                        new_logs = logs[last_log_count:]
                        
                        print(f"\n🆕 {len(new_logs)} novos logs detectados:")
                        print("-" * 60)
                        
                        for log_entry in new_logs:
                            print_log_entry(log_entry)
                        
                        # Estatísticas
                        total_logs = logs_data.get('totalLogs', 0)
                        errors = logs_data.get('errors', 0)
                        trading_errors = logs_data.get('tradingErrors', 0)
                        api_errors = logs_data.get('apiErrors', 0)
                        
                        print("-" * 60)
                        print(f"📊 Estatísticas: Total={total_logs} | Erros={errors} | Trading={trading_errors} | API={api_errors}")
                        
                        last_log_count = current_log_count
                    
                    last_modified = current_modified
                else:
                    # Mostrar status a cada 30 segundos
                    if int(time.time()) % 30 == 0:
                        logs_data = load_logs()
                        total_logs = logs_data.get('totalLogs', 0)
                        errors = logs_data.get('errors', 0)
                        trading_errors = logs_data.get('tradingErrors', 0)
                        api_errors = logs_data.get('apiErrors', 0)
                        
                        print(f"⏰ [{datetime.now().strftime('%H:%M:%S')}] Status: Total={total_logs} | Erros={errors} | Trading={trading_errors} | API={api_errors}")
            else:
                print(f"⏳ [{datetime.now().strftime('%H:%M:%S')}] Aguardando arquivo de logs...")
            
            time.sleep(1)
            
        except KeyboardInterrupt:
            print("\n\n🛑 Monitor interrompido pelo usuário")
            break
        except Exception as e:
            print(f"❌ Erro no monitor: {e}")
            time.sleep(5)

def show_log_summary():
    """Mostra resumo dos logs atuais"""
    logs_data = load_logs()
    logs = logs_data.get('logs', [])
    
    print("📋 Resumo dos Logs Atuais")
    print("=" * 60)
    
    # Estatísticas gerais
    total_logs = len(logs)
    errors = len([log for log in logs if log.get('level') == 'error'])
    warnings = len([log for log in logs if log.get('level') == 'warn'])
    trading_logs = len([log for log in logs if log.get('category') == 'trading'])
    position_logs = len([log for log in logs if log.get('category') == 'position'])
    api_logs = len([log for log in logs if log.get('category') == 'api'])
    
    print(f"📊 Total de logs: {total_logs}")
    print(f"❌ Erros: {errors}")
    print(f"⚠️ Avisos: {warnings}")
    print(f"📈 Trading: {trading_logs}")
    print(f"💼 Posições: {position_logs}")
    print(f"🌐 API: {api_logs}")
    
    # Últimos 10 logs
    print("\n🕒 Últimos 10 logs:")
    print("-" * 60)
    
    for log_entry in logs[-10:]:
        print_log_entry(log_entry)
    
    # Logs de erro mais recentes
    error_logs = [log for log in logs if log.get('level') == 'error']
    if error_logs:
        print(f"\n🚨 Últimos {min(5, len(error_logs))} erros:")
        print("-" * 60)
        
        for log_entry in error_logs[-5:]:
            print_log_entry(log_entry)

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "summary":
        show_log_summary()
    else:
        monitor_logs()
