@echo off
title DIANA SERVERS - PM2 MONITOR
color 0A
:: PM2 ja gerencia todos os servers via ecosystem.config.js
:: Esta aba monitora os logs em tempo real
echo ====================================================
echo   DIANA SERVERS - MONITORAMENTO PM2
echo ====================================================
echo.
echo   Dashboard:      http://localhost:21300
echo   Backend API:    http://localhost:21301
echo   Monitor WS:     ws://localhost:21302/stream
echo   Corp Frontend:  http://localhost:21303
echo   Binance Front:  http://localhost:21340
echo   Binance Back:   http://localhost:21341
echo   WhatsApp:       http://localhost:21350
echo.
echo ====================================================
echo.
npx pm2 logs --lines 50