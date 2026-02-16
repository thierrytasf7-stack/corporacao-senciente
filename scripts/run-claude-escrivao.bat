@echo off
title CLAUDE-ESCRIVAO
cd /d "%~dp0.."
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0claude-worker.ps1" -WorkerName escrivao
pause
