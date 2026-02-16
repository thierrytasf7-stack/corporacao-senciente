#!/usr/bin/env python3
"""
Script para testar os containers e verificar se estão funcionando
"""

import requests
import time
import subprocess
import json
from datetime import datetime

def run_docker_command(command):
    """Executa um comando docker e retorna o resultado"""
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        return result.returncode == 0, result.stdout.strip(), result.stderr.strip()
    except Exception as e:
        return False, "", str(e)

def test_container_health():
    """Testa a saúde dos containers"""
    print("🔍 Testando saúde dos containers...")
    
    # Verificar status dos containers
    success, output, error = run_docker_command("docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'")
    
    if success:
        print("📊 Status dos containers:")
        print(output)
    else:
        print(f"❌ Erro ao verificar containers: {error}")
        return False
    
    return True

def test_backend_connection():
    """Testa a conexão com o backend"""
    print("\n🔍 Testando conexão com o backend...")
    
    # URLs para testar
    urls = [
        "http://localhost:13001/api/v1/health",
        "http://localhost:13001/api/v1/logs/test",
        "http://localhost:13001/api/v1/binance/test-connection",
    ]
    
    for url in urls:
        try:
            print(f"  📡 Testando: {url}")
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                print(f"    ✅ Sucesso: {response.status_code}")
                try:
                    data = response.json()
                    print(f"    📄 Resposta: {json.dumps(data, indent=2)}")
                except:
                    print(f"    📄 Resposta: {response.text[:200]}...")
            else:
                print(f"    ⚠️  Status: {response.status_code}")
                print(f"    📄 Resposta: {response.text[:200]}...")
                
        except requests.exceptions.ConnectionError:
            print(f"    ❌ Erro de conexão: Não foi possível conectar")
        except requests.exceptions.Timeout:
            print(f"    ⏰ Timeout: A requisição demorou muito")
        except Exception as e:
            print(f"    ❌ Erro: {str(e)}")
    
    return True

def test_frontend_connection():
    """Testa a conexão com o frontend"""
    print("\n🔍 Testando conexão com o frontend...")
    
    try:
        print("  📡 Testando: http://localhost:13000")
        response = requests.get("http://localhost:13000", timeout=10)
        
        if response.status_code == 200:
            print(f"    ✅ Sucesso: {response.status_code}")
            print(f"    📄 Título: {response.text[:200]}...")
        else:
            print(f"    ⚠️  Status: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("    ❌ Erro de conexão: Não foi possível conectar")
    except requests.exceptions.Timeout:
        print("    ⏰ Timeout: A requisição demorou muito")
    except Exception as e:
        print(f"    ❌ Erro: {str(e)}")
    
    return True

def check_container_logs():
    """Verifica os logs dos containers"""
    print("\n📋 Verificando logs dos containers...")
    
    containers = ["aura-backend", "aura-frontend"]
    
    for container in containers:
        print(f"\n  📄 Logs do {container}:")
        success, output, error = run_docker_command(f"docker logs {container} --tail 20")
        
        if success:
            print(f"    {output}")
        else:
            print(f"    ❌ Erro: {error}")

def main():
    """Função principal"""
    print("🚀 Iniciando testes dos containers...")
    print(f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Testar saúde dos containers
    test_container_health()
    
    # Aguardar um pouco para os containers inicializarem
    print("\n⏳ Aguardando containers inicializarem...")
    time.sleep(10)
    
    # Testar conexões
    test_backend_connection()
    test_frontend_connection()
    
    # Verificar logs
    check_container_logs()
    
    print("\n✅ Testes concluídos!")

if __name__ == "__main__":
    main()
