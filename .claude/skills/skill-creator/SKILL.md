---
name: skill-creator
description: Guia interativo para criar novas Skills do Claude Code.
  Ativa quando o usuário quer criar uma skill customizada,
  definir SKILL.md, ou estruturar expertise reutilizável.
---

# Skill Creator — Criador de Skills para Claude Code

## O que são Skills
Skills são pastas com um `SKILL.md` que o Claude carrega dinamicamente para executar tarefas especializadas. São "manuais de expertise" portáveis.

## Estrutura de uma Skill

```
.claude/skills/nome-da-skill/
├── SKILL.md          # (obrigatório) Instruções + frontmatter YAML
├── scripts/          # (opcional) Código executável
├── references/       # (opcional) Docs de referência
└── assets/           # (opcional) Templates, dados estáticos
```

## Como Criar uma Skill

### 1. Definir o Frontmatter YAML
```yaml
---
name: nome-da-skill
description: Descrição clara e específica do que faz e QUANDO usar.
  O Claude usa esta descrição para decidir se carrega a skill automaticamente.
---
```

### 2. Corpo do SKILL.md
Seções recomendadas:
- **O que fazer** — Instruções que o Claude seguirá
- **Quando usar** — Triggers de ativação
- **Exemplos** — Casos de uso concretos
- **Regras** — Constraints e guardrails
- **Outputs** — O que a skill produz

### 3. Localização
| Escopo | Path |
|--------|------|
| Global (todos projetos) | `~/.claude/skills/nome/SKILL.md` |
| Projeto (só este repo) | `.claude/skills/nome/SKILL.md` |

## Regras para Skills de Qualidade
1. **Descrição precisa** — O Claude decide por ela se carrega ou não
2. **Instruções diretas** — Sem filosofia, vá ao ponto
3. **Exemplos concretos** — Mostre inputs e outputs esperados
4. **Tamanho controlado** — Ideal < 3000 tokens o corpo todo
5. **Sem duplicação** — Não repita o que já está no CLAUDE.md
6. **Complementar, não substituir** — Skills complementam agents, não os substituem

## Workflow de Criação
1. Pergunte ao usuário: Nome, propósito, quando deve ativar
2. Gere o SKILL.md seguindo a estrutura acima
3. Crie em `.claude/skills/{nome}/SKILL.md`
4. Confirme criação e teste ativação

## Diferença: Skill vs Agent vs Squad
| Conceito | Quando usar |
|----------|-------------|
| **Skill** | Expertise pontual, referência rápida, sem persona |
| **Agent** | Persona completa com comandos e workflows |
| **Squad** | Time de agents trabalhando juntos num domínio |
