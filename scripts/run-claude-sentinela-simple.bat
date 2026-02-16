@echo off
title SENTINELA-CLAUDE (SIMPLES)
cd /d "%~dp0.."

echo.
echo ============================================
echo   DIANA WORKER: SENTINELA
echo   Papel: Genesis - gera stories sencientes
echo ============================================
echo.
echo [*] Aguarde 60 segundos para inicializacao...
echo.
timeout /t 60 /nobreak
echo.
echo ============================================
echo   ATIVACAO CEO-ZERO
echo ============================================
echo.
echo Voce e o worker 'sentinela' da Diana Corporacao Senciente.
echo Papel: Genesis - gera stories de evolucao senciente
echo.
echo Ative o modo CEO-ZERO (Zeus) para orquestrar tasks via Agent Zero.
echo Use *fire para tasks simples e *batch para multiplas.
echo Delegue para Agent Zero sempre que possivel (modelos free).
echo.
echo Confirme ativacao respondendo: WORKER SENTINELA ONLINE
echo.
echo ============================================
echo   COLE A MENSAGEM ACIMA NO CLAUDE
echo ============================================
echo.
pause
echo.
echo [OK] Iniciando Claude interativo...
echo      O sentinela criara triggers em .trigger_sentinela
echo      Voce deve processar os prompts manualmente
echo.
claude
