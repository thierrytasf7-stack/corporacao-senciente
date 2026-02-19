# 📊 COMPARATIVO: Fixed vs Fibonacci Staking

**Data:** 2026-02-17  
**Estratégia:** Live Over Points (NBA 2024-25)  
**Dados:** 1.225 jogos reais, 507 oportunidades, 30 times

---

## 🎯 RESULTADOS GERAIS

| Métrica | Fixed (2%) | Fibonacci | Diferença |
|---------|------------|-----------|-----------|
| **Oportunidades** | 507 | 507 | - |
| **Win Rate** | 78.1% | 78.1% | = |
| **Lucro Total** | +R$ 6.469,40 | +R$ 7.776,20 | **+R$ 1.306,80** |
| **Banca Final** | R$ 7.469,40 | R$ 7.776,20 | **+4.1%** |
| **ROI** | +646.9% | +677.6% | **+30.7 pp** |
| **Aposta Média** | R$ 20,00 | R$ 21,07 | +5.4% |
| **Max Drawdown** | R$ 66,00 | R$ 487,80 | **+639%** |
| **Sharpe Ratio** | 85.12 | 13.61 | **-84%** |

---

## 📈 ANÁLISE

### ✅ Vantagens do Fibonacci

1. **Maior lucro absoluto**: +R$ 1.306,80 extras
2. **Progressão após derrota**: Aumenta aposta gradualmente para recuperar
3. **Reset após vitória**: Volta para unidade base, protegendo lucros
4. **ROI maior**: 677.6% vs 646.9%

### ⚠️ Riscos do Fibonacci

1. **Drawdown 7.4x maior**: R$ 487,80 vs R$ 66,00
2. **Sharpe Ratio menor**: 13.61 vs 85.12 (risco/retorno pior)
3. **Volatilidade extrema**: Sequências de derrota aumentam exposição
4. **Risco de ruína**: Sem cap de 25% da banca, poderia quebrar

---

## 🔍 EXEMPLO PRÁTICO

### Sequência: 3 derrotas → 1 vitória

**Fixed (2% = R$ 20):**
```
Aposta 1: R$ 20 → Perde → Banca: R$ 980
Aposta 2: R$ 20 → Perde → Banca: R$ 960
Aposta 3: R$ 20 → Perde → Banca: R$ 940
Aposta 4: R$ 20 → Ganha (odd 2.15) → Banca: R$ 963
Lucro líquido: -R$ 37
```

**Fibonacci (base R$ 20):**
```
Aposta 1: R$ 20 (step 1) → Perde → Banca: R$ 980
Aposta 2: R$ 20 (step 2) → Perde → Banca: R$ 960
Aposta 3: R$ 40 (step 3) → Perde → Banca: R$ 920
Aposta 4: R$ 60 (step 4) → Ganha (odd 2.15) → Banca: R$ 989
Lucro líquido: -R$ 11
```

**Conclusão:** Fibonacci recupera perdas mais rápido, mas expõe mais capital.

---

## 🏆 TOP 5 TIMES - COMPARATIVO

| Time | Fixed Lucro | Fibonacci Lucro | Diferença |
|------|-------------|-----------------|-----------|
| Minnesota Timberwolves | +R$ 447,80 | +R$ 447,80 | = |
| San Antonio Spurs | +R$ 408,60 | +R$ 408,60 | = |
| Utah Jazz | +R$ 354,00 | +R$ 354,00 | = |
| Charlotte Hornets | +R$ 329,60 | +R$ 352,40 | +R$ 22,80 |
| New York Knicks | +R$ 342,00 | +R$ 342,00 | = |

**Nota:** Times com poucas derrotas consecutivas têm resultados similares. A diferença aparece em times com sequências de derrota.

---

## 📊 DISTRIBUIÇÃO DE STAKES (Fibonacci)

| Stake | Ocorrências | % do Total | Valor Apostado |
|-------|-------------|------------|----------------|
| R$ 20 (step 1) | 396 | 78.1% | R$ 7.920 |
| R$ 20 (step 2) | 55 | 10.8% | R$ 1.100 |
| R$ 40 (step 3) | 28 | 5.5% | R$ 1.120 |
| R$ 60 (step 4) | 14 | 2.8% | R$ 840 |
| R$ 100 (step 5) | 8 | 1.6% | R$ 800 |
| R$ 160 (step 6) | 4 | 0.8% | R$ 640 |
| R$ 250 (cap 25%) | 2 | 0.4% | R$ 500 |

**Total apostado:** R$ 12.920 (Fixed: R$ 10.140)

---

## 🎲 CENÁRIOS DE ESTRESSE

### Pior sequência de derrotas (simulação)

**8 derrotas consecutivas:**

| Staking | Perda Acumulada | Recuperação Necessária |
|---------|-----------------|------------------------|
| Fixed | -R$ 160 | 8 vitórias @ 2.15 |
| Fibonacci (sem cap) | -R$ 2.120 | 1 vitória @ 2.15 |
| Fibonacci (cap 25%) | -R$ 890 | 3-4 vitórias @ 2.15 |

**Conclusão:** O cap de 25% é **essencial** para sobrevivência.

---

## ✅ RECOMENDAÇÕES

### Use Fixed (2%) se:
- ✅ Prioriza **consistência** e baixo risco
- ✅ Quer **Sharpe Ratio alto** (>80)
- ✅ Não tolera drawdown >R$ 100
- ✅ Opera múltiplas estratégias simultâneas

### Use Fibonacci se:
- ✅ Prioriza **lucro absoluto máximo**
- ✅ Tolerância a drawdown de ~R$ 500
- ✅ Win rate esperado >70%
- ✅ Opera com banca >= R$ 2.000 (para absorver variância)

---

## 📌 VEREDITO FINAL

**Para esta estratégia específica (Live Over Points, 78% win rate):**

| Critério | Vencedor | Justificativa |
|----------|----------|---------------|
| Lucro | 🏆 Fibonacci | +R$ 1.306 extras |
| Risco | 🏆 Fixed | Drawdown 7x menor |
| Consistência | 🏆 Fixed | Sharpe 85 vs 13 |
| Capital necessário | 🏆 Fixed | Funciona com R$ 500 |
| Longo prazo | 🏆 **Empate** | Depende do perfil |

**Recomendação híbrida:**
- Comece com **Fixed** para construir banca (R$ 1.000 → R$ 3.000)
- Mude para **Fibonacci** com banca maior (R$ 3.000+)
- Sempre use **cap de 25% da banca** no Fibonacci

---

## 📁 ARQUIVOS DE REFERÊNCIA

- Backtest Fixed: `backtests/backtest_real_nba_20260217_185623.json`
- Backtest Fibonacci: `backtests/backtest_real_nba_20260217_191029.json`
- Script: `scripts/run-all-teams-backtest.py`

---

**Nota:** Resultados baseados em dados históricos reais da NBA 2024-25. Performance passada não garante resultados futuros.
