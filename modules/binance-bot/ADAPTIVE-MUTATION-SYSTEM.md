# Adaptive Mutation System - CEO-BINANCE Optimization

**Data de Implementação:** 14 Fev 2026
**Directive:** Garantir exploração evolutiva saudável com mutações de intensidades e direções variadas

---

## 🎯 OBJETIVOS

1. **Prevenir estagnação evolutiva** - Detectar quando grupos param de evoluir e forçar exploração
2. **Mutações adaptativas por mortes** - Aumentar exploração quando bots morrem consecutivamente
3. **Variedade de intensidades** - 4 tipos de mutação (Subtle, Normal, Bold, Radical)
4. **Direções variadas** - Conservadora (preserva traits) vs Exploratória (grandes saltos)

---

## 📊 OTIMIZAÇÕES IMPLEMENTADAS

### 1. Config Spot Rotative
**Arquivo:** `backend/data/spot-rotative-config.json`

```diff
- "minSignalStrength": 55
+ "minSignalStrength": 62
```

**Impacto:** Filtro mais rigoroso de sinais (55% → 62%) reduz ruído e melhora precisão.

---

## 🧬 SISTEMA DE MUTAÇÃO ADAPTATIVA

### 2. AdaptiveMutationEngine
**Arquivo:** `backend/src/services/ecosystem/AdaptiveMutationEngine.ts`

**Componentes:**

#### A. Tipos de Mutação (4 intensidades)

| Tipo | Amplitude | Taxa | Direção | Uso |
|------|-----------|------|---------|-----|
| **SUBTLE** | 0.3x | 0.5x | Conservative | Fine-tuning (10%) |
| **NORMAL** | 1.0x | 1.0x | Balanced | Evolução padrão (60%) |
| **BOLD** | 2.0x | 1.5x | Balanced | Exploração moderada (25%) |
| **RADICAL** | 4.0x | 2.5x | Exploratory | Break from local optima (5%) |

#### B. Gatilhos de Exploração

**1. Death-Triggered Boost:**
- 2 mortes recentes → BOLD mutation
- 3+ mortes consecutivas → RADICAL mutation

**2. Stagnation Detection:**
- 100 ciclos sem melhoria de fitness → RADICAL mutation
- 60 ciclos sem melhoria → BOLD mutation

**3. Probabilístico (Normal Evolution):**
```
10% → Subtle
60% → Normal
25% → Bold
5%  → Radical
```

#### C. Direções de Mutação

**CONSERVATIVE (Subtle):**
- Pequenos ajustes (5% do range)
- Preserva características principais
- Ideal para fine-tuning de bots bem-sucedidos

**BALANCED (Normal, Bold):**
- Ajustes moderados (20% do range para Normal, maior para Bold)
- Mix de preservação + exploração

**EXPLORATORY (Radical):**
- Grandes saltos (50% do range)
- 30% chance de reset completo para valor aleatório
- Break from local optima

---

### 3. Integração no GroupArena
**Arquivo:** `backend/src/services/ecosystem/GroupArena.ts`

**Modificações:**

#### A. Nova Função `mutate()` Adaptativa

```typescript
// Antes: Mutação fixa (15% rate, 1.0x amplitude)
const mutationRate = 0.15;
const amplitude = 1.0;

// Depois: Mutação adaptativa baseada em estado
const mutationType = this.adaptiveMutation.selectMutationType(cycle, fitness);
const profile = this.adaptiveMutation.getMutationProfile(mutationType);
const mutationRate = baseMutationRate * profile.rateMultiplier;
const amplitude = baseAmplitude * profile.amplitudeMultiplier;
```

**Aplicação Direcional:**
```typescript
// Exemplo: Mutação de leverage
child.risk.leverage = this.adaptiveMutation.applyDirectionalBias(
    child.risk.leverage, // valor atual
    5, 75,               // min/max
    direction,           // CONSERVATIVE | BALANCED | EXPLORATORY
    amplitude * 20       // amplitude ajustada
);
```

#### B. Registro de Eventos

**Mortes Registradas em 3 locais:**
1. `replaceBot()` - Quando bot morre de falência
2. `intraGroupEvolution()` - Quando pior bot é substituído
3. `removeWorstBot()` - Quando bot é removido para migração inter-grupo

**Evoluções Registradas:**
- `replaceBot()` - Após substituição
- `intraGroupEvolution()` - Após evolução periódica

#### C. Persistência de Estado

```typescript
// Serialização
serialize(): {
    adaptiveMutation: this.adaptiveMutation.getState()
}

// Restore
restore(data): {
    if (data.adaptiveMutation) {
        this.adaptiveMutation.restoreState(data.adaptiveMutation);
    }
}
```

---

## 📈 RESULTADOS ESPERADOS

### Curto Prazo (24h)
- Sinais mais precisos (62% threshold)
- Logs de mutação adaptativa visíveis
- Detecção de primeiras mortes consecutivas

### Médio Prazo (7 dias)
- Grupos com mortes consecutivas → RADICAL exploration → novas soluções
- Grupos estagnados → mutação forçada → quebra de local optima
- Distribuição de mutações: ~10% Subtle, ~60% Normal, ~25% Bold, ~5% Radical

### Longo Prazo (30 dias)
- Evolução mais robusta e diversificada
- Menor taxa de estagnação (grupos presos em local optima)
- Performance geral melhorada (ROI, Sharpe, Win Rate)

---

## 🔍 MONITORAMENTO

### Logs de Mutação
```
🧬 [ALPHA] Mutation: NORMAL (Standard evolution) | Rate: 0.15 | Amp: 1.00
🧬 [BETA] Mutation: BOLD (Bold exploration) | Rate: 0.23 | Amp: 2.00
💀 Bot death recorded | Total: 5 | Consecutive: 2 | Since last evolution: 1
🔴 DEATH BOOST: 3 consecutive deaths → RADICAL mutation
⚠️ STAGNATION detected (100 cycles) → RADICAL mutation
```

### Métricas para Acompanhar
- `totalDeaths` - Total de mortes registradas
- `consecutiveDeaths` - Mortes consecutivas (gap < 50 ciclos)
- `stagnationCycles` - Ciclos sem melhoria de fitness
- Distribuição de tipos de mutação por grupo

---

## 🛠️ CONFIGURAÇÕES AJUSTÁVEIS

**Em `AdaptiveMutationEngine.ts`:**

```typescript
STAGNATION_THRESHOLD = 100;  // Ciclos sem melhoria = stagnação
DEATH_BOOST_THRESHOLD = 3;   // Mortes para ativar RADICAL

// Probabilidades de mutação (normal evolution)
10% → Subtle      // Aumentar para mais fine-tuning
60% → Normal      // Padrão
25% → Bold        // Aumentar para mais exploração
5%  → Radical     // Aumentar para quebrar optima local mais frequentemente
```

---

## 📝 CHANGELOG

### v1.0.0 - 14 Fev 2026 (CEO-BINANCE Directive)

**Added:**
- `AdaptiveMutationEngine.ts` - Sistema completo de mutação adaptativa
- 4 tipos de mutação (Subtle, Normal, Bold, Radical)
- 3 direções (Conservative, Balanced, Exploratory)
- Death-triggered exploration (2+ deaths → Bold, 3+ → Radical)
- Stagnation detection (100 cycles → Radical, 60 → Bold)
- Logging detalhado de mutações

**Changed:**
- `GroupArena.mutate()` - Usa perfis adaptativos
- `GroupArena.replaceBot()` - Registra mortes e evoluções
- `GroupArena.intraGroupEvolution()` - Registra mortes e evoluções
- `GroupArena.removeWorstBot()` - Registra mortes
- `GroupArena.serialize()/restore()` - Persiste estado adaptativo
- `spot-rotative-config.json` - minSignalStrength 55% → 62%

---

## 🎓 TEORIA EVOLUTIVA

### Por que Mutações Variadas?

**Problema:** Mutação fixa (15% rate, 1.0x amp) pode:
- Ficar presa em local optima
- Não explorar espaço de soluções suficientemente
- Não reagir a mudanças de mercado

**Solução:** Mutação adaptativa baseada em contexto:
- **Stable groups** → Subtle/Normal (exploita solução atual)
- **Struggling groups** (mortes) → Bold/Radical (explora novas soluções)
- **Stagnant groups** → Radical (força saída de local optima)

### Lei de Pareto Evolutiva
- 80% das mutações são Subtle/Normal (exploitation)
- 20% são Bold/Radical (exploration)
- Em crise: inverte para 20% exploitation, 80% exploration

---

**Status:** ✅ IMPLEMENTADO - Pronto para testes em produção

— CEO Satoshi | Adaptive Evolution = Survival 👔
