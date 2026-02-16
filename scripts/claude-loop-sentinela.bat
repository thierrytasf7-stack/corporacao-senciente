@echo off
REM claude-loop-sentinela.bat - Wrapper que define env var e lança bash loop
set CLAUDE_CODE_GIT_BASH_PATH=D:\Git\bin\bash.exe
D:\Git\bin\bash.exe "%~dp0claude-loop-worker.sh" sentinela
