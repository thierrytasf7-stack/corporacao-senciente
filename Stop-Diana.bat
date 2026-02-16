@echo off
title DIANA - SHUTDOWN TOTAL
color 0C

echo.
echo ================================================
echo    DIANA CORPORACAO SENCIENTE - SHUTDOWN
echo ================================================
echo.
echo [!] Este script vai MATAR TODOS os processos:
echo     - PM2 e processos gerenciados
echo     - Guardian Hive (background)
echo     - Node.js (dashboard, backend, binance)
echo     - Python (sentinelas)
echo     - Claude CLI (workers)
echo     - Windows Terminal
echo.

choice /C SN /M "Confirma SHUTDOWN TOTAL"
if errorlevel 2 goto :cancel

echo.
echo [*] Executando shutdown...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Stop-Diana-Complete.ps1"

echo.
echo [OK] Shutdown completo!
pause
goto :end

:cancel
echo.
echo [*] Shutdown cancelado.
pause

:end
