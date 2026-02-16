# Tasks Coverage Checklist

## Command-Task Mapping
- [ ] Cada command principal do agente tem task correspondente
- [ ] Task files existem em `tasks/` para cada referencia
- [ ] Nomes de task sao consistentes (command: audit-manifest -> task: audit-manifest.md)

## Orphan Detection
- [ ] Zero tasks em disco sem referencia em squad.yaml
- [ ] Zero tasks em disco sem referencia em agent dependencies

## Phantom Detection
- [ ] Zero tasks em squad.yaml que nao existem em disco
- [ ] Zero tasks em agent dependencies que nao existem em disco

## Task Frontmatter
- [ ] Cada task tem frontmatter YAML valido
- [ ] Campo `task:` presente com nome correto
- [ ] Campo `responsavel:` presente com agente valido
- [ ] Campo `checklist:` presente (pode ser null)
- [ ] Campo `elicit:` presente (true/false)

## Task Quality
- [ ] Cada task tem secao "Objetivo" clara
- [ ] Cada task tem secao "Procedimento" detalhado
- [ ] Cada task tem secao "Output" descrevendo deliverable
- [ ] Procedimentos tem steps numerados ou checkboxes
- [ ] Nao sao apenas titulos sem conteudo

---
*Squad Audit Checklist - Tasks Coverage Validation*
