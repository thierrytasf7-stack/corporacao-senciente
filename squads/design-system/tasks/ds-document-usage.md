---
task: Generate Developer Usage Guide
responsavel: "@ds-architect"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - system_name: Nome do Design System
  - framework?: Framework alvo (react|vue|html) - opcional
Saida: |
  - usage_guide_path: Caminho do guia de uso gerado
  - content: Conteudo do guia de uso
  - examples: Exemplos de implementacao
Checklist:
  - "[ ] Setup & Installation instructions"
  - "[ ] Como importar tokens (CSS, Tailwind, SCSS)"
  - "[ ] Como usar tokens em codigo"
  - "[ ] Como implementar cada tier de componente"
  - "[ ] Como trocar de tema"
  - "[ ] Troubleshooting comum"
  - "[ ] Exemplos de paginas completas usando o DS"
  - "[ ] Code examples for each use case"
  - "[ ] Framework-specific instructions"
  - "[ ] Common pitfalls documented"
---

# Task: Generate Developer Usage Guide

## Metadata
- **id:** ds-document-usage
- **agent:** ds-architect
- **complexity:** F2
- **inputs:** system_name, framework? (react|vue|html)
- **outputs:** Usage guide document

## Description
Gera guia pratico de uso do DS para desenvolvedores. Focado em como integrar, usar tokens, e implementar componentes.

## Process

1. Setup & Installation instructions
2. Como importar tokens (CSS, Tailwind, SCSS)
3. Como usar tokens em codigo
4. Como implementar cada tier de componente
5. Como trocar de tema
6. Troubleshooting comum
7. Exemplos de paginas completas usando o DS

## Quality Criteria
- [ ] Step-by-step installation
- [ ] Code examples for each use case
- [ ] Framework-specific instructions
- [ ] Common pitfalls documented
