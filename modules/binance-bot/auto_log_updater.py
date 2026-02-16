#!/usr/bin/env python3
"""
Script AUTOMÁTICO para atualizar o arquivo LOGS-CONSOLE-FRONTEND.JSON
Sistema totalmente autônomo - sem interação do usuário
"""

import json
import os
import time
from datetime import datetime
import threading

class AutoLogUpdater:
    def __init__(self):
        self.log_file = "LOGS-CONSOLE-FRONTEND.JSON"
        self.running = False
        self.log_counter = 0
        
    def update_log_file(self):
        """Atualiza o arquivo de log com dados simulados"""
        
        self.log_counter += 1
        
        # Dados de exemplo para o log
        log_data = {
            "sessionId": f"auto_session_{int(time.time())}_{os.getpid()}",
            "startTime": datetime.now().isoformat(),
            "endTime": datetime.now().isoformat(),
            "totalLogs": self.log_counter * 5,
            "errors": max(1, self.log_counter % 3),
            "warnings": max(1, self.log_counter % 2),
            "logs": [
                {
                    "timestamp": datetime.now().isoformat(),
                    "level": "log",
                    "message": f"🚀 Sistema de Log Automático - Atualização #{self.log_counter}",
                    "url": "http://localhost:13000",
                    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                },
                {
                    "timestamp": datetime.now().isoformat(),
                    "level": "info",
                    "message": f"ℹ️ Informação automática - Ciclo {self.log_counter}",
                    "url": "http://localhost:13000",
                    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                },
                {
                    "timestamp": datetime.now().isoformat(),
                    "level": "warn",
                    "message": f"⚠️ Aviso automático - Sistema funcionando",
                    "url": "http://localhost:13000",
                    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                },
                {
                    "timestamp": datetime.now().isoformat(),
                    "level": "error",
                    "message": f"❌ Erro simulado - Ciclo {self.log_counter}",
                    "url": "http://localhost:13000",
                    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                },
                {
                    "timestamp": datetime.now().isoformat(),
                    "level": "debug",
                    "message": f"🐛 Debug automático - Operação {self.log_counter}",
                    "url": "http://localhost:13000",
                    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                }
            ],
            "summary": {
                "errors": [
                    {
                        "timestamp": datetime.now().isoformat(),
                        "level": "error",
                        "message": f"❌ Erro simulado - Ciclo {self.log_counter}",
                        "url": "http://localhost:13000"
                    }
                ],
                "warnings": [
                    {
                        "timestamp": datetime.now().isoformat(),
                        "level": "warn",
                        "message": f"⚠️ Aviso automático - Sistema funcionando",
                        "url": "http://localhost:13000"
                    }
                ],
                "criticalErrors": []
            },
            "status": f"Sistema automático ativo - Atualização #{self.log_counter} - {datetime.now().strftime('%H:%M:%S')}"
        }
        
        try:
            # Salvar o arquivo
            with open(self.log_file, 'w', encoding='utf-8') as f:
                json.dump(log_data, f, indent=4, ensure_ascii=False)
            
            print(f"✅ Atualização #{self.log_counter} - {datetime.now().strftime('%H:%M:%S')} - Logs: {log_data['totalLogs']}")
            
        except Exception as e:
            print(f"❌ Erro na atualização #{self.log_counter}: {e}")
    
    def start_monitoring(self):
        """Inicia o monitoramento automático"""
        print("🤖 SISTEMA AUTOMÁTICO INICIADO")
        print("📁 Arquivo: LOGS-CONSOLE-FRONTEND.JSON")
        print("⏰ Intervalo: 5 segundos")
        print("🔄 Modo: TOTALMENTE AUTÔNOMO")
        print("=" * 60)
        
        self.running = True
        
        # Primeira atualização imediata
        self.update_log_file()
        
        # Loop automático
        while self.running:
            try:
                time.sleep(5)  # Aguardar 5 segundos
                if self.running:
                    self.update_log_file()
            except KeyboardInterrupt:
                print("\n🛑 Sistema interrompido")
                self.running = False
                break
            except Exception as e:
                print(f"❌ Erro no loop: {e}")
                time.sleep(5)  # Continuar mesmo com erro
    
    def stop_monitoring(self):
        """Para o monitoramento"""
        self.running = False
        print("🛑 Sistema automático parado")

# Instância global
auto_updater = AutoLogUpdater()

def start_auto_system():
    """Inicia o sistema automático"""
    auto_updater.start_monitoring()

if __name__ == "__main__":
    # Iniciar automaticamente sem perguntas
    start_auto_system()
