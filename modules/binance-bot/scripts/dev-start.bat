@echo off
REM Script para iniciar o ambiente de desenvolvimento do AURA Bot (Windows)
REM Autor: Sistema AURA
REM Versão: 1.0.0

setlocal enabledelayedexpansion

echo [INFO] === Iniciando Ambiente de Desenvolvimento AURA Bot ===

REM Verificar se Docker está instalado
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker não está instalado. Por favor, instale o Docker Desktop primeiro.
    pause
    exit /b 1
)

REM Verificar se Docker Compose está disponível
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose não está disponível. Verifique se o Docker Desktop está rodando.
    pause
    exit /b 1
)

REM Verificar se Docker está rodando
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker não está rodando. Por favor, inicie o Docker Desktop primeiro.
    pause
    exit /b 1
)

echo [INFO] Docker verificado com sucesso.

REM Parar containers existentes
echo [INFO] Parando containers existentes...
docker-compose -f docker-compose.dev.yml down --remove-orphans 2>nul
docker-compose -f docker-compose.yml down --remove-orphans 2>nul

REM Limpar volumes se solicitado
if "%1"=="--clean" (
    echo [INFO] Limpando volumes...
    docker volume prune -f
    docker system prune -f
)

REM Construir imagens
echo [INFO] Construindo imagens Docker...
docker-compose -f docker-compose.dev.yml build --no-cache

REM Iniciar serviços
echo [INFO] Iniciando serviços...
docker-compose -f docker-compose.dev.yml up -d

echo [INFO] Aguardando serviços ficarem prontos...
timeout /t 10 /nobreak >nul

REM Verificar saúde dos serviços
echo [INFO] Verificando saúde dos serviços...

REM Aguardar PostgreSQL
echo [INFO] Aguardando PostgreSQL...
:wait_postgres
docker exec aura-postgres-dev pg_isready -U aura_user -d aura_db_dev >nul 2>&1
if errorlevel 1 (
    timeout /t 2 /nobreak >nul
    goto wait_postgres
)

REM Aguardar Redis
echo [INFO] Aguardando Redis...
:wait_redis
docker exec aura-redis-dev redis-cli ping >nul 2>&1
if errorlevel 1 (
    timeout /t 2 /nobreak >nul
    goto wait_redis
)

REM Aguardar Backend
echo [INFO] Aguardando Backend...
:wait_backend
curl -f http://localhost:13001/api/v1/health >nul 2>&1
if errorlevel 1 (
    timeout /t 3 /nobreak >nul
    goto wait_backend
)

REM Aguardar Frontend
echo [INFO] Aguardando Frontend...
:wait_frontend
curl -f http://localhost:13000 >nul 2>&1
if errorlevel 1 (
    timeout /t 3 /nobreak >nul
    goto wait_frontend
)

REM Mostrar status
echo [INFO] Status dos serviços:
docker-compose -f docker-compose.dev.yml ps

echo.
echo [INFO] URLs de acesso:
echo Frontend: http://localhost:13000
echo Backend API: http://localhost:13001
echo Nginx Proxy: http://localhost:18080
echo Prometheus: http://localhost:19090
echo Grafana: http://localhost:13002 ^(admin/admin^)
echo PostgreSQL: localhost:15432
echo Redis: localhost:16379

echo.
echo [INFO] Comandos úteis:
echo Ver logs: docker-compose -f docker-compose.dev.yml logs -f
echo Parar serviços: docker-compose -f docker-compose.dev.yml down
echo Reiniciar backend: docker-compose -f docker-compose.dev.yml restart backend
echo Reiniciar frontend: docker-compose -f docker-compose.dev.yml restart frontend

echo.
echo [INFO] === Ambiente de desenvolvimento iniciado com sucesso! ===
echo [INFO] O hot-reload está ativo. Faça alterações nos arquivos e veja as mudanças em tempo real.

pause
