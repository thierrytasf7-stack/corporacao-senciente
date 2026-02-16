---
task: audit-agents-quality
responsavel: squad-evolver
checklist: null
elicit: false
---

# Auditoria de Qualidade dos Agentes

## Objetivo
Avaliar a qualidade de CADA agente dentro da squad, verificando se seguem os padroes AIOS.

## Input
- `{squad}` - Nome da squad

## Procedimento

### Para CADA agente listado em squad.yaml components.agents:

#### 1. File Exists (1pt per agent)
- [ ] Arquivo existe em `agents/{nome}.md`
- [ ] Arquivo nao esta vazio

#### 2. AIOS Structure (5pts total)
- [ ] Tem bloco YAML com `activation-instructions` (1pt)
- [ ] Tem bloco `agent:` com name, id, title, icon (1pt)
- [ ] Tem bloco `persona:` com role, style, identity, focus (1pt)
- [ ] Tem bloco `commands:` com lista de comandos (1pt)
- [ ] Tem bloco `dependencies:` com tasks listadas (1pt)

#### 3. whenToUse (3pts)
- [ ] Campo `whenToUse` presente no bloco agent (1pt)
- [ ] Detalhado com cenarios de uso (1pt)
- [ ] Inclui exemplo de solicitacao (1pt)

#### 4. Quick Commands Section (2pts)
- [ ] Secao "Quick Commands" presente apos YAML (1pt)
- [ ] Comandos formatados com backtick e descricao (1pt)

#### 5. Agent Collaboration (2pts)
- [ ] Secao "Agent Collaboration" presente (1pt)
- [ ] Lista agentes com quem colabora e workflow tipico (1pt)

#### 6. Mandatory Commands (2pts)
- [ ] Comando `*help` presente na lista de commands (1pt)
- [ ] Comando `*exit` presente na lista de commands (1pt)

### Score Normalization
Se squad tem N agentes, score = (soma_scores / (N * max_per_agent)) * 15

## Output
- Score: X/15
- Per-agent breakdown
- Findings com severity
