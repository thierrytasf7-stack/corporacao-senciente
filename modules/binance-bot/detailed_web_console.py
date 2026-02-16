#!/usr/bin/env python3
"""
Sistema de Captura de Console Web Simplificado - AURA BOT
Captura logs em tempo real do frontend e mostra apenas as mensagens principais
"""

import json
import time
import requests
import subprocess
import sys
from datetime import datetime
from typing import Dict, List, Any
import threading
import queue

class DetailedConsoleCapture:
    def __init__(self, update_interval: int = 5):
        self.update_interval = update_interval
        self.frontend_url = "http://localhost:13000"
        self.log_file = "logs/LOGS-CONSOLE-FRONTEND.JSON"
        self.session_id = f"detailed_web_{int(time.time())}"
        self.start_time = datetime.now().isoformat()
        self.log_queue = queue.Queue()
        self.is_running = False
        
    def log_message(self, message: str):
        """Adiciona mensagem ao log (apenas a mensagem principal)"""
        self.log_queue.put(message)
        
    def capture_real_console_logs(self):
        """Captura logs reais do console web"""
        try:
            # Tentar capturar logs via API do backend (logs enviados pelo frontend)
            try:
                # Primeiro, verificar se há logs no backend
                response = requests.get("http://localhost:13001/api/v1/logs", timeout=5)
                if response.status_code == 200:
                    logs_data = response.json()
                    if logs_data and "logs" in logs_data and logs_data["logs"]:
                        for log in logs_data["logs"]:
                            # Extrair apenas a mensagem principal
                            message = log.get("message", "")
                            if message and message.strip():
                                self.log_message(message.strip())
                        return True
                else:
                    # Se não há logs via API, verificar logs do container
                    print(f"⚠️ API logs endpoint retornou {response.status_code}")
            except Exception as e:
                print(f"⚠️ Erro ao capturar logs via API: {e}")
            
            # Capturar logs do container (proxy logs) como fallback
            result = subprocess.run(
                ["docker", "logs", "aura-frontend", "--tail", "30"],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode == 0:
                lines = result.stdout.strip().split('\n')
                for line in lines:
                    if line.strip():
                        # Analisar linha do log e extrair apenas a mensagem
                        line_lower = line.lower()
                        
                        # Filtrar apenas logs importantes e extrair mensagem principal
                        if any(keyword in line_lower for keyword in [
                            "error", "404", "500", "failed", "refused"
                        ]):
                            # Para erros, manter a mensagem completa
                            self.log_message(line.strip())
                        elif "global logger" in line_lower or "console" in line_lower:
                            # Para logs normais, extrair apenas a parte da mensagem
                            # Remover prefixos comuns de timestamp e metadados
                            clean_message = line.strip()
                            
                            # Remover timestamps no início da linha
                            if clean_message and clean_message[0].isdigit():
                                # Pular até encontrar o primeiro caractere não-numérico após timestamp
                                i = 0
                                while i < len(clean_message) and (clean_message[i].isdigit() or clean_message[i] in ':-.T'):
                                    i += 1
                                clean_message = clean_message[i:].strip()
                            
                            # Remover prefixos comuns de log
                            prefixes_to_remove = [
                                "[INFO]", "[ERROR]", "[WARN]", "[DEBUG]",
                                "INFO:", "ERROR:", "WARN:", "DEBUG:",
                                "console:", "logger:", "web_console:"
                            ]
                            
                            for prefix in prefixes_to_remove:
                                if clean_message.upper().startswith(prefix):
                                    clean_message = clean_message[len(prefix):].strip()
                            
                            if clean_message:
                                self.log_message(clean_message)
                
                return True
                
        except Exception as e:
            print(f"⚠️ Erro ao capturar logs: {e}")
        
        return False
            
    def check_frontend_status(self) -> bool:
        """Verifica se o frontend está funcionando"""
        try:
            response = requests.get(self.frontend_url, timeout=5)
            return response.status_code == 200
        except:
            return False
            
    def check_backend_status(self) -> bool:
        """Verifica se o backend está funcionando"""
        try:
            response = requests.get(f"{self.frontend_url}/api/v1/binance/test-connection", timeout=5)
            return response.status_code == 200
        except:
            return False
            
    def generate_log_report(self) -> Dict[str, Any]:
        """Gera relatório simplificado dos logs"""
        messages = []
        while not self.log_queue.empty():
            try:
                messages.append(self.log_queue.get_nowait())
            except queue.Empty:
                break
                
        # Adicionar logs reais se não houver mensagens na fila
        if not messages:
            self.capture_real_console_logs()
            while not self.log_queue.empty():
                try:
                    messages.append(self.log_queue.get_nowait())
                except queue.Empty:
                    break
        
        # Filtrar mensagens vazias ou duplicadas
        unique_messages = []
        seen_messages = set()
        
        for message in messages:
            if message and message.strip() and message.strip() not in seen_messages:
                unique_messages.append(message.strip())
                seen_messages.add(message.strip())
        
        # Mostrar até 100 mensagens (as mais recentes)
        display_messages = unique_messages[-100:] if len(unique_messages) > 100 else unique_messages
        
        return {
            "sessionId": self.session_id,
            "startTime": self.start_time,
            "endTime": datetime.now().isoformat(),
            "totalMessages": len(unique_messages),
            "displayMessages": len(display_messages),
            "messages": display_messages,
            "status": f"Logs Console Web SIMPLIFICADOS - {datetime.now().strftime('%H:%M:%S')} - Total: {len(unique_messages)} | Exibindo: {len(display_messages)}"
        }
            
    def save_logs_to_file(self, report: Dict[str, Any]):
        """Salva logs no arquivo JSON"""
        try:
            with open(self.log_file, 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=4, ensure_ascii=False)
            print(f"📄 Logs salvos em: {self.log_file}")
        except Exception as e:
            print(f"❌ Erro ao salvar logs: {e}")
            
    def display_console_interface(self):
        """Exibe interface similar ao console da imagem"""
        print("\n" + "="*80)
        print("           CONSOLE WEB SIMPLIFICADO - SISTEMA AURA BINANCE BOT")
        print("="*80)
        print(f"🌐 Frontend: {self.frontend_url}")
        print(f"📝 Arquivo: {self.log_file}")
        print(f"🔄 Atualização: {self.update_interval}s")
        print(f"🆔 Sessão: {self.session_id}")
        print("="*80)
        
        # Status dos serviços
        frontend_status = "✅ ONLINE" if self.check_frontend_status() else "❌ OFFLINE"
        backend_status = "✅ ONLINE" if self.check_backend_status() else "❌ OFFLINE"
        
        print(f"📱 Frontend: {frontend_status}")
        print(f"🔧 Backend:  {backend_status}")
        print("="*80)
        
    def run(self):
        """Executa o sistema de captura"""
        self.is_running = True
        self.display_console_interface()
        
        print("\n🚀 Iniciando captura de logs em tempo real...")
        print("📊 Capturando mensagens REAIS do sistema...")
        print("🛑 Pressione Ctrl+C para parar\n")
        
        try:
            while self.is_running:
                # Gerar relatório
                report = self.generate_log_report()
                
                # Salvar no arquivo
                self.save_logs_to_file(report)
                
                # Mostrar estatísticas
                print(f"📊 [{datetime.now().strftime('%H:%M:%S')}] "
                      f"Mensagens: {report['totalMessages']}")
                
                # Aguardar próximo ciclo
                time.sleep(self.update_interval)
                
        except KeyboardInterrupt:
            print("\n\n🛑 Captura interrompida pelo usuário")
            self.is_running = False
            
        except Exception as e:
            print(f"\n❌ Erro durante captura: {e}")
            self.is_running = False
            
        finally:
            # Salvar log final
            if self.is_running:
                report = self.generate_log_report()
                self.save_logs_to_file(report)
            print("✅ Captura finalizada")

def main():
    if len(sys.argv) > 1:
        try:
            update_interval = int(sys.argv[1])
        except ValueError:
            print("❌ Intervalo inválido. Usando padrão: 5 segundos")
            update_interval = 5
    else:
        update_interval = 5
    
    capture = DetailedConsoleCapture(update_interval)
    capture.run()

if __name__ == "__main__":
    main()
