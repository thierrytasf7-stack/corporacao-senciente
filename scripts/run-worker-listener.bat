@echo off
setlocal
cd /d "%~dp0.."
title WORKER-GENESIS-MOTOR
color 0A

:wait_loop
cls
echo ====================================================
echo   DIANA : AGENTE ZERO (SESSAO GENESIS)
echo ====================================================
echo [*] Status: Vigilante (Aguardando Sinal do Topo)
echo.

:check_trigger
if exist ".trigger_worker" (
    echo [!!!] SINAL RECEBIDO EM %TIME%!
    del ".trigger_worker" >nul 2>&1
    
    :: -u forca o log em tempo real sem delay
    python -u scripts/worker_genesis_agent.py
    
    echo.
    echo [OK] Retornando ao estado de vigilia em 10s...
    timeout /t 10
    goto wait_loop
)
timeout /t 2 /nobreak >nul
goto check_trigger
