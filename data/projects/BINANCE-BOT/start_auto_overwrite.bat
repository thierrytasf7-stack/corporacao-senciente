@echo off
echo ========================================
echo    SOBRESCRITA AUTOMATICA - AURA BOT
echo ========================================
echo.
echo SOBRESCREVENDO LOGS-CONSOLE-FRONTEND.JSON automaticamente
echo Intervalo: 5 segundos
echo NÃO solicita local de salvamento
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

echo ✅ Python e Docker verificados
echo.

REM Executar sobrescrita automática
echo 🚀 Iniciando sobrescrita automática...
echo 📝 SOBRESCREVENDO a cada 5 segundos
echo 🛑 Pressione Ctrl+C para parar
echo.

python auto_overwrite_logs.py 5

echo.
echo ✅ Sobrescrita automática finalizada
pause
