@echo off
REM Auto-Start: Paper Trading Bot
REM Mantém o bot rodando mesmo se fechar

echo.
echo ============================================================
echo AUTO-START: Paper Trading Bot - Tennis 30-0
echo ============================================================
echo.

cd /d "%~dp0"

REM Verificar Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Python nao encontrado
    pause
    exit /b 1
)

echo [OK] Python encontrado
echo.

REM Loop de auto-reinício
:loop
echo [%DATE% %TIME%] Iniciando bot...
python paper-trading-bot.py --continuous --simulate --interval 30

REM Se cair, reinicia após 5 segundos
echo [AVISO] Bot parou. Reiniciando em 5 segundos...
timeout /t 5 /nobreak
goto loop
