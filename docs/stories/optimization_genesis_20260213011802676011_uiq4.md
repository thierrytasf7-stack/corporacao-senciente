# [STORY-20260213011802-1] Cache de Resultados de Syntax Check no Zero Worker
> **Status:** REVISADO
> **subStatus:** waiting_human_approval
> **Agente Sugerido:** @agente-zero
> **Agente AIOS:** 💻 @dev (Dex) - Full Stack Developer
> **Skill:** `/AIOS:agents:dev`
> **Tipo:** optimization
> **Dificuldade:** LOW
> **Prioridade:** Alta
> **Criado em:** 2026-02-13 01:18:02

## Contexto
O Zero worker roda syntax check em dezenas de arquivos a cada ciclo, muitos dos quais nao mudaram. Cachear resultados por mtime elimina checagens redundantes, reduzindo tempo de ciclo e uso de CPU significativamente.

## Objetivo
O Zero worker roda syntax check nos mesmos arquivos repetidamente entre stories. Implementar cache em memoria baseado em mtime para evitar re-checar arquivos que nao mudaram desde o ultimo check.

## Responsavel
**💻 Dex** (Full Stack Developer) e o agente AIOS responsavel por esta task.
- **Foco:** Implementacao de codigo, debugging, testes unitarios e de integracao
- **Invocacao:** `/AIOS:agents:dev`
- **Executor runtime:** `@agente-zero` (worker autonomo que processa a story)

## Arquivos Alvo
- `scripts/`

## Output Esperado
- Dicionario _syntax_cache no zero_worker_engine.py com chave (filepath, mtime) e valor resultado
- Funcao check_syntax_cached(filepath) que consulta cache antes de rodar check
- Log safe_print indicando CACHE HIT ou CACHE MISS para cada arquivo checado
- Reducao mensuravel no tempo de ciclos consecutivos do worker

## Acceptance Criteria
- [x] Cache de syntax check implementado com invalidacao por mtime
- [?] Segundo ciclo do worker significativamente mais rapido
- [?] Cache limpo automaticamente a cada inicializacao do worker
- [?] Log indicando cache hit/miss para debugging

## Constraints
- Cache em memoria apenas (dict Python) - sem persistencia em disco
- Cache deve ser limpo no inicio de cada execucao do worker (nao entre ciclos)
- Usar os.path.getmtime() para obter mtime do arquivo
- NAO modificar arquivos fora do escopo listado em Arquivos Alvo
- NAO introduzir dependencias externas sem justificativa
- NAO quebrar funcionalidades existentes

## Instrucoes
1. Criar dicionario global _syntax_cache = {} no zero_worker_engine.py. 2. Antes de rodar syntax check, verificar se (filepath, mtime) esta no cache. 3. Se mtime nao mudou, retornar resultado cacheado. 4. Adicionar log de cache hit/miss para monitoramento.

## Exemplo de Referencia
```
import os
from typing import Optional

_syntax_cache: dict[tuple[str, float], bool] = {}

def check_syntax_cached(filepath: str) -> bool:
    try:
        mtime = os.path.getmtime(filepath)
    except OSError:
        return False
    cache_key = (filepath, mtime)
    if cache_key in _syntax_cache:
        safe_print(f'  [CACHE HIT] {os.path.basename(filepath)}')
        return _syntax_cache[cache_key]
    safe_print(f'  [CACHE MISS] {os.path.basename(filepath)}')
    result = run_syntax_check(filepath)
    _syntax_cache[cache_key] = result
    return result
```


## Execution Log
> Executed at: 2026-02-13T01:18:13.306208
> Total targets: 1
> Files checked: 33
> Overall: ALL PASS
> scripts\aider_with_fallback.py: PASS - Python syntax OK
> scripts\aider_worker_engine.py: PASS - Python syntax OK
> scripts\audit-dependencies.py: PASS - Python syntax OK
> scripts\check-diana-status.py: PASS - Python syntax OK
> scripts\gen-audit.py: PASS - Python syntax OK
> scripts\list-diana-procs.py: PASS - Python syntax OK
> scripts\pipeline-validate.py: PASS - Python syntax OK
> scripts\pm2-wrapper.js: PASS - JS/TS syntax OK
> scripts\pm2-wrapper.py: PASS - Python syntax OK
> scripts\qa-explore-routes.js: PASS - JS/TS syntax OK
> scripts\sentinela_escrivao_aider.py: PASS - Python syntax OK
> scripts\sentinela_genesis_saude.py: PASS - Python syntax OK
> scripts\sentinela_revisor_agentezero.py: PASS - Python syntax OK
> scripts\stress-test-20-stories.py: PASS - Python syntax OK
> scripts\stress-test-live.py: PASS - Python syntax OK
> scripts\stress-test-mini.py: PASS - Python syntax OK
> scripts\stress-test-quick.py: PASS - Python syntax OK
> scripts\verificar_sistema.py: PASS - Python syntax OK
> scripts\worker_genesis_agent.py: PASS - Python syntax OK
> scripts\write-audit.js: PASS - JS/TS syntax OK
> scripts\zero_worker_engine.py: PASS - Python syntax OK
> scripts\migration\MigrationState-README.md: PASS - Markdown OK (11783 bytes, has headings)
> scripts\migration\README.md: PASS - Markdown OK (12058 bytes, has headings)
> scripts\migration\TASK-2.1-COMPLETION.md: PASS - Markdown OK (8345 bytes, has headings)
> scripts\migration\TASK-2.2-COMPLETION.md: PASS - Markdown OK (10856 bytes, has headings)
> scripts\migration\docker-cleanup-report.json: PASS - File exists (7785 bytes, no syntax check for .json)
> scripts\migration\inventory.json: PASS - File exists (82490 bytes, no syntax check for .json)
> scripts\migration\sample-inventory-output.json: PASS - File exists (3861 bytes, no syntax check for .json)
> scripts\migration\test-output\container-termination-report.json: PASS - File exists (2357 bytes, no syntax check for .json)
> scripts\migration\test-output\mock-inventory.json: PASS - File exists (417 bytes, no syntax check for .json)
> scripts\migration\test-output\test-inventory.json: PASS - File exists (149 bytes, no syntax check for .json)
> scripts\migration\test-output\test-migration-state.json: PASS - File exists (820 bytes, no syntax check for .json)
> scripts\senciencia\daemon_auto_continue.js: PASS - JS/TS syntax OK
