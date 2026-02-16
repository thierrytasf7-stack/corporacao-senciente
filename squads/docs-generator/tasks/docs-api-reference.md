---
task: Generate API Documentation
responsavel: "@docs-engineer"
responsavel_type: agent
atomic_layer: task
trigger: "*api-doc"
Entrada: |
  - service: Servico a documentar (backend | dashboard | binance | whatsapp)
  - target: Path especifico (default: auto-detect routes)
Saida: |
  - api_doc: Documento de API gerado
  - endpoints_count: Total de endpoints documentados
Checklist:
  - "[ ] Identificar servico alvo"
  - "[ ] Descobrir todos os endpoints (routes)"
  - "[ ] Documentar cada endpoint (method, path, params, response)"
  - "[ ] Incluir exemplos de request/response"
  - "[ ] Gerar doc markdown"
  - "[ ] Salvar em docs/api/"
---

# *api-doc - Generate API Documentation

Gera documentacao de API a partir do source code.

## Flow

```
1. Identify target service
   ├── backend → apps/backend/server.js + routes
   ├── dashboard → apps/dashboard/src/app/api/**/route.ts
   ├── binance → modules/binance-bot/ endpoints
   └── whatsapp → apps/backend/integrations/whatsapp/

2. Discover endpoints
   ├── Express: grep for app.get/post/put/delete/patch/use
   ├── Next.js: scan app/api/**/route.ts (GET/POST/PUT/DELETE exports)
   ├── WebSocket: identify ws/wss endpoints
   └── Build endpoint inventory

3. For each endpoint, extract:
   ├── Method (GET/POST/PUT/DELETE/PATCH)
   ├── Path (/api/stories, /api/workers, etc.)
   ├── Parameters (query, body, path params)
   ├── Response format (JSON schema if available)
   ├── Authentication required?
   ├── Rate limiting?
   └── Description from comments/JSDoc

4. Generate documentation
   ├── Use API section from aios-doc-template.md
   ├── Group endpoints by resource
   ├── Include request/response examples
   ├── Include error codes
   └── Add authentication notes

5. Save
   ├── Path: docs/api/{service}-api.md
   └── Update INDEX.md
```

## Services Known

| Service | Port | Route Source |
|---------|------|-------------|
| Backend API | 21301 | apps/backend/server.js |
| Dashboard API | 21300 | apps/dashboard/src/app/api/ |
| Binance Bot | 21341 | modules/binance-bot/ |
| WhatsApp | 21350 | apps/backend/integrations/whatsapp/ |
| Monitor | 21302 | apps/monitor-server/ |
