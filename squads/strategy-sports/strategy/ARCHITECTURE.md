# Arquitetura: Separação Estratégia vs Gestão

**Domínio:** BET-SPORTS
**Versão:** 2.0.0 (Atualizada com Protocolos Formais)
**Data:** 2026-02-17
**Status:** `APPROVED`
**Autor:** strategy-sports

---

## ⚠️ PRINCÍPIO FUNDAMENTAL

> **ESTRATÉGIA e GESTÃO são camadas SEPARADAS e INDEPENDENTES.**
>
> Bots e backtests DEVEM tratar essas camadas de forma isolada.
>
> - **Estratégia** define **O QUE** fazer (lógica de entrada/saída)
> - **Gestão** define **QUANTO** arriscar (parâmetros matemáticos)
>
> **Esta separação é OBRIGATÓRIA para todas as estratégias BET-SPORTS.**

---

## 📋 Visão Geral

Este documento define a separação arquitetural entre **Estratégia** (lógica de entrada/saída) e **Gestão** (parâmetros matemáticos de alocação de risco).

### Princípio Fundamental

```
┌─────────────────────────────────────────────────────────────────┐
│                    SEPARAÇÃO DE RESPONSABILIDADES               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ESTRATÉGIA (WHAT)              GESTÃO (HOW MUCH)              │
│  ─────────────────              ───────────────────             │
│  Lógica de identificação        Parâmetros de alocação         │
│  de oportunidades               de capital                      │
│                                                                 │
│  → IMUTÁVEL                     → CONFIGURÁVEL                 │
│  → REUTILIZÁVEL                 → AJUSTÁVEL                    │
│  → ESPECÍFICA                   → TRANSVERSAL                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Por Que Separar?

### 1. Reusabilidade

A mesma lógica de estratégia pode ser operada com diferentes perfis de risco:

```
Estratégia: TENNIS_FAV_30_0_COMEBACK
    │
    ├── Perfil Conservador → Stake 0.5%, Stop 3%
    ├── Perfil Moderado    → Stake 1.0%, Stop 5%
    └── Perfil Agressivo   → Kelly 0.25, Stop 7%
```

### 2. Manutenibilidade

Mudanças na gestão **NÃO** requerem mudanças na lógica:

```yaml
# Antes: Mudar stake exigia editar spec.md
spec.md:
  - stake_percent: 1.0  # ❌ Misturado com lógica

# Depois: Mudar stake é apenas config
strategy.md:              # ✅ Lógica pura
config.yaml:
  - stake_percent: 1.5  # ✅ Fácil de ajustar
```

### 3. Testabilidade

Backtest da lógica é separado da otimização de parâmetros:

```
Teste de Lógica:
  - Trigger detecta 30-0 corretamente?
  - Regras de exclusão funcionam?
  - Schema de dados está correto?

Teste de Gestão:
  - Qual stake ótima?
  - Quais limites de drawdown?
  - Qual perfil de risco?
```

### 4. Composabilidade

Múltiplas estratégias compartilham a mesma camada de gestão:

```
┌──────────────────────────────────────────────────────┐
│              CAMADA DE GESTÃO ÚNICA                 │
│  - Bankroll management                              │
│  - Risk limits                                      │
│  - Circuit breakers                                 │
└────────────────────┬─────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
   Estratégia   Estratégia   Estratégia
   Tennis       Futebol      Basquete
```

---

## 📁 Estrutura de Arquivos

### Padrão por Estratégia

```
squads/strategy-sports/
├── strategy/
│   └── {strategy-id}.md           # Estratégia pura
│
└── config/
    └── management/
        └── {strategy-id}-config.yaml   # Gestão injetável
```

### Exemplo Concreto

```
squads/strategy-sports/
├── strategy/
│   └── tennis-favorite-30-0-comeback.md
│
└── config/
    └── management/
        └── tennis-favorite-30-0-comeback-config.yaml
```

---

## 📊 O Que Vai em Cada Lugar

### Estratégia Pura (strategy/*.md)

**INCLUI:**
- ✅ Descrição da hipótese
- ✅ Regras de trigger
- ✅ Condições de entrada
- ✅ Condições de saída
- ✅ Mercado e seleção
- ✅ Schema de dados
- ✅ Integrações técnicas
- ✅ Lógica de exclusão
- ✅ Pseudocódigo da estratégia

**NÃO INCLUI:**
- ❌ Valores de stake (%, fixos, Kelly)
- ❌ Parâmetros de bankroll
- ❌ Metas de ROI/Win Rate
- ❌ Limites de perda diária/semanal
- ❌ Circuit breakers financeiros
- ❌ Métricas de performance esperada

### Configuração de Gestão (config/management/*.yaml)

**INCLUI:**
- ✅ Métodos de staking (percentage, kelly, fixed)
- ✅ Valores de stake (% ou fixo)
- ✅ Limites de exposição (por partida, dia, semana)
- ✅ Circuit breakers (stop loss, consecutive losses)
- ✅ Alocação de bankroll (active, reserve, emergency)
- ✅ Perfis de risco (conservador, moderado, agressivo)
- ✅ Fases de operação (validation, standard, full)
- ✅ Alertas e monitoramento

**NÃO INCLUI:**
- ❌ Lógica de trigger
- ❌ Regras de entrada/saída
- ❌ Schema de dados
- ❌ Integrações técnicas

---

## 🔌 Interface Estratégia-Gestão

### Como a Gestão é Injetada

```typescript
// Estratégia recebe config como dependência
class TennisFavorite30ComebackStrategy {
  constructor(
    private config: TennisFavorite30ComebackConfig
  ) {}

  // Config é usada para decisões de gestão
  canEnter(signal: Signal): boolean {
    // Lógica da estratégia
    if (!this.triggerActive(signal)) return false;
    
    // Config de gestão (injetada)
    if (signal.market.odds < this.config.odds.min) return false;
    if (signal.market.odds > this.config.odds.max) return false;
    
    return true;
  }

  calculateStake(signal: Signal, bankroll: number): number {
    // Método definido na config
    switch (this.config.staking.method) {
      case 'percentage':
        return bankroll * (this.config.staking.value / 100);
      case 'kelly':
        return this.calculateKelly(signal, bankroll);
      case 'fixed':
        return this.config.staking.value;
    }
  }
}
```

### Schema de Config

```typescript
interface StrategyConfig {
  strategyId: string;
  
  // Odds (filtro de mercado)
  odds: {
    min: number;
    max: number;
  };
  
  // Staking (método de alocação)
  staking: {
    method: 'percentage' | 'kelly' | 'fixed';
    value: number;
    limits: {
      min: number;
      max: number;
    };
  };
  
  // Exposure (limites de risco)
  exposure: {
    per_match: {
      max_bets: number;
      max_stake: number;
    };
    per_day: {
      max_bets: number;
      max_loss: number;
    };
  };
  
  // Circuit breakers
  circuit_breakers: {
    daily: {
      loss_stop: number;
      consecutive_loss_pause: number;
    };
  };
}
```

---

## 🏗️ Arquitetura do Sistema

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                    SISTEMA DE BETTING                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐                                       │
│  │  Match Monitor  │ ← Live Score API                     │
│  └────────┬────────┘                                       │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                       │
│  │ Trigger Detector │ ← Estratégia (lógica pura)          │
│  │                  │    strategy/*.md                     │
│  └────────┬────────┘                                       │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                       │
│  │ Entry Validator  │ ← Regras de exclusão                │
│  └────────┬────────┘                                       │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐     ┌──────────────────┐             │
│  │ Signal Generator│────▶│  Risk Manager    │ ← Config    │
│  └────────┬────────┘     │                  │   Gestão    │
│           │              └────────┬─────────┘             │
│           │                       │                        │
│           ▼                       ▼                        │
│  ┌─────────────────┐     ┌──────────────────┐             │
│  │  Bet Executor   │◀────│ Stake Calculator │             │
│  └─────────────────┘     └──────────────────┘             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Fluxo de Dados

```
1. Match Monitor detecta evento (30-0 contra favorito)
         │
2. Trigger Detector valida lógica da estratégia
         │
3. Entry Validator aplica regras de exclusão
         │
4. Signal Generator cria signal
         │
5. Risk Manager consulta config de gestão
         │
6. Stake Calculator calcula stake baseada na config
         │
7. Bet Executor executa aposta
```

---

## 📝 Guia para Novas Estratégias

### Passo 1: Criar Estratégia Pura

```markdown
# strategy/{strategy-id}.md

## Estrutura Mínima

1. Visão Geral
   - Descrição
   - Hipótese
   - Premissas

2. Especificação do Trigger
   - Condições de ativação
   - Pseudocódigo

3. Condições de Entrada
   - Validações
   - Regras de exclusão

4. Seleção e Mercado
   - Mercado alvo
   - Seleção

5. Condições de Saída
   - Resolução natural
   - Cashout (se aplicável)

6. Schema de Dados
   - Signal schema
   - Result schema

7. Integrações Técnicas
   - APIs necessárias
   - Endpoints
```

### Passo 2: Criar Configuração de Gestão

```yaml
# config/management/{strategy-id}-config.yaml

# Estrutura mínima
strategy:
  id: {STRATEGY_ID}

odds:
  min: 1.70
  max: 3.50

staking:
  method: percentage
  value: 1.0
  limits:
    min: 0.25
    max: 2.0

exposure:
  per_match:
    max_bets: 3
    max_stake: 3.0
  per_day:
    max_bets: 15
    max_loss: 5.0

circuit_breakers:
  daily:
    loss_stop: 5.0
    consecutive_loss_pause: 5
```

### Passo 3: Atualizar README

```markdown
# data/{strategy-id}-readme.md

## Adicionar Separação Arquitetural

1. Explicar separação estratégia/gestão
2. Linkar para strategy/*.md
3. Linkar para config/management/*.yaml
4. Documentar perfis disponíveis
```

---

## ✅ Checklist de Validação

### Para Estratégia Pura

- [ ] Contém apenas lógica de entrada/saída?
- [ ] Não contém valores de stake?
- [ ] Não contém limites de bankroll?
- [ ] Não contém metas de ROI/Win Rate?
- [ ] Não contém circuit breakers financeiros?
- [ ] Schema de dados está definido?
- [ ] Integrações técnicas estão documentadas?
- [ ] Pseudocódigo está claro?

### Para Configuração de Gestão

- [ ] Método de staking está definido?
- [ ] Limites de exposição estão configurados?
- [ ] Circuit breakers estão configurados?
- [ ] Perfis de risco estão definidos?
- [ ] Fases de operação estão configuradas?
- [ ] Alertas de monitoramento estão configurados?

---

## 🔗 Referências

### Protocolos Formais

- **[PROTOCOLS.md](../PROTOCOLS.md)** - Protocolos formais do domínio BET-SPORTS
  - Protocolo de Separação Arquitetural
  - Protocolo para Bots de Trading
  - Protocolo para Backtesting
  - Protocolo de Versionamento
  - Protocolo de Validação
  - Template de Nova Estratégia

### Documentos de Arquitetura

- **[DATA_FLOW.md](./DATA_FLOW.md)** - Fluxo de dados completo
  - Diagrama: Estratégia → Gestão → Execução → Analytics
  - Estrutura de dados por camada
  - Integração com backtesting

- **[tennis-favorite-30-0-comeback.md](./tennis-favorite-30-0-comeback.md)** - Estratégia de exemplo

### Tipos e Schemas

- **[types/strategy.types.ts](../types/strategy.types.ts)** - Interfaces TypeScript
  - `StrategyTrigger` - Gatilho da estratégia
  - `StrategySignal` - Sinal gerado
  - `StrategyConfig` - Config injetável de gestão
  - `BetExecution` - Dados da aposta executada
  - `StrategyResult` - Resultado do backtest/live
  - `StrategyMetrics` - Métricas de estratégia (lógica)
  - `ManagementMetrics` - Métricas de gestão (parâmetros)

- **[schemas/strategy.schema.json](../schemas/strategy.schema.json)** - Schema JSON da estratégia
- **[schemas/management.schema.json](../schemas/management.schema.json)** - Schema JSON da gestão

### Exemplos de Implementação

- **[examples/bot-implementation.ts](../examples/bot-implementation.ts)** - Exemplo de bot
  - Carregar estratégia
  - Injetar config de gestão
  - Processar triggers
  - Executar apostas
  - Reportar resultados

- **[examples/backtest-implementation.ts](../examples/backtest-implementation.ts)** - Exemplo de backtest
  - Backtest da estratégia (lógica pura)
  - Otimização de gestão (parâmetros)
  - Validação cruzada (out-of-sample)
  - Métricas separadas por camada

### Checklists

- **[checklists/bot-compliance-checklist.md](../checklists/bot-compliance-checklist.md)** - Checklist de validação
  - Estratégia carregada sem parâmetros de gestão
  - Config de gestão injetada separadamente
  - Schema validado
  - Logs separam lógica de gestão
  - Métricas reportadas por camada
  - Versionamento correto

### Configuração de Gestão

- [Config de Gestão](../config/management/tennis-favorite-30-0-comeback-config.yaml)

### Módulos do Sistema

- [Strategy Service](../../modules/betting-platform/backend/services/StrategyService.ts)
- [Strategy Types](../../modules/betting-platform/backend/types/strategy-types.ts)

---

## 📝 Histórico de Revisões

| Versão | Data | Autor | Mudanças |
|--------|------|-------|----------|
| 1.0.0 | 2026-02-17 | Strategy-Sports | Criação inicial |
| 2.0.0 | 2026-02-17 | Strategy-Sports | **Atualização com Protocolos Formais:**<br>• Adicionado princípio fundamental explícito<br>• Link para PROTOCOLS.md<br>• Link para DATA_FLOW.md<br>• Link para types/strategy.types.ts<br>• Link para schemas (strategy + management)<br>• Link para exemplos (bot + backtest)<br>• Link para checklist de compliance |

---

**Status:** `APPROVED`
**Próxima revisão:** Conforme novas estratégias forem criadas
**Responsável:** @strategy-lead

---

## 📚 Índice Remissivo

### Documentos Principais

| Documento | Finalidade | Localização |
|-----------|------------|-------------|
| PROTOCOLS.md | Protocolos formais | `../PROTOCOLS.md` |
| ARCHITECTURE.md | Separação estratégica | `./ARCHITECTURE.md` |
| DATA_FLOW.md | Fluxo de dados | `./DATA_FLOW.md` |

### Tipos e Schemas

| Arquivo | Finalidade | Localização |
|---------|------------|-------------|
| strategy.types.ts | TypeScript interfaces | `../types/strategy.types.ts` |
| strategy.schema.json | JSON Schema estratégia | `../schemas/strategy.schema.json` |
| management.schema.json | JSON Schema gestão | `../schemas/management.schema.json` |

### Exemplos

| Arquivo | Finalidade | Localização |
|---------|------------|-------------|
| bot-implementation.ts | Exemplo de bot | `../examples/bot-implementation.ts` |
| backtest-implementation.ts | Exemplo de backtest | `../examples/backtest-implementation.ts` |

### Checklists

| Arquivo | Finalidade | Localização |
|---------|------------|-------------|
| bot-compliance-checklist.md | Validação de bots | `../checklists/bot-compliance-checklist.md` |
