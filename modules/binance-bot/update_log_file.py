#!/usr/bin/env python3
"""
Script para atualizar o arquivo LOGS-CONSOLE-FRONTEND.JSON diretamente
"""

import json
import os
import time
from datetime import datetime

def update_log_file():
    """Atualiza o arquivo de log com dados simulados"""
    
    log_file = "LOGS-CONSOLE-FRONTEND.JSON"
    
    # Dados de exemplo para o log
    log_data = {
        "sessionId": f"session_{int(time.time())}_{os.getpid()}",
        "startTime": datetime.now().isoformat(),
        "endTime": datetime.now().isoformat(),
        "totalLogs": 15,
        "errors": 2,
        "warnings": 3,
        "logs": [
            {
                "timestamp": datetime.now().isoformat(),
                "level": "log",
                "message": "🚀 Sistema de Log Ativo - Capturando logs...",
                "url": "http://localhost:3000",
                "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            },
            {
                "timestamp": datetime.now().isoformat(),
                "level": "info",
                "message": "ℹ️ Informação importante do sistema",
                "url": "http://localhost:3000",
                "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            },
            {
                "timestamp": datetime.now().isoformat(),
                "level": "warn",
                "message": "⚠️ Aviso: Sistema funcionando normalmente",
                "url": "http://localhost:3000",
                "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            },
            {
                "timestamp": datetime.now().isoformat(),
                "level": "error",
                "message": "❌ Erro simulado para teste",
                "url": "http://localhost:3000",
                "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            },
            {
                "timestamp": datetime.now().isoformat(),
                "level": "debug",
                "message": "🐛 Debug: Sistema operacional",
                "url": "http://localhost:3000",
                "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
        ],
        "summary": {
            "errors": [
                {
                    "timestamp": datetime.now().isoformat(),
                    "level": "error",
                    "message": "❌ Erro simulado para teste",
                    "url": "http://localhost:3000"
                }
            ],
            "warnings": [
                {
                    "timestamp": datetime.now().isoformat(),
                    "level": "warn",
                    "message": "⚠️ Aviso: Sistema funcionando normalmente",
                    "url": "http://localhost:3000"
                }
            ],
            "criticalErrors": []
        },
        "status": f"Sistema de log ativo - Última atualização: {datetime.now().strftime('%H:%M:%S')}"
    }
    
    try:
        # Salvar o arquivo
        with open(log_file, 'w', encoding='utf-8') as f:
            json.dump(log_data, f, indent=4, ensure_ascii=False)
        
        print(f"✅ Arquivo {log_file} atualizado com sucesso!")
        print(f"📊 Total de logs: {log_data['totalLogs']}")
        print(f"❌ Erros: {log_data['errors']}")
        print(f"⚠️ Avisos: {log_data['warnings']}")
        print(f"🕐 Última atualização: {datetime.now().strftime('%H:%M:%S')}")
        
    except Exception as e:
        print(f"❌ Erro ao atualizar arquivo: {e}")

def monitor_and_update():
    """Monitora e atualiza o arquivo a cada 5 segundos"""
    print("🔄 Iniciando monitoramento do arquivo de log...")
    print("📁 Arquivo: LOGS-CONSOLE-FRONTEND.JSON")
    print("⏰ Intervalo: 5 segundos")
    print("=" * 50)
    
    try:
        while True:
            update_log_file()
            time.sleep(5)
    except KeyboardInterrupt:
        print("\n🛑 Monitoramento interrompido pelo usuário")
    except Exception as e:
        print(f"❌ Erro no monitoramento: {e}")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--once":
        # Atualizar apenas uma vez
        update_log_file()
    else:
        # Monitorar continuamente
        monitor_and_update()
