# Docs Generator Squad

**Scribe** - Documentation Engineer da Diana Corporacao Senciente.

Se nao esta documentado, nao existe. Gera, valida, sincroniza e audita toda a documentacao do projeto.

## Quick Start

```
# Ativar Scribe
/Desenvolvimento:DocsGenerator-AIOS

# Gerar doc a partir de template
*generate guide

# Criar ADR
*adr "Migrar de Express para Fastify"

# Gerar changelog
*changelog

# Validar docs (links, metadata, freshness)
*validate

# Auditar cobertura
*audit
```

## 5 Dominios

| Dominio | Foco | Comandos |
|---------|------|----------|
| Generation | Criar docs a partir de templates | *generate, *adr, *story |
| API Docs | Documentar APIs do source code | *api-doc |
| Code Docs | Gerar JSDoc/TSDoc | *code-docs |
| Validation | Verificar qualidade dos docs | *validate, *audit |
| Maintenance | Manter docs atualizados | *index, *sync, *changelog |

## Infraestrutura Existente (Nao Duplica)

| Asset | Path | Uso |
|-------|------|-----|
| aios-doc-template.md | .aios-core/development/templates/ | Template master |
| SMART_STORY_TEMPLATE.md | docs/templates/ | Stories |
| INDEX.md | docs/ | Index auto-gerado (252 secoes) |
| framework/ | docs/framework/ | Coding standards, tech stack |
| architecture/ | docs/architecture/ | 45+ docs, ADRs |
| AgentsReference.md | .claude/commands/Docs/ | Agent reference |

## Estrutura

```
squads/docs-generator/
├── squad.yaml
├── README.md
├── agents/
│   └── docs-engineer.md          # Scribe (Chronicler, ♍ Virgo)
├── tasks/                         # 10 tasks
│   ├── docs-generate.md          # *generate - doc from template
│   ├── docs-adr.md               # *adr - Architecture Decision Record
│   ├── docs-story.md             # *story - development story
│   ├── docs-api-reference.md     # *api-doc - API documentation
│   ├── docs-code-docs.md         # *code-docs - JSDoc/TSDoc
│   ├── docs-changelog.md         # *changelog - from git history
│   ├── docs-index.md             # *index - regenerate INDEX.md
│   ├── docs-validate.md          # *validate - check quality
│   ├── docs-sync-i18n.md         # *sync - i18n PT/EN/ES
│   └── docs-audit.md             # *audit - coverage audit
├── workflows/
│   ├── full-docs-generation.yaml
│   └── pre-release-docs-check.yaml
├── checklists/
│   ├── docs-gate-quality.md
│   └── docs-gate-release.md
└── templates/
    ├── docs-adr-tmpl.md
    └── docs-guide-tmpl.md
```

---

*Scribe, Documentation Engineer | Se nao esta documentado, nao existe*
