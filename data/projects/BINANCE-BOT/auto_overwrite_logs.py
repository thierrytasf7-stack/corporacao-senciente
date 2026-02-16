#!/usr/bin/env python3
"""
Script para SOBRESCREVER automaticamente logs Docker a cada 5 segundos
NÃO solicita local de salvamento - sobrescreve diretamente o arquivo
"""

import json
import time
import requests
import subprocess
import os
from datetime import datetime

class AutoOverwriteLogger:
    def __init__(self):
        self.log_file = "LOGS-CONSOLE-FRONTEND.JSON"
        self.session_id = f"auto_overwrite_{int(time.time())}"
        self.start_time = datetime.now().isoformat()
        
        # Portas Docker detectadas
        self.docker_ports = {
            'frontend': '13000',
            'backend': '13001',
            'postgres': '15432',
            'redis': '16379'
        }
    
    def capture_current_status(self):
        """Captura status atual do sistema Docker"""
        logs = []
        errors = []
        warnings = []
        timestamp = datetime.now().isoformat()
        
        # Verificar containers Docker
        try:
            result = subprocess.run(['docker', 'ps'], capture_output=True, text=True)
            if result.returncode == 0:
                lines = result.stdout.split('\n')
                container_count = 0
                
                for line in lines[1:]:
                    if line.strip() and 'aura-binance' in line:
                        container_count += 1
                        parts = line.split()
                        if len(parts) >= 2:
                            container_id = parts[0]
                            container_name = parts[-1]
                            status = 'Up' if 'Up' in line else 'Down'
                            
                            logs.append({
                                "timestamp": timestamp,
                                "level": "info",
                                "message": f"Container {container_name} - Status: {status}",
                                "url": f"docker://{container_id}",
                                "source": "docker"
                            })
                
                if container_count > 0:
                    logs.append({
                        "timestamp": timestamp,
                        "level": "info",
                        "message": f"Total de containers aura-binance: {container_count}",
                        "url": "docker",
                        "source": "docker"
                    })
                else:
                    error_log = {
                        "timestamp": timestamp,
                        "level": "error",
                        "message": "Nenhum container aura-binance encontrado",
                        "url": "docker",
                        "source": "docker"
                    }
                    logs.append(error_log)
                    errors.append(error_log)
        except Exception as e:
            error_log = {
                "timestamp": timestamp,
                "level": "error",
                "message": f"Erro ao verificar containers: {str(e)}",
                "url": "docker",
                "source": "docker"
            }
            logs.append(error_log)
            errors.append(error_log)
        
        # Verificar frontend
        try:
            response = requests.get(f"http://localhost:{self.docker_ports['frontend']}", timeout=2)
            if response.status_code == 200:
                logs.append({
                    "timestamp": timestamp,
                    "level": "info",
                    "message": f"Frontend ativo em http://localhost:{self.docker_ports['frontend']}",
                    "url": f"http://localhost:{self.docker_ports['frontend']}",
                    "source": "docker_frontend"
                })
            else:
                warn_log = {
                    "timestamp": timestamp,
                    "level": "warn",
                    "message": f"Frontend retornou status {response.status_code}",
                    "url": f"http://localhost:{self.docker_ports['frontend']}",
                    "source": "docker_frontend"
                }
                logs.append(warn_log)
                warnings.append(warn_log)
        except Exception as e:
            error_log = {
                "timestamp": timestamp,
                "level": "error",
                "message": f"Frontend não acessível: {str(e)}",
                "url": f"http://localhost:{self.docker_ports['frontend']}",
                "source": "docker_frontend"
            }
            logs.append(error_log)
            errors.append(error_log)
        
        # Verificar backend
        try:
            response = requests.get(f"http://localhost:{self.docker_ports['backend']}/health", timeout=2)
            if response.status_code == 200:
                health_data = response.json()
                logs.append({
                    "timestamp": timestamp,
                    "level": "info",
                    "message": f"Backend saudável: {health_data.get('status', 'unknown')}",
                    "url": f"http://localhost:{self.docker_ports['backend']}/health",
                    "source": "docker_backend"
                })
            else:
                warn_log = {
                    "timestamp": timestamp,
                    "level": "warn",
                    "message": f"Backend health check retornou {response.status_code}",
                    "url": f"http://localhost:{self.docker_ports['backend']}/health",
                    "source": "docker_backend"
                }
                logs.append(warn_log)
                warnings.append(warn_log)
        except Exception as e:
            error_log = {
                "timestamp": timestamp,
                "level": "error",
                "message": f"Backend não acessível: {str(e)}",
                "url": f"http://localhost:{self.docker_ports['backend']}/health",
                "source": "docker_backend"
            }
            logs.append(error_log)
            errors.append(error_log)
        
        # Capturar logs dos containers
        containers_to_check = ['aura-binance-frontend-dev', 'aura-binance-backend-dev']
        for container in containers_to_check:
            try:
                result = subprocess.run(
                    ['docker', 'logs', '--tail', '1', container],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                
                if result.returncode == 0 and result.stdout.strip():
                    last_log = result.stdout.strip().split('\n')[-1]
                    level = "info"
                    if 'error' in last_log.lower() or 'failed' in last_log.lower():
                        level = "error"
                    elif 'warn' in last_log.lower():
                        level = "warn"
                    
                    log_entry = {
                        "timestamp": timestamp,
                        "level": level,
                        "message": f"Docker Log ({container}): {last_log}",
                        "url": f"docker://{container}",
                        "source": "docker_logs"
                    }
                    logs.append(log_entry)
                    
                    if level == "error":
                        errors.append(log_entry)
                    elif level == "warn":
                        warnings.append(log_entry)
            except:
                pass
        
        return logs, errors, warnings
    
    def overwrite_file(self, logs, errors, warnings):
        """SOBRESCREVE o arquivo de logs automaticamente"""
        try:
            report = {
                "sessionId": self.session_id,
                "startTime": self.start_time,
                "endTime": datetime.now().isoformat(),
                "totalLogs": len(logs),
                "errors": len(errors),
                "warnings": len(warnings),
                "logs": logs,
                "summary": {
                    "errors": errors,
                    "warnings": warnings,
                    "criticalErrors": [e for e in errors if 'Critical' in e['message'] or 'Fatal' in e['message']]
                },
                "dockerInfo": {
                    "frontendPort": self.docker_ports['frontend'],
                    "backendPort": self.docker_ports['backend'],
                    "postgresPort": self.docker_ports['postgres'],
                    "redisPort": self.docker_ports['redis']
                },
                "status": f"Logs SOBRESCRITOS - {datetime.now().strftime('%H:%M:%S')} - Total: {len(logs)}"
            }
            
            # SOBRESCREVER arquivo automaticamente
            with open(self.log_file, 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=4, ensure_ascii=False)
            
            print(f"✅ ARQUIVO SOBRESCRITO: {len(logs)} logs, {len(errors)} erros, {len(warnings)} avisos - {datetime.now().strftime('%H:%M:%S')}")
            
            return True
        except Exception as e:
            print(f"❌ Erro ao sobrescrever: {e}")
            return False
    
    def run_auto_overwrite(self, interval=5):
        """Executa sobrescrita automática a cada 5 segundos"""
        print(f"🔄 SOBRESCREVENDO automaticamente a cada {interval} segundos")
        print(f"📁 Arquivo: {self.log_file}")
        print("Pressione Ctrl+C para parar")
        print("=" * 60)
        
        while True:
            try:
                # Capturar status atual
                logs, errors, warnings = self.capture_current_status()
                
                # Sobrescrever arquivo
                self.overwrite_file(logs, errors, warnings)
                
                # Aguardar próximo ciclo
                time.sleep(interval)
                
            except KeyboardInterrupt:
                print("\n🛑 Sobrescrita automática interrompida")
                break
            except Exception as e:
                print(f"❌ Erro no ciclo: {e}")
                time.sleep(interval)

def main():
    """Função principal"""
    import sys
    
    logger = AutoOverwriteLogger()
    
    if len(sys.argv) > 1:
        interval = int(sys.argv[1])
    else:
        interval = 5  # Padrão: 5 segundos
    
    logger.run_auto_overwrite(interval)

if __name__ == "__main__":
    main()
