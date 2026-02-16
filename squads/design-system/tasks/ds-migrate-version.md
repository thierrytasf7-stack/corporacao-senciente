---
task: Migrate Design System Version
responsavel: "@ds-architect"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - system_name: Nome do Design System
  - from_version: Versão atual
  - to_version: Versão alvo
Saida: |
  - migration_guide: Guia completo de migração
  - token_remapping: Mapeamento automatizado de tokens renomeados
  - breaking_changes: Lista de breaking changes identificadas
  - codemods: Scripts de codemods (se aplicável)
  - updated_changelog: Changelog atualizado
Checklist:
  - "[ ] Diff entre versões (tokens, components, themes)"
  - "[ ] Classificar mudanças: Added, Changed, Deprecated, Removed"
  - "[ ] Gerar migration guide com find/replace patterns"
  - "[ ] Gerar codemods (se possível)"
  - "[ ] Atualizar changelog"
  - "[ ] Validar que nenhum token quebrou"
  - "[ ] Documentar todos breaking changes"
  - "[ ] Verificar orphaned token references"
---

# Task: Migrate Design System Version

## Metadata
- **id:** ds-migrate-version
- **agent:** ds-architect
- **complexity:** F4
- **inputs:** system_name, from_version, to_version
- **outputs:** Migration guide + automated token remapping

## Description
Migra Design System para nova versao. Gera migration guide, remapeia tokens renomeados, e identifica breaking changes.

## Process

1. Diff entre versoes (tokens, components, themes)
2. Classificar mudancas:
   - **Added**: Novos tokens/componentes
   - **Changed**: Tokens renomeados ou valores alterados
   - **Deprecated**: Marcados para remocao futura
   - **Removed**: Removidos nesta versao
3. Gerar migration guide com find/replace patterns
4. Gerar codemods (se possivel)
5. Atualizar changelog
6. Validar que nenhum token quebrou

## Quality Criteria
- [ ] All breaking changes documented
- [ ] Find/replace patterns for renamed tokens
- [ ] Changelog updated
- [ ] No orphaned token references
