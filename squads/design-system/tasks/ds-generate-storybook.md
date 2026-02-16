---
task: Generate Storybook Stories
responsavel: "@ds-architect"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - system_name: Nome do design system (obrigatorio)
  - components: Array de componentes a serem documentados (obrigatorio)
Saida: |
  - storybook_path: Caminho da pasta storybook gerada
  - story_files: Array com paths dos arquivos de story gerados
  - config_files: Array com paths dos arquivos de configuracao gerados
Checklist:
  - "[ ] Validar system_name (nao vazio)"
  - "[ ] Validar components (array nao vazio)"
  - "[ ] Para cada componente, gerar story default com todos os props"
  - "[ ] Para cada componente, gerar stories por variant"
  - "[ ] Para cada componente, gerar stories por size"
  - "[ ] Para cada componente, gerar stories de states (hover, focus, disabled, loading)"
  - "[ ] Para cada componente, gerar stories de composition"
  - "[ ] Configurar controls/args para props interativas"
  - "[ ] Adicionar docs page com guidelines para cada componente"
  - "[ ] Configurar viewport addon para responsive preview"
  - "[ ] Gerar main.js e preview.js se nao existirem"
  - "[ ] Executar validacao dos arquivos gerados"
  - "[ ] Exibir proximos passos para execucao do storybook"
---

# Task: Generate Storybook Stories

## Metadata
- **id:** ds-generate-storybook
- **agent:** ds-architect
- **complexity:** F3
- **inputs:** system_name, components[]
- **outputs:** Storybook story files

## Description
Gera Storybook stories para componentes do DS com todos os variants, sizes, e states documentados interativamente.

## Process

1. Para cada componente:
   - Story default (all props)
   - Story por variant
   - Story por size
   - Story de states (hover, focus, disabled, loading)
   - Story de composition (componente com outros)
2. Configurar controls/args para props interativas
3. Adicionar docs page com guidelines
4. Configurar viewport addon para responsive preview

## Quality Criteria
- [ ] All variants have dedicated stories
- [ ] Controls configured for interactive props
- [ ] Docs page with usage guidelines
- [ ] Responsive preview stories
