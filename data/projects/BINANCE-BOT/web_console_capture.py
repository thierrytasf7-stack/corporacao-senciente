#!/usr/bin/env python3
"""
Script para capturar logs REAIS do console web do navegador
Captura logs do React, Redux, erros de rede, etc.
SOBRESCREVE automaticamente a cada 5 segundos
"""

import json
import time
import subprocess
import os
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import threading

class WebConsoleCapture:
    def __init__(self):
        self.log_file = "LOGS-CONSOLE-FRONTEND.JSON"
        self.session_id = f"web_console_{int(time.time())}"
        self.start_time = datetime.now().isoformat()
        self.driver = None
        self.running = False
        
        # URL do frontend Docker
        self.frontend_url = "http://localhost:13000"
        
    def setup_driver(self):
        """Configura o driver do Chrome para capturar logs do console"""
        try:
            chrome_options = Options()
            chrome_options.add_argument("--headless")  # Executar em background
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--disable-gpu")
            chrome_options.add_argument("--window-size=1920,1080")
            
            # Configurar para capturar logs do console
            caps = DesiredCapabilities.CHROME
            caps['goog:loggingPrefs'] = {
                'browser': 'ALL',
                'performance': 'ALL'
            }
            
            self.driver = webdriver.Chrome(options=chrome_options, desired_capabilities=caps)
            print("✅ Driver Chrome configurado com sucesso")
            return True
            
        except Exception as e:
            print(f"❌ Erro ao configurar driver: {e}")
            return False
    
    def capture_console_logs(self):
        """Captura logs reais do console web"""
        if not self.driver:
            return [], [], []
        
        logs = []
        errors = []
        warnings = []
        timestamp = datetime.now().isoformat()
        
        try:
            # Navegar para a página
            self.driver.get(self.frontend_url)
            time.sleep(3)  # Aguardar carregamento
            
            # Capturar logs do console
            console_logs = self.driver.get_log('browser')
            
            for log_entry in console_logs:
                level = log_entry.get('level', 'INFO').lower()
                message = log_entry.get('message', '')
                source = log_entry.get('source', 'console')
                
                # Filtrar logs relevantes
                if any(keyword in message.lower() for keyword in [
                    'react', 'redux', 'binance', 'api', 'error', 'warning', 
                    'console', 'network', 'http', 'axios', 'fetch'
                ]):
                    log_data = {
                        "timestamp": timestamp,
                        "level": level,
                        "message": message,
                        "url": self.frontend_url,
                        "source": "web_console"
                    }
                    
                    logs.append(log_data)
                    
                    if level == 'severe' or 'error' in message.lower():
                        errors.append(log_data)
                    elif level == 'warning' or 'warn' in message.lower():
                        warnings.append(log_data)
            
            # Capturar logs de performance (erros de rede)
            performance_logs = self.driver.get_log('performance')
            
            for perf_log in performance_logs:
                try:
                    message = perf_log.get('message', '')
                    if 'Network.responseReceived' in message or 'Network.requestFailed' in message:
                        log_data = {
                            "timestamp": timestamp,
                            "level": "error" if 'Failed' in message else "info",
                            "message": f"Network: {message}",
                            "url": self.frontend_url,
                            "source": "web_network"
                        }
                        
                        logs.append(log_data)
                        if 'Failed' in message:
                            errors.append(log_data)
                except:
                    pass
            
            # Executar JavaScript para capturar logs do console
            js_script = """
            return (function() {
                var logs = [];
                var originalLog = console.log;
                var originalError = console.error;
                var originalWarn = console.warn;
                
                console.log = function() {
                    logs.push({
                        level: 'info',
                        message: Array.from(arguments).join(' '),
                        timestamp: new Date().toISOString()
                    });
                    originalLog.apply(console, arguments);
                };
                
                console.error = function() {
                    logs.push({
                        level: 'error',
                        message: Array.from(arguments).join(' '),
                        timestamp: new Date().toISOString()
                    });
                    originalError.apply(console, arguments);
                };
                
                console.warn = function() {
                    logs.push({
                        level: 'warn',
                        message: Array.from(arguments).join(' '),
                        timestamp: new Date().toISOString()
                    });
                    originalWarn.apply(console, arguments);
                };
                
                // Capturar logs existentes
                if (window.consoleLogs) {
                    logs = logs.concat(window.consoleLogs);
                }
                
                return logs;
            })();
            """
            
            try:
                js_logs = self.driver.execute_script(js_script)
                for js_log in js_logs:
                    log_data = {
                        "timestamp": js_log.get('timestamp', timestamp),
                        "level": js_log.get('level', 'info'),
                        "message": js_log.get('message', ''),
                        "url": self.frontend_url,
                        "source": "javascript_console"
                    }
                    
                    logs.append(log_data)
                    
                    if log_data['level'] == 'error':
                        errors.append(log_data)
                    elif log_data['level'] == 'warn':
                        warnings.append(log_data)
            except Exception as e:
                print(f"⚠️ Erro ao executar JavaScript: {e}")
            
        except Exception as e:
            error_log = {
                "timestamp": timestamp,
                "level": "error",
                "message": f"Erro ao capturar logs do console: {str(e)}",
                "url": self.frontend_url,
                "source": "capture_error"
            }
            logs.append(error_log)
            errors.append(error_log)
        
        return logs, errors, warnings
    
    def capture_network_errors(self):
        """Captura erros de rede específicos"""
        logs = []
        errors = []
        timestamp = datetime.now().isoformat()
        
        try:
            # Verificar erros de rede conhecidos
            network_checks = [
                "http://backend:3001/api/v1/binance/test-connection",
                "http://localhost:13001/api/v1/binance/test-connection",
                "http://localhost:8000/api/logs/update-frontend",
                "http://localhost:13000/api/logs/update-frontend"
            ]
            
            for url in network_checks:
                try:
                    import requests
                    response = requests.get(url, timeout=2)
                    if response.status_code >= 400:
                        error_log = {
                            "timestamp": timestamp,
                            "level": "error",
                            "message": f"Network Error: {url} - Status: {response.status_code}",
                            "url": url,
                            "source": "network_check"
                        }
                        logs.append(error_log)
                        errors.append(error_log)
                except Exception as e:
                    error_log = {
                        "timestamp": timestamp,
                        "level": "error",
                        "message": f"Network Error: {url} - {str(e)}",
                        "url": url,
                        "source": "network_check"
                    }
                    logs.append(error_log)
                    errors.append(error_log)
                    
        except Exception as e:
            print(f"⚠️ Erro ao verificar rede: {e}")
        
        return logs, errors
    
    def overwrite_file(self, logs, errors, warnings):
        """SOBRESCREVE o arquivo de logs automaticamente"""
        try:
            # Adicionar logs de rede
            network_logs, network_errors = self.capture_network_errors()
            logs.extend(network_logs)
            errors.extend(network_errors)
            
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
                "webConsoleInfo": {
                    "frontendUrl": self.frontend_url,
                    "captureMethod": "Selenium WebDriver",
                    "logTypes": ["console", "network", "javascript", "performance"]
                },
                "status": f"Logs Console Web REAIS - {datetime.now().strftime('%H:%M:%S')} - Total: {len(logs)}"
            }
            
            # SOBRESCREVER arquivo automaticamente
            with open(self.log_file, 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=4, ensure_ascii=False)
            
            print(f"✅ CONSOLE WEB SOBRESCRITO: {len(logs)} logs, {len(errors)} erros, {len(warnings)} avisos - {datetime.now().strftime('%H:%M:%S')}")
            
            return True
        except Exception as e:
            print(f"❌ Erro ao sobrescrever: {e}")
            return False
    
    def run_auto_capture(self, interval=5):
        """Executa captura automática do console web a cada 5 segundos"""
        print(f"🔄 Capturando CONSOLE WEB REAIS a cada {interval} segundos")
        print(f"🌐 URL: {self.frontend_url}")
        print(f"📁 Arquivo: {self.log_file}")
        print("Pressione Ctrl+C para parar")
        print("=" * 60)
        
        if not self.setup_driver():
            print("❌ Não foi possível configurar o driver Chrome")
            return
        
        self.running = True
        
        while self.running:
            try:
                # Capturar logs do console web
                logs, errors, warnings = self.capture_console_logs()
                
                # Sobrescrever arquivo
                self.overwrite_file(logs, errors, warnings)
                
                # Aguardar próximo ciclo
                time.sleep(interval)
                
            except KeyboardInterrupt:
                print("\n🛑 Captura do console web interrompida")
                self.running = False
                break
            except Exception as e:
                print(f"❌ Erro no ciclo: {e}")
                time.sleep(interval)
        
        # Limpar driver
        if self.driver:
            self.driver.quit()

def main():
    """Função principal"""
    import sys
    
    capturer = WebConsoleCapture()
    
    if len(sys.argv) > 1:
        interval = int(sys.argv[1])
    else:
        interval = 5  # Padrão: 5 segundos
    
    capturer.run_auto_capture(interval)

if __name__ == "__main__":
    main()
