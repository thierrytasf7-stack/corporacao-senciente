@echo off
echo ========================================
echo    SISTEMA DE LOGS REAIS - AURA BOT
echo ========================================
echo.
echo Iniciando captura de logs reais...
echo.

REM Verificar se Python está disponível
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python não encontrado!
    echo 💡 Instale o Python e tente novamente
    pause
    exit /b 1
)

REM Executar captura de logs reais
echo 🚀 Executando captura de logs...
python simple_real_logger.py --continuous 10

echo.
echo ✅ Captura de logs finalizada
pause
