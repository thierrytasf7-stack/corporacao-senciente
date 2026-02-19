# 🌍 DIANA CORPORAÇÃO SENCIENTE - AMBIENTES DE TRADING

## 📋 Visão Geral

Este documento descreve os **4 ambientes de trading** configurados e como eles se integram com as **DNA Arenas** (simulações).

---

## 🎯 Os 4 Ambientes

### 1. 🟢 TESTNET FUTURES
- **Propósito:** Testes com dinheiro fictício em Futures
- **API:** Binance Testnet Futures
- **Risco:** ZERO (dinheiro fictício)
- **Uso:** Validar estratégias antes de operar real
- **Config:** `.env.testnet-futures`
- **Server:** `server-testnet-futures.ts`
- **Status:** ⚠️ Configurar

### 2. 🟡 TESTNET SPOT
- **Propósito:** Testes com dinheiro fictício em Spot
- **API:** Binance Testnet Spot
- **Risco:** ZERO (dinheiro fictício)
- **Uso:** Validar estratégias spot
- **Config:** `.env.testnet-spot`
- **Server:** `server-testnet-spot.ts`
- **Status:** ⚠️ Configurar

### 3. 🔴 MAINNET FUTURES
- **Propósito:** Operações REAIS em Futures
- **API:** Binance Mainnet Futures
- **Risco:** ALTO (dinheiro real)
- **Uso:** Produção com campeões validados
- **Config:** `.env.mainnet-futures`
- **Server:** `server-mainnet-futures.ts`
- **Status:** ⚠️ Configurar

### 4. 🔵 MAINNET SPOT
- **Propósito:** Operações REAIS em Spot
- **API:** Binance Mainnet Spot
- **Risco:** ALTO (dinheiro real)
- **Uso:** Produção com campeões validados
- **Config:** `.env.mainnet-spot`
- **Server:** `server-mainnet-spot.ts`
- **Status:** ⚠️ Configurar

---

## 🏟️ DNA ARENAS (Simulações)

### DNA Arena V2
- **Propósito:** Evolução genética de estratégias
- **Status:** 🟢 OPERANDO
- **Geração Atual:** 247
- **Bots Vivos:** 5
- **Integridade:** ✅ PRESERVADA

### DNA Arena V1 (Legacy)
- **Propósito:** Estratégias campeãs exportadas
- **Status:** 🟢 ATIVO
- **Campeões:** 10 exportados
- **Integridade:** ✅ PRESERVADA

---

## 🔄 Fluxo de Dados

```
┌─────────────────────────────────────────────────────────┐
│                  DNA ARENA V2 (VIVO)                     │
│  Geração 247 | 5 bots | Evolução contínua               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              DNA ARENA V1 (CHAMPIONS)                    │
│  10 campeões exportados com fitness > 37                │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
┌───────────────┬───────────────┬───────────────┐
│   Champion    │   Champion    │   Champion    │
│   Sync        │   Sync        │   Sync        │
│   (Futures)   │   (Spot)      │   (Hybrid)    │
└───────┬───────┴───────┬───────┴───────┬───────┘
        │               │               │
        ▼               ▼               ▼
┌─────────────────────────────────────────────────────────┐
│              AMBIENTES DE TRADING                        │
├───────────────┬───────────────┬───────────────┬─────────┤
│ TESTNET       │ TESTNET       │ MAINNET       │ MAINNET │
│ FUTURES       │ SPOT          │ FUTURES       │ SPOT    │
│ (5 champs)    │ (5 champs)    │ (5 champs)    │ (5 ch.) │
└───────────────┴───────────────┴───────────────┴─────────┘
```

---

## 🏆 Campeões Sincronizados

Top 5 Campeões (DNA Arena V1):

| Rank | Bot | Fitness | Win Rate | Trades | Grupo |
|------|-----|---------|----------|--------|-------|
| 1 | **Pulse** | 117.62 | 87.5% | 8 | DELTA |
| 2 | Drift | 98.02 | 50.0% | 6 | OMEGA |
| 3 | Storm | 68.99 | 78.9% | 19 | OMEGA |
| 4 | Nova | 62.66 | 71.4% | 14 | BETA |
| 5 | Titan | 49.57 | 40.0% | 5 | DELTA |

---

## 🚀 Como Iniciar Cada Ambiente

### Testnet Futures (Recomendado para testes)
```bash
npm run start:testnet-futures
```

### Testnet Spot
```bash
npm run start:testnet-spot
```

### Mainnet Futures (DINHEIRO REAL)
```bash
npm run start:mainnet-futures
```

### Mainnet Spot (DINHEIRO REAL)
```bash
npm run start:mainnet-spot
```

### DNA Arena V2 (Simulação)
```bash
npm run start:arena-v2
```

---

## ⚠️ Avisos Importantes

1. **NUNCA** use Mainnet sem validar em Testnet primeiro
2. **SEMPRE** verifique se a DNA Arena está evoluindo bem antes de exportar
3. **MONITORE** constantemente as operações reais
4. **MANTENHA** as Arenas rodando para evolução contínua

---

## 📊 Status Atual

| Componente | Status | Última Atividade |
|------------|--------|------------------|
| DNA Arena V2 | 🟢 OPERANDO | Agora |
| DNA Arena V1 | 🟢 ATIVO | 22:13 UTC |
| Champion Sync | 🟡 CONFIGURAR | - |
| Testnet Futures | 🟡 CONFIGURAR | - |
| Testnet Spot | 🟡 CONFIGURAR | - |
| Mainnet Futures | 🟡 CONFIGURAR | - |
| Mainnet Spot | 🟡 CONFIGURAR | - |

---

*Documento criado: 2026-02-19*
*Versão: 1.0*
