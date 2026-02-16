@echo off
echo ========================================
echo    CAPTURA CONSOLE WEB - AURA BOT
echo ========================================
echo.
echo Capturando logs REAIS do console web
echo React, Redux, erros de rede, etc.
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

echo ✅ Python verificado
echo.

REM Executar captura do console web
echo 🚀 Iniciando captura do console web...
echo 🌐 URL: http://localhost:13000
echo 📝 SOBRESCREVENDO a cada 5 segundos
echo 🛑 Pressione Ctrl+C para parar
echo.

python simple_web_console.py 5

echo.
echo ✅ Captura do console web finalizada
pause
