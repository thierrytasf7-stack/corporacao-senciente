@echo off
:: test-worker-individual.bat <worker-name>
:: Abre um worker individual em nova janela CMD para teste
:: Uso: test-worker-individual.bat sentinela

setlocal
set WORKER=%1

if "%WORKER%"=="" (
    echo ERRO: Especifique o worker (sentinela, escrivao, revisador, corp^)
    echo Uso: test-worker-individual.bat sentinela
    exit /b 1
)

echo.
echo ============================================
echo   TESTE INDIVIDUAL: WORKER %WORKER%
echo ============================================
echo.
echo [*] Abrindo worker %WORKER% em nova janela...
echo     Verifique que:
echo     1. Banner correto aparece
echo     2. Claude abre interativo
echo     3. Terminal atual NAO e afetado
echo.

start "DIANA-TEST-%WORKER%" cmd /k "cd /d %~dp0.. && scripts\run-claude-%WORKER%-stable.bat"

echo [OK] Worker %WORKER% lancado em nova janela!
echo      Feche a janela de teste quando terminar.
echo.
pause
