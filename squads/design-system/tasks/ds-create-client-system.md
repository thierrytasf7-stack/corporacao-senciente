---
task: Create Client-Specific Design System
responsavel: "@ds-architect"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - client_name: Nome do cliente (obrigatorio)
  - brand_guide: Guia de marca (opcional, URL ou arquivo)
  - website: Site do cliente (opcional, para scraping)
  - colors: Cores especificas (opcional, hex codes)
  - typography: Tipografia (opcional, font families)
Saida: |
  - client_ds_path: Caminho do design system criado em library/systems/client-{name}/
  - catalog_entry: Entrada adicionada ao catalog.json
  - brand_tokens: Tokens de marca gerados
  - component_variants: Componentes adaptados para o cliente
  - documentation: Documentacao especifica do cliente
Checklist:
  - "[ ] Validar client_name (formato, nao existe)"
  - "[ ] Elicitar informacoes de marca (brand_guide, website, colors, typography)"
  - "[ ] Analisar brand guide (se fornecido)"
  - "[ ] Scrape site do cliente (se website fornecido)"
  - "[ ] Definir brand personality tokens"
  - "[ ] Copiar _base template"
  - "[ ] Substituir brand colors"
  - "[ ] Ajustar tipografia"
  - "[ ] Manter neutrals e spacing do base (ou ajustar se solicitado)"
  - "[ ] Gerar semantic mapping"
  - "[ ] Ajustar component tokens para brand"
  - "[ ] Definir component variants especificos do cliente (se necessario)"
  - "[ ] Criar theme com brand identity"
  - "[ ] Gerar client-specific usage guide"
  - "[ ] Criar brand alignment notes"
  - "[ ] Documentar diferencas do _base template"
  - "[ ] Salvar em library/systems/client-{name}/"
  - "[ ] Atualizar catalog.json"
  - "[ ] Linkar ao _base para heranca de updates"
  - "[ ] Validar WCAG AA contrast"
  - "[ ] Executar validacao inicial do design system"
---

# Task: Create Client-Specific Design System

## Metadata
- **id:** ds-create-client-system
- **agent:** ds-architect
- **complexity:** F4
- **inputs:** client_name, brand_guide?, website?, colors?, typography?
- **outputs:** Client DS in library/systems/client-{name}/

## Description
Cria Design System customizado para um cliente especifico. Parte do template _base e aplica brand identity do cliente.

## Process

### Phase 1: Brand Discovery
1. Analisar brand guide do cliente (se fornecido)
2. Scrape site do cliente para extrair:
   - Cores predominantes
   - Tipografia usada
   - Padrao visual (moderno, classico, minimalista, etc)
   - Tom de comunicacao
3. Definir brand personality tokens

### Phase 2: Token Customization
1. Copiar _base template
2. Substituir brand colors
3. Ajustar tipografia
4. Manter neutrals e spacing do base (ou ajustar se solicitado)
5. Gerar semantic mapping

### Phase 3: Component Adaptation
1. Ajustar component tokens para brand
2. Definir component variants especificos do cliente (se necessario)
3. Criar theme com brand identity

### Phase 4: Documentation
1. Client-specific usage guide
2. Brand alignment notes
3. Diferencas do _base template

### Phase 5: Registration
1. Salvar em library/systems/client-{name}/
2. Atualizar catalog.json
3. Linkar ao _base para heranca de updates

## Quality Criteria
- [ ] Brand colors accurately mapped
- [ ] Typography matches brand guide
- [ ] WCAG AA contrast maintained
- [ ] Client-specific docs generated
- [ ] Registered in catalog
