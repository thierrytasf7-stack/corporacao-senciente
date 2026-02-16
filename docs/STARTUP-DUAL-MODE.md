# Startup Dual Mode - Diana Corporação Senciente

## Arquitetura Separada

Diana agora roda em **2 sessões isoladas** para evitar conflitos de nested Claude sessions:

### 1. Start-Diana-Native.bat (Servers + Apps)

**Componentes:**
- ✅ Backend API (21301)
- ✅ Frontend (21303)
- ✅ Dashboard AIOS (21300)
- ✅ Monitor Server (21302)
- ✅ Binance Bot (21340/21341)
- ✅ WhatsApp Bridge (21350)
- ✅ PUV Score
- ✅ Chat/Relatórios

**Gerenciamento:** PM2 (ecosystem.config.js)

**Como usar:**
```batch
Start-Diana-Native.bat
```

### 2. Start-Evolucao.bat (Workers Evolução - SESSÃO ISOLADA)

**Componentes:**
- ✅ Sentinela Genesis (Python) - Gera stories batch ETAPA_002
- ✅ Worker Genesis (PowerShell) - Processa via /CEOs:CEO-ZERO
- ✅ Sentinela Trabalhador (Python) - Detecta TODO stories
- ✅ Worker Trabalhador (PowerShell) - Implementa via /CEOs:CEO-ZERO
- ✅ Sentinela Revisador (Python) - Detecta PARA_REVISAO
- ✅ Worker Revisador (PowerShell) - Review via /CEOs:CEO-ZERO

**Gerenciamento:** Windows Terminal (4 abas separadas)

**Como usar:**
```batch
Start-Evolucao.bat
```

## Por Que Separado?

**Problema:** Claude CLI não pode ser invocado dentro de sessão Claude Code ativa.

**Solução:** Workers de evolução rodam em **terminal completamente isolado**, sem variáveis de ambiente CLAUDECODE.

## Workflow Completo

```
1. Start-Diana-Native.bat
   ↓
   Servers ativos (dashboard, backend, etc.)

2. Start-Evolucao.bat (terminal separado)
   ↓
   Sentinelas Python → .queue/{worker}/*.prompt
   ↓
   Workers PowerShell → /CEOs:CEO-ZERO {prompt}
   ↓
   CEO-ZERO → decide execução (Agent Zero ou outros)
   ↓
   Output → .output/{worker}/task_N.txt
```

## Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `Start-Evolucao.bat` | Startup workers evolução |
| `scripts/Launch-Diana-Terminal-Evolucao.ps1` | Abre Windows Terminal com 4 abas |
| `scripts/claude-worker-ceo.ps1` | Worker PowerShell que invoca CEO-ZERO |
| `scripts/claude-worker-ceo-genesis.ps1` | Alias para genesis |
| `scripts/claude-worker-ceo-revisador.ps1` | Alias para revisador |

## Modificações

### Start-Diana-Native.bat
- ❌ Removido: Criação de .queue/genesis, trabalhador, revisador
- ✅ Adicionado: Nota sobre workers rodarem em Start-Evolucao.bat

### ecosystem.config.js
- ✅ Modificado: claude-wrapper-trabalhador → claude-worker-trabalhador (PowerShell)
- ⚠️ Genesis/Revisador ainda como Rust wrapper (podem ser removidos ou atualizados)

## Status

- ✅ Start-Diana-Native.bat - PRONTO
- ✅ Start-Evolucao.bat - PRONTO
- ✅ Workers PowerShell CEO-ZERO - IMPLEMENTADOS
- ⚠️ PENDENTE: Testar em terminal externo (fora desta sessão Claude Code)

## Próximos Passos

1. **Fechar esta sessão Claude Code**
2. **Executar Start-Evolucao.bat em terminal limpo**
3. **Verificar se workers conseguem invocar /CEOs:CEO-ZERO sem bloqueio**
4. **Monitorar outputs em .output/{worker}/task_N.txt**

---

*Arquitetura Dual Mode v1.0 | Feb 14, 2026 | Sessão isolada para workers*
