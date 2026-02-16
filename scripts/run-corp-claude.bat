@echo off
setlocal
cd /d "%~dp0.."
title WORKER-CORP-CLAUDE
color 0A

:wait_loop
cls
echo ============================================
echo   DIANA WORKER: CORP SENCIENTE (AUTOMATIZADO)
echo   Papel: Orquestrador corporativo geral
echo   Modelo: Sonnet 4.5 + CEO-ZERO
echo   Contador: A cada 10 tasks reinicia CEO-ZERO
echo ============================================
echo [*] Status: Aguardando sinal da Sentinela...

:check_trigger
if exist ".trigger_corp" (
    echo [INFO] Sinal recebido. Iniciando Claude...
    del ".trigger_corp" >nul 2>&1

    :: Criar lock
    echo running > .worker_corp.lock

    echo [EXEC] Chamando scripts/claude-worker-auto.py corp...
    echo =============================================
    python -u scripts/claude-worker-auto.py corp
    echo =============================================

    :: Limpar lock
    del .worker_corp.lock >nul 2>&1

    echo.
    echo [OK] Processamento concluido. Retornando ao estado de vigilia.
    timeout /t 5
    goto wait_loop
)
timeout /t 2 /nobreak >nul
goto check_trigger
