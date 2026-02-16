---
task: Generate Code Documentation
responsavel: "@docs-engineer"
responsavel_type: agent
atomic_layer: task
trigger: "*code-docs"
Entrada: |
  - target: Path(s) para documentar (default: src/, .aios-core/core/)
  - format: Formato (markdown | jsdoc-comments)
Saida: |
  - docs_generated: Lista de docs gerados
  - functions_documented: Total de funcoes documentadas
Checklist:
  - "[ ] Identificar arquivos alvo"
  - "[ ] Extrair funcoes/classes/interfaces"
  - "[ ] Gerar documentacao para cada item"
  - "[ ] Incluir exemplos de uso"
  - "[ ] Salvar documentacao"
---

# *code-docs - Generate Code Documentation

Gera documentacao de codigo extraindo info de JSDoc/TSDoc ou analisando source.

## Flow

```
1. Identify targets
   ├── Default: src/, .aios-core/core/, apps/
   ├── File types: .js, .ts, .tsx, .mjs
   └── Exclude: node_modules/, dist/, tests/

2. For each file, extract:
   ├── Existing JSDoc/TSDoc comments
   ├── Exported functions/classes
   ├── TypeScript interfaces/types
   ├── Module description (top-level comment)
   └── Dependencies (imports)

3. Generate docs
   ├── Module overview (description, exports)
   ├── Function signatures with params/returns
   ├── Class documentation with methods
   ├── Interface/type definitions
   └── Usage examples (from tests if available)

4. Output
   ├── If format=markdown → save to docs/api/code/
   ├── If format=jsdoc-comments → add inline to source
   └── Generate summary index
```

## Key Modules to Document

| Module | Path | Priority |
|--------|------|----------|
| security-utils | .aios-core/core/utils/security-utils.js | High |
| security-checker | .aios-core/infrastructure/scripts/security-checker.js | High |
| squad-generator | .aios-core/development/scripts/squad/squad-generator.js | Medium |
| squad-validator | .aios-core/development/scripts/squad/squad-validator.js | Medium |
| permission-mode | .aios-core/core/permissions/permission-mode.js | Medium |
| greeting-builder | .aios-core/development/scripts/greeting-builder.js | Low |
