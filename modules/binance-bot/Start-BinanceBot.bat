@echo off
echo ============================================
echo  DIANA BINANCE BOT - Startup
echo  Backend: http://localhost:21341
echo  Frontend: http://localhost:21340
echo ============================================
echo.

echo [1/3] Starting Backend (port 21341)...
cd /d "%~dp0backend"
start "BinanceBot-Backend" cmd /k "npx ts-node src/real-server.ts"

echo Waiting 8 seconds for backend to initialize...
timeout /t 8 /nobreak >nul

echo [2/3] Starting Frontend (port 21340)...
cd /d "%~dp0frontend"
start "BinanceBot-Frontend" cmd /k "npx vite --port 21340"

echo [3/3] Opening browser...
timeout /t 5 /nobreak >nul
start http://localhost:21340

echo.
echo ============================================
echo  BinanceBot is running!
echo  Dashboard: http://localhost:21340
echo  API: http://localhost:21341/health
echo
echo  To start auto-trading:
echo    1. Open dashboard
echo    2. Go to Analysis page
echo    3. Click "Start Analysis"
echo ============================================
pause
