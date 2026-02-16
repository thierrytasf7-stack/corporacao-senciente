#!/usr/bin/env python3
"""
Script para testar a conexão entre frontend e backend
"""

import requests
import json
import time
from datetime import datetime

def test_backend_connection():
    """Testa a conexão com o backend"""
    print("🔍 Testando conexão com o backend...")
    
    # URLs para testar
    urls = [
        "http://localhost:13001/api/v1/logs/test",
        "http://localhost:13001/api/v1/binance/test-connection",
        "http://localhost:13001/api/v1/health",
    ]
    
    for url in urls:
        try:
            print(f"  📡 Testando: {url}")
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                print(f"    ✅ Sucesso: {response.status_code}")
                try:
                    data = response.json()
                    print(f"    📄 Resposta: {json.dumps(data, indent=2)}")
                except:
                    print(f"    📄 Resposta: {response.text[:100]}...")
            else:
                print(f"    ⚠️  Status: {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            print(f"    ❌ Erro: Não foi possível conectar")
        except requests.exceptions.Timeout:
            print(f"    ⏰ Erro: Timeout")
        except Exception as e:
            print(f"    ❌ Erro: {str(e)}")
        
        print()

def test_frontend_connection():
    """Testa a conexão com o frontend"""
    print("🔍 Testando conexão com o frontend...")
    
    try:
        print("  📡 Testando: http://localhost:13000")
        response = requests.get("http://localhost:13000", timeout=5)
        
        if response.status_code == 200:
            print("    ✅ Frontend está rodando")
        else:
            print(f"    ⚠️  Status: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("    ❌ Erro: Frontend não está rodando")
    except Exception as e:
        print(f"    ❌ Erro: {str(e)}")

def test_log_endpoint():
    """Testa o endpoint de logs"""
    print("🔍 Testando endpoint de logs...")
    
    test_log = {
        "filename": "TEST-LOG.json",
        "content": json.dumps({
            "test": True,
            "timestamp": datetime.now().isoformat(),
            "message": "Teste de conexão"
        }),
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        print("  📡 Enviando log para: http://localhost:13001/api/v1/logs/update-frontend")
        response = requests.post(
            "http://localhost:13001/api/v1/logs/update-frontend",
            json=test_log,
            timeout=10
        )
        
        if response.status_code == 200:
            print("    ✅ Log enviado com sucesso")
            data = response.json()
            print(f"    📄 Resposta: {json.dumps(data, indent=2)}")
        else:
            print(f"    ⚠️  Status: {response.status_code}")
            print(f"    📄 Resposta: {response.text}")
            
    except Exception as e:
        print(f"    ❌ Erro: {str(e)}")

def main():
    """Função principal"""
    print("🚀 Iniciando testes de conexão...")
    print("=" * 50)
    
    # Testar backend
    test_backend_connection()
    
    # Testar frontend
    test_frontend_connection()
    
    # Testar endpoint de logs
    test_log_endpoint()
    
    print("=" * 50)
    print("✅ Testes concluídos!")

if __name__ == "__main__":
    main()
