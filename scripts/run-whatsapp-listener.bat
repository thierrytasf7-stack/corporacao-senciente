@echo off
setlocal
cd /d "%~dp0.."
title WORKER-WHATSAPP-ALEX
color 0B

:wait_loop
cls
echo ====================================================
echo   DIANA : WORKER WHATSAPP ALEX (CLAUDE ENGINE)
echo ====================================================
echo [*] Status: Aguardando sinal da Sentinela...

:check_trigger
if exist ".trigger_whatsapp" (
    echo [INFO] Sinal recebido. Iniciando Claude...
    del ".trigger_whatsapp" >nul 2>&1

    :: Criar lock
    echo running > .worker_whatsapp.lock

    echo [EXEC] Chamando scripts/worker_whatsapp_alex.py...
    echo ----------------------------------------------------
    python -u scripts/worker_whatsapp_alex.py
    echo ----------------------------------------------------

    :: Limpar lock
    del .worker_whatsapp.lock >nul 2>&1

    echo.
    echo [OK] Resposta enviada. Retornando ao estado de vigilia.
    timeout /t 5
    goto wait_loop
)
timeout /t 2 /nobreak >nul
goto check_trigger
