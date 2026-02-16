# 🚀 PLANO DE EVOLUÇÃO AGRESSIVA - Mycelium Ecosystem

**Filosofia:** Aumentar agressividade gradualmente conforme demonstramos estabilidade e lucratividade consistente.

**Meta Base:** 3% ROI (constante em todos os níveis)
**Variável:** Tempo para atingir meta (diminui conforme evoluímos)

---

## 📊 NÍVEIS DE AGRESSIVIDADE

### ✅ NÍVEL 0: BASELINE (CONCLUÍDO)
**Meta:** 3% em 24 horas
**Status:** ✅ APROVADO (2% em 24h alcançado, estável)
**Período:** 14-15 Fev 2026
**Resultados:**
- ROI: +2.00% em 24h
- Win Rate: 35-52%
- Drawdown: -1.00% (excelente)
- Bots: 25/25 alive
- Estabilidade: ✅ 100%

**Conclusão:** Base sólida estabelecida, pronto para NÍVEL 1.

---

### 🎯 NÍVEL 1: MODERADO (ATUAL)
**Meta:** 3% em 12 horas
**Período:** 15 Fev 2026 → até aprovação
**Tempo:** Metade do tempo do NÍVEL 0 (24h → 12h)

**Ajustes de Config:**
- `minSignalStrength`: 62% → **58%** (mais sinais)
- `maxOpenPositions`: 8 → **10** (mais exposição)
- `symbolCooldownMs`: 300000 (5min) → **180000** (3min)
- `cycleIntervalMs`: 6000 (6s) → **5000** (5s) - ciclos mais rápidos

**Critérios para Aprovação (72h consecutivas):**
- ✅ Atingir 3% ROI em <= 12h (pelo menos 2 ciclos completos em 24h)
- ✅ Drawdown < 5%
- ✅ Win Rate > 30%
- ✅ Bots alive > 23/25 (92%)
- ✅ Nenhum crash do backend por 72h
- ✅ Média de 2+ ciclos de 3% por dia (demonstra consistência)

**Se FALHAR:** Rollback para NÍVEL 0 por 48h, revisar estratégias.

---

### 🔥 NÍVEL 2: AGRESSIVO
**Meta:** 3% em 6 horas
**Tempo:** Metade do tempo do NÍVEL 1 (12h → 6h)

**Ajustes de Config:**
- `minSignalStrength`: 58% → **52%** (sinais mais agressivos)
- `maxOpenPositions`: 10 → **15**
- `maxPositionsPerSymbol`: 2 → **3**
- `symbolCooldownMs`: 180000 → **120000** (2min)
- `cycleIntervalMs`: 5000 → **4000** (4s)
- Leverage médio: aumentar em 10% por grupo

**Critérios para Aprovação (96h consecutivas):**
- ✅ Atingir 3% ROI em <= 6h (pelo menos 4 ciclos completos em 24h)
- ✅ Drawdown < 8%
- ✅ Win Rate > 30%
- ✅ Bots alive > 22/25 (88%)
- ✅ Peak-to-current < 10% (controle de retração)
- ✅ Média de 4+ ciclos de 3% por dia

**Se FALHAR:** Rollback para NÍVEL 1 por 96h.

---

### ⚡ NÍVEL 3: MUITO AGRESSIVO
**Meta:** 3% em 3 horas
**Tempo:** Metade do tempo do NÍVEL 2 (6h → 3h)

**Ajustes de Config:**
- `minSignalStrength`: 52% → **45%** (máxima sensibilidade)
- `maxOpenPositions`: 15 → **20**
- `maxPositionsPerSymbol`: 3 → **4**
- `symbolCooldownMs`: 120000 → **60000** (1min)
- `cycleIntervalMs`: 4000 → **3000** (3s)
- Leverage médio: aumentar em 20% por grupo
- Ativar trading de altcoins adicionais

**Critérios para Aprovação (120h consecutivas):**
- ✅ Atingir 3% ROI em <= 3h (pelo menos 8 ciclos completos em 24h)
- ✅ Drawdown < 12%
- ✅ Win Rate > 28%
- ✅ Bots alive > 20/25 (80%)
- ✅ Sharpe Ratio > 1.2
- ✅ Média de 8+ ciclos de 3% por dia

**Se FALHAR:** Rollback para NÍVEL 2 por 120h.

---

### 🚀 NÍVEL 4: EXPERT (MÁXIMA AGRESSIVIDADE)
**Meta:** 3% em 1 hora
**Tempo:** Um terço do tempo do NÍVEL 3 (3h → 1h)

**Ajustes de Config:**
- `minSignalStrength`: 45% → **38%** (aceita sinais fracos)
- `maxOpenPositions`: 20 → **30**
- `maxPositionsPerSymbol`: 4 → **5**
- `symbolCooldownMs`: 60000 → **30000** (30s)
- `cycleIntervalMs`: 3000 → **2000** (2s) - máxima velocidade
- Leverage médio: aumentar em 30% por grupo
- Ativar scalping de alta frequência
- Diversificar em 50+ pares

**Critérios para Manutenção (168h consecutivas):**
- ✅ Atingir 3% ROI em <= 1h (30+ ciclos completos em 24h)
- ✅ Drawdown < 18%
- ✅ Win Rate > 25%
- ✅ Bots alive > 18/25 (72%)
- ✅ Sharpe Ratio > 1.0
- ✅ Média de 20+ ciclos de 3% por dia (máxima eficiência)

**Se FALHAR:** Rollback para NÍVEL 3 por 168h.

---

## 🛡️ PROTOCOLO DE SEGURANÇA

### Gates Automáticos (todos os níveis)

**STOP LOSS GERAL:**
- Drawdown > 25% → PAUSE ecosystem, notificar CEO
- 5+ bots mortos em 1 hora → ROLLBACK nível anterior
- Backend crashes > 3 em 6h → Investigar antes de continuar

**ROLLBACK CONDICIONAL:**
- ROI negativo por 24h consecutivas → ROLLBACK
- Win rate < 20% por 48h → ROLLBACK
- Peak-to-current retração > 20% → ROLLBACK

**RECOVERY MODE:**
- Se ROLLBACK, operar em modo conservador (NÍVEL 0) por 48h
- Analisar logs de mutação adaptativa para identificar falhas
- Ajustar DNA seeds se necessário
- Só tentar avançar novamente após 3 dias de estabilidade

---

## 📈 PROGRESSÃO EXPONENCIAL DE TEMPO

**Meta constante:** 3% ROI
**Variável:** Tempo para atingir (reduz exponencialmente)

| Nível | Tempo para 3% | Redução | Ciclos/dia (teórico) |
|-------|---------------|---------|----------------------|
| **0** | 24 horas | Baseline | 1.25× ao dia |
| **1** | 12 horas | ÷2 | 2.5× ao dia |
| **2** | 6 horas | ÷2 | 5× ao dia |
| **3** | 3 horas | ÷2 | 10× ao dia |
| **4** | 1 hora | ÷3 | 30× ao dia |

**Exponencial = Cada nível reduz tempo pela METADE (ou mais)**

**OBJETIVO:** Atingir NÍVEL 4 (3% por hora) = crescimento exponencial sustentado.

---

## 🧬 INTEGRAÇÃO COM ADAPTIVE MUTATION

**NÍVEL 1-2:** Mutação adaptativa padrão
- STAGNATION_THRESHOLD: 100 ciclos
- DEATH_BOOST_THRESHOLD: 3 mortes

**NÍVEL 3:** Mutação mais agressiva
- STAGNATION_THRESHOLD: 75 ciclos (detecta mais rápido)
- DEATH_BOOST_THRESHOLD: 2 mortes (reage mais cedo)
- RADICAL mutation probability: 5% → 10%

**NÍVEL 4:** Mutação ultra-agressiva
- STAGNATION_THRESHOLD: 50 ciclos
- DEATH_BOOST_THRESHOLD: 2 mortes
- RADICAL mutation probability: 10% → 15%
- EXPLORATORY bias: +20% amplitude

---

## 📊 MONITORAMENTO OBRIGATÓRIO

**Por Nível:**
- **Daily Report** (todo dia 00:00 UTC): ROI 24h, drawdown, win rate, bots alive
- **6h Checkpoint** (4x/dia): Quick status, verificar gates
- **Logs de Mutação**: Monitorar DEATH_BOOST e STAGNATION events
- **Performance por Grupo**: Identificar underperformers

**Alertas Automáticos:**
- Drawdown > threshold do nível → Slack/Email
- Bot death spike (5+ em 1h) → Slack/Email
- Backend crash → Slack/Email
- ROI negativo por 12h → Slack/Email

---

## 🎯 FILOSOFIA DE EVOLUÇÃO

> "Agressividade sem estabilidade é temeridade.
> Estabilidade sem agressividade é mediocridade.
> Evoluir é encontrar o equilíbrio dinâmico entre ambos."

**Princípios:**
1. **Provar antes de avançar** - 72h+ de estabilidade comprovada
2. **Rollback não é falha** - É proteção inteligente de capital
3. **Dados > Emoção** - Decisões baseadas em métricas objetivas
4. **Exponencial > Linear** - Crescimento composto é a meta
5. **Adaptação contínua** - DNA evolution + human oversight

---

**Status Atual:** 🎯 **NÍVEL 1 INICIADO** (15 Fev 2026)
**Próxima Revisão:** 18 Fev 2026 (72h checkpoint)

— CEO Satoshi | Evolução Disciplinada = Lucro Exponencial 👔
