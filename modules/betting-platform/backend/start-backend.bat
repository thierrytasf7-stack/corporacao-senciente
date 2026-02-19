@echo off
cd /d "%~dp0"
set PORT=21370
set NODE_ENV=production
call npx ts-node src/index.ts
