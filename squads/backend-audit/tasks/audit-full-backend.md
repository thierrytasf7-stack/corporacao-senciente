---
task: Full Backend Audit
responsavel: "@backend-auditor"
responsavel_type: agent
atomic_layer: workflow
elicit: true
Entrada: |
  - path: Caminho do backend a ser auditado
  - focus: (opcional) Dimensoes especificas para focar
  - stack: (opcional) Stack do backend (auto-detect se omitido)
Saida: |
  - findings: Lista completa de issues por dimensao
  - metrics: Metricas de qualidade agregadas
  - report: Relatorio final priorizado
Checklist:
  - "[ ] Detectar stack/linguagem/framework automaticamente"
  - "[ ] Executar audit-performance"
  - "[ ] Executar audit-security"
  - "[ ] Executar audit-code-quality"
  - "[ ] Executar audit-api-validation"
  - "[ ] Executar audit-database"
  - "[ ] Executar audit-architecture"
  - "[ ] Executar audit-error-handling"
  - "[ ] Executar audit-observability"
  - "[ ] Executar audit-dependencies"
  - "[ ] Consolidar findings"
  - "[ ] Gerar relatorio final priorizado"
---

# *audit-full

Auditoria completa de backend - executa todas as dimensoes de auditoria.

## Procedimento

### Fase 0: Stack Detection
1. Ler arquivos de configuracao raiz:
   - `package.json` -> Node.js (Express, Fastify, NestJS, Koa, Hapi)
   - `requirements.txt` / `pyproject.toml` / `Pipfile` -> Python (Django, Flask, FastAPI)
   - `go.mod` -> Go (Gin, Echo, Fiber)
   - `Cargo.toml` -> Rust (Actix, Axum, Rocket)
   - `pom.xml` / `build.gradle` -> Java (Spring Boot, Quarkus)
   - `*.csproj` / `*.sln` -> .NET
   - `Gemfile` -> Ruby (Rails, Sinatra)
   - `composer.json` -> PHP (Laravel, Symfony)
2. Identificar entry point (server.js, main.py, main.go, etc)
3. Mapear estrutura de diretórios

### Fase 1: Elicitacao
Perguntar ao usuario:
```
Preciso de algumas informacoes para uma auditoria eficaz:

1. **Escopo:** Auditar tudo ou focar em dimensoes especificas?
   a) Auditoria completa (todas as 9 dimensoes)
   b) Performance + Security (mais comuns)
   c) Escolher dimensoes especificas

2. **Ambiente:** O backend esta rodando? Se sim, qual URL?

3. **Database:** Qual(is) database(s) utilizado(s)?

4. **Prioridade:** O que mais preocupa?
   a) Performance (lentidao, timeouts)
   b) Seguranca (vulnerabilidades)
   c) Qualidade de codigo (manutencao, bugs)
   d) Tudo igualmente
```

### Fase 2: Execucao
Executar cada dimensao de auditoria seguindo as tasks individuais.
Ordem recomendada:
1. Security (detectar vulnerabilidades criticas primeiro)
2. Performance (impacto direto em usuarios)
3. Code Quality (base para todos os outros)
4. API Validation
5. Database
6. Architecture
7. Error Handling
8. Observability
9. Dependencies

### Fase 3: Consolidacao
1. Agregar todos os findings
2. Deduplicar issues relacionados
3. Priorizar por severidade (CRITICAL > HIGH > MEDIUM > LOW)
4. Gerar metricas agregadas (health score 0-100)
5. Criar roadmap de fixes sugerido

### Fase 4: Relatorio
Gerar relatorio usando template `audit-report-tmpl.md`
