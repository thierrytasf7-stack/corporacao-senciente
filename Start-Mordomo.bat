@echo off
setlocal enabledelayedexpansion
title MORDOMO ATOMICO - GEMINI CLI (QWEN ENGINE)

:: ====================================================
:: 1. DEFINICAO DO AMBIENTE
:: ====================================================
set "PROJECT_ROOT=%~dp0"
cd /d "%PROJECT_ROOT%"

:: Limpar ruído visual
cls

echo ====================================================
echo   DIANA CORPORACAO SENCIENTE - MORDOMO ATOMICO
echo   Engine: Qwen-Code (Gemini CLI Compatible)
echo ====================================================

:: ====================================================
:: 2. PARAMETROS DE INVOCACAO
:: ====================================================

:: [ESTADO]
:: --continue: Carrega a última sessão (memória recente)
:: --resume <ID>: Carrega uma sessão específica
set "ESTADO=--continue"

:: [AUTONOMIA]
:: --yolo: Modo "You Only Live Once" - Sem confirmações (Autonomia Total)
:: --approval-mode default: Pede confirmação para ações críticas
set "AUTONOMIA=--yolo"

:: [CONHECIMENTO_LOCAL]
:: --include-directories ".": Indexa recursivamente o diretório atual
set "CONHECIMENTO_LOCAL=--include-directories ."

:: [PERSONALIDADE / CONTEXTO]
:: Arquivos que definem quem é a IA e o contexto do projeto.
:: O prefixo @ instrui o CLI a ler o conteúdo.
set "PERSONALIDADE="

:: Adicionar Contexto do Projeto (se existir)
if exist ".project-context.md" (
    set "PERSONALIDADE=!PERSONALIDADE! @.project-context.md"
)

:: Adicionar Contexto Diana (se existir)
if exist "CONTEXTO-DIANA.md" (
    set "PERSONALIDADE=!PERSONALIDADE! @CONTEXTO-DIANA.md"
)

:: Adicionar Protocolos Sencientes (se existir)
if exist ".sentient_protocols.md" (
    set "PERSONALIDADE=!PERSONALIDADE! @.sentient_protocols.md"
)

:: [ORDEM_DIRETA]
:: O comando inicial que a IA deve executar.
:: Se um argumento for passado para o .bat, usa ele. Caso contrário, usa o default.
if "%~1"=="" (
    set "ORDEM_DIRETA=Inicie o modo Mordomo Atômico. Analise o diretório raiz, identifique o estado atual das tarefas em ./docs/stories e execute a tarefa de maior prioridade usando Aider como motor de edição de código. Mantenha custo $0 e autonomia total."
) else (
    set "ORDEM_DIRETA=%~1"
)

:: ====================================================
:: 3. VISUALIZACAO E EXECUCAO
:: ====================================================

echo.
echo   [CONFIGURACAO]
echo   --------------
echo   ESTADO        : !ESTADO!
echo   AUTONOMIA     : !AUTONOMIA!
echo   CONHECIMENTO  : !CONHECIMENTO_LOCAL!
echo   PERSONALIDADE : !PERSONALITY_FILES! (Resumo)
echo   ORDEM         : "!ORDEM_DIRETA!"
echo.
echo   [INICIANDO QWEN ENGINE...]
echo.

:: Executa o CLI (Qwen) com os parâmetros montados
:: O "call" garante que o script não feche abruptamente se o Node.js terminar
call qwen !ESTADO! !AUTONOMIA! !CONHECIMENTO_LOCAL! !PERSONALIDADE! "!ORDEM_DIRETA!"

:: ====================================================
:: 4. ENCERRAMENTO
:: ====================================================
echo.
echo ====================================================
echo   Sessão encerrada.
echo ====================================================
pause
