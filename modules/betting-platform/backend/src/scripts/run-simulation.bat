@echo off
title TESTNET BET ARENA - Simulation Loop
echo ====================================================
echo   TESTNET BET ARENA - 50 Bots Simulation
echo ====================================================
echo.
echo   Running simulation loop...
echo.

cd /d "%~dp0..\.."
npx ts-node src/scripts/testnet-simulation.ts

echo.
echo   Simulation cycle complete.
echo   In production, this loop runs continuously via PM2.
echo.
pause
