---
task: Full Harmony Audit
responsavel: "@harmony-auditor"
responsavel_type: agent
atomic_layer: workflow
elicit: true
Entrada: |
  - frontend_path: Caminho do frontend
  - backend_path: Caminho do backend
Saida: |
  - findings: Dessintonias encontradas por dimensao
  - harmony_score: Score de harmonia 0-100
  - report: Relatorio final
Checklist:
  - "[ ] Detectar stacks de frontend e backend"
  - "[ ] Mapear todos os endpoints do backend"
  - "[ ] Mapear todas as chamadas API do frontend"
  - "[ ] Executar audit-api-contracts"
  - "[ ] Executar audit-data-flow"
  - "[ ] Executar audit-auth-flow"
  - "[ ] Executar audit-error-propagation"
  - "[ ] Executar audit-realtime"
  - "[ ] Executar audit-cors-headers"
  - "[ ] Executar audit-state-sync"
  - "[ ] Executar audit-loading-states"
  - "[ ] Executar audit-type-consistency"
  - "[ ] Executar audit-env-config"
  - "[ ] Consolidar findings e calcular harmony score"
  - "[ ] Gerar relatorio final"
---

# *audit-full

Auditoria completa de harmonia Backend-Frontend.

## Fase 0: Stack Detection

**Backend:** Ler package.json, requirements.txt, go.mod, etc.
**Frontend:** Ler package.json buscando React, Vue, Angular, Svelte, Next.js, Nuxt, etc.

Identificar:
- Framework backend (Express, Fastify, NestJS, Django, FastAPI, Gin, etc)
- Framework frontend (React, Vue, Angular, Svelte, Next.js, etc)
- Protocolo de comunicacao (REST, GraphQL, gRPC, WebSocket, SSE)
- Auth strategy (JWT, Session, OAuth, API Key)

## Fase 1: Elicitacao

```
Para auditar a harmonia, preciso entender o setup:

1. **Comunicacao principal:**
   a) REST API (fetch/axios)
   b) GraphQL (Apollo, urql)
   c) tRPC (type-safe)
   d) Misto

2. **Auth strategy:**
   a) JWT (Bearer token)
   b) Session/Cookie
   c) OAuth/OIDC
   d) Sem auth

3. **Real-time:**
   a) WebSocket
   b) SSE (Server-Sent Events)
   c) Polling
   d) Nenhum

4. **O que mais preocupa?**
   a) Endpoints e contracts (chamadas quebradas)
   b) Auth flow (login/logout)
   c) Error handling (erros nao aparecem no frontend)
   d) Tudo igualmente
```

## Fase 2: Mapeamento Bilateral

### Backend - Extrair:
1. **Todos os endpoints** (path, method, params, body schema, response schema)
2. **Middleware de auth** (quais rotas protegidas)
3. **Error handlers** (como erros sao formatados)
4. **CORS config** (origins permitidas)
5. **WebSocket/SSE handlers** (events emitidos)

### Frontend - Extrair:
1. **Todas as chamadas API** (fetch, axios, useSWR, useQuery, etc)
2. **URLs chamadas** (path, method, body, headers)
3. **Response handling** (quais campos consome)
4. **Error handling** (catch blocks, error boundaries)
5. **Auth logic** (onde guarda token, como envia, refresh)
6. **WebSocket/SSE listeners** (events escutados)

## Fase 3: Cruzamento (Core da Auditoria)

Para cada chamada do frontend, verificar:
- Endpoint existe no backend? (path + method)
- Payload enviado bate com o esperado?
- Campos consumidos do response existem?
- Error handling cobre os status possiveis?
- Auth header enviado quando necessario?

Para cada endpoint do backend, verificar:
- Algum frontend consome? (dead endpoint detection)
- Response format bate com o que frontend espera?

## Fase 4: Execucao das Sub-auditorias
Rodar cada dimensao conforme tasks individuais.

## Fase 5: Consolidacao
1. Calcular harmony score
2. Listar dessintonias por severidade
3. Gerar relatorio com fixes
