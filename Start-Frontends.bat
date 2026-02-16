@echo off
echo ============================================
echo  DIANA FRONTENDS - Startup
echo ============================================
echo.

echo [1/3] Starting Dashboard UI (21300)...
start "Dashboard-UI" powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0apps\dashboard\start-dashboard.ps1"
timeout /t 3 /nobreak >nul

echo [2/3] Starting Binance Frontend (21340)...
start "Binance-Frontend" powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0modules\binance-bot\frontend\start-frontend.ps1"
timeout /t 3 /nobreak >nul

echo [3/3] Starting Corp Frontend (21303)...
start "Corp-Frontend" powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0apps\frontend\start-frontend.ps1"
timeout /t 3 /nobreak >nul

echo.
echo ============================================
echo  All frontends starting...
echo
echo  Dashboard:  http://localhost:21300
echo  Binance:    http://localhost:21340
echo  Corp:       http://localhost:21303
echo ============================================
echo.
echo Press any key to exit (frontends will keep running)...
pause >nul
