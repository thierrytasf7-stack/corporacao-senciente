---
name: project-onboarding
description: Onboarding rápido para o projeto Diana Corporação Senciente.
  Ativa quando alguém novo precisa entender o codebase, a arquitetura,
  ou como começar a contribuir.
---

# Project Onboarding — Diana Corporação Senciente

## O que é este projeto?
Sistema operacional cognitivo com 11 agentes AI especializados. Roda 100% nativo em Windows (sem Docker).

## Arquitetura em 30 segundos
```
CLI (source of truth) → Observability (dashboard) → UI (conveniência)
```

- **PM2** gerencia processos
- **PowerShell** para scripts operacionais
- **Node.js** como runtime principal
- **Next.js** para dashboard (observabilidade)
- **Bun** para monitor-server (event streaming)
- **PostgreSQL** para persistência

## Estrutura do Projeto
```
.aios-core/          → Framework core (agents, tasks, workflows)
apps/dashboard/      → Next.js dashboard
apps/monitor-server/ → Bun event streaming
scripts/             → PowerShell/Python operacionais
docs/stories/        → Stories de desenvolvimento (active/, completed/)
src/                 → Source code
tests/               → Testes (Jest)
squads/              → Expansion packs (times temáticos)
```

## Primeiros Passos
```bash
npm install                     # Dependências
npm test                        # Verificar testes
pm2 start ecosystem.config.js   # Iniciar sistema
pm2 status                      # Ver processos
```

## Como Desenvolver
1. Story é criada em `docs/stories/active/`
2. Dev implementa seguindo checklist da story
3. QA valida qualidade
4. DevOps faz push (SOMENTE devops pode push)

## Agentes Disponíveis
Ativar com `/AIOS:agents:nome`:
- `@dev` (Dex) — Implementação
- `@qa` (Quinn) — Testes
- `@architect` (Aria) — Arquitetura
- `@pm` (Morgan) — Product Management
- `@po` (Pax) — Product Owner
- `@sm` (River) — Scrum Master
- `@devops` (Gage) — CI/CD e Git

## Convenções
- Commits: `feat|fix|docs|test|chore|refactor: mensagem`
- Imports: Absolutos com `@synkra/` ou `@/`
- TypeScript strict, sem `any`
- Arquivos: kebab-case
