---
task: Persona Quality Audit
responsavel: "@agent-evolver"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - agent_yaml: YAML parseado do agente
Saida: |
  - score: Score da dimensao (0-15)
  - findings: Issues de persona
Checklist:
  - "[ ] name existe e e unico (2pts)"
  - "[ ] id segue kebab-case e e unico (1pt)"
  - "[ ] title descreve role claramente (2pts)"
  - "[ ] icon relevante ao role (1pt)"
  - "[ ] archetype alinha com role/focus (2pts)"
  - "[ ] tone alinha com archetype (1pt)"
  - "[ ] vocabulary 5+ termos relevantes (2pts)"
  - "[ ] identity especifica, nao generica (2pts)"
  - "[ ] whenToUse claro com exemplo (2pts)"
---

# *audit-persona

Auditoria de qualidade da persona do agente.

## Criterios Detalhados

### name (2pts)
- 0pts: Ausente
- 1pt: Existe mas generico (Agent1, Bot)
- 2pts: Nome unico, memoravel, alinhado ao archetype

### id (1pt)
- 0pts: Ausente ou nao kebab-case
- 1pt: kebab-case, unico, descritivo

### title (2pts)
- 0pts: Ausente
- 1pt: Existe mas vago ("Developer" vs "Full Stack Developer & Implementation Specialist")
- 2pts: Descreve role + especialidade claramente

### icon (1pt)
- 0pts: Ausente ou generico
- 1pt: Icone relevante ao dominio do agente

### archetype (2pts)
- 0pts: Ausente
- 1pt: Existe mas nao alinha com role (Builder para um QA?)
- 2pts: Archetype coerente (Guardian para QA, Builder para Dev, Inspector para Auditor)

### tone (1pt)
- 0pts: Ausente
- 1pt: Alinha com archetype (analytical para Guardian, pragmatic para Builder)

### vocabulary (2pts)
- 0pts: Ausente ou vazio
- 1pt: 1-4 termos
- 2pts: 5+ termos relevantes ao dominio especifico

### identity (2pts)
- 0pts: Ausente
- 1pt: Generica ("Expert who does things")
- 2pts: Especifica com personalidade ("Inspetora obsessiva por qualidade que nao deixa nenhum detalhe passar")

### whenToUse (2pts)
- 0pts: Ausente
- 1pt: Existe mas vago
- 2pts: Claro com QUANDO USAR, O QUE FAZ, EXEMPLO, ENTREGA

## Formato de Finding

```markdown
### [PERSONA-001] Identity generica - nao diferencia do agente base
- **Score Impact:** -2pts (identity)
- **Atual:** "Expert who implements code and tests"
- **Sugestao:** "Engenheiro fullstack obsessivo por clean code que implementa stories com precisao cirurgica, testando cada edge case"
- **Justificativa:** Identity deve ter personalidade e especificidade
```
