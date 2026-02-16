---
task: Sync i18n Documentation
responsavel: "@docs-engineer"
responsavel_type: agent
atomic_layer: task
trigger: "*sync"
Entrada: |
  - source_lang: Idioma fonte (default: pt)
  - target_lang: Idioma(s) alvo (en | es | all)
  - scope: Escopo (full | specific files)
Saida: |
  - synced_files: Arquivos sincronizados
  - missing_translations: Docs sem traducao
Checklist:
  - "[ ] Identificar docs no idioma fonte"
  - "[ ] Comparar com docs nos idiomas alvo"
  - "[ ] Identificar docs desatualizados (source newer)"
  - "[ ] Identificar docs sem traducao"
  - "[ ] Gerar report de sync status"
---

# *sync - Sync i18n Documentation

Sincroniza documentacao entre idiomas. PT e source of truth.

## Directory Structure

```
docs/
├── *.md          → Docs em PT (principal/default)
├── pt/           → Alias para docs raiz (opcional)
├── es/           → Traducoes para Espanhol
└── en/           → Traducoes para Ingles (quando necessario)
```

## Flow

```
1. Scan source docs (PT - root)
   ├── List all .md files in docs/
   ├── Get last modified date for each
   └── Build source inventory

2. Scan target docs (EN/ES)
   ├── List .md files in docs/en/ and docs/es/
   ├── Get last modified date for each
   └── Build target inventory

3. Compare
   ├── Missing: source exists, target doesn't → NEEDS TRANSLATION
   ├── Outdated: source newer than target → NEEDS UPDATE
   ├── Synced: target same or newer → OK
   └── Orphaned: target exists, source doesn't → CONSIDER REMOVING

4. Report
   ├── Sync status per file
   ├── % translated per language
   ├── Priority: high-traffic docs first
   └── Estimate effort (word count of missing)

5. Optional: Generate translation stubs
   ├── Copy source to target dir
   ├── Add frontmatter: translation_status: pending
   └── Add header: "TRANSLATION NEEDED from PT"
```
