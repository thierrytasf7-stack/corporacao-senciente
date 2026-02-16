@echo off
setlocal
cd /d "%~dp0.."
title WORKER-ZERO-REVISOR
color 0B

:wait_loop
cls
echo ====================================================
echo   DIANA : MOTOR AGENTE ZERO (EXECUCAO E REVISAO)
echo ====================================================
echo [*] Status: Aguardando sinal do Sentinela...

:check_trigger
if exist ".trigger_revisor" (
    echo [INFO] Sinal recebido. Iniciando Motor Zero...
    del ".trigger_revisor" >nul 2>&1
    
    :: Criar lock
    echo running > .worker_revisor.lock
    
    echo [EXEC] Chamando scripts/zero_worker_engine.py...
    echo ----------------------------------------------------
    python -u scripts/zero_worker_engine.py
    echo ----------------------------------------------------
    
    :: Limpar lock
    del .worker_revisor.lock >nul 2>&1
    
    echo.
    echo [OK] Ciclo finalizado. Retornando a vigilia.
    timeout /t 5
    goto wait_loop
)
timeout /t 3 /nobreak >nul
goto check_trigger