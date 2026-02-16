@echo off
title WATCHER-SENTINELA
cd /d "%~dp0.."
python scripts\watcher-queue.py sentinela
