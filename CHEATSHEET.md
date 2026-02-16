# Claude Code - Cheatsheet Completo

## Comandos Slash

| Comando | Descricao |
|---------|-----------|
| `/help` | Ajuda geral |
| `/model` | Trocar modelo (Opus, Sonnet, Haiku) |
| `/mcp` | Gerenciar MCP servers |
| `/rewind` | Voltar a estado anterior |
| `/resume` | Retomar sessao anterior |
| `/debug` | Modo debug |
| `/clear` | Limpar conversa |
| `/compact` | Compactar contexto |
| `/fast` | Toggle modo rapido (mesmo modelo, output mais rapido) |
| `/status` | Status do sistema |
| `/tasks` | Ver tasks em background |
| `/review` | Review de codigo |
| `/commit` | Criar commit |

## Atalhos de Teclado

| Atalho | Acao |
|--------|------|
| `Esc Esc` | Rewind (voltar checkpoint anterior) |
| `Ctrl+R` | Historico de conversas |
| `Ctrl+C` | Cancelar operacao atual |
| `Ctrl+D` | Sair do Claude Code |
| `Tab` | Autocomplete |
| `Shift+Tab` | Aceitar sugestao |

## MCP Servers Instalados

### Listar
```bash
claude mcp list
```

### Adicionar novo
```bash
claude mcp add <nome> -- npx -y <pacote>
claude mcp add --transport http <nome> <url> -H "Authorization: Bearer <token>"
```

### Remover
```bash
claude mcp remove <nome>
```

### Servers Ativos neste Projeto
| Server | Tipo | Funcao |
|--------|------|--------|
| context7 | stdio | Docs atualizadas de libs |
| sequential-thinking | stdio | Decomposicao de tarefas |
| memory | stdio | Memoria persistente entre sessoes |
| filesystem | stdio | Acesso ao sistema de arquivos |
| postgres | stdio | Acesso direto ao PostgreSQL |

## Agent Teams (Experimental)

### Ativar
```bash
set CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```
Ja esta ativo via settings.local.json.

### Como Usar
- **Subagentes** sao criados automaticamente via Task tool
- Cada subagente tem escopo isolado e ferramentas especificas
- Tipos: Bash, Explore, Plan, general-purpose
- Subagentes rodam em paralelo para tarefas independentes

### Exemplo Pratico
```
"Faca em paralelo: (1) rode os testes, (2) faca lint do codigo"
→ Claude cria 2 subagentes simultaneos
```

## Hooks Configurados

| Evento | Matcher | Acao |
|--------|---------|------|
| PreToolUse | `git commit*` | Aviso pre-commit |
| PostToolUse | `git commit*` | Confirmacao pos-commit |
| Stop | qualquer | Mensagem de fim de sessao |

### Criar Hook Customizado
Edite `.claude/settings.local.json`:
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash(npm test*)",
        "hooks": [{
          "type": "command",
          "command": "powershell.exe -NoProfile -Command \"Write-Host 'Rodando testes...'\"",
          "timeout": 10
        }]
      }
    ]
  }
}
```

### Eventos Disponiveis
- `PreToolUse` - Antes de usar ferramenta
- `PostToolUse` - Depois de usar ferramenta
- `Stop` - Quando Claude para de responder
- `UserPromptSubmit` - Quando usuario envia mensagem

## Subagentes - Uso Avancado

### Tipos de Subagentes
| Tipo | Uso |
|------|-----|
| `Bash` | Execucao de comandos |
| `Explore` | Busca rapida no codebase |
| `Plan` | Planejamento de implementacao |
| `general-purpose` | Pesquisa e tarefas complexas |

### Dicas
- Lance multiplos subagentes em paralelo para tarefas independentes
- Use `run_in_background: true` para tarefas longas
- Subagentes tem contexto isolado - forneca instrucoes claras

## Performance Tips

| Config | Valor | Efeito |
|--------|-------|--------|
| `effortLevel` | high | Respostas mais detalhadas |
| `defaultMode` | dontAsk | Sem prompts de permissao (YOLO) |
| `/fast` | toggle | Output mais rapido, mesmo modelo |
| `/compact` | manual | Compacta contexto quando pesado |

## Agentes AIOS (Skills)

### Ativar Agente
```
/AIOS:agents:dev       → Dex (implementacao)
/AIOS:agents:qa        → Quinn (testes)
/AIOS:agents:architect → Aria (arquitetura)
/AIOS:agents:devops    → Gage (deploy, git push)
/AIOS:agents:po        → Pax (stories)
/AIOS:agents:sm        → River (scrum master)
```

### Comandos de Agente
```
*help           → Lista comandos
*create-story   → Cria story
*task <nome>    → Executa task
*exit           → Sai do modo agente
```

## PostgreSQL Local

```bash
# Conectar via psql
psql -U postgres -h localhost -p 5432

# MCP ja configurado automaticamente
# Connection: postgresql://postgres:***@localhost:5432/postgres
```

## Git Workflow

```bash
# Conventional commits
git commit -m "feat(scope): descricao"
git commit -m "fix(scope): descricao"
git commit -m "docs: descricao"

# Branches
feat/*   → Features
fix/*    → Correcoes
docs/*   → Documentacao
```

## Troubleshooting

| Problema | Solucao |
|----------|---------|
| MCP nao conecta | Reinicie Claude Code |
| Contexto pesado | `/compact` |
| Quer voltar atras | `Esc Esc` ou `/rewind` |
| Permissao negada | Verifique settings.json |
| Hook falha | Cheque timeout e comando |

---
*Diana Corporacao Senciente - Claude Code Supercharged*
