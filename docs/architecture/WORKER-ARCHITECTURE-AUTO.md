# Worker Architecture - Automatizado com CEO-ZERO Cíclico

## Visão Geral

Workers automatizados que processam triggers dos sentinelas Python com ativação cíclica do CEO-ZERO para manter contexto limpo e custo mínimo.

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    SENTINELA PYTHON                          │
│  Monitora etapas/stories → Cria .trigger + .prompt          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  CLAUDE WORKER AUTO                          │
│                                                              │
│  [INIT] 20s aguarda → Ativa CEO-ZERO → 30s aguarda         │
│                                                              │
│  [LOOP]                                                      │
│  ├─ Detecta .trigger_{worker}                               │
│  ├─ Lê .prompt_{worker}.txt                                 │
│  ├─ Envia para Claude via stdin                             │
│  ├─ Incrementa contador                                     │
│  └─ A cada 10 tasks:                                        │
│      ├─ Envia "clear" (limpa contexto)                      │
│      ├─ Reativa CEO-ZERO                                    │
│      └─ Aguarda 10s                                         │
└─────────────────────────────────────────────────────────────┘
```

## Componentes

### 1. Sentinela Python
- **Localização:** `scripts/sentinela-{worker}.py`
- **Função:** Monitora backlog/etapas e gera triggers quando necessário
- **Output:** `.trigger_{worker}` + `.prompt_{worker}.txt`

### 2. Claude Worker Auto
- **Localização:** `scripts/claude-worker-auto.py`
- **Função:** Processa triggers automaticamente via Claude CLI
- **Persistência:**
  - `.session_{worker}.txt` - Session ID do Claude
  - `.counter_{worker}.txt` - Contador de tasks processadas
  - `.worker_{worker}.lock` - Lock de processamento

### 3. Scripts de Inicialização
- **Localização:** `scripts/run-claude-{worker}-stable.bat`
- **Função:** Wrapper que inicia o worker Python automatizado

## Fluxo de Execução

### Fase 0: Startup Escalonado (evita sobrecarga)

**Inicialização SEQUENCIAL para não sobrecarregar Claude:**

| Worker | Delay Inicial | Inicia em |
|--------|--------------|-----------|
| **Genesis (Sentinela)** | 0s | t=0s (imediato) |
| **Escrivão** | 120s (2 min) | t=2min (após Genesis) |
| **Revisador** | 240s (4 min) | t=4min (após Genesis + Escrivão) |
| **Corp** | 0s | t=0s (independente) |

### Fase 1: Inicialização Individual (90s cada)

```python
1. [t=0s]   Inicia Claude CLI com subprocess
2. [t=60s]  Envia mensagem de ativação CEO-ZERO (aguarda 1 min para garantir init completo)
3. [t=90s]  Pronto para processar triggers
```

**Timeline completo (todos workers):**
```
t=0:00  → Genesis inicia
t=2:00  → Genesis pronto | Escrivão inicia
t=4:00  → Escrivão pronto | Revisador inicia
t=6:00  → Revisador pronto | SISTEMA COMPLETO
```

**Mensagem de ativação:**
```
Voce e o worker 'SENTINELA' da Diana Corporacao Senciente.
Papel: Genesis - gera stories de evolucao senciente

Ative o modo CEO-ZERO (Zeus) para orquestrar tasks via Agent Zero.
Confirme ativacao respondendo: WORKER SENTINELA ONLINE
```

### Fase 2: Processamento Contínuo

```python
while True:
    if exists(.trigger_{worker}):
        # Processar task
        prompt = read(.prompt_{worker}.txt)
        send_to_claude(prompt)
        task_count += 1

        # A cada 10 tasks
        if task_count % 10 == 0:
            send_to_claude("clear")
            sleep(2)
            send_to_claude(CEO_ACTIVATION_MESSAGE)
            sleep(10)

        remove(.trigger_{worker})

    sleep(2)  # Polling interval
```

### Fase 3: Gestão de Contexto

**Por que limpar a cada 10 tasks?**
- Claude mantém contexto de todas conversas anteriores
- Após 10 tasks, contexto fica muito grande (tokens caros)
- `clear` reseta o contexto mantendo session ativa
- Reativar CEO-ZERO garante que o agente está pronto

## Workers Disponíveis

| Worker | Papel | Sentinela | Triggers |
|--------|-------|-----------|----------|
| **sentinela** | Genesis - gera stories sencientes | `sentinela-genesis.py` | `.trigger_sentinela` |
| **escrivao** | Implementa stories do backlog | `sentinela-escrivao.py` | `.trigger_escrivao` |
| **revisador** | Revisa stories completadas | `sentinela-revisador.py` | `.trigger_revisador` |
| **corp** | Orquestrador corporativo geral | `sentinela-corp.py` | `.trigger_corp` |

## Contadores e Persistência

### Contador de Tasks
```
.counter_{worker}.txt
```
- Incrementado a cada task processada
- Sobrevive a reinicializações
- Usado para determinar quando reativar CEO-ZERO

### Session ID
```
.session_{worker}.txt
```
- Mantém session ID do Claude entre reinicializações
- Permite continuar contexto após crash/restart
- Atualizado automaticamente pelo Claude CLI

### Lock de Processamento
```
.worker_{worker}.lock
```
- Previne processamento simultâneo do mesmo trigger
- Timeout: 10 minutos (auto-remove se expirado)
- Removido ao fim do processamento

## Configuração

### Variáveis (`claude-worker-auto.py`)

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `INIT_DELAY` | 60s | Aguarda Claude iniciar (1 minuto para garantir) |
| `CEO_ACTIVATION_DELAY` | 30s | Aguarda CEO-ZERO ativar |
| `REACTIVATE_INTERVAL` | 10 | Tasks antes de reativar CEO-ZERO |
| `POLL_INTERVAL` | 2s | Intervalo de polling de triggers |
| `MODEL` | `claude-sonnet-4-5-20250929` | Modelo Claude usado |

### Delays de Startup Sequencial

| Worker | Delay | Motivo |
|--------|-------|--------|
| `sentinela` (Genesis) | 0s | Inicia primeiro |
| `escrivao` | 120s | Aguarda Genesis completar |
| `revisador` | 240s | Aguarda Genesis + Escrivão |
| `corp` | 0s | Independente |

## Logs e Monitoramento

### Output do Worker
```
[12:34:56] [SENTINELA] Worker automatizado iniciado - Papel: Genesis
[12:34:56] [SENTINELA] Aguardando 60s para Claude inicializar completamente...
[12:35:06] [SENTINELA]   Inicializando... 10s/60s
[12:35:16] [SENTINELA]   Inicializando... 20s/60s
[12:35:26] [SENTINELA]   Inicializando... 30s/60s
[12:35:36] [SENTINELA]   Inicializando... 40s/60s
[12:35:46] [SENTINELA]   Inicializando... 50s/60s
[12:35:56] [SENTINELA]   Inicializando... 60s/60s
[12:35:56] [SENTINELA] Ativando CEO-ZERO...
[12:36:26] [SENTINELA] Iniciando processamento de triggers...
[12:36:28] [SENTINELA] Processando task #1...
[12:37:11] [SENTINELA] Processando task #10...
[12:37:13] [SENTINELA] Task #10 - Limpando contexto e reativando CEO-ZERO
```

### Heartbeat (Sentinelas)
```
C:/AIOS/workers/{worker}.json
```
- Status atual do sentinela
- Contadores de stories (TODO, EM_EXECUCAO, etc)
- Etapa atual sendo processada
- Timestamp da última atualização

## Inicialização do Sistema

### Via Start-Diana-Native.bat
```batch
.\Start-Diana-Native.bat
```

**Windows Terminal abre com 6 tabs:**
1. **SERVERS** - PM2 (backend, frontend, etc)
2. **SENTINELA-WATCH** (Python) + **SENTINELA-CLAUDE** (Worker)
3. **ESCRIVAO-WATCH** (Python) + **ESCRIVAO-CLAUDE** (Worker)
4. **REVISADOR-WATCH** (Python) + **REVISADOR-CLAUDE** (Worker)
5. **ALEX-SENTINEL** (Python) + **ALEX-WORKER** (On-demand)
6. **CORP-SENTINEL** (Python) + **CORP-CLAUDE** (Worker)

## Troubleshooting

### Worker não processa triggers
1. Verificar se sentinela Python está rodando
2. Verificar se `.trigger_{worker}` está sendo criado
3. Verificar logs do worker para erros
4. Verificar se lock não está travado (`.worker_{worker}.lock`)

### CEO-ZERO não ativa
1. Aumentar `CEO_ACTIVATION_DELAY` (padrão 30s)
2. Verificar logs do Claude para erros
3. Verificar se modelo está correto (`claude-sonnet-4-5-20250929`)

### Contador não persiste
1. Verificar permissões de escrita em `.counter_{worker}.txt`
2. Verificar se arquivo não foi deletado manualmente
3. Recriar arquivo: `echo 0 > .counter_{worker}.txt`

### Worker reinicia constantemente
1. Claude CLI pode estar falhando - verificar instalação
2. Verificar env vars (`CLAUDE_CODE_GIT_BASH_PATH`)
3. Verificar model ID válido

## Próximas Melhorias

- [ ] Dashboard web para monitorar contadores em tempo real
- [ ] Alertas quando worker fica idle por muito tempo
- [ ] Auto-ajuste do `REACTIVATE_INTERVAL` baseado em uso de tokens
- [ ] Backup automático de `.counter_{worker}.txt`
- [ ] Métricas de performance (tasks/min, tempo médio por task)

---

**Última atualização:** 2026-02-14
**Versão:** 1.0 (Automatizada com CEO-ZERO cíclico)
