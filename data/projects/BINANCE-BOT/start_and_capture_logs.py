#!/usr/bin/env python3
"""
Script para iniciar serviços e capturar logs REAIS em tempo real
"""

import subprocess
import time
import threading
import sys
import os
from simple_real_logger import SimpleRealLogger

class ServiceManager:
    def __init__(self):
        self.frontend_process = None
        self.backend_process = None
        self.logger = SimpleRealLogger()
        self.running = False
        
    def start_frontend(self):
        """Inicia o frontend"""
        print("🚀 Iniciando frontend...")
        try:
            self.frontend_process = subprocess.Popen(
                ['npm', 'run', 'dev'],
                cwd='frontend',
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True
            )
            print("✅ Frontend iniciado")
            return True
        except Exception as e:
            print(f"❌ Erro ao iniciar frontend: {e}")
            return False
    
    def start_backend(self):
        """Inicia o backend"""
        print("🚀 Iniciando backend...")
        try:
            self.backend_process = subprocess.Popen(
                ['npm', 'run', 'dev'],
                cwd='backend',
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True
            )
            print("✅ Backend iniciado")
            return True
        except Exception as e:
            print(f"❌ Erro ao iniciar backend: {e}")
            return False
    
    def monitor_frontend_output(self):
        """Monitora a saída do frontend"""
        if self.frontend_process:
            print("📊 Monitorando frontend...")
            for line in iter(self.frontend_process.stdout.readline, ''):
                if line:
                    print(f"Frontend: {line.strip()}")
                    # Capturar logs específicos do frontend
                    if 'error' in line.lower():
                        self.logger.logs.append({
                            "timestamp": time.strftime('%Y-%m-%dT%H:%M:%S'),
                            "level": "error",
                            "message": f"Frontend Error: {line.strip()}",
                            "url": "frontend",
                            "source": "frontend"
                        })
                        self.logger.errors.append(self.logger.logs[-1])
    
    def monitor_backend_output(self):
        """Monitora a saída do backend"""
        if self.backend_process:
            print("📊 Monitorando backend...")
            for line in iter(self.backend_process.stdout.readline, ''):
                if line:
                    print(f"Backend: {line.strip()}")
                    # Capturar logs específicos do backend
                    if 'error' in line.lower():
                        self.logger.logs.append({
                            "timestamp": time.strftime('%Y-%m-%dT%H:%M:%S'),
                            "level": "error",
                            "message": f"Backend Error: {line.strip()}",
                            "url": "backend",
                            "source": "backend"
                        })
                        self.logger.errors.append(self.logger.logs[-1])
    
    def start_services(self):
        """Inicia todos os serviços"""
        print("🔄 Iniciando serviços...")
        
        # Iniciar backend primeiro
        if not self.start_backend():
            return False
        
        # Aguardar backend inicializar
        time.sleep(5)
        
        # Iniciar frontend
        if not self.start_frontend():
            return False
        
        # Aguardar frontend inicializar
        time.sleep(10)
        
        print("✅ Todos os serviços iniciados")
        return True
    
    def run_with_logging(self, interval=15):
        """Executa serviços com captura de logs"""
        print("🚀 Iniciando sistema com captura de logs...")
        print("=" * 60)
        
        # Iniciar serviços
        if not self.start_services():
            print("❌ Falha ao iniciar serviços")
            return
        
        self.running = True
        
        # Iniciar threads de monitoramento
        frontend_thread = threading.Thread(target=self.monitor_frontend_output)
        backend_thread = threading.Thread(target=self.monitor_backend_output)
        
        frontend_thread.daemon = True
        backend_thread.daemon = True
        
        frontend_thread.start()
        backend_thread.start()
        
        print(f"🔄 Captura de logs ativa - Intervalo: {interval} segundos")
        print("Pressione Ctrl+C para parar")
        print("=" * 60)
        
        # Loop principal de captura
        while self.running:
            try:
                # Capturar logs do sistema
                self.logger.capture_system_logs()
                self.logger.capture_network_logs()
                
                # Salvar logs
                report = self.logger.generate_real_report()
                self.logger.save_to_file(report)
                
                print(f"⏰ Próxima captura em {interval} segundos...")
                time.sleep(interval)
                
            except KeyboardInterrupt:
                print("\n🛑 Parando sistema...")
                self.running = False
                break
            except Exception as e:
                print(f"❌ Erro na captura: {e}")
                time.sleep(interval)
        
        # Parar serviços
        self.stop_services()
    
    def stop_services(self):
        """Para todos os serviços"""
        print("🛑 Parando serviços...")
        
        if self.frontend_process:
            self.frontend_process.terminate()
            print("✅ Frontend parado")
        
        if self.backend_process:
            self.backend_process.terminate()
            print("✅ Backend parado")
        
        self.running = False

def main():
    """Função principal"""
    manager = ServiceManager()
    
    if len(sys.argv) > 1 and sys.argv[1] == '--interval':
        interval = int(sys.argv[2]) if len(sys.argv) > 2 else 15
        manager.run_with_logging(interval)
    else:
        manager.run_with_logging()

if __name__ == "__main__":
    main()
