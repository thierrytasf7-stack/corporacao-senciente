@echo off
setlocal
set WORKER=%1

if "%WORKER%"=="" (
    echo Uso: monitor-output.bat ^<worker^>
    echo Exemplo: monitor-output.bat sentinela
    exit /b 1
)

title %WORKER%-OUTPUT

cd /d "%~dp0.."

echo.
echo ============================================
echo   DIANA OUTPUT MONITOR - %WORKER%
echo   Daemon output em tempo real
echo ============================================
echo.
echo Aguardando daemon criar output...

:: Aguardar arquivo existir
:WAIT_FILE
if not exist ".output\%WORKER%\latest.txt" (
    timeout /t 2 /nobreak >nul
    goto WAIT_FILE
)

echo Output detectado! Monitorando...
echo.

:: Usar PowerShell Get-Content -Wait (equivalente a tail -f)
powershell.exe -NoProfile -Command "Get-Content -Path '.output\%WORKER%\latest.txt' -Wait"
