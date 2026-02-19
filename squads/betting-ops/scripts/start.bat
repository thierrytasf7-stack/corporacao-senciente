@echo off
REM Inicialização Rápida: Paper Trading Bots
REM Tennis Favorite 30-0 Comeback

echo.
echo ============================================================
echo PAPER TRADING: Tennis Favorite 30-0 Comeback
echo ============================================================
echo.

cd /d "%~dp0"

REM Verificar se Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Python nao encontrado. Instale Python 3.8+
    pause
    exit /b 1
)

echo [OK] Python encontrado
echo.

REM Menu de opções
echo Escolha uma opcao:
echo.
echo 1. Iniciar bot (uma execucao)
echo 2. Iniciar bot (continuo - 60s)
echo 3. Iniciar bot (continuo - 5min)
echo 4. Ver status/monitor
echo 5. Gerar relatorio diario
echo 6. Ver log de apostas
echo 7. Ver estado atual
echo 8. Sair
echo.
set /p choice="Digite o numero da opcao: "

if "%choice%"=="1" goto once
if "%choice%"=="2" goto continuous1
if "%choice%"=="3" goto continuous5
if "%choice%"=="4" goto monitor
if "%choice%"=="5" goto report
if "%choice%"=="6" goto log
if "%choice%"=="7" goto state
if "%choice%"=="8" goto end

:once
echo.
echo [BOT] Executando uma vez...
python paper-trading-bot.py --once --simulate
goto menu

:continuous1
echo.
echo [BOT] Iniciando modo continuo (60s)...
echo Pressione Ctrl+C para parar
python paper-trading-bot.py --continuous --simulate --interval 60
goto menu

:continuous5
echo.
echo [BOT] Iniciando modo continuo (5min)...
echo Pressione Ctrl+C para parar
python paper-trading-bot.py --continuous --simulate --interval 300
goto menu

:monitor
echo.
echo [MONITOR] Verificando status e alertas...
python monitor.py --alert
goto menu

:report
echo.
echo [REPORT] Gerando relatorio diario...
python monitor.py --report
goto menu

:log
echo.
echo [LOG] Abrindo log de apostas...
if exist "data\paper-trading-log.md" (
    start data\paper-trading-log.md
) else (
    echo [ERRO] Log nao encontrado
)
goto menu

:state
echo.
echo [STATE] Estado atual:
if exist "data\paper-trading-state.json" (
    type data\paper-trading-state.json
) else (
    echo [ERRO] Estado nao encontrado
)
goto menu

:menu
echo.
pause
goto :EOF

:end
echo.
echo [OK] Encerrado
pause
