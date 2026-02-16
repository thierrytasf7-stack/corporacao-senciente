---
task: audit-documentation
responsavel: squad-evolver
checklist: null
elicit: false
---

# Auditoria de Documentacao

## Objetivo
Avaliar a qualidade e completude da documentacao da squad.

## Input
- `{squad}` - Nome da squad

## Procedimento

### 1. README Exists (2pts)
- [ ] `README.md` existe na raiz da squad (1pt)
- [ ] README nao esta vazio (> 50 chars de conteudo real) (1pt)

### 2. Quick Start Section (2pts)
- [ ] README tem secao Quick Start ou Getting Started (1pt)
- [ ] Quick Start tem comandos executaveis (com backticks) (1pt)

### 3. Commands/Dimensions Table (2pts)
- [ ] README tem tabela ou lista de comandos disponiveis (1pt)
- [ ] README tem tabela de dimensoes/scoring se aplicavel (1pt)

### 4. Usage Examples (2pts)
- [ ] README tem pelo menos 1 exemplo de uso real (1pt)
- [ ] Exemplos mostram sintaxe correta dos comandos (1pt)

### 5. Score/Rating Documentation (2pts)
- [ ] Sistema de scoring esta documentado (escala, pesos) (1pt)
- [ ] Rating system esta documentado (S/A/B/C/D/F ou equivalente) (1pt)

### Bonus Checks (nao pontuados, mas registrados)
- Changelog documentado
- Versao visivel no README
- Autoria e licenca mencionados
- Links para documentacao adicional

## Output
- Score: X/10
- Checklist de secoes presentes/ausentes
- Findings com severity
