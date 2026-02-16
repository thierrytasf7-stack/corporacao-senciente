# [STORY-20260213011254-1] Otimizar Queries do Dashboard API
> **Status:** REVISADO
> **subStatus:** waiting_human_approval
> **Agente Sugerido:** @aider
> **Agente AIOS:** 💻 @dev (Dex) - Full Stack Developer
> **Skill:** `/AIOS:agents:dev`
> **Tipo:** optimization
> **Dificuldade:** MEDIUM
> **Prioridade:** Alta
> **Criado em:** 2026-02-13 01:12:54

## Contexto
O dashboard e o principal ponto de observabilidade do sistema Diana. Rotas lentas degradam a experiencia de monitoramento em tempo real e causam polling desnecessario.

## Objetivo
As rotas de API do dashboard fazem queries N+1 ao buscar dados de agentes e workflows. Implementar agregacao no lado do servidor e cache em memoria para reduzir latencia. Priorizar as rotas mais acessadas: /api/agents, /api/workflows e /api/metrics.

## Responsavel
**💻 Dex** (Full Stack Developer) e o agente AIOS responsavel por esta task.
- **Foco:** Implementacao de codigo, debugging, testes unitarios e de integracao
- **Invocacao:** `/AIOS:agents:dev`
- **Executor runtime:** `@aider` (worker autonomo que processa a story)

## Arquivos Alvo
- `apps/dashboard/src/app/api/`
- `apps/dashboard/src/hooks/`
- `apps/dashboard/src/stores/`

## Output Esperado
- Arquivo apps/dashboard/src/hooks/useQueryCache.ts criado e exportando hook funcional
- Rotas /api/agents, /api/workflows e /api/metrics refatoradas sem queries N+1
- Testes em apps/dashboard/tests/api/query-cache.test.ts passando
- Tempo de resposta das rotas abaixo de 200ms medido via console.time

## Acceptance Criteria
- [?] Queries N+1 eliminadas nas rotas principais
- [x] Cache em memoria implementado com TTL configuravel
- [?] Tempo de resposta das rotas reduzido em pelo menos 40%
- [?] Testes unitarios cobrindo as rotas otimizadas

## Constraints
- Usar TypeScript strict, sem any
- Nao adicionar dependencias npm novas - usar Map nativo para cache
- Manter compatibilidade com Next.js App Router (Route Handlers)
- NAO modificar arquivos fora do escopo listado em Arquivos Alvo
- NAO introduzir dependencias externas sem justificativa
- NAO quebrar funcionalidades existentes

## Instrucoes
1. Auditar todas as rotas em apps/dashboard/src/app/api/ para identificar queries N+1. 2. Criar um modulo de cache simples em apps/dashboard/src/hooks/useQueryCache.ts. 3. Refatorar cada rota para usar agregacao e cache. 4. Adicionar testes para validar que o cache funciona e expira corretamente.

## Exemplo de Referencia
```
const cache = new Map<string, { data: unknown; expiry: number }>();

export function getCached<T>(key: string, ttlMs: number, fetcher: () => T): T {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expiry) return entry.data as T;
  const data = fetcher();
  cache.set(key, { data, expiry: Date.now() + ttlMs });
  return data;
}
```

## Aider Processing Log
- **Timestamp:** 2026-02-13 01:17:51
- **Duration:** 46.1s
- **Result:** SUCCESS
- **Files Modified:** apps/dashboard/src/app/api/route.ts, apps/dashboard/src/hooks/index.ts, apps/dashboard/src/hooks/use-agents.ts, apps/dashboard/src/hooks/use-aios-status.ts, apps/dashboard/src/hooks/use-monitor-events.ts, apps/dashboard/src/hooks/use-realtime-status.ts, apps/dashboard/src/stores/agent-store.ts, apps/dashboard/src/stores/alert-store.ts, apps/dashboard/src/stores/index.ts, apps/dashboard/src/stores/monitor-store.ts, apps/dashboard/src/stores/projects-store.ts


## Review Results
> Reviewed at: 2026-02-13T01:17:54.777185
> Verdict: PASS
> Aider log present: True
> Aider result: SUCCESS
> Files modified by Aider: 11
> All syntax OK: True
> apps\dashboard\src\app\api\route.ts: PASS - JS/TS syntax OK
> apps\dashboard\src\hooks\index.ts: PASS - JS/TS syntax OK
> apps\dashboard\src\hooks\use-agents.ts: PASS - JS/TS syntax OK
> apps\dashboard\src\hooks\use-aios-status.ts: PASS - JS/TS syntax OK
> apps\dashboard\src\hooks\use-monitor-events.ts: PASS - JS/TS syntax OK
> apps\dashboard\src\hooks\use-realtime-status.ts: PASS - JS/TS syntax OK
> apps\dashboard\src\stores\agent-store.ts: PASS - JS/TS syntax OK
> apps\dashboard\src\stores\alert-store.ts: PASS - JS/TS syntax OK
> apps\dashboard\src\stores\index.ts: PASS - JS/TS syntax OK
> apps\dashboard\src\stores\monitor-store.ts: PASS - JS/TS syntax OK
> apps\dashboard\src\stores\projects-store.ts: PASS - JS/TS syntax OK
