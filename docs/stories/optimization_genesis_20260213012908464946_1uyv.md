# [STORY-20260213012908-4] Debounce e Throttle nos Event Listeners do Dashboard
> **Status:** REVISADO
> **subStatus:** waiting_human_approval
> **Agente Sugerido:** @agente-zero
> **Agente AIOS:** 💻 @dev (Dex) - Full Stack Developer
> **Skill:** `/AIOS:agents:dev`
> **Tipo:** optimization
> **Dificuldade:** LOW
> **Prioridade:** Alta
> **Criado em:** 2026-02-13 01:29:08

## Contexto
Re-renders excessivos por event listeners nao otimizados consomem CPU desnecessariamente e causam jank visual. Em um dashboard de monitoramento que roda continuamente, performance suave e essencial para nao distrair o operador.

## Objetivo
Varios componentes do dashboard registram event listeners para resize, scroll e input sem debounce, causando re-renders excessivos. Implementar hooks utilitarios useDebounce e useThrottle e aplicar nos componentes afetados.

## Responsavel
**💻 Dex** (Full Stack Developer) e o agente AIOS responsavel por esta task.
- **Foco:** Implementacao de codigo, debugging, testes unitarios e de integracao
- **Invocacao:** `/AIOS:agents:dev`
- **Executor runtime:** `@agente-zero` (worker autonomo que processa a story)

## Arquivos Alvo
- `apps/dashboard/src/hooks/`
- `apps/dashboard/src/components/`

## Output Esperado
- Arquivo apps/dashboard/src/hooks/use-debounce.ts exportando useDebounce com tipo generico
- Arquivo apps/dashboard/src/hooks/use-throttle.ts exportando useThrottle com tipo generico
- Hooks re-exportados em apps/dashboard/src/hooks/index.ts
- Componentes com resize/scroll listeners usando os novos hooks

## Acceptance Criteria
- [?] Hook useDebounce criado e funcional
- [?] Hook useThrottle criado e funcional
- [?] Componentes com listeners otimizados usando os hooks
- [?] Re-renders reduzidos verificaveis via React DevTools

## Constraints
- Hooks devem ser genericos com TypeScript (useDebounce<T>)
- Usar useRef e useEffect internamente - sem dependencias externas (lodash)
- Cleanup de timers no useEffect return para evitar memory leaks
- NAO modificar arquivos fora do escopo listado em Arquivos Alvo
- NAO introduzir dependencias externas sem justificativa
- NAO quebrar funcionalidades existentes

## Instrucoes
1. Criar useDebounce em apps/dashboard/src/hooks/use-debounce.ts. 2. Criar useThrottle em apps/dashboard/src/hooks/use-throttle.ts. 3. Identificar componentes com addEventListener sem debounce. 4. Aplicar os hooks nos componentes identificados.

## Exemplo de Referencia
```
import { useState, useEffect, useRef } from 'react';

export function useDebounce<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
```


## Execution Log
> Executed at: 2026-02-13T01:29:21.863599
> Total targets: 2
> Files checked: 65
> Overall: HAS FAILURES
> apps\dashboard\src\hooks\index.ts: PASS - JS/TS syntax OK
> apps\dashboard\src\hooks\use-agents.ts: PASS - JS/TS syntax OK
> apps\dashboard\src\hooks\use-aios-status.ts: PASS - JS/TS syntax OK
> apps\dashboard\src\hooks\use-monitor-events.ts: PASS - JS/TS syntax OK
> apps\dashboard\src\hooks\use-realtime-status.ts: PASS - JS/TS syntax OK
> apps\dashboard\src\hooks\use-stories.ts: PASS - JS/TS syntax OK
> apps\dashboard\src\hooks\use-workers.ts: PASS - JS/TS syntax OK
> apps\dashboard\src\hooks\useQueryCache.ts: FAIL - C:\Users\User\Desktop\Diana-Corporacao-Senciente\apps\dashboard\src\hooks\useQueryCache.ts:4
interface CacheEntry<T> {
          ^^^^^^^^^^

SyntaxError: Unexpected identifier 'CacheEntry'
    at wrapSafe (node:internal/modules/cjs/loader:1734:18)
    at checkSyntax (node:internal/main/check_syntax:76:3)

Node.js v25.4.0
> apps\dashboard\src\components\agents\AgentCard.tsx: PASS - JSX/TSX OK (6060 bytes)
> apps\dashboard\src\components\agents\AgentMonitor.tsx: PASS - JSX/TSX OK (6133 bytes)
> apps\dashboard\src\components\agents\index.ts: PASS - JS/TS syntax OK
> apps\dashboard\src\components\context\ContextPanel.tsx: PASS - JSX/TSX OK (10385 bytes)
> apps\dashboard\src\components\context\index.ts: PASS - JS/TS syntax OK
> apps\dashboard\src\components\github\GitHubPanel.tsx: PASS - JSX/TSX OK (12147 bytes)
> apps\dashboard\src\components\github\index.ts: PASS - JS/TS syntax OK
> apps\dashboard\src\components\insights\InsightsPanel.tsx: PASS - JSX/TSX OK (11533 bytes)
> apps\dashboard\src\components\insights\index.ts: PASS - JS/TS syntax OK
> apps\dashboard\src\components\kanban\KanbanBoard.tsx: PASS - JSX/TSX OK (8431 bytes)
> apps\dashboard\src\components\kanban\KanbanColumn.tsx: PASS - JSX/TSX OK (6177 bytes)
> apps\dashboard\src\components\kanban\SortableStoryCard.tsx: PASS - JSX/TSX OK (1685 bytes)
> apps\dashboard\src\components\kanban\index.ts: PASS - JS/TS syntax OK
> apps\dashboard\src\components\layout\AppShell.tsx: PASS - JSX/TSX OK (4517 bytes)
> apps\dashboard\src\components\layout\ProjectTabs.tsx: PASS - JSX/TSX OK (6185 bytes)
> apps\dashboard\src\components\layout\Sidebar.tsx: PASS - JSX/TSX OK (4954 bytes)
> apps\dashboard\src\components\layout\StatusBar.tsx: PASS - JSX/TSX OK (4221 bytes)
> apps\dashboard\src\components\layout\index.ts: PASS - JS/TS syntax OK
> apps\dashboard\src\components\monitor\ActivityFeed.tsx: PASS - JSX/TSX OK (8426 bytes)
> apps\dashboard\src\components\monitor\CommandPanel.tsx: PASS - JSX/TSX OK (4465 bytes)
> apps\dashboard\src\components\monitor\CurrentToolIndicator.tsx: PASS - JSX/TSX OK (3386 bytes)
> apps\dashboard\src\components\monitor\MonitorPanel.tsx: PASS - JSX/TSX OK (3474 bytes)
> apps\dashboard\src\components\monitor\MonitorStatus.tsx: PASS - JSX/TSX OK (2687 bytes)
> apps\dashboard\src\components\monitor\index.ts: PASS - JS/TS syntax OK
> apps\dashboard\src\components\qa\QAMetricsPanel.tsx: PASS - JSX/TSX OK (20504 bytes)
> apps\dashboard\src\components\roadmap\RoadmapCard.tsx: PASS - JSX/TSX OK (2103 bytes)
> apps\dashboard\src\components\roadmap\RoadmapView.tsx: PASS - JSX/TSX OK (10324 bytes)
> apps\dashboard\src\components\roadmap\index.ts: PASS - JS/TS syntax OK
> apps\dashboard\src\components\settings\SettingsPanel.tsx: PASS - JSX/TSX OK (10700 bytes)
> apps\dashboard\src\components\settings\index.ts: PASS - JS/TS syntax OK
> apps\dashboard\src\components\stories\StoryCard.tsx: PASS - JSX/TSX OK (4076 bytes)
> apps\dashboard\src\components\stories\StoryCreateModal.tsx: PASS - JSX/TSX OK (14066 bytes)
> apps\dashboard\src\components\stories\StoryDetailModal.tsx: PASS - JSX/TSX OK (8890 bytes)
> apps\dashboard\src\components\stories\StoryEditModal.tsx: PASS - JSX/TSX OK (18265 bytes)
> apps\dashboard\src\components\stories\index.ts: PASS - JS/TS syntax OK
> apps\dashboard\src\components\terminal\TerminalOutput.tsx: PASS - JSX/TSX OK (6234 bytes)
> apps\dashboard\src\components\terminal\index.ts: PASS - JS/TS syntax OK
> apps\dashboard\src\components\terminals\TerminalCard.tsx: PASS - JSX/TSX OK (6161 bytes)
> apps\dashboard\src\components\terminals\TerminalGrid.tsx: PASS - JSX/TSX OK (7285 bytes)
> apps\dashboard\src\components\terminals\TerminalOutput.tsx: PASS - JSX/TSX OK (7554 bytes)
> apps\dashboard\src\components\terminals\TerminalStream.tsx: PASS - JSX/TSX OK (9866 bytes)
> apps\dashboard\src\components\terminals\index.ts: PASS - JS/TS syntax OK
> apps\dashboard\src\components\ui\badge.tsx: PASS - JSX/TSX OK (1783 bytes)
> apps\dashboard\src\components\ui\button.tsx: PASS - JSX/TSX OK (2399 bytes)
> apps\dashboard\src\components\ui\context-menu.tsx: PASS - JSX/TSX OK (8274 bytes)
> apps\dashboard\src\components\ui\dialog.tsx: PASS - JSX/TSX OK (4308 bytes)
> apps\dashboard\src\components\ui\fab.tsx: PASS - JSX/TSX OK (3728 bytes)
> apps\dashboard\src\components\ui\icon.tsx: PASS - JSX/TSX OK (949 bytes)
> apps\dashboard\src\components\ui\progress-bar.tsx: PASS - JSX/TSX OK (1250 bytes)
> apps\dashboard\src\components\ui\section-label.tsx: PASS - JSX/TSX OK (1344 bytes)
> apps\dashboard\src\components\ui\skeleton.tsx: PASS - JSX/TSX OK (1847 bytes)
> apps\dashboard\src\components\ui\status-badge.tsx: PASS - JSX/TSX OK (4466 bytes)
> apps\dashboard\src\components\ui\status-dot.tsx: PASS - JSX/TSX OK (1427 bytes)
> apps\dashboard\src\components\ui\tag.tsx: PASS - JSX/TSX OK (4603 bytes)
> apps\dashboard\src\components\workers\WorkerCard.tsx: PASS - JSX/TSX OK (7409 bytes)
> apps\dashboard\src\components\workers\WorkerPanel.tsx: PASS - JSX/TSX OK (4482 bytes)
> apps\dashboard\src\components\workers\index.ts: PASS - JS/TS syntax OK
