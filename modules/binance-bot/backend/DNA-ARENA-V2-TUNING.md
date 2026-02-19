# DNA Arena V2 - Ajustes de Performance (Fev 2026)

## 📊 Análise de Performance (Última Hora)

### Métricas Observadas
- **Win Rate Médio:** ~40% (abaixo do ideal de 55%+)
- **Geração Atual:** 232 (Omega)
- **Trades por 20 min:** ~37-64 trades
- **Performance Omega (gen 232):** 31.3% win rate, -0.59% PnL
- **Performance Sigma (gen 230):** 52.4% win rate, -0.87% PnL

### Problemas Identificados
1. **Consensus muito fraco:** Bots entrando com 2-4 sinais apenas
2. **Muita oposição aceita:** Até 3-4 sinais opostos permitidos
3. **Força mínima baixa:** 39-45% de força ponderada
4. **Mutação muito agressiva:** 15% causava instabilidade genética
5. **Estratégias insuficientes:** Mínimo de 3 estratégias era pouco
6. **Leverage muito alto:** Até 75x causava drawdowns severos

---

## 🔧 Ajustes Aplicados

### 1. Parâmetros de Consenso (TUNED)

| Parâmetro | Antes | Depois | Justificativa |
|-----------|-------|--------|---------------|
| `MIN_AGREEING_SIGNALS` | 2-4 | **5** | Entradas mais seletivas, maior qualidade |
| `MAX_OPPOSING_SIGNALS` | 3-4 | **2** | Menos contradição aceita |
| `MIN_WEIGHTED_STRENGTH` | 39-45 | **50** | Sinais mais fortes e confiáveis |

**Impacto Esperado:**
- Redução de ~30% no número de trades
- Aumento de win rate de ~40% para ~50%+
- Melhor risco/retorno por trade

---

### 2. Taxa de Mutação (STABILITY)

| Parâmetro | Antes | Depois | Justificativa |
|-----------|-------|--------|---------------|
| `mutationRate` | 0.15 (15%) | **0.10 (10%)** | Mais estabilidade, menos caos |

**Impacto Esperado:**
- Genomas mais estáveis entre gerações
- Preservação de traits bem-sucedidos
- Evolução mais gradual e controlada

---

### 3. Mínimo de Estratégias (DIVERSIFICATION)

| Parâmetro | Antes | Depois | Justificativa |
|-----------|-------|--------|---------------|
| `minActiveStrategies` | 3 | **5** | Melhor diversificação de sinais |

**Impacto Esperado:**
- Decisões mais equilibradas
- Menos dependência de 1-2 estratégias
- Redução de viés direcional

---

### 4. Limites de Risco (RISK CONTROL)

| Parâmetro | Antes | Depois | Justificativa |
|-----------|-------|--------|---------------|
| `atrMultiplierTP` min | 1.0 | **1.5** | TP mais realista |
| `atrMultiplierSL` min | 0.5 | **0.8** | SL menos apertado |
| `trailingStopATR` min | 0 | **0.5** | Algum trailing sempre ativo |
| `leverage` max | 75 | **50** | Redução de risco extremo |
| `basePercent` range | 1-10 | **2-8** | Betting mais conservador |

**Impacto Esperado:**
- Menos stop losses prematuros
- Drawdowns controlados
- Sobrevivência mais longa dos bots

---

### 5. Validação de Genoma (INTEGRITY)

Nova função `validateGenome()` verifica:
- ✅ Length de arrays (30 estratégias)
- ✅ Bounds de pesos (0-2.5)
- ✅ Regras de consenso (2-15 sinais, 0-10 opostos, 30-95% força)
- ✅ Parâmetros de risco (TP/SL/leverage dentro de limites)
- ✅ Parâmetros de betting (1-15% base, 5-25% max)
- ✅ Consistência lógica (TP > SL * 0.8)

**Auto-Correção:**
- Se validação falha, parâmetros críticos são ajustados automaticamente
- Logging de warnings para debugging

---

## 📈 Expected Improvements

### Curto Prazo (Próximas 50 gerações)
- Win rate: 40% → **48-52%**
- Trades/hora: 180 → **120-140** (qualidade > quantidade)
- Drawdown médio: 15% → **8-12%**

### Longo Prazo (100+ gerações)
- Win rate estabilizado: **52-58%**
- Sharpe Ratio: 0.5 → **1.0+**
- Sobrevivência média: 200 → **400+ ciclos**

---

## 🧪 Monitoramento

### Métricas para Observar
1. **Win Rate por Geração:** Deve subir gradualmente
2. **Fitness Médio:** Deve aumentar (Sharpe + Profit Factor)
3. **Número de Trades:** Deve diminuir (entradas mais seletivas)
4. **Max Drawdown:** Deve estabilizar abaixo de 15%
5. **Hall of Fame:** Novos entries devem ter fitness crescente

### Sinais de Alerta
- ⚠️ Win rate < 35% por 3+ gerações
- ⚠️ Drawdown > 25% em qualquer bot
- ⚠️ 0 trades em 100+ ciclos (paralisia por consenso excessivo)
- ⚠️ Múltiplas falhas de validação de genoma

---

## 🔄 Rollback (Se Necessário)

Se os ajustes causarem degradação:

```bash
# Reverter para parâmetros anteriores
git checkout HEAD -- modules/binance-bot/backend/src/services/DNAArenaV2Engine.ts
```

Parâmetros originais para referência:
- `mutationRate: 0.15`
- `minAgreeingSignals: 2-4`
- `maxOpposingSignals: 3-4`
- `minWeightedStrength: 39-45`
- `minActiveStrategies: 3`
- `leverage max: 75`

---

## 📝 Notas de Implementação

### Integridade Preservada
- ✅ Todas as funções existentes mantidas
- ✅ Backward compatibility com sessões salvas
- ✅ Validação não-bloqueante (auto-correção)
- ✅ Logging extensivo para debugging

### Arquivos Modificados
- `modules/binance-bot/backend/src/services/DNAArenaV2Engine.ts`
  - Adicionado: `CONSENSUS_DEFAULTS` constants
  - Adicionado: `validateGenome()` function
  - Modificado: `mutate()` com novos limites
  - Modificado: `crossover()` com validação
  - Modificado: `createBotState()` com validação
  - Modificado: Genesis genomes com novos defaults

---

## 🎯 Próximos Passos (Opcional)

1. **Ajuste Dinâmico:** Adaptar consenso baseado em performance recente
2. **Estratégias Ponderadas:** Dar mais peso a estratégias com melhor histórico
3. **Multi-Timeframe:** Usar confirmação 15m/1h para entradas 5m
4. **Risk Parity:** Ajustar bet size baseado em volatilidade do símbolo

---

*Documento criado: 2026-02-18*
*Versão: 1.0*
*Status: IMPLEMENTADO*
