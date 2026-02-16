@echo off
title DIANA - STARTUP COM AUTO-STOP
color 0B

echo.
echo ================================================
echo    DIANA CORPORACAO SENCIENTE - STARTUP
echo    COM SHUTDOWN AUTOMATICO AO FECHAR
echo ================================================
echo.

:: 1. Start Diana Native (PM2)
echo [1/2] Iniciando Diana Native (PM2)...
call "%~dp0Start-Diana-Native.bat"

:: 2. Launch Windows Terminal com auto-stop (em background)
echo.
echo [2/2] Lancando Windows Terminal com auto-stop...
echo.
echo [INFO] Ao fechar o Windows Terminal, todos processos
echo        serao automaticamente encerrados (PM2, Node, Python, etc)
echo.

start /B powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Launch-Diana-Terminal-AutoStop.ps1"
timeout /t 2 /nobreak >nul

echo.
echo [OK] Diana finalizado!
pause
