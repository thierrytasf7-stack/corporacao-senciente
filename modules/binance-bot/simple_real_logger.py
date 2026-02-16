#!/usr/bin/env python3
"""
Script SIMPLES para capturar logs REAIS do sistema
Atualiza LOGS-CONSOLE-FRONTEND.JSON com dados autênticos
"""

import json
import time
import requests
import subprocess
import os
import psutil
from datetime import datetime
import threading

class SimpleRealLogger:
    def __init__(self):
        self.log_file = "LOGS-CONSOLE-FRONTEND.JSON"
        self.session_id = f"real_session_{int(time.time())}"
        self.start_time = datetime.now().isoformat()
        self.logs = []
        self.errors = []
        self.warnings = []
        self.running = False
        
    def check_frontend_status(self):
        """Verifica se o frontend está rodando"""
        urls_to_check = [
            "http://localhost:5173",  # Vite
            "http://localhost:3000",  # React
            "http://localhost:13000", # Docker
        ]
        
        for url in urls_to_check:
            try:
                response = requests.get(url, timeout=2)
                if response.status_code == 200:
                    return url
            except:
                continue
        return None
    
    def find_node_processes(self):
        """Encontra processos Node.js relacionados ao frontend"""
        processes = []
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                if proc.info['name'] == 'node.exe':
                    cmdline = ' '.join(proc.info['cmdline']) if proc.info['cmdline'] else ''
                    if 'vite' in cmdline.lower() or 'react' in cmdline.lower():
                        processes.append({
                            'pid': proc.info['pid'],
                            'cmdline': cmdline,
                            'type': 'FRONTEND'
                        })
            except:
                continue
        return processes
    
    def capture_system_logs(self):
        """Captura logs do sistema"""
        timestamp = datetime.now().isoformat()
        
        # Verificar frontend
        frontend_url = self.check_frontend_status()
        if frontend_url:
            self.logs.append({
                "timestamp": timestamp,
                "level": "info",
                "message": f"Frontend ativo em {frontend_url}",
                "url": frontend_url,
                "source": "system"
            })
        else:
            self.logs.append({
                "timestamp": timestamp,
                "level": "warn",
                "message": "Frontend não está rodando",
                "url": "N/A",
                "source": "system"
            })
            self.warnings.append(self.logs[-1])
        
        # Verificar processos Node.js
        node_processes = self.find_node_processes()
        if node_processes:
            for proc in node_processes:
                self.logs.append({
                    "timestamp": timestamp,
                    "level": "info",
                    "message": f"Processo {proc['type']} ativo (PID: {proc['pid']})",
                    "url": "system",
                    "source": "process"
                })
        else:
            self.logs.append({
                "timestamp": timestamp,
                "level": "error",
                "message": "Nenhum processo Node.js encontrado",
                "url": "system",
                "source": "process"
            })
            self.errors.append(self.logs[-1])
        
        # Verificar portas em uso
        try:
            result = subprocess.run(['netstat', '-ano'], capture_output=True, text=True)
            if result.returncode == 0:
                lines = result.stdout.split('\n')
                for line in lines:
                    if ':5173' in line or ':3000' in line or ':13000' in line:
                        self.logs.append({
                            "timestamp": timestamp,
                            "level": "info",
                            "message": f"Porta em uso: {line.strip()}",
                            "url": "system",
                            "source": "network"
                        })
        except Exception as e:
            self.logs.append({
                "timestamp": timestamp,
                "level": "warn",
                "message": f"Erro ao verificar portas: {str(e)}",
                "url": "system",
                "source": "network"
            })
        
        # Verificar arquivos de log recentes
        try:
            if os.path.exists('frontend'):
                for file in os.listdir('frontend'):
                    if file.endswith('.log') or 'error' in file.lower():
                        file_path = os.path.join('frontend', file)
                        try:
                            with open(file_path, 'r', encoding='utf-8') as f:
                                last_lines = f.readlines()[-5:]  # Últimas 5 linhas
                                for line in last_lines:
                                    if 'error' in line.lower():
                                        self.logs.append({
                                            "timestamp": timestamp,
                                            "level": "error",
                                            "message": f"Log file error: {line.strip()}",
                                            "url": file_path,
                                            "source": "file"
                                        })
                                        self.errors.append(self.logs[-1])
                        except Exception as e:
                            continue
        except Exception as e:
            self.logs.append({
                "timestamp": timestamp,
                "level": "warn",
                "message": f"Erro ao verificar arquivos de log: {str(e)}",
                "url": "system",
                "source": "file"
            })
    
    def capture_network_logs(self):
        """Captura logs de rede"""
        timestamp = datetime.now().isoformat()
        
        # Testar conexões com APIs
        apis_to_test = [
            "http://localhost:3002/health",
            "http://localhost:8000/health",
            "http://localhost:3002/api/test"
        ]
        
        for api_url in apis_to_test:
            try:
                response = requests.get(api_url, timeout=3)
                self.logs.append({
                    "timestamp": timestamp,
                    "level": "info",
                    "message": f"API {api_url} - Status: {response.status_code}",
                    "url": api_url,
                    "source": "api"
                })
            except Exception as e:
                self.logs.append({
                    "timestamp": timestamp,
                    "level": "warn",
                    "message": f"API {api_url} - Erro: {str(e)}",
                    "url": api_url,
                    "source": "api"
                })
                self.warnings.append(self.logs[-1])
    
    def generate_real_report(self):
        """Gera relatório com logs reais"""
        return {
            "sessionId": self.session_id,
            "startTime": self.start_time,
            "endTime": datetime.now().isoformat(),
            "totalLogs": len(self.logs),
            "errors": len(self.errors),
            "warnings": len(self.warnings),
            "logs": self.logs,
            "summary": {
                "errors": self.errors,
                "warnings": self.warnings,
                "criticalErrors": [e for e in self.errors if 'Critical' in e['message'] or 'Fatal' in e['message']]
            },
            "status": f"Logs reais do sistema - {datetime.now().strftime('%H:%M:%S')} - Total: {len(self.logs)}"
        }
    
    def save_to_file(self, report):
        """Salva o relatório no arquivo JSON"""
        try:
            with open(self.log_file, 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=4, ensure_ascii=False)
            
            print(f"✅ Logs reais salvos: {report['totalLogs']} logs, {report['errors']} erros, {report['warnings']} avisos")
            
            if report['errors'] > 0:
                print("🚨 ERROS ENCONTRADOS:")
                for error in report['errors'][:3]:
                    print(f"   • {error['message']}")
            
            return True
        except Exception as e:
            print(f"❌ Erro ao salvar: {e}")
            return False
    
    def start_frontend_if_needed(self):
        """Inicia o frontend se não estiver rodando"""
        if not self.check_frontend_status():
            print("🔄 Iniciando frontend...")
            try:
                # Verificar se o diretório frontend existe
                if not os.path.exists('frontend'):
                    print("❌ Diretório 'frontend' não encontrado")
                    return False
                
                # Verificar se package.json existe
                if not os.path.exists('frontend/package.json'):
                    print("❌ package.json não encontrado no frontend")
                    return False
                
                subprocess.Popen(
                    ['npm', 'run', 'dev'],
                    cwd='frontend',
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL
                )
                time.sleep(5)  # Aguardar inicialização
                return True
            except Exception as e:
                print(f"⚠️ Erro ao iniciar frontend: {e}")
                return False
        return True
    
    def run_single_capture(self):
        """Executa uma captura única"""
        print("🚀 Capturando logs reais do sistema...")
        
        # Capturar logs do sistema
        self.capture_system_logs()
        
        # Capturar logs de rede
        self.capture_network_logs()
        
        # Gerar e salvar relatório
        report = self.generate_real_report()
        self.save_to_file(report)
        
        return True
    
    def run_continuous_capture(self, interval=10):
        """Executa captura contínua"""
        print(f"🔄 Modo contínuo - Intervalo: {interval} segundos")
        print("Pressione Ctrl+C para parar")
        
        self.running = True
        
        while self.running:
            try:
                self.run_single_capture()
                print(f"⏰ Próxima captura em {interval} segundos...")
                time.sleep(interval)
            except KeyboardInterrupt:
                print("\n🛑 Captura interrompida")
                self.running = False
                break
            except Exception as e:
                print(f"❌ Erro na captura: {e}")
                time.sleep(interval)

def main():
    """Função principal"""
    import sys
    
    logger = SimpleRealLogger()
    
    if len(sys.argv) > 1 and sys.argv[1] == '--continuous':
        # Modo contínuo
        interval = int(sys.argv[2]) if len(sys.argv) > 2 else 10
        logger.run_continuous_capture(interval)
    elif len(sys.argv) > 1 and sys.argv[1] == '--start-frontend':
        # Iniciar frontend e capturar
        logger.start_frontend_if_needed()
        time.sleep(5)
        logger.run_single_capture()
    else:
        # Captura única
        logger.run_single_capture()

if __name__ == "__main__":
    main()
