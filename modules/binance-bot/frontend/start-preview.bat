@echo off
cd /d "%~dp0"
call npm run preview -- --port 21340 --host 0.0.0.0
