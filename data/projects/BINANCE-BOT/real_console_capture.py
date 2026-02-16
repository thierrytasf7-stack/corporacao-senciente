#!/usr/bin/env python3
"""
Script para capturar logs REAIS do console do frontend
Atualiza o arquivo LOGS-CONSOLE-FRONTEND.JSON com dados autênticos
"""

import json
import time
import requests
import subprocess
import os
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException

class RealConsoleCapture:
    def __init__(self):
        self.log_file = "LOGS-CONSOLE-FRONTEND.JSON"
        self.driver = None
        self.session_id = f"real_session_{int(time.time())}"
        self.start_time = datetime.now().isoformat()
        self.logs = []
        self.errors = []
        self.warnings = []
        
    def setup_driver(self):
        """Configura o driver do Chrome para capturar logs"""
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        
        # Configurar logs do console
        chrome_options.set_capability('goog:loggingPrefs', {
            'browser': 'ALL',
            'performance': 'ALL'
        })
        
        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            print("✅ Driver Chrome configurado com sucesso")
            return True
        except WebDriverException as e:
            print(f"❌ Erro ao configurar driver Chrome: {e}")
            print("💡 Certifique-se de que o ChromeDriver está instalado")
            return False
    
    def find_frontend_url(self):
        """Encontra a URL do frontend rodando"""
        urls_to_check = [
            "http://localhost:5173",  # Vite dev server
            "http://localhost:3000",  # React dev server
            "http://localhost:13000", # Docker frontend
            "http://localhost:8080",  # Porta alternativa
        ]
        
        print("🔍 Procurando frontend ativo...")
        
        for url in urls_to_check:
            try:
                response = requests.get(url, timeout=3)
                if response.status_code == 200:
                    print(f"✅ Frontend encontrado em: {url}")
                    return url
            except requests.exceptions.RequestException:
                continue
        
        print("❌ Frontend não encontrado")
        return None
    
    def capture_console_logs(self, url):
        """Captura logs reais do console do navegador"""
        print(f"🌐 Acessando: {url}")
        
        try:
            self.driver.get(url)
            
            # Aguardar carregamento da página
            time.sleep(5)
            
            # Capturar logs do console
            browser_logs = self.driver.get_log('browser')
            performance_logs = self.driver.get_log('performance')
            
            print(f"📊 Logs capturados: {len(browser_logs)} do console, {len(performance_logs)} de performance")
            
            # Processar logs do console
            for log in browser_logs:
                level = log.get('level', 'INFO')
                message = log.get('message', '')
                source = log.get('source', 'unknown')
                timestamp = log.get('timestamp', time.time() * 1000)
                
                # Converter timestamp para ISO string
                log_time = datetime.fromtimestamp(timestamp / 1000).isoformat()
                
                log_entry = {
                    "timestamp": log_time,
                    "level": self.map_log_level(level),
                    "message": message,
                    "url": url,
                    "source": source,
                    "userAgent": self.driver.execute_script("return navigator.userAgent;")
                }
                
                self.logs.append(log_entry)
                
                # Categorizar logs
                if level == 'SEVERE':
                    self.errors.append(log_entry)
                elif level == 'WARNING':
                    self.warnings.append(log_entry)
            
            # Processar logs de performance
            for log in performance_logs:
                try:
                    log_data = json.loads(log['message'])
                    if 'message' in log_data and log_data['message']['method'] == 'Network.responseReceived':
                        network_log = {
                            "timestamp": datetime.fromtimestamp(log['timestamp'] / 1000).isoformat(),
                            "level": "info",
                            "message": f"Network: {log_data['message']['params']['response']['url']} - {log_data['message']['params']['response']['status']}",
                            "url": url,
                            "source": "network",
                            "userAgent": self.driver.execute_script("return navigator.userAgent;")
                        }
                        self.logs.append(network_log)
                except:
                    continue
            
            # Capturar erros da página
            page_errors = self.driver.execute_script("""
                return window.errors || [];
            """)
            
            for error in page_errors:
                error_log = {
                    "timestamp": datetime.now().isoformat(),
                    "level": "error",
                    "message": f"Page Error: {error}",
                    "url": url,
                    "source": "page",
                    "userAgent": self.driver.execute_script("return navigator.userAgent;")
                }
                self.logs.append(error_log)
                self.errors.append(error_log)
            
            return True
            
        except Exception as e:
            print(f"❌ Erro ao capturar logs: {e}")
            return False
    
    def map_log_level(self, selenium_level):
        """Mapeia níveis de log do Selenium para níveis padrão"""
        mapping = {
            'SEVERE': 'error',
            'WARNING': 'warn',
            'INFO': 'info',
            'DEBUG': 'debug'
        }
        return mapping.get(selenium_level, 'log')
    
    def generate_real_report(self):
        """Gera relatório com logs reais capturados"""
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
            "status": f"Logs reais capturados - {datetime.now().strftime('%H:%M:%S')} - Total: {len(self.logs)}"
        }
    
    def save_to_file(self, report):
        """Salva o relatório no arquivo JSON"""
        try:
            with open(self.log_file, 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=4, ensure_ascii=False)
            
            print(f"✅ Logs reais salvos em: {self.log_file}")
            print(f"📊 Resumo: {report['totalLogs']} logs, {report['errors']} erros, {report['warnings']} avisos")
            
            if report['errors'] > 0:
                print("🚨 ERROS ENCONTRADOS:")
                for error in report['errors'][:5]:
                    print(f"   • {error['message']}")
            
            return True
        except Exception as e:
            print(f"❌ Erro ao salvar arquivo: {e}")
            return False
    
    def run_capture(self):
        """Executa a captura completa de logs"""
        print("🚀 Iniciando captura de logs REAIS do console...")
        print("=" * 60)
        
        # Configurar driver
        if not self.setup_driver():
            return False
        
        try:
            # Encontrar frontend
            frontend_url = self.find_frontend_url()
            if not frontend_url:
                print("💡 Iniciando frontend...")
                self.start_frontend()
                time.sleep(10)
                frontend_url = self.find_frontend_url()
                if not frontend_url:
                    print("❌ Não foi possível encontrar o frontend")
                    return False
            
            # Capturar logs
            if self.capture_console_logs(frontend_url):
                # Gerar e salvar relatório
                report = self.generate_real_report()
                self.save_to_file(report)
                return True
            else:
                print("❌ Falha na captura de logs")
                return False
                
        finally:
            if self.driver:
                self.driver.quit()
    
    def start_frontend(self):
        """Tenta iniciar o frontend se não estiver rodando"""
        try:
            print("🔄 Iniciando frontend...")
            subprocess.Popen(
                ['npm', 'run', 'dev'],
                cwd='frontend',
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
        except Exception as e:
            print(f"⚠️ Erro ao iniciar frontend: {e}")
    
    def continuous_capture(self, interval=30):
        """Captura logs continuamente"""
        print(f"🔄 Modo contínuo - Intervalo: {interval} segundos")
        print("Pressione Ctrl+C para parar")
        
        while True:
            try:
                self.run_capture()
                print(f"⏰ Próxima captura em {interval} segundos...")
                time.sleep(interval)
            except KeyboardInterrupt:
                print("\n🛑 Captura interrompida pelo usuário")
                break
            except Exception as e:
                print(f"❌ Erro na captura: {e}")
                time.sleep(interval)

def main():
    """Função principal"""
    import sys
    
    capture = RealConsoleCapture()
    
    if len(sys.argv) > 1 and sys.argv[1] == '--continuous':
        # Modo contínuo
        interval = int(sys.argv[2]) if len(sys.argv) > 2 else 30
        capture.continuous_capture(interval)
    else:
        # Captura única
        capture.run_capture()

if __name__ == "__main__":
    main()
