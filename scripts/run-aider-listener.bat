@echo off
setlocal
cd /d "%~dp0.."
title WORKER-AIDER-EXEC
color 0D

:wait_loop
cls
echo ====================================================
echo   DIANA : PAINEL DE EXECUCAO AIDER (PYTHON ENGINE)
echo ====================================================
echo [*] Status: Aguardando sinal da Sentinela...

:check_trigger
if exist ".trigger_aider" (
    echo [INFO] Sinal recebido. Iniciando motor Aider...
    del ".trigger_aider" >nul 2>&1
    
    :: Criar lock
    echo running > .worker_aider.lock
    
    echo [EXEC] Chamando scripts/aider_worker_engine.py...
    echo ----------------------------------------------------
    :: Invocacao do motor Python com output em tempo real
    python -u scripts/aider_worker_engine.py
    echo ----------------------------------------------------
    
    :: Limpar lock
    del .worker_aider.lock >nul 2>&1
    
    echo.
    echo [OK] Tarefa finalizada. Retornando ao estado de vigilia.
    timeout /t 10
    goto wait_loop
)
timeout /t 3 /nobreak >nul
goto check_trigger
