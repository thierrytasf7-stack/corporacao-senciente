# 🤖 BOTS DE PAPER TRADING: Tennis Favorite 30-0 Comeback

**Status:** 🟢 **ATIVOS E RODANDO**  
**Início:** 2026-02-17  
**Estratégia:** Tennis Favorite 30-0 Comeback

---

## 📊 VISÃO GERAL

```
┌─────────────────────────────────────────────────────────────┐
│  BOTS ATIVOS                                                │
│  ─────────────────────────────────────────────────────────  │
│  🟢 paper-trading-bot.py    - Execução de apostas          │
│  🟢 monitor.py              - Monitoramento e alertas       │
│  ⏳ live-tracker.py         - Rastreamento em tempo real*   │
│  ⏳ daily-reporter.py       - Relatórios automáticos*       │
│  ─────────────────────────────────────────────────────────  │
│  * Pendente de integração com APIs reais                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 COMO EXECUTAR

### Bot Principal (Paper Trading)

```bash
cd squads/betting-ops/scripts

# Executar uma vez (com dados simulados)
python paper-trading-bot.py --once --simulate

# Executar continuamente (a cada 60 segundos)
python paper-trading-bot.py --continuous --simulate --interval 60

# Executar com dados reais (se disponíveis)
python paper-trading-bot.py --continuous --interval 300
```

### Monitor (Alertas e Relatórios)

```bash
cd squads/betting-ops/scripts

# Verificar alertas
python monitor.py --alert

# Gerar relatório diário
python monitor.py --report

# Modo padrão (status + alertas)
python monitor.py
```

### Execução Automática (Background)

```bash
# Windows Task Scheduler
# Criar task para executar a cada 5 minutos

# Ou usar script batch
start_bot.bat
```

---

## 📁 ARQUIVOS GERADOS

### Dados

| Arquivo | Finalidade |
|---------|------------|
| `data/paper-trading-state.json` | Estado atual do paper trading |
| `data/paper-trading-log.md` | Log de todas as apostas |
| `data/alerts-log.md` | Histórico de alertas |
| `data/reports/daily-YYYY-MM-DD.md` | Relatórios diários |

### Scripts

| Arquivo | Finalidade |
|---------|------------|
| `scripts/paper-trading-bot.py` | Bot principal de execução |
| `scripts/monitor.py` | Monitoramento e alertas |
| `scripts/live-tracker.py` | Rastreamento em tempo real (futuro) |
| `scripts/daily-reporter.py` | Relatórios automáticos (futuro) |

---

## 📊 ESTADO ATUAL

### Bankroll

```
Inicial:  1000.00 unidades
Atual:    [ATUALIZAR]
Lucro:    [ATUALIZAR]
```

### Métricas

```
Total Apostas:  [ATUALIZAR]
Vitórias:       [ATUALIZAR]
Derrotas:       [ATUALIZAR]
Win Rate:       [ATUALIZAR]%
ROI:            [ATUALIZAR]%
Max Drawdown:   [ATUALIZAR]%
```

---

## ⚙️ CONFIGURAÇÃO

### Estratégia

| Parâmetro | Valor |
|-----------|-------|
| Gatilho | Favorito perde 30-0 no saque |
| Mercado | Game Winner |
| Odd Mínima | 1.70 |
| Odd Máxima | 2.10 |
| Stake | 1.0 unidade (fixa) |

### Limites

| Parâmetro | Valor |
|-----------|-------|
| Max Apostas/Dia | 20 |
| Stop Loss/Dia | 10 unidades (1%) |
| Stop Loss/Semana | 50 unidades (5%) |
| Stop Loss/Mês | 100 unidades (10%) |

---

## 🚨 ALERTAS CONFIGURADOS

| Nível | Condição | Ação |
|-------|----------|------|
| ⚠️ | Win Rate < 70% (50 apostas) | Revisar estratégia |
| ⚠️ | Drawdown > 5% | Reduzir stake |
| 🔴 | Stop Loss Diário (-10) | Parar por hoje |
| 🔴 | Sequência de 3 derrotas | Avaliar pausa |
| ✅ | Win Rate > 80% (100 apostas) | Continuar |
| ✅ | ROI > 50% (100 apostas) | Aumentar stake gradual |

---

## 📝 LOG DE EXECUÇÃO

### Hoje

| Hora | Torneio | Jogadores | Odd | Stake | Resultado | Lucro | Bankroll |
|------|---------|-----------|-----|-------|-----------|-------|----------|
| [AUTO] | [AUTO] | [AUTO] | [AUTO] | 1.0 | [AUTO] | [AUTO] | [AUTO] |

### Resumo do Dia

- **Apostas:** 0
- **Vitórias:** 0
- **Derrotas:** 0
- **Win Rate:** 0%
- **Lucro:** 0.00

---

## 🔄 FLUXO DE EXECUÇÃO

```
┌─────────────────────────────────────────────────────────────┐
│  1. paper-trading-bot.py (a cada 60s)                      │
│     ├─ Carrega estado atual                                 │
│     ├─ Detecta triggers 30-0                                │
│     ├─ Verifica limites (max bets, stop loss)               │
│     ├─ Executa apostas simuladas                            │
│     └─ Atualiza estado e log                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  2. monitor.py (a cada 300s)                                │
│     ├─ Carrega estado                                       │
│     ├─ Verifica alertas                                     │
│     ├─ Registra alertas                                     │
│     └─ Gera relatório diário (18:00)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📈 PRÓXIMAS INTEGRAÇÕES

### Pendentes

- [ ] **API-Sports:** Dados reais de tênis em tempo real
- [ ] **TheOddsAPI:** Odds reais de mercado
- [ ] **Live Tracker:** Monitoramento de jogos ao vivo
- [ ] **Telegram Bot:** Alertas via Telegram
- [ ] **Email Reports:** Relatórios diários por email

### Prioridade

1. **API-Sports** - Coleta de dados reais
2. **TheOddsAPI** - Odds em tempo real
3. **Telegram Bot** - Alertas instantâneos
4. **Live Tracker** - Monitoramento automático

---

## 🛠️ COMANDOS ÚTEIS

### Ver Status

```bash
python monitor.py
```

### Ver Log

```bash
cat data/paper-trading-log.md
```

### Ver Estado

```bash
cat data/paper-trading-state.json
```

### Iniciar Bot

```bash
python paper-trading-bot.py --continuous --simulate
```

### Parar Bot

```
Ctrl+C
```

---

## 📞 SUPORTE

### Problemas Comuns

| Erro | Solução |
|------|---------|
| Estado não encontrado | Executar bot uma vez primeiro |
| Sem triggers | Aguardar próximos jogos simulados |
| Alertas não aparecem | Verificar monitor.py --alert |

### Logs

- **Bot:** Console durante execução
- **Estado:** `data/paper-trading-state.json`
- **Alertas:** `data/alerts-log.md`
- **Relatórios:** `data/reports/`

---

## 🎯 METAS

| Período | Win Rate | ROI | Apostas |
|---------|----------|-----|---------|
| Semana 1 | > 75% | > 50% | 100+ |
| Semana 2 | > 75% | > 50% | 200+ |
| Semana 3 | > 75% | > 50% | 300+ |
| Semana 4 | > 75% | > 50% | 400+ |

**Critério de Sucesso:** Win Rate > 75% E ROI > 50% por 4 semanas

---

**Bots ativos e monitorando 24/7!** 🤖

**Betting-Ops Squad** | **CEO-BET Domain** | **2026-02-17**
