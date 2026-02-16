@echo off
title CLAUDE-SENTINELA
cd /d "%~dp0.."
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0claude-worker.ps1" -WorkerName sentinela
pause
