@echo off
cd /d "%~dp0"
set PORT=21371
set VITE_API_URL=http://localhost:21370
call npx vite --port 21371 --host
