# DELTA Ranging Market Optimization Fix

## Problema
Grupo DELTA (Momentum Specialist) é o único grupo negativo (-1.02% ROI) enquanto mercado esteve RANGING 75% do tempo durante noite. Estratégias momentum (10-19) sofrem em mercados laterais.

## Solução Implementada
### Ajustes no MarketRegimeDNA e StrategyParamDNA
1. **Detecção mais cedo**: Threshold ajustado para identificar RANGING mais rapidamente
2. **Redução de leverage**: 35-45x → 15-25x em mercados RANGING
3. **Aumento de threshold**: minSignalStrength de 65% → 75% em RANGING
4. **Ativação mean-reversion**: Estratégias 20-29 ativadas quando regime=RANGING
5. **Cooldown dinâmico**: 15min em TRENDING → 30min em RANGING

### Arquivos Modificados
- `GroupArena.ts`: Lógica condicional `applyRangingOptimizations()`
- `configs/delta-ranging-optimization.json`: Parâmetros ajustados

### Lógica Condicional
```typescript
if (this.groupId === 'DELTA' && this.regimeDNA.getCurrentRegime() === 'RANGING') {
    this.applyRangingOptimizations();
}
```

### Parâmetros Ajustados
- **Leverage**: min=15, max=25
- **minSignalStrength**: 75%
- **Cooldown**: 1800000ms (30min)
- **Strategies**: [20-29] (mean-reversion)
- **Mean-reversion boost**: 1.3x
- **Momentum penalty**: 0.6x

## Teste Dry-Run
### Cenário: Mercado RANGING
1. **Detecção**: Regime identificado como RANGING
2. **Aplicado**: 
   - Leverage reduzido para 15-25x
   - Threshold de sinais aumentado para 75%
   - Cooldown estendido para 30min
   - Estratégias mean-reversion (20-29) ativadas
   - Estratégias momentum (10-19) penalizadas (0.6x)

### Resultados Esperados
- Redução de perdas em mercados laterais
- Melhor filtragem de sinais fracos
- Aproveitamento de oportunidades mean-reversion
- Menor overtrading em RANGING

## Validação
- [x] Configuração carregada corretamente
- [x] Lógica condicional funcional
- [x] Parâmetros aplicados dinamicamente
- [x] Teste dry-run passando
- [x] Documentação completa

## Backup
- `GroupArena.ts.bak` criado antes das modificações