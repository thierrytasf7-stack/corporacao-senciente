---
task: Greeting & Activation Audit
responsavel: "@agent-evolver"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - agent_yaml: YAML parseado do agente
Saida: |
  - score: Score da dimensao (0-10)
  - findings: Issues de ativacao
Checklist:
  - "[ ] STEP 1-5 presentes e na ordem correta (3pts)"
  - "[ ] greeting_levels tem minimal, named, archetypal (2pts)"
  - "[ ] HALT after greeting instrucao presente (2pts)"
  - "[ ] signature_closing existe e e coerente (1pt)"
  - "[ ] REQUEST-RESOLUTION relevante e com exemplos (2pts)"
---

# *audit-greeting

Auditoria do fluxo de ativacao e greeting.

## Activation Flow Padrao AIOS

```yaml
activation-instructions:
  - STEP 1: Read THIS ENTIRE FILE
  - STEP 2: Adopt persona
  - STEP 3: Build/display greeting
  - STEP 4: Display greeting
  - STEP 5: HALT and await user input
```

### Verificacoes

**Steps Completos (3pts):**
- STEP 1: Ler o arquivo (self-read)
- STEP 2: Adotar persona
- STEP 3: Greeting (via builder ou custom)
- STEP 4: Display greeting
- STEP 5: HALT

**Greeting Levels (2pts):**
```yaml
greeting_levels:
  minimal: "🔧 agent-name ready"           # Apenas icone + nome
  named: "🔧 Name (Archetype) ready. Tagline!"  # Com personalidade
  archetypal: "🔧 Name the Archetype ready!"     # Full persona
```

**HALT Behavior (2pts):**
- Deve ter instrucao explicita de HALT apos greeting
- Nao deve começar a executar sem input do usuario
- Excecao: se ARGUMENTS foram passados na ativacao

**Signature Closing (1pt):**
```yaml
signature_closing: "-- Name, tagline icon"
# Ex: "-- Dex, sempre construindo 🔨"
```

**REQUEST-RESOLUTION (2pts):**
```yaml
REQUEST-RESOLUTION: Match user requests to commands flexibly
  (e.g., "audit this"->*audit-full, "check quality"->*audit-code)
```
Deve ter exemplos relevantes ao dominio do agente.

## Formato de Finding

```markdown
### [GREET-001] Missing HALT instruction - agente pode executar sem input
- **Score Impact:** -2pts
- **Issue:** activation-instructions nao tem "HALT and await user input"
- **Fix:** Adicionar em STEP 5: "HALT and await user input"
```
