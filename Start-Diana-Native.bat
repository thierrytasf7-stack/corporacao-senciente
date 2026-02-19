@echo off
setlocal
cd /d "%~dp0"
title DIANA CORPORACAO SENCIENTE - STARTUP

echo ====================================================
echo   DIANA CORPORACAO SENCIENTE - PM2 STARTUP
echo   (Servers + Apps - SEM workers evolucao)
echo ====================================================
echo.
echo   NOTA: Workers de evolucao (Genesis/Trabalhador/Revisador)
echo         rodam em Start-Evolucao.bat separado
echo ====================================================

:: 1. Limpar ambiente anterior (CLEANUP seletivo - NAO mata Claude ativo)
echo [*] Limpando processos anteriores (pm2, python workers)...
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "& { Get-Process python* -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like '*sentinela*' -or $_.CommandLine -like '*worker*' } | Stop-Process -Force }" >nul 2>&1
call npx pm2 kill >nul 2>&1

:: 2. Limpar triggers e locks residuais
echo [*] Limpando sinais residuais...
if exist ".trigger_*" del .trigger_*
if exist ".prompt_*.txt" del .prompt_*.txt
if exist ".worker_*.lock" del .worker_*.lock
if exist ".stop_*" del .stop_*
if exist ".session_*.txt" del .session_*.txt
if exist ".corp_prompt.json" del .corp_prompt.json

:: 2.5. Criar diretorios para daemon queues (workers de evolucao rodam em Start-Evolucao.bat separado)
echo [*] Criando diretorios de comunicacao daemon...
if not exist ".queue" mkdir .queue
if not exist ".output" mkdir .output

:: 3. Verificar identidade corporativa (IDENTITY LOCK)
echo [*] Verificando IDENTITY LOCK - Diana Corporacao Senciente...
call node scripts/identity-injector.js --check
if errorlevel 1 (
    echo.
    echo [ERROR] ====================================================
    echo [ERROR] IDENTITY LOCK FALHOU - Ecossistema NAO INICIALIZADO
    echo [ERROR] Corrija: .aios-core/config/identity.json
    echo [ERROR] ====================================================
    pause
    exit /b 1
)
echo [OK] IDENTITY LOCK validado

:: 3.5. Iniciar todos os processos via PM2
echo [*] Iniciando ecossistema via PM2...
call npx pm2 start ecosystem.config.js

:: 4. Mostrar status
echo.
echo [OK] Ecossistema iniciado. Status:
call npx pm2 status
echo.

:: 5. Lancar Windows Terminal em background (nao bloqueia terminal atual)
echo [*] Lancando Windows Terminal em background...
start /B powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Launch-Diana-Terminal.ps1"
timeout /t 2 /nobreak >nul

echo.
echo ====================================================
echo   SERVICOS ATIVOS:
echo   Dashboard AIOS:    http://localhost:21300
echo   Backend API:       http://localhost:21301
echo   Monitor WS:        ws://localhost:21302/stream
echo   Corp Frontend:     http://localhost:21303
echo   Binance Front:     http://localhost:21340
echo   Binance Back:      http://localhost:21341
echo   WhatsApp:          http://localhost:21350
echo   Betting Front:     http://localhost:21371
echo   Betting Back:      http://localhost:21370
echo.
echo   DNA Arena V2:      (PM2 - WORKERS)
echo.
echo   [Executores Isolados - server-executor.js]
echo   Testnet Futures:   http://localhost:21342/health
echo   Testnet Spot:      http://localhost:21343/health
echo   Mainnet Futures:   http://localhost:21344/health
echo   Mainnet Spot:      http://localhost:21345/health
echo ====================================================
echo.
echo   pm2 logs        = Ver logs em tempo real
echo   pm2 status      = Status dos processos
echo   pm2 restart all = Reiniciar tudo
echo   pm2 stop all    = Parar tudo
echo ====================================================

pause
