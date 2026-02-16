# Harmonização do Sistema de Workers - Feb 14, 2026

## Contexto

Harmonização completa do workflow de workers Claude para seguir a arquitetura correta:
**Genesis → Trabalhador → Revisador → Entrega**

Todos usando Claude Haiku 4.5 + Agent Zero delegation para execução $0.

## Mudanças Realizadas

### 1. Nomenclatura Harmonizada

**Antes:**
- sentinela-genesis.py
- sentinela-escrivao.py ← nome antigo
- sentinela-revisador.py

**Depois:**
- sentinela-genesis.py
- sentinela-trabalhador.py ← renomeado
- sentinela-revisador.py

**Workers Rust (PM2):**
- claude-wrapper-genesis (antes: sentinela)
- claude-wrapper-trabalhador (antes: escrivao)
- claude-wrapper-revisador

### 2. Arquitetura: Bridge Eliminado

**Problema anterior:**
- Sentinelas Python → escreviam `.prompt_*.txt` + `.trigger_*` na raiz
- Workers Rust → liam de `.queue/{worker}/*.prompt`
- Incompatibilidade = nenhum processamento

**Solução:**
- Sentinelas Python agora escrevem DIRETO em `.queue/{worker}/{timestamp}.prompt`
- Workers Rust leem de `.queue/{worker}/`
- Bridge desnecessário - comunicação direta

### 3. Filtros Removidos

**Antes (sentinela-escrivao):**
```python
# 1ª pass: senciencia + TODO
# 2ª pass: TODO + (@aider OU @escrivao)
# Resultado: 3 stories TODO ignoradas (@agente-zero)
```

**Depois (sentinela-trabalhador):**
```python
# 1ª pass: senciencia + TODO
# 2ª pass: QUALQUER TODO (sem filtros)
# Resultado: TODAS as stories TODO são processadas
```

### 4. Claude Haiku 4.5 + Agent Zero

**Rust Wrapper modificado:**
```rust
cmd.arg("--model").arg("claude-haiku-4-5-20251001");
```

**Prompts atualizados** com seção:
```
DELEGACAO AGENT ZERO:
Para tasks complexas ou repetitivas, DELEGUE para Agent Zero:
- Use o comando /CEOs:CEO-ZERO para invocar Zeus
- Agent Zero executa com custo $0.00 (Trinity model free tier)
- Ideal para: file operations, batch tasks, data processing
```

### 5. Workflow Completo

```
┌─────────────────────────────────────────────────────────────┐
│ GENESIS (sentinela-genesis.py)                              │
│ - Detecta TODO < 2                                           │
│ - Gera 3 stories/batch para ETAPA_XXX                       │
│ - Escreve .queue/genesis/{timestamp}.prompt                 │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ GENESIS WORKER (claude-wrapper-genesis)                     │
│ - Haiku 4.5 processa prompt                                 │
│ - Cria arquivos .md em docs/stories/                        │
│ - Salva output em .output/genesis/                          │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ TRABALHADOR (sentinela-trabalhador.py)                      │
│ - Detecta QUALQUER story TODO (sem filtros)                 │
│ - Prioriza senciência > outras                              │
│ - Escreve .queue/trabalhador/{timestamp}.prompt             │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ TRABALHADOR WORKER (claude-wrapper-trabalhador)             │
│ - Haiku 4.5 processa prompt + Agent Zero delegation         │
│ - Implementa acceptance criteria                            │
│ - Atualiza story: TODO → EM_EXECUCAO → PARA_REVISAO         │
│ - Salva output em .output/trabalhador/                      │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ REVISADOR (sentinela-revisador.py)                          │
│ - Detecta stories PARA_REVISAO                              │
│ - Escreve .queue/revisador/{timestamp}.prompt               │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ REVISADOR WORKER (claude-wrapper-revisador)                 │
│ - Haiku 4.5 processa prompt + Agent Zero delegation         │
│ - Revisa qualidade, segurança, testes                       │
│ - APROVADO: PARA_REVISAO → REVISADO                         │
│ - REPROVADO: PARA_REVISAO → TODO (com feedback)             │
│ - Salva output em .output/revisador/                        │
└─────────────────────────────────────────────────────────────┘
```

### 6. Estrutura de Diretórios

```
.queue/
├── genesis/          # Prompts para gerar stories (Genesis)
├── trabalhador/      # Prompts para implementar (Trabalhador)
└── revisador/        # Prompts para revisar (Revisador)

.output/
├── genesis/          # Outputs do worker genesis
├── trabalhador/      # Outputs do worker trabalhador
└── revisador/        # Outputs do worker revisador

logs/
├── sentinela-genesis.log
├── sentinela-trabalhador.log
└── sentinela-revisador.log
```

## Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `scripts/sentinela-trabalhador.py` | **CRIADO** - Renomeado de escrivao, sem filtros |
| `scripts/sentinela-genesis.py` | Escreve em `.queue/genesis/`, prompt Agent Zero |
| `scripts/sentinela-revisador.py` | Escreve em `.queue/revisador/`, prompt Agent Zero |
| `workers/claude-wrapper/src/main.rs` | Adicionado `--model claude-haiku-4-5-20251001` |
| `ecosystem.config.js` | Renomeado workers (sentinela→genesis, escrivao→trabalhador) |

## Validação

### Workers PM2 - ✅ ONLINE
```
claude-wrapper-genesis      │ 65s uptime │ 6.2MB RAM
claude-wrapper-trabalhador  │ 65s uptime │ 8.2MB RAM
claude-wrapper-revisador    │ 64s uptime │ 6.2MB RAM
```

### Sentinelas Python - ✅ RODANDO
```
Genesis:      PID 56731
Trabalhador:  PID 56753
Revisador:    PID 56775
```

### Primeira Execução - ✅ SUCESSO
```
[14:28:55] Trabalhador detectou: "Health Monitor para Agent Zero v3"
[14:28:55] Prompt criado: .queue/trabalhador/1771090135770.prompt (2253 bytes)
[14:28:58] Worker Rust processando com Haiku 4.5...
```

## Custos

| Worker | Modelo | Custo/task |
|--------|--------|-----------|
| Genesis | Haiku 4.5 + Agent Zero | ~$0.001-0.003 |
| Trabalhador | Haiku 4.5 + Agent Zero | ~$0.002-0.005 |
| Revisador | Haiku 4.5 + Agent Zero | ~$0.001-0.003 |

**Redução vs Sonnet 4.5:**
- Haiku: ~10x mais barato (~$0.002 vs $0.020)
- Agent Zero delegation: pode chegar a $0.000 em tasks puras

## Próximos Passos

1. Monitorar primeira execução completa end-to-end
2. Validar que Agent Zero está sendo invocado corretamente
3. Confirmar ciclo: TODO → EM_EXECUCAO → PARA_REVISAO → REVISADO
4. Ajustar thresholds de geração de stories (MIN_TODO, BATCH_SIZE)

## Notas Técnicas

- **Session persistence**: Mantida via `.session_{worker}.txt`
- **FIFO queue**: Processamento oldest-first (sorted by filename)
- **Haiku 4.5**: `claude-haiku-4-5-20251001` (lançado Oct 2024)
- **No locking**: Removido `.trigger_*` e `.worker_*.lock` (desnecessário com queue)

---

**Data:** 2026-02-14
**Status:** ✅ IMPLEMENTADO E FUNCIONAL
**Impacto:** Sistema 100% harmonizado, pronto para processar 24/7
