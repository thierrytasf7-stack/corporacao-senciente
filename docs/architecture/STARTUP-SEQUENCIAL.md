# Startup Sequencial - Workers Diana

## Visão Geral

Workers inicializam de forma **sequencial** para evitar sobrecarga do Claude e garantir inicialização estável.

## Timeline Visual

```
MINUTO 0-2: GENESIS INICIALIZA
├─ [0:00] Genesis: Aguardando 60s para Claude inicializar...
├─ [0:10] Genesis: Inicializando... 10s/60s
├─ [0:20] Genesis: Inicializando... 20s/60s
├─ [0:30] Genesis: Inicializando... 30s/60s
├─ [0:40] Genesis: Inicializando... 40s/60s
├─ [0:50] Genesis: Inicializando... 50s/60s
├─ [1:00] Genesis: Inicializando... 60s/60s
├─ [1:00] Genesis: Ativando CEO-ZERO...
├─ [1:30] Genesis: Iniciando processamento de triggers...
└─ [1:30] ✅ GENESIS PRONTO

MINUTO 2-4: ESCRIVÃO INICIALIZA
├─ [0:00] Escrivao: Aguardando 120s para inicializacao sequencial...
├─ [0:30] Escrivao: Aguardando... 30s/120s (faltam 90s)
├─ [1:00] Escrivao: Aguardando... 60s/120s (faltam 60s)
├─ [1:30] Escrivao: Aguardando... 90s/120s (faltam 30s)
├─ [2:00] Escrivao: Delay de startup concluido. Iniciando worker...
├─ [2:00] Escrivao: Aguardando 60s para Claude inicializar...
├─ [2:10] Escrivao: Inicializando... 10s/60s
├─ [2:20] Escrivao: Inicializando... 20s/60s
├─ [2:30] Escrivao: Inicializando... 30s/60s
├─ [2:40] Escrivao: Inicializando... 40s/60s
├─ [2:50] Escrivao: Inicializando... 50s/60s
├─ [3:00] Escrivao: Inicializando... 60s/60s
├─ [3:00] Escrivao: Ativando CEO-ZERO...
├─ [3:30] Escrivao: Iniciando processamento de triggers...
└─ [3:30] ✅ ESCRIVÃO PRONTO

MINUTO 4-6: REVISADOR INICIALIZA
├─ [0:00] Revisador: Aguardando 240s para inicializacao sequencial...
├─ [0:30] Revisador: Aguardando... 30s/240s (faltam 210s)
├─ [1:00] Revisador: Aguardando... 60s/240s (faltam 180s)
├─ [1:30] Revisador: Aguardando... 90s/240s (faltam 150s)
├─ [2:00] Revisador: Aguardando... 120s/240s (faltam 120s)
├─ [2:30] Revisador: Aguardando... 150s/240s (faltam 90s)
├─ [3:00] Revisador: Aguardando... 180s/240s (faltam 60s)
├─ [3:30] Revisador: Aguardando... 210s/240s (faltam 30s)
├─ [4:00] Revisador: Delay de startup concluido. Iniciando worker...
├─ [4:00] Revisador: Aguardando 60s para Claude inicializar...
├─ [4:10] Revisador: Inicializando... 10s/60s
├─ [4:20] Revisador: Inicializando... 20s/60s
├─ [4:30] Revisador: Inicializando... 30s/60s
├─ [4:40] Revisador: Inicializando... 40s/60s
├─ [4:50] Revisador: Inicializando... 50s/60s
├─ [5:00] Revisador: Inicializando... 60s/60s
├─ [5:00] Revisador: Ativando CEO-ZERO...
├─ [5:30] Revisador: Iniciando processamento de triggers...
└─ [5:30] ✅ REVISADOR PRONTO

[6:00] 🎉 SISTEMA COMPLETO - TODOS WORKERS OPERACIONAIS
```

## Resumo de Tempos

| Worker | Startup Delay | Init Claude | Ativa CEO-ZERO | Pronto em | Status |
|--------|--------------|-------------|----------------|-----------|--------|
| **Genesis** | 0s | 60s | +30s | **1:30** | ✅ |
| **Escrivão** | 120s | 60s | +30s | **3:30** | ⏳ Aguarda Genesis |
| **Revisador** | 240s | 60s | +30s | **5:30** | ⏳ Aguarda Genesis + Escrivão |
| **Sistema** | - | - | - | **6:00** | 🎉 Completo |

## Benefícios da Inicialização Sequencial

### ✅ Evita Sobrecarga
- 3 Claude CLI simultâneos podem sobrecarregar CPU/memória
- Inicialização sequencial distribui carga ao longo de 6 minutos

### ✅ Estabilidade
- Cada worker tem tempo completo para inicializar
- Sem competição por recursos (I/O, network, etc)

### ✅ Observabilidade
- Fácil identificar qual worker falhou (logs separados no tempo)
- Cada worker completa antes do próximo iniciar

### ✅ Graceful Degradation
- Se Genesis falhar, Escrivão e Revisador não iniciam
- Falha detectada cedo (não desperdiça 6 min de init se Genesis está quebrado)

## Configuração

### Ajustar Delays (`scripts/claude-worker-auto.py`)

```python
STARTUP_DELAYS = {
    "sentinela": 0,      # Genesis (imediato)
    "escrivao": 120,     # 2 min
    "revisador": 240,    # 4 min
    "corp": 0            # Independente
}
```

### Reduzir Tempo Total

Para ambiente de desenvolvimento (testes rápidos):

```python
STARTUP_DELAYS = {
    "sentinela": 0,      # Genesis
    "escrivao": 60,      # 1 min (metade)
    "revisador": 120,    # 2 min (metade)
    "corp": 0
}
```

**Tempo total:** 3 minutos (vs 6 minutos produção)

## Monitoramento

### Verificar Status Durante Startup

```powershell
# Ver qual worker está inicializando
Get-Content C:\AIOS\workers\*.json | ConvertFrom-Json | Select worker, status
```

### Heartbeat Files

```
C:\AIOS\workers\sentinela.json   → Status Genesis
C:\AIOS\workers\escrivao.json    → Status Escrivão
C:\AIOS\workers\revisador.json   → Status Revisador
```

## Troubleshooting

### Worker não inicia após delay

**Sintoma:** Escrivão não inicia após 2 min

**Diagnóstico:**
1. Verificar logs do Genesis - completou inicialização?
2. Verificar se Genesis travou durante init
3. Verificar se Claude CLI está acessível

**Solução:**
- Reiniciar Genesis primeiro
- Aguardar 2 min para Escrivão detectar e iniciar

### Quer inicializar mais rápido

**Para testes:**
1. Editar `STARTUP_DELAYS` em `claude-worker-auto.py`
2. Reduzir valores pela metade
3. ⚠️ **Não usar em produção** - pode sobrecarregar

### Sistema demora 6 minutos para ficar pronto

**É esperado!** Inicialização completa leva 6 min para garantir estabilidade.

**Alternativa:**
- Iniciar apenas Genesis para testes
- Adicionar workers incrementalmente conforme necessário

---

**Última atualização:** 2026-02-14
**Versão:** 1.0 (Startup Sequencial)
