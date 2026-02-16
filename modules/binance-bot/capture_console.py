#!/usr/bin/env python3
"""
Script para acessar o frontend e capturar erros do console
"""

import requests
import time
import json
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException

def setup_driver():
    """Configura o driver do Chrome"""
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Executar em modo headless
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    
    # Configurar logs do console
    chrome_options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        return driver
    except WebDriverException as e:
        print(f"❌ Erro ao configurar driver Chrome: {e}")
        print("💡 Certifique-se de que o ChromeDriver está instalado e no PATH")
        return None

def check_frontend_health():
    """Verifica se o frontend está rodando"""
    urls_to_check = [
        "http://localhost:5173",  # Vite dev server
        "http://localhost:13000", # Docker frontend
        "http://localhost:13000",  # Porta fixa do frontend AURA
    ]
    
    print("🔍 Verificando se o frontend está rodando...")
    
    for url in urls_to_check:
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                print(f"✅ Frontend encontrado em: {url}")
                return url
        except requests.exceptions.RequestException:
            continue
    
    print("❌ Frontend não encontrado em nenhuma porta comum")
    return None

def capture_console_errors(driver, url):
    """Captura erros do console do navegador"""
    print(f"🌐 Acessando: {url}")
    
    try:
        driver.get(url)
        
        # Aguardar carregamento da página
        time.sleep(5)
        
        # Capturar logs do console
        logs = driver.get_log('browser')
        
        print(f"\n📊 Logs do Console ({len(logs)} entradas):")
        print("=" * 80)
        
        errors = []
        warnings = []
        info = []
        
        for log in logs:
            level = log.get('level', 'INFO')
            message = log.get('message', '')
            source = log.get('source', 'unknown')
            
            if 'level' in log:
                if level == 'SEVERE':
                    errors.append(f"[{source}] {message}")
                elif level == 'WARNING':
                    warnings.append(f"[{source}] {message}")
                else:
                    info.append(f"[{source}] {message}")
            
            print(f"[{level}] {source}: {message}")
        
        # Resumo
        print("\n" + "=" * 80)
        print(f"📈 RESUMO:")
        print(f"   ❌ Erros: {len(errors)}")
        print(f"   ⚠️  Avisos: {len(warnings)}")
        print(f"   ℹ️  Info: {len(info)}")
        
        if errors:
            print(f"\n🚨 ERROS ENCONTRADOS:")
            for error in errors[:10]:  # Mostrar apenas os primeiros 10 erros
                print(f"   • {error}")
        
        if warnings:
            print(f"\n⚠️  AVISOS ENCONTRADOS:")
            for warning in warnings[:5]:  # Mostrar apenas os primeiros 5 avisos
                print(f"   • {warning}")
        
        # Verificar se há elementos de erro na página
        try:
            error_elements = driver.find_elements(By.CSS_SELECTOR, "[class*='error'], [class*='Error'], .error, .Error")
            if error_elements:
                print(f"\n🔍 Elementos de erro encontrados na página: {len(error_elements)}")
                for i, elem in enumerate(error_elements[:3]):
                    print(f"   {i+1}. {elem.text[:100]}...")
        except Exception as e:
            print(f"⚠️  Erro ao verificar elementos de erro: {e}")
        
        return {
            'errors': errors,
            'warnings': warnings,
            'info': info,
            'total_logs': len(logs)
        }
        
    except TimeoutException:
        print("⏰ Timeout ao carregar a página")
        return None
    except Exception as e:
        print(f"❌ Erro ao acessar página: {e}")
        return None

def check_network_requests(driver):
    """Verifica requisições de rede"""
    print("\n🌐 Verificando requisições de rede...")
    
    try:
        # Executar JavaScript para capturar requisições
        network_logs = driver.execute_script("""
            return window.performance.getEntries().filter(entry => 
                entry.entryType === 'resource'
            ).map(entry => ({
                name: entry.name,
                duration: entry.duration,
                transferSize: entry.transferSize,
                failed: entry.transferSize === 0 && entry.duration > 0
            }));
        """)
        
        failed_requests = [req for req in network_logs if req['failed']]
        
        if failed_requests:
            print(f"❌ Requisições falharam: {len(failed_requests)}")
            for req in failed_requests[:5]:
                print(f"   • {req['name']}")
        else:
            print("✅ Todas as requisições de rede foram bem-sucedidas")
            
    except Exception as e:
        print(f"⚠️  Erro ao verificar requisições de rede: {e}")

def main():
    """Função principal"""
    print("🚀 Iniciando análise do frontend...")
    print("=" * 80)
    
    # Verificar se o frontend está rodando
    frontend_url = check_frontend_health()
    
    if not frontend_url:
        print("\n💡 Tentando iniciar o frontend...")
        print("   Execute: cd frontend && npm run dev")
        return
    
    # Configurar driver
    driver = setup_driver()
    if not driver:
        return
    
    try:
        # Capturar erros do console
        results = capture_console_errors(driver, frontend_url)
        
        if results:
            # Verificar requisições de rede
            check_network_requests(driver)
            
            # Verificar se há erros críticos
            if results['errors']:
                print(f"\n🔴 PROBLEMAS CRÍTICOS DETECTADOS!")
                print("   Recomendações:")
                print("   1. Verifique se o backend está rodando")
                print("   2. Verifique as variáveis de ambiente")
                print("   3. Verifique a configuração da API")
                print("   4. Verifique se todas as dependências estão instaladas")
            else:
                print(f"\n✅ Nenhum erro crítico encontrado!")
                
    finally:
        driver.quit()
    
    print("\n" + "=" * 80)
    print("🏁 Análise concluída!")

if __name__ == "__main__":
    main()