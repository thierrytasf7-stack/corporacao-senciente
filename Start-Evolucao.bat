@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
title DIANA EVOLUCAO - Workers Genesis/Trabalhador/Revisador

:MENU
cls
echo ====================================================
echo   DIANA EVOLUCAO - Workers de Desenvolvimento
echo ====================================================
echo.
echo   [1] Iniciar Workers (Genesis + Trabalhador + Revisador)
echo   [2] Editar Intencao Genesis  (INTENCAO-GENESIS.md)
echo   [3] Ver Stories Pendentes
echo   [4] Limpar Queues
echo.
set /p opcao="Escolha [1-4]: "

if "%opcao%"=="2" goto EDITAR_INTENCAO
if "%opcao%"=="3" goto VER_STORIES
if "%opcao%"=="4" goto LIMPAR_QUEUES
if not "%opcao%"=="1" goto MENU

:: ====================================================
:: OPCAO 1: Iniciar Workers
:: ====================================================

echo.
echo [*] Limpando workers anteriores...
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "Get-Process python* -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like '*sentinela*' } | Stop-Process -Force" >nul 2>&1

echo [*] Limpando filas residuais...
if exist ".queue\genesis\*.prompt" del .queue\genesis\*.prompt
if exist ".queue\trabalhador\*.prompt" del .queue\trabalhador\*.prompt
if exist ".queue\revisador\*.prompt" del .queue\revisador\*.prompt

echo [*] Criando diretorios...
if not exist ".queue\genesis" mkdir .queue\genesis
if not exist ".queue\trabalhador" mkdir .queue\trabalhador
if not exist ".queue\revisador" mkdir .queue\revisador
if not exist ".output\genesis" mkdir .output\genesis
if not exist ".output\trabalhador" mkdir .output\trabalhador
if not exist ".output\revisador" mkdir .output\revisador

echo [*] Lancando Windows Terminal com workers...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Launch-Diana-Terminal-Evolucao.ps1"

echo.
echo ====================================================
echo   WORKERS ATIVOS:
echo   - Sentinelas Python (background)
echo   - GENESIS    → Evolucao\Genesis-AIOS  + INTENCAO-GENESIS
echo   - TRABALHADOR→ Roteamento automatico por tipo de story
echo   - REVISADOR  → Desenvolvimento\QA-AIOS
echo   - INTENCAO   → Editor da direcao Genesis
echo   Engine: ver CLI_DEFAULT em MULTI-CLIS.bat
echo ====================================================
echo.
goto FIM

:: ====================================================
:: OPCAO 2: Editar Intencao Genesis
:: ====================================================
:EDITAR_INTENCAO
cls
echo ====================================================
echo   INTENCAO GENESIS - Editor
echo ====================================================
echo.
if not exist "INTENCAO-GENESIS.md" (
    echo [!] INTENCAO-GENESIS.md nao encontrado. Criando...
    echo # INTENCAO GENESIS > INTENCAO-GENESIS.md
    echo. >> INTENCAO-GENESIS.md
    echo ## Foco Atual >> INTENCAO-GENESIS.md
    echo Edite este arquivo para direcionar o Genesis. >> INTENCAO-GENESIS.md
)
echo Abrindo INTENCAO-GENESIS.md no Notepad...
echo (Salve e feche o Notepad para continuar)
echo.
start /wait notepad.exe INTENCAO-GENESIS.md
echo.
echo [OK] Intencao atualizada.
pause
goto MENU

:: ====================================================
:: OPCAO 3: Ver Stories Pendentes
:: ====================================================
:VER_STORIES
cls
echo ====================================================
echo   STORIES PENDENTES (docs\stories\)
echo ====================================================
echo.
set "count=0"
for /f "delims=" %%f in ('dir /b docs\stories\*.md 2^>nul') do (
    set /a count+=1
    echo  [!count!] %%f
)
if "!count!"=="0" echo  (nenhuma story na raiz - Genesis pode gerar novas)
echo.
echo  --- Pasta active\ ---
for /f "delims=" %%f in ('dir /b docs\stories\active\*.md 2^>nul') do (
    echo  [active] %%f
)
echo.
pause
goto MENU

:: ====================================================
:: OPCAO 4: Limpar Queues
:: ====================================================
:LIMPAR_QUEUES
cls
echo [*] Limpando todas as queues...
if exist ".queue\genesis\*.prompt" del .queue\genesis\*.prompt & echo  genesis: limpa
if exist ".queue\trabalhador\*.prompt" del .queue\trabalhador\*.prompt & echo  trabalhador: limpa
if exist ".queue\revisador\*.prompt" del .queue\revisador\*.prompt & echo  revisador: limpa
echo [OK] Queues limpas.
pause
goto MENU

:FIM
pause
