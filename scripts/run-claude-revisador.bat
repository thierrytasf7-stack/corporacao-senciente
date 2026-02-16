@echo off
title CLAUDE-REVISADOR
cd /d "%~dp0.."
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0claude-worker.ps1" -WorkerName revisador
pause
