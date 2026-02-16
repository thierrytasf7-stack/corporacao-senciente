@echo off
title WATCHER-ESCRIVAO
cd /d "%~dp0.."
python scripts\watcher-queue.py escrivao
