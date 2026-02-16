---
task: Create Architecture Decision Record
responsavel: "@docs-engineer"
responsavel_type: agent
atomic_layer: task
trigger: "*adr"
Entrada: |
  - title: Titulo da decisao (obrigatorio)
  - context: Contexto que motivou a decisao
  - decision: A decisao tomada
  - alternatives: Alternativas consideradas
Saida: |
  - adr_path: Caminho do ADR gerado
  - adr_number: Numero sequencial do ADR
Checklist:
  - "[ ] Determinar proximo numero ADR"
  - "[ ] Coletar contexto da decisao"
  - "[ ] Documentar alternativas consideradas"
  - "[ ] Documentar a decisao e justificativa"
  - "[ ] Documentar consequencias"
  - "[ ] Salvar com numeracao sequencial"
---

# *adr - Create Architecture Decision Record

Cria ADR numerado seguindo o padrao Lightweight ADR.

## Flow

```
1. Determine next ADR number
   ├── Scan docs/architecture/adr/ for existing ADRs
   ├── Find highest number (ADR-NNN)
   └── Next = highest + 1

2. Collect decision info
   ├── Title: nome curto da decisao
   ├── Context: qual problema/necessidade motivou
   ├── Decision: o que foi decidido
   ├── Alternatives: opcoes consideradas (pros/cons cada)
   └── Consequences: impacto da decisao

3. Generate ADR using template
   ├── Load docs-adr-tmpl.md
   ├── Fill: number, title, date, status=Accepted
   ├── Fill: context, decision, alternatives, consequences
   └── Add references se aplicavel

4. Save
   ├── Path: docs/architecture/adr/ADR-{NNN}-{kebab-title}.md
   ├── Update ARCHITECTURE-INDEX.md (add reference)
   └── Display path and number
```

## ADR Status Values

| Status | Meaning |
|--------|---------|
| Proposed | Em discussao, ainda nao aceito |
| Accepted | Decisao tomada e em vigor |
| Deprecated | Substituida por outra ADR |
| Superseded | Substituida (link para nova) |

## Existing ADRs Location

`docs/architecture/adr/` - Scanner procura pattern `ADR-\d+`
`docs/architecture/ADE-*.md` - Architecture Decision Handoffs (8 files)
