@echo off
echo ========================================
echo    SISTEMA DE LOGS DOCKER - AURA BOT
echo ========================================
echo.
echo Iniciando captura de logs reais do Docker...
echo SOBRESCREVENDO automaticamente a cada 5 segundos
echo.

REM Verificar se Python está disponível
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python não encontrado!
    echo 💡 Instale o Python e tente novamente
    pause
    exit /b 1
)

REM Verificar se Docker está disponível
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker não encontrado!
    echo 💡 Instale o Docker e tente novamente
    pause
    exit /b 1
)

REM Verificar se containers estão rodando
docker ps | findstr "aura-binance" >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Containers aura-binance não encontrados!
    echo 💡 Execute: docker-compose up -d
    pause
    exit /b 1
)

echo ✅ Docker e containers verificados
echo.

REM Executar captura de logs Docker - SOBRESCREVENDO a cada 5 segundos
echo 🚀 Executando captura de logs Docker...
echo 📝 SOBRESCREVENDO LOGS-CONSOLE-FRONTEND.JSON a cada 5 segundos
python docker_real_logger.py --continuous 5

echo.
echo ✅ Captura de logs Docker finalizada
pause
