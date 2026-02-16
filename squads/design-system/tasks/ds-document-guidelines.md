---
task: Generate Design System Documentation
responsavel: "@ds-architect"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - system_name: Nome do Design System (obrigatorio)
Saida: |
  - documentation_path: Caminho dos documentos gerados
  - token_reference: Documentacao completa de tokens
  - component_catalog: Catalogo completo de componentes
  - usage_guidelines: Guia de uso e melhores praticas
  - getting_started: Guia de inicio rapido
  - changelog: Historico de versoes
Checklist:
  - "[ ] Carregar DS e todos seus tokens/components"
  - "[ ] Gerar Token Reference com todas categorias e valores visuais"
  - "[ ] Gerar Component Catalog com specs de todos componentes"
  - "[ ] Gerar Usage Guidelines com Do/Don't patterns e best practices"
  - "[ ] Gerar Getting Started guide acionavel"
  - "[ ] Atualizar Changelog com historico de versoes"
  - "[ ] Incluir exemplos de codigo em cada secao"
  - "[ ] Verificar links e referencias cruzadas"
  - "[ ] Salvar em system/docs/"
---

# Task: Generate Design System Documentation

## Metadata
- **id:** ds-document-guidelines
- **agent:** ds-architect
- **complexity:** F3
- **inputs:** system_name
- **outputs:** Complete documentation set

## Description
Gera documentacao completa do Design System incluindo token reference, component catalog, usage guidelines, e getting started guide.

## Process

1. Carregar DS e todos seus tokens/components
2. Gerar documentos:
   - **Token Reference**: Todas as categorias com valores visuais
   - **Component Catalog**: Todos os componentes com specs
   - **Usage Guidelines**: Do/Don't patterns, best practices
   - **Getting Started**: Como instalar e usar o DS
   - **Changelog**: Historico de versoes
3. Incluir exemplos de codigo em cada secao
4. Verificar links e referencias cruzadas
5. Salvar em system/docs/

## Quality Criteria
- [ ] All tokens documented with visual samples
- [ ] All components with usage examples
- [ ] Do/Don't patterns for critical decisions
- [ ] Getting started guide is actionable
- [ ] Changelog updated
