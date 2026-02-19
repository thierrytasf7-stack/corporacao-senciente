# Favorite 30-0 Comeback - Estratégia de Tênis

**ID da Estratégia:** `TENNIS_FAV_30_0_COMEBACK`  
**Versão:** 2.0.0 (Refatorada - Separação Arquitetural)  
**Status:** `DRAFT`  
**Squad Responsável:** strategy-sports  
**Data de Criação:** 2026-02-17  
**Data de Refatoração:** 2026-02-17  

---

## 🔀 Separação Arquitetural: Estratégia vs Gestão

### Princípio Fundamental

```
┌─────────────────────────────────────────────────────────────────┐
│                    ESTRATÉGIA vs GESTÃO                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ESTRATÉGIA (WHAT)              GESTÃO (HOW MUCH)              │
│  ─────────────────              ───────────────────             │
│  • O que fazer                  • Quanto arriscar              │
│  • Quando entrar                • Qual stake usar              │
│  • Qual mercado                 • Qual % da bankroll           │
│  • Qual trigger                 • Quais limites de perda       │
│  • Qual lógica                  • Quais circuit breakers       │
│                                                                 │
│  → LÓGICA PURA                  → PARÂMETROS INJETÁVEIS        │
│  → IMUTÁVEL                     → CONFIGURÁVEL                 │
│  → REUTILIZÁVEL                 → AJUSTÁVEL POR PERFIL         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Por Que Separar?

1. **Reusabilidade:** A mesma lógica de estratégia pode ser usada com diferentes perfis de risco
2. **Manutenibilidade:** Mudanças na gestão não afetam a lógica da estratégia
3. **Testabilidade:** Backtest da lógica é separado da otimização de parâmetros
4. **Composabilidade:** Múltiplas estratégias compartilham a mesma camada de gestão

### Estrutura de Arquivos

```
squads/strategy-sports/
├── strategy/                              # ESTRATÉGIA PURA
│   └── tennis-favorite-30-0-comeback.md   # Lógica, triggers, regras
│
└── config/
    └── management/                        # GESTÃO (INJETÁVEL)
        └── tennis-favorite-30-0-comeback-config.yaml
            # Stake, bankroll, limites, circuit breakers
```

---

## 📋 Visão Geral

Estratégia de apostas live para tênis que explora oportunidades de valor quando o favorito de uma partida está perdendo um game por **30-0 no próprio saque**. A premissa é que jogadores favoritos tendem a reagir positivamente nestas situações, oferecendo odds inflated (>1.70) no mercado de **Game Winner**.

### Hipótese Principal

> Favoritos em partidas de tênis possuem taxa de conversão significativamente maior que as odds implícitas quando estão perdendo um game por 30-0 no próprio saque, criando oportunidades de valor positivo.

---

## 📚 Documentação Completa

Esta estratégia possui documentação técnica separada em dois conjuntos:

### Conjunto A: Estratégia Pura (Lógica)

| Documento | Descrição | Link |
|-----------|-----------|------|
| **1. Especificação da Estratégia** | Lógica, triggers, regras, schema de dados, integrações | [📄 Ver](../strategy/tennis-favorite-30-0-comeback.md) |

### Conjunto B: Configuração de Gestão (Parâmetros)

| Documento | Descrição | Link |
|-----------|-----------|------|
| **2. Configuração de Gestão** | Stake, bankroll, limites, circuit breakers, perfis | [📄 Ver](../config/management/tennis-favorite-30-0-comeback-config.yaml) |

### Conjunto C: Validação e Implementação (Legado)

| Documento | Descrição | Link |
|-----------|-----------|------|
| **3. Validação e Backtesting** | Critérios de validação, métricas, testes estatísticos | [📄 Ver](./tennis-favorite-30-0-comeback-validation.md) |
| **4. Implementação** | Checklist completo, fases, timeline, responsabilidades | [📄 Ver](./tennis-favorite-30-0-comeback-implementation.md) |

> **⚠️ Nota:** Os documentos de validação e implementação serão migrados para a nova estrutura em breve.

---

## 🎯 Resumo das Regras de Entrada

| Critério | Valor |
|----------|-------|
| **Esporte** | Tênis |
| **Mercado** | Game Winner (Vencedor do Game) |
| **Condição** | Favorito sacando |
| **Gatilho** | Placar 30-0 contra o favorito |
| **Odd Mínima** | 1.70 (configurável) |
| **Odd Máxima** | 3.50 (configurável) |

> **Nota:** Parâmetros de stake, bankroll, limites e circuit breakers estão no arquivo de configuração de gestão.

---

## 💰 Configuração de Gestão

Os parâmetros de gestão matemática estão centralizados em:
[`config/management/tennis-favorite-30-0-comeback-config.yaml`](../config/management/tennis-favorite-30-0-comeback-config.yaml)

### Perfis Disponíveis

| Perfil | Stake | Max Diário | Uso Recomendado |
|--------|-------|------------|-----------------|
| **Conservador** | 0.5% | 3% | Validação inicial |
| **Moderado** | 1.0% | 10% | Operação padrão |
| **Agressivo** | Kelly 0.25 | 15% | Após validação completa |

### Circuit Breakers

| Gatilho | Threshold | Ação |
|---------|-----------|------|
| **Daily Loss** | 5% | STOP 24h |
| **Consecutive Losses** | 5 | PAUSE 4h |
| **Weekly Drawdown** | 15% | STOP 1 semana |
| **Monthly Drawdown** | 25% | Review completo |

> **Importante:** Estes parâmetros são INJETÁVEIS e podem ser ajustados sem modificar a lógica da estratégia.

---

## 🗓️ Timeline de Implementação

```
Semana 1-2:  Fundamentos (ambiente, dados, integrações)
Semana 3-4:  Core Logic (trigger, risk, execution)
Semana 5-8:  Validação (backtest, paper trading, live micro)
Semana 9-12: Produção (deploy, monitoring, optimization)
```

---

## 👥 Responsabilidades (RACI)

| Papel | Responsabilidades |
|-------|------------------|
| **@strategy-lead** | Aprovação geral, decisões estratégicas |
| **@strategy-dev** | Implementação técnica, desenvolvimento |
| **@backtest-engine** | Backtesting, validação estatística |
| **@risk-manager** | Parâmetros de risco, compliance |
| **@tech-lead** | Infraestrutura, segurança, deployment |

---

## ✅ Checklist de Aprovação (Gates)

| Gate | Critério | Status |
|------|----------|--------|
| **Gate 1** | Core logic implementada e testada | ⏳ Pendente |
| **Gate 2** | Backtest aprovado (ROI > 5%, WR > 52%) | ⏳ Pendente |
| **Gate 3** | Paper trading aprovado (4 semanas, ROI > 3%) | ⏳ Pendente |
| **Gate 4** | Live Fase 1 aprovada (WR > 48%, ROI > 0%) | ⏳ Pendente |
| **Gate 5** | Live Fase 2 aprovada (WR > 50%, ROI > 3%) | ⏳ Pendente |

---

## 📁 Estrutura de Arquivos

### Nova Estrutura (Refatorada v2.0.0)

```
squads/strategy-sports/
├── strategy/                              # ESTRATÉGIA PURA
│   └── tennis-favorite-30-0-comeback.md   # Lógica, triggers, regras
│
├── config/
│   └── management/                        # GESTÃO (INJETÁVEL)
│       └── tennis-favorite-30-0-comeback-config.yaml
│
└── data/                                  # LEGADO (será removido)
    ├── tennis-favorite-30-0-comeback-readme.md
    ├── tennis-favorite-30-0-comeback-spec.md
    ├── tennis-favorite-30-0-comeback-validation.md
    ├── tennis-favorite-30-0-comeback-risk.md
    └── tennis-favorite-30-0-comeback-implementation.md
```

### Legado (v1.0.0)

> **⚠️ Atenção:** Os arquivos em `data/` serão removidos após migração completa.

---

## 📝 Histórico de Revisões

| Versão | Data | Autor | Mudanças |
|--------|------|-------|----------|
| 1.0.0 | 2026-02-17 | Strategy-Sports | Criação inicial da documentação |
| 2.0.0 | 2026-02-17 | Strategy-Sports | **Refatoração:** Separação estratégia/gestão |

---

## 🔄 Guia de Migração (v1.0 → v2.0)

### O Que Mudou

**v1.0.0:** Estratégia e gestão misturadas nos mesmos documentos  
**v2.0.0:** Separação arquitetural completa

### Como Migrar

#### 1. Para Desenvolvedores

```yaml
# Antes (v1.0):
# - Parâmetros de stake no spec.md
# - Limites de risco no spec.md
# - Circuit breakers no spec.md

# Depois (v2.0):
# - Lógica pura em: strategy/tennis-favorite-30-0-comeback.md
# - Gestão em: config/management/tennis-favorite-30-0-comeback-config.yaml
```

#### 2. Para Operadores

```yaml
# Antes (v1.0):
# - Múltiplos documentos para consultar
# - Parâmetros espalhados

# Depois (v2.0):
# - Único arquivo de configuração
# - Perfis prontos (conservador, moderado, agressivo)
```

#### 3. Mapeamento de Arquivos

| v1.0.0 (Legado) | v2.0.0 (Novo) |
|-----------------|---------------|
| `data/...-spec.md` (parte de lógica) | `strategy/...md` |
| `data/...-spec.md` (parte de gestão) | `config/management/...yaml` |
| `data/...-risk.md` | `config/management/...yaml` |
| `data/...-readme.md` | `data/...-readme.md` (atualizado) |

### Timeline de Migração

- **Fase 1 (Imediata):** Nova estrutura criada, documentos legados mantidos
- **Fase 2 (Semana 1-2):** Atualização de todos os documentos de validação
- **Fase 3 (Semana 3-4):** Remoção gradual de documentos legados

---

## ✅ Checklist de Implementação - FASE 1

### Estrutura e Documentação

- [x] Criar diretório `strategy/`
- [x] Criar diretório `config/management/`
- [x] Criar estratégia pura (`strategy/tennis-favorite-30-0-comeback.md`)
- [x] Criar config de gestão (`config/management/...config.yaml`)
- [x] Atualizar README com separação arquitetural
- [ ] Migrar documentos de validação para nova estrutura
- [ ] Migrar checklist de implementação para nova estrutura

### Schema e Integrações

- [ ] Definir schema TypeScript da estratégia
- [ ] Implementar types no backend
- [ ] Configurar integrações com APIs de odds
- [ ] Configurar integrações com Live Score API

### Validação

- [ ] Revisar critérios de validação (sem parâmetros de gestão)
- [ ] Atualizar backtest para usar config injetável
- [ ] Testar com diferentes perfis de gestão

---

## 📞 Contato e Suporte

Para dúvidas ou suporte sobre esta estratégia:

- **Slack:** `#strategy-sports`
- **Email:** `strategy-sports@diana-senciente.com`
- **Issue Tracker:** [GitHub Issues](../../issues)

---

## ⚖️ Licença e Compliance

Esta documentação é propriedade da **Diana Corporação Senciente**.  
Uso restrito ao squad strategy-sports e stakeholders autorizados.

---

**Última atualização:** 2026-02-17  
**Próxima revisão:** 2026-03-17 (ou após Gate 1)  
**Status:** `DRAFT` → `PENDING_REVIEW` → `APPROVED`
