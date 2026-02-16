# Task: Ship to Production

## Metadata
- agent: ceo-desenvolvimento
- trigger: `*ship`

## Execution
1. Verify all stories in sprint are QA-approved
2. Activate @devops via Skill: `Operacoes:DevOps-AIOS`
3. Execute release pipeline:
   - `*pre-push` (lint, typecheck, all tests, build, CodeRabbit)
   - `*push` (to remote)
   - `*create-pr` (if PR-based workflow)
   - `*release` (semantic version bump)
4. Generate release notes from shipped stories
5. Update all story statuses → SHIPPED
6. Report:
```
SHIPPED ✓
Version: {version}
Stories: {count}
PR: {url}
```
