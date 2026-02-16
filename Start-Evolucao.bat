@echo off
setlocal
cd /d "%~dp0"
title DIANA EVOLUCAO - Workers Genesis/Trabalhador/Revisador

echo ====================================================
echo   DIANA EVOLUCAO - Workers de Desenvolvimento
echo ====================================================
echo.
echo   IMPORTANTE: Este startup roda em sessao ISOLADA
echo   para permitir invocacao de Claude CLI sem conflito.
echo ====================================================
echo.

:: 1. Limpar workers anteriores
echo [*] Limpando workers anteriores...
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "& { Get-Process python* -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like '*sentinela*' } | Stop-Process -Force }" >nul 2>&1

:: 2. Limpar queue e outputs residuais
echo [*] Limpando filas residuais...
if exist ".queue\genesis\*.prompt" del .queue\genesis\*.prompt
if exist ".queue\trabalhador\*.prompt" del .queue\trabalhador\*.prompt
if exist ".queue\revisador\*.prompt" del .queue\revisador\*.prompt

:: 3. Criar diretorios
echo [*] Criando diretorios de comunicacao...
if not exist ".queue\genesis" mkdir .queue\genesis
if not exist ".queue\trabalhador" mkdir .queue\trabalhador
if not exist ".queue\revisador" mkdir .queue\revisador
if not exist ".output\genesis" mkdir .output\genesis
if not exist ".output\trabalhador" mkdir .output\trabalhador
if not exist ".output\revisador" mkdir .output\revisador

:: 4. Lancar Windows Terminal com 4 abas (sentinelas + workers)
echo [*] Lancando Windows Terminal com workers...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Launch-Diana-Terminal-Evolucao.ps1"

echo.
echo ====================================================
echo   WORKERS ATIVOS EM TERMINAL SEPARADO:
echo   - Aba 1: Sentinela Genesis (Python)
echo   - Aba 2: Worker Genesis (PowerShell + CEO-ZERO)
echo   - Aba 3: Worker Trabalhador (PowerShell + CEO-ZERO)
echo   - Aba 4: Worker Revisador (PowerShell + CEO-ZERO)
echo ====================================================
echo.
echo   Cada worker invoca /CEOs:CEO-ZERO para processar tasks
echo   Outputs salvos em .output/{worker}/task_N.txt
echo ====================================================
echo.

pause
