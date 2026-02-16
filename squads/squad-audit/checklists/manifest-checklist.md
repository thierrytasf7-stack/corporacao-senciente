# Manifest Checklist (squad.yaml)

## File Integrity
- [ ] squad.yaml existe na raiz da squad
- [ ] YAML parseable sem erros de sintaxe
- [ ] Encoding UTF-8

## Required Fields
- [ ] `name` presente e kebab-case
- [ ] `name` unico (nao duplica outra squad)
- [ ] `version` presente em formato semver (X.Y.Z)
- [ ] `description` presente e > 20 caracteres

## Metadata
- [ ] `author` presente
- [ ] `license` presente (MIT, Apache-2.0, etc.)
- [ ] `slashPrefix` presente e PascalCase

## AIOS Block
- [ ] `aios.minVersion` presente e semver valido
- [ ] `aios.type` igual a "squad"

## Components
- [ ] `components.agents` lista nao-vazia
- [ ] `components.tasks` lista nao-vazia
- [ ] Componentes opcionais listados apenas se existem em disco

## Tags
- [ ] `tags` lista com 3+ entries
- [ ] Tags sao relevantes ao escopo da squad

## Dependencies
- [ ] `dependencies` section presente
- [ ] Se tem deps node/python, versoes especificadas
- [ ] Se depende de outras squads, listadas

---
*Squad Audit Checklist - Manifest Validation*
