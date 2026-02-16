@echo off
echo ========================================
echo    CONSOLE WEB DETALHADO - AURA BOT
echo ========================================
echo.
echo Sistema de captura de console web em tempo real
echo Captura logs REAIS do frontend e backend
echo Atualiza automaticamente a cada 5 segundos
echo.

REM Verificar se Python está disponível
py --version >nul 2>&1
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
echo 📝 Atualizando a cada 5 segundos
echo 🔍 Capturando logs reais do sistema
echo 🛑 Pressione Ctrl+C para parar
echo.

py detailed_web_console.py 5

echo.
echo ✅ Captura do console web finalizada
pause
