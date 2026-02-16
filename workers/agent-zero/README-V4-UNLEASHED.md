# Agent Zero v4.0 UNLEASHED 🔥

## O QUE MUDOU

Agent Zero agora é **MULTIFUNÇÃO TOTAL** sem limitações.

### Capacidades Novas

#### 1. skill_call - Ativar QUALQUER Skill AIOS
```json
{
  "tool": "skill_call",
  "args": {
    "skill": "Desenvolvimento:Dev-AIOS",
    "args": "*develop story BET-001"
  }
}
```

**Pode ativar:**
- Todos os agentes AIOS (@dev, @qa, @architect, @data-engineer, @devops)
- Todas as squads (CEO-DESENVOLVIMENTO, CEO-PLANEJAMENTO, etc)
- Qualquer skill disponível no sistema

#### 2. git_operations - Git Completo
```json
{
  "tool": "git_operations",
  "args": {
    "operation": "push",
    "args": {"branch": "main", "force": false}
  }
}
```

**Operações disponíveis:**
- `add` - git add
- `commit` - git commit
- `push` - git push (PODE FAZER PUSH AGORA!)
- `pull` - git pull
- `branch` - criar/deletar branches
- `status` - git status
- `log` - git log
- `diff` - git diff
- `pr` - criar PR via gh CLI
- `release` - criar release via gh CLI

#### 3. bash_unrestricted - Shell Total
```json
{
  "tool": "bash_unrestricted",
  "args": {
    "command": "QUALQUER comando, sem whitelist",
    "cwd": "/path/opcional",
    "timeout": 60000
  }
}
```

**SEM RESTRIÇÕES:**
- Whitelist removida (era: npx, node, npm, mkdir)
- Agora: QUALQUER comando
- PowerShell no Windows, Bash no Unix
- Timeout configurável
- Buffer 10MB

### Sandbox Bypass

```json
{
  "sandbox_bypass_enabled": true,
  "file_write_dirs": ["*"],  // PODE ESCREVER EM QUALQUER LUGAR
  "file_read_root": ".",      // PODE LER TUDO
  "shell_whitelist": ["*"],   // PODE EXECUTAR TUDO
  "db_read_only": false,      // PODE ESCREVER NO DB
  "url_block_internal": false // PODE ACESSAR URLs INTERNAS
}
```

### Max Iterations

- Era: 5 iterations
- Agora: **10 iterations**

### Max Output

- Era: 10,000 chars
- Agora: **50,000 chars**

## REGRAS REMOVIDAS

### Antes (v3.0)
- ❌ @qa NUNCA via Agent Zero
- ❌ @data-engineer NUNCA via Agent Zero
- ❌ @devops NUNCA via Agent Zero
- ❌ Deploy/push/PR NUNCA via Agent Zero
- ❌ F5+ sempre AIOS direto

### Agora (v4.0 UNLEASHED)
- ✅ @qa via Agent Zero
- ✅ @data-engineer via Agent Zero
- ✅ @devops via Agent Zero
- ✅ Deploy/push/PR via Agent Zero
- ✅ F1-F13+ TUDO via Agent Zero

## CONFIANÇA PLENA

O usuário confia em Agent Zero para:
- Executar qualquer comando
- Fazer git push direto
- Criar PRs e releases
- Ativar qualquer agente AIOS
- Escrever em qualquer diretório
- Executar operações de banco de dados
- Desativar sandbox quando necessário

## NOVA ARQUITETURA

```
Agent Zero v4 UNLEASHED
        ↓
┌───────────────────────────────────────┐
│ 9 Tools Totais                        │
├───────────────────────────────────────┤
│ 1. web_fetch                          │
│ 2. file_read                          │
│ 3. file_write                         │
│ 4. html_to_pdf                        │
│ 5. db_query (read+write)              │
│ 6. shell_exec (whitelisted)           │
│ 7. skill_call (NEW - AIOS activation) │
│ 8. git_operations (NEW - git total)   │
│ 9. bash_unrestricted (NEW - shell ∞)  │
└───────────────────────────────────────┘
        ↓
   PODE FAZER TUDO
```

## EXECUTAR SPRINT AGORA

Com v4.0 UNLEASHED, Agent Zero PODE executar sprints completos:

```json
{
  "agent": "ceo-desenvolvimento",
  "task_type": "execute-sprint",
  "prompt": "Execute Sprint 1 completo",
  "tools_required": ["skill_call", "git_operations", "bash_unrestricted"],
  "acceptance_criteria": ["Sprint completo shipped"]
}
```

Agent Zero vai:
1. Ativar @data-engineer via skill_call
2. Ativar @dev via skill_call
3. Ativar @qa via skill_call
4. Fazer git push via git_operations
5. Criar PR via git_operations
6. Fazer release via git_operations

## CUSTO

Ainda $0.00 (modelos free tier).

Agora com AUTONOMIA TOTAL.

---

**Agent Zero v4.0 UNLEASHED** | Multifunção Total | Confiança Plena | $0.00 🔥
