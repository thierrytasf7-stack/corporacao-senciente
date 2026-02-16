---
task: audit-command-registration
responsavel: squad-evolver
checklist: null
elicit: false
---

# Auditoria de Registro de Comando

## Objetivo
Verificar que a squad tem slash command registrado corretamente em `.claude/commands/`.

## Input
- `{squad}` - Nome da squad

## Procedimento

### 1. Command File Exists (2pts)
1. Determinar categoria esperada do slash command (ex: Audit, Squads, Operacoes)
2. Determinar nome esperado baseado no `slashPrefix` do squad.yaml
3. Verificar se arquivo existe em `.claude/commands/{Category}/{Name}.md`
- [ ] Arquivo de comando existe (2pts)

### 2. Path Reference (2pts)
Abrir o arquivo de comando e verificar:
- [ ] Referencia o path correto do agente: `squads/{squad}/agents/{agent}.md` (1pt)
- [ ] Instrucao "Load and activate the agent defined in:" presente (1pt)

### 3. Standard Format (1pt)
- [ ] Tem `$ARGUMENTS` placeholder para passagem de argumentos (0.5pt)
- [ ] Tem `ACTIVATION-NOTICE` no topo do arquivo (0.5pt)

### Anti-Patterns
- Path do agente errado ou inexistente
- Faltando $ARGUMENTS (agente nao recebe input do user)
- Nome do comando nao segue convencao PascalCase
- Categoria errada

## Output
- Score: X/5
- Command path verificado
- Findings com severity
