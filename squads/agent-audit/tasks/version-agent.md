---
task: Version Agent
responsavel: "@agent-evolver"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - agent_path: Path do agente
  - bump_type: major, minor, ou patch
  - changes: Lista de mudancas aplicadas
  - quality_score: Score atual
Saida: |
  - new_version: Nova versao
  - evolution_header: Header atualizado
  - changelog_entry: Entrada no changelog
Checklist:
  - "[ ] Determinar tipo de bump (major/minor/patch)"
  - "[ ] Calcular nova versao"
  - "[ ] Atualizar/injetar evolution header no agente"
  - "[ ] Append entrada no changelog do agente"
  - "[ ] Atualizar lineage com novo score"
  - "[ ] Verificar que score >= score anterior (zero regression)"
---

# *version

Bump de versao com changelog e metricas.

## Semantic Versioning Rules

```
MAJOR.MINOR.PATCH

MAJOR (breaking):
- Mudanca de persona/role/archetype
- Reestruturacao de commands
- Mudanca de core_principles fundamentais

MINOR (features):
- Novo comando
- Nova task/checklist
- Melhoria significativa em persona
- Novo core_principle

PATCH (fixes):
- Fix em description
- Melhoria em vocabulary
- Fix em greeting
- Typo fix
- Dependency correction
```

## Evolution Header

Injetar/atualizar no YAML do agente:

```yaml
evolution:
  version: "1.2.0"
  quality_score: 85
  last_audit: "2026-02-12"
  total_optimizations: 7
  changelog: "squads/agent-audit/data/changelogs/dev.changelog.md"
  lineage:
    - { version: "1.0.0", score: 62, date: "2026-01-15", auditor: "Helix" }
    - { version: "1.1.0", score: 71, date: "2026-01-22", auditor: "Helix" }
    - { version: "1.2.0", score: 85, date: "2026-02-12", auditor: "Helix" }
```

## Changelog Entry

Append no arquivo `data/changelogs/{agent-id}.changelog.md`:

```markdown
## v1.2.0 (2026-02-12)

**Quality Score:** 71 -> 85 (+14)
**Auditor:** Helix (Agent Evolver)
**Bump Type:** MINOR

### Changes
- [PERSONA] Reescrita identity para ser mais especifica (+4pts)
- [CMD] Adicionado whenToUse com exemplos (+3pts)
- [VOCAB] Adicionado 7 termos de dominio (+2pts)
- [TASK] Criada task develop-story.md (+3pts)
- [COLLAB] Adicionado collaboration section (+2pts)

### Dimension Scores
| Dimension | Before | After | Delta |
|-----------|--------|-------|-------|
| Persona | 8/15 | 14/15 | +6 |
| Commands | 12/15 | 12/15 | 0 |
| Tasks | 9/15 | 12/15 | +3 |
| Principles | 8/10 | 8/10 | 0 |
| Greeting | 9/10 | 9/10 | 0 |
| Dependencies | 7/10 | 10/10 | +3 |
| Collaboration | 0/5 | 4/5 | +4 |
| Documentation | 8/10 | 8/10 | 0 |
| Evolution | 0/10 | 8/10 | +8 |

### Regressions
None ✅
```

## Zero Regression Gate

**BLOQUEANTE:** Se `new_score < previous_score`, o version bump e REJEITADO.
O agente DEVE investigar qual dimensao regrediu e corrigir antes de versionar.
