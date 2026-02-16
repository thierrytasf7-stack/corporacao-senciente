#!/usr/bin/env python3
"""
Script para reiniciar a aplicação e limpar cache
"""

import os
import subprocess
import time
import sys
import json
import requests
from datetime import datetime

def run_command(command, description):
    """Executa um comando e mostra o resultado"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {description} - Sucesso")
            if result.stdout.strip():
                print(f"   Output: {result.stdout.strip()}")
        else:
            print(f"❌ {description} - Erro")
            print(f"   Error: {result.stderr.strip()}")
        return result.returncode == 0
    except Exception as e:
        print(f"❌ {description} - Exceção: {str(e)}")
        return False

def check_port(port, service_name):
    """Verifica se uma porta está em uso"""
    try:
        import socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('localhost', port))
        sock.close()
        if result == 0:
            print(f"✅ {service_name} está rodando na porta {port}")
            return True
        else:
            print(f"❌ {service_name} não está rodando na porta {port}")
            return False
    except Exception as e:
        print(f"❌ Erro ao verificar porta {port}: {str(e)}")
        return False

def kill_process_on_port(port):
    """Mata processo na porta especificada"""
    try:
        if os.name == 'nt':  # Windows
            cmd = f"netstat -ano | findstr :{port}"
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            if result.stdout:
                lines = result.stdout.strip().split('\n')
                for line in lines:
                    if f":{port}" in line:
                        parts = line.split()
                        if len(parts) >= 5:
                            pid = parts[-1]
                            subprocess.run(f"taskkill /PID {pid} /F", shell=True)
                            print(f"🔄 Processo {pid} na porta {port} finalizado")
        else:  # Linux/Mac
            cmd = f"lsof -ti:{port}"
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            if result.stdout.strip():
                pids = result.stdout.strip().split('\n')
                for pid in pids:
                    subprocess.run(f"kill -9 {pid}", shell=True)
                    print(f"🔄 Processo {pid} na porta {port} finalizado")
    except Exception as e:
        print(f"⚠️ Erro ao matar processo na porta {port}: {str(e)}")

def clear_cache():
    """Limpa cache do frontend"""
    print("🧹 Limpando cache...")
    
    # Limpar node_modules (opcional)
    if os.path.exists("frontend/node_modules"):
        print("   Removendo node_modules...")
        if os.name == 'nt':  # Windows
            run_command("rmdir /s /q frontend\\node_modules", "Removendo node_modules")
        else:
            run_command("rm -rf frontend/node_modules", "Removendo node_modules")
    
    # Limpar cache do npm
    run_command("npm cache clean --force", "Limpando cache do npm")
    
    # Limpar cache do yarn (se existir)
    if os.path.exists("frontend/yarn.lock"):
        run_command("yarn cache clean", "Limpando cache do yarn")
    
    print("✅ Cache limpo")

def install_dependencies():
    """Instala dependências"""
    print("📦 Instalando dependências...")
    
    # Backend
    if os.path.exists("backend/package.json"):
        print("   Instalando dependências do backend...")
        run_command("cd backend && npm install", "Instalando dependências do backend")
    
    # Frontend
    if os.path.exists("frontend/package.json"):
        print("   Instalando dependências do frontend...")
        run_command("cd frontend && npm install", "Instalando dependências do frontend")
    
    print("✅ Dependências instaladas")

def start_backend():
    """Inicia o backend"""
    print("🚀 Iniciando backend...")
    
    # Verificar se a porta 13001 está livre
    kill_process_on_port(13001)
    time.sleep(2)
    
    # Iniciar backend
    success = run_command("cd backend && npm run dev", "Iniciando backend")
    
    if success:
        # Aguardar backend inicializar
        print("⏳ Aguardando backend inicializar...")
        time.sleep(10)
        
        # Verificar se está rodando
        if check_port(13001, "Backend"):
            print("✅ Backend iniciado com sucesso")
            return True
        else:
            print("❌ Backend não conseguiu inicializar")
            return False
    else:
        print("❌ Falha ao iniciar backend")
        return False

def start_frontend():
    """Inicia o frontend"""
    print("🚀 Iniciando frontend...")
    
    # Verificar se a porta 13000 está livre
    kill_process_on_port(13000)
    time.sleep(2)
    
    # Iniciar frontend
    success = run_command("cd frontend && npm run dev", "Iniciando frontend")
    
    if success:
        # Aguardar frontend inicializar
        print("⏳ Aguardando frontend inicializar...")
        time.sleep(10)
        
        # Verificar se está rodando
        if check_port(13000, "Frontend"):
            print("✅ Frontend iniciado com sucesso")
            return True
        else:
            print("❌ Frontend não conseguiu inicializar")
            return False
    else:
        print("❌ Falha ao iniciar frontend")
        return False

def test_connection():
    """Testa a conexão"""
    print("🔍 Testando conexão...")
    
    try:
        # Testar backend
        response = requests.get("http://localhost:13001/api/v1/logs/test", timeout=5)
        if response.status_code == 200:
            print("✅ Backend respondendo")
        else:
            print(f"⚠️ Backend retornou status {response.status_code}")
    except Exception as e:
        print(f"❌ Erro ao conectar com backend: {str(e)}")
    
    try:
        # Testar frontend
        response = requests.get("http://localhost:13000", timeout=5)
        if response.status_code == 200:
            print("✅ Frontend respondendo")
        else:
            print(f"⚠️ Frontend retornou status {response.status_code}")
    except Exception as e:
        print(f"❌ Erro ao conectar com frontend: {str(e)}")

def main():
    """Função principal"""
    print("🔄 Reiniciando aplicação AURA Binance...")
    print("=" * 60)
    
    # 1. Parar processos existentes
    print("🛑 Parando processos existentes...")
    kill_process_on_port(13001)
    kill_process_on_port(13000)
    time.sleep(3)
    
    # 2. Limpar cache
    clear_cache()
    
    # 3. Instalar dependências
    install_dependencies()
    
    # 4. Iniciar backend
    backend_ok = start_backend()
    
    # 5. Iniciar frontend
    frontend_ok = start_frontend()
    
    # 6. Testar conexão
    if backend_ok and frontend_ok:
        test_connection()
    
    print("=" * 60)
    if backend_ok and frontend_ok:
        print("🎉 Aplicação reiniciada com sucesso!")
        print("📱 Frontend: http://localhost:13000")
        print("🔧 Backend: http://localhost:13001")
    else:
        print("❌ Falha ao reiniciar aplicação")
        sys.exit(1)

if __name__ == "__main__":
    main()
