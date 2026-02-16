@echo off
title WATCHER-REVISADOR
cd /d "%~dp0.."
python scripts\watcher-queue.py revisador
