#!/usr/bin/env python3
"""
Script para capturar logs REAIS do sistema Docker
Atualiza LOGS-CONSOLE-FRONTEND.JSON com dados autênticos das portas Docker
SOBRESCREVE automaticamente a cada 5 segundos
"""

import json
import time
import requests
import subprocess
import os
import psutil
from datetime import datetime
import threading

class DockerRealLogger:
    def __init__(self):
        self.log_file = "LOGS-CONSOLE-FRONTEND.JSON"
        self.session_id = f"docker_session_{int(time.time())}"
        self.start_time = datetime.now().isoformat()
        self.logs = []
        self.errors = []
        self.warnings = []
        self.running = False
        
        # Portas Docker detectadas
        self.docker_ports = {
            'frontend': '13000',  # aura-binance-frontend-dev
            'backend': '13001',   # aura-binance-backend-dev
            'postgres': '15432',  # aura-binance-postgres-dev
            'redis': '16379',     # aura-binance-redis-dev
            'mcp_bridge': '8080'  # mcp-bridge
        }
        
    def check_docker_containers(self):
        """Verifica status dos containers Docker"""
        timestamp = datetime.now().isoformat()
        
        try:
            result = subprocess.run(['docker', 'ps'], capture_output=True, text=True)
            if result.returncode == 0:
                lines = result.stdout.split('\n')
                container_count = 0
                
                for line in lines[1:]:  # Pular cabeçalho
                    if line.strip() and 'aura-binance' in line:
                        container_count += 1
                        # Extrair informações do container
                        parts = line.split()
                        if len(parts) >= 2:
                            container_id = parts[0]
                            container_name = parts[-1]
                            status = 'Up' if 'Up' in line else 'Down'
                            
                            self.logs.append({
                                "timestamp": timestamp,
                                "level": "info",
                                "message": f"Container {container_name} - Status: {status}",
                                "url": f"docker://{container_id}",
                                "source": "docker"
                            })
                
                if container_count == 0:
                    self.logs.append({
                        "timestamp": timestamp,
                        "level": "error",
                        "message": "Nenhum container aura-binance encontrado",
                        "url": "docker",
                        "source": "docker"
                    })
                    self.errors.append(self.logs[-1])
                else:
                    self.logs.append({
                        "timestamp": timestamp,
                        "level": "info",
                        "message": f"Total de containers aura-binance: {container_count}",
                        "url": "docker",
                        "source": "docker"
                    })
            else:
                self.logs.append({
                    "timestamp": timestamp,
                    "level": "error",
                    "message": "Erro ao verificar containers Docker",
                    "url": "docker",
                    "source": "docker"
                })
                self.errors.append(self.logs[-1])
        except Exception as e:
            self.logs.append({
                "timestamp": timestamp,
                "level": "error",
                "message": f"Erro ao executar docker ps: {str(e)}",
                "url": "docker",
                "source": "docker"
            })
            self.errors.append(self.logs[-1])
    
    def check_frontend_docker(self):
        """Verifica frontend no Docker (porta 13000)"""
        timestamp = datetime.now().isoformat()
        
        try:
            response = requests.get(f"http://localhost:{self.docker_ports['frontend']}", timeout=3)
            if response.status_code == 200:
                self.logs.append({
                    "timestamp": timestamp,
                    "level": "info",
                    "message": f"Frontend Docker ativo em http://localhost:{self.docker_ports['frontend']}",
                    "url": f"http://localhost:{self.docker_ports['frontend']}",
                    "source": "docker_frontend"
                })
                
                # Verificar se é uma página React/Vite
                if 'html' in response.headers.get('content-type', '').lower():
                    self.logs.append({
                        "timestamp": timestamp,
                        "level": "info",
                        "message": "Frontend retornando HTML válido",
                        "url": f"http://localhost:{self.docker_ports['frontend']}",
                        "source": "docker_frontend"
                    })
            else:
                self.logs.append({
                    "timestamp": timestamp,
                    "level": "warn",
                    "message": f"Frontend Docker retornou status {response.status_code}",
                    "url": f"http://localhost:{self.docker_ports['frontend']}",
                    "source": "docker_frontend"
                })
                self.warnings.append(self.logs[-1])
        except Exception as e:
            self.logs.append({
                "timestamp": timestamp,
                "level": "error",
                "message": f"Frontend Docker não acessível: {str(e)}",
                "url": f"http://localhost:{self.docker_ports['frontend']}",
                "source": "docker_frontend"
            })
            self.errors.append(self.logs[-1])
    
    def check_backend_docker(self):
        """Verifica backend no Docker (porta 13001)"""
        timestamp = datetime.now().isoformat()
        
        # Testar health check
        try:
            response = requests.get(f"http://localhost:{self.docker_ports['backend']}/health", timeout=3)
            if response.status_code == 200:
                health_data = response.json()
                self.logs.append({
                    "timestamp": timestamp,
                    "level": "info",
                    "message": f"Backend Docker saudável: {health_data.get('status', 'unknown')}",
                    "url": f"http://localhost:{self.docker_ports['backend']}/health",
                    "source": "docker_backend"
                })
            else:
                self.logs.append({
                    "timestamp": timestamp,
                    "level": "warn",
                    "message": f"Backend Docker health check retornou {response.status_code}",
                    "url": f"http://localhost:{self.docker_ports['backend']}/health",
                    "source": "docker_backend"
                })
                self.warnings.append(self.logs[-1])
        except Exception as e:
            self.logs.append({
                "timestamp": timestamp,
                "level": "error",
                "message": f"Backend Docker não acessível: {str(e)}",
                "url": f"http://localhost:{self.docker_ports['backend']}/health",
                "source": "docker_backend"
            })
            self.errors.append(self.logs[-1])
        
        # Testar API de logs
        try:
            response = requests.get(f"http://localhost:{self.docker_ports['backend']}/api/logs/test", timeout=3)
            if response.status_code == 200:
                self.logs.append({
                    "timestamp": timestamp,
                    "level": "info",
                    "message": "API de logs do backend funcionando",
                    "url": f"http://localhost:{self.docker_ports['backend']}/api/logs/test",
                    "source": "docker_backend"
                })
        except Exception as e:
            self.logs.append({
                "timestamp": timestamp,
                "level": "warn",
                "message": f"API de logs não acessível: {str(e)}",
                "url": f"http://localhost:{self.docker_ports['backend']}/api/logs/test",
                "source": "docker_backend"
            })
            self.warnings.append(self.logs[-1])
    
    def check_docker_logs(self):
        """Captura logs dos containers Docker"""
        timestamp = datetime.now().isoformat()
        
        containers_to_check = [
            'aura-binance-frontend-dev',
            'aura-binance-backend-dev'
        ]
        
        for container in containers_to_check:
            try:
                result = subprocess.run(
                    ['docker', 'logs', '--tail', '5', container],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                
                if result.returncode == 0 and result.stdout.strip():
                    # Pegar apenas a última linha de log
                    last_log = result.stdout.strip().split('\n')[-1]
                    
                    # Determinar nível do log
                    level = "info"
                    if 'error' in last_log.lower() or 'failed' in last_log.lower():
                        level = "error"
                    elif 'warn' in last_log.lower() or 'warning' in last_log.lower():
                        level = "warn"
                    
                    log_entry = {
                        "timestamp": timestamp,
                        "level": level,
                        "message": f"Docker Log ({container}): {last_log}",
                        "url": f"docker://{container}",
                        "source": "docker_logs"
                    }
                    
                    self.logs.append(log_entry)
                    
                    if level == "error":
                        self.errors.append(log_entry)
                    elif level == "warn":
                        self.warnings.append(log_entry)
                        
            except Exception as e:
                self.logs.append({
                    "timestamp": timestamp,
                    "level": "warn",
                    "message": f"Erro ao capturar logs do {container}: {str(e)}",
                    "url": f"docker://{container}",
                    "source": "docker_logs"
                })
                self.warnings.append(self.logs[-1])
    
    def check_port_usage(self):
        """Verifica uso das portas Docker"""
        timestamp = datetime.now().isoformat()
        
        try:
            result = subprocess.run(['netstat', '-ano'], capture_output=True, text=True)
            if result.returncode == 0:
                lines = result.stdout.split('\n')
                
                for port_name, port_number in self.docker_ports.items():
                    port_found = False
                    for line in lines:
                        if f':{port_number}' in line and 'LISTENING' in line:
                            port_found = True
                            self.logs.append({
                                "timestamp": timestamp,
                                "level": "info",
                                "message": f"Porta {port_number} ({port_name}) em uso",
                                "url": f"localhost:{port_number}",
                                "source": "network"
                            })
                            break
                    
                    if not port_found:
                        self.logs.append({
                            "timestamp": timestamp,
                            "level": "warn",
                            "message": f"Porta {port_number} ({port_name}) não está em uso",
                            "url": f"localhost:{port_number}",
                            "source": "network"
                        })
                        self.warnings.append(self.logs[-1])
        except Exception as e:
            self.logs.append({
                "timestamp": timestamp,
                "level": "warn",
                "message": f"Erro ao verificar portas: {str(e)}",
                "url": "system",
                "source": "network"
            })
    
    def capture_docker_system_logs(self):
        """Captura logs completos do sistema Docker"""
        print("🐳 Capturando logs do sistema Docker...")
        
        # Verificar containers
        self.check_docker_containers()
        
        # Verificar frontend
        self.check_frontend_docker()
        
        # Verificar backend
        self.check_backend_docker()
        
        # Verificar logs dos containers
        self.check_docker_logs()
        
        # Verificar uso de portas
        self.check_port_usage()
    
    def generate_docker_report(self):
        """Gera relatório com logs do Docker"""
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
            "dockerInfo": {
                "frontendPort": self.docker_ports['frontend'],
                "backendPort": self.docker_ports['backend'],
                "postgresPort": self.docker_ports['postgres'],
                "redisPort": self.docker_ports['redis']
            },
            "status": f"Logs Docker reais - {datetime.now().strftime('%H:%M:%S')} - Total: {len(self.logs)}"
        }
    
    def save_to_file(self, report):
        """Salva o relatório no arquivo JSON - SOBRESCREVE automaticamente"""
        try:
            # Salvar diretamente no arquivo, sobrescrevendo
            with open(self.log_file, 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=4, ensure_ascii=False)
            
            print(f"✅ Logs Docker SOBRESCRITOS: {report['totalLogs']} logs, {report['errors']} erros, {report['warnings']} avisos")
            
            if report['errors'] > 0:
                print("🚨 ERROS ENCONTRADOS:")
                for error in report['errors'][:3]:
                    print(f"   • {error['message']}")
            
            return True
        except Exception as e:
            print(f"❌ Erro ao sobrescrever arquivo: {e}")
            return False
    
    def run_single_capture(self):
        """Executa uma captura única"""
        print("🚀 Capturando logs reais do sistema Docker...")
        
        # Capturar logs do sistema Docker
        self.capture_docker_system_logs()
        
        # Gerar e salvar relatório
        report = self.generate_docker_report()
        self.save_to_file(report)
        
        return True
    
    def run_continuous_capture(self, interval=5):
        """Executa captura contínua - SOBRESCREVE a cada 5 segundos por padrão"""
        print(f"🔄 Modo contínuo Docker - SOBRESCREVENDO a cada {interval} segundos")
        print("Pressione Ctrl+C para parar")
        
        self.running = True
        
        while self.running:
            try:
                self.run_single_capture()
                print(f"⏰ Próxima SOBRESCRITA em {interval} segundos...")
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
    
    logger = DockerRealLogger()
    
    if len(sys.argv) > 1 and sys.argv[1] == '--continuous':
        # Modo contínuo - padrão 5 segundos
        interval = int(sys.argv[2]) if len(sys.argv) > 2 else 5
        logger.run_continuous_capture(interval)
    else:
        # Captura única
        logger.run_single_capture()

if __name__ == "__main__":
    main()
