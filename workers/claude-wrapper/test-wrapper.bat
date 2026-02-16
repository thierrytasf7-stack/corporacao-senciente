@echo off
REM test-wrapper.bat - Testar wrapper Rust

echo Testando Claude Wrapper Rust...
echo.

REM Criar prompt de teste
echo Responda apenas "WRAPPER FUNCIONA" se conseguir me ouvir. > .queue\sentinela\wrapper_test_%RANDOM%.prompt

echo Prompt criado. Aguardando 10s...
timeout /t 10 /nobreak

echo.
echo === OUTPUT ===
type .output\sentinela\latest.txt

echo.
echo === DONE ===
