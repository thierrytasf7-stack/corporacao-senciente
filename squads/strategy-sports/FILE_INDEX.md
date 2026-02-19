# 📁 Índice de Arquivos: Refatoração Estratégia/Gestão

**Estratégia:** `TENNIS_FAV_30_0_COMEBACK`  
**Versão:** 2.0.0  
**Data:** 2026-02-17  

---

## ✅ Arquivos Criados (Fase 1)

### 1. Estratégia Pura

**Path:** `squads/strategy-sports/strategy/tennis-favorite-30-0-comeback.md`  
**Tamanho:** 645 linhas  
**Conteúdo:**

```
1. Separação Arquitetural (WHAT vs HOW MUCH)
2. Visão Geral da Estratégia
3. Especificação do Trigger
   - Condições de ativação
   - Pseudocódigo da lógica
   - Janela temporal
4. Condições de Entrada
   - Validações
   - Regras de exclusão
5. Seleção e Mercado
   - Mercado alvo
   - Seleção do favorito
6. Condições de Saída
   - Resolução natural
   - Schema de resolução
7. Schema de Dados
   - Signal schema
   - Result schema
   - Config schema (referência)
8. Integrações Técnicas
   - Fontes de dados
   - Providers sugeridos
   - Endpoints necessários
9. Arquitetura de Implementação
   - Diagrama de componentes
   - Módulos do sistema
10. Métricas de Performance (referência)
11. Validação da Lógica
    - Testes unitários
    - Critérios de validação
12. Estrutura de Arquivos
13. Histórico de Revisões
```

**NÃO CONTÉM:**
- ❌ Valores de stake
- ❌ Parâmetros de bankroll
- ❌ Metas de ROI
- ❌ Limites de perda
- ❌ Circuit breakers financeiros

---

### 2. Configuração de Gestão

**Path:** `squads/strategy-sports/config/management/tennis-favorite-30-0-comeback-config.yaml`  
**Tamanho:** 459 linhas  
**Conteúdo:**

```yaml
1. Parâmetros de Odds (filtro de mercado)
   - min: 1.70
   - max: 3.50
   - ideal: 1.80-2.50

2. Método de Staking
   - method: percentage
   - value: 1.0%
   - limits: 0.25% - 2.0%

3. Gestão de Bankroll
   - initial: 10000
   - allocation: 70% active, 20% reserve, 10% emergency
   - rebalance thresholds

4. Limites de Exposição
   - per_match: max 3 bets, 3% stake
   - per_day: max 15 bets, 10% stake, 5% loss
   - per_week: max 75 bets, 15% drawdown
   - per_month: 25% drawdown, 5% target ROI

5. Circuit Breakers
   - daily: 5% loss stop, 5 consecutive losses
   - weekly: 15% drawdown stop
   - monthly: 25% drawdown stop

6. Ajuste de Risco por Condição
   - low_risk: 1.25x multiplier
   - medium_risk: 1.0x multiplier
   - high_risk: 0.5x multiplier

7. Resposta a Drawdown
   - 10%: ALERT
   - 15%: REDUCE_STAKE_25
   - 20%: REDUCE_STAKE_50
   - 25%: STOP

8. Filtros de Mercado
   - exclusions (injury, weather, fatigue, etc.)
   - inclusions (tournament tiers, rounds, etc.)

9. Parâmetros de Execução
   - max_latency: 3000ms
   - max_slippage: 10%
   - max_retries: 3

10. Perfis de Gestão
    - conservative: 0.5% stake
    - moderate: 1.0% stake
    - aggressive: Kelly 0.25

11. Fases de Operação
    - validation: 0-100 bets
    - standard: 101-500 bets
    - full: 500+ bets

12. Monitoramento e Alertas
    - real-time alerts
    - dashboard metrics
```

---

### 3. Documento de Arquitetura

**Path:** `squads/strategy-sports/strategy/ARCHITECTURE.md`  
**Tamanho:** ~400 linhas  
**Conteúdo:**

```
1. Visão Geral da Separação
2. Por Que Separar?
   - Reusabilidade
   - Manutenibilidade
   - Testabilidade
   - Composabilidade
3. Estrutura de Arquivos Padrão
4. O Que Vai em Cada Lugar
   - Estratégia Pura (inclui/não inclui)
   - Configuração de Gestão (inclui/não inclui)
5. Interface Estratégia-Gestão
   - Como a gestão é injetada
   - Schema de config
6. Arquitetura do Sistema
   - Diagrama de componentes
   - Fluxo de dados
7. Guia para Novas Estratégias
   - Passo 1: Criar estratégia pura
   - Passo 2: Criar config de gestão
   - Passo 3: Atualizar README
8. Checklist de Validação
9. Referências e Links
```

---

### 4. README Atualizado

**Path:** `squads/strategy-sports/data/tennis-favorite-30-0-comeback-readme.md`  
**Tamanho:** 305 linhas (atualizado de 227)  
**Novas Seções:**

```
1. Separação Arquitetural: Estratégia vs Gestão
   - Princípio fundamental
   - Por que separar
   - Estrutura de arquivos

2. Nova estrutura de documentação
   - Conjunto A: Estratégia Pura
   - Conjunto B: Configuração de Gestão
   - Conjunto C: Validação e Implementação (legado)

3. Configuração de Gestão (resumo)
   - Perfis disponíveis
   - Circuit breakers

4. Guia de Migração (v1.0 → v2.0)
   - O que mudou
   - Como migrar
   - Mapeamento de arquivos

5. Checklist de Implementação - FASE 1
```

---

### 5. Status da Refatoração

**Path:** `squads/strategy-sports/REFACTOR_STATUS.md`  
**Tamanho:** ~350 linhas  
**Conteúdo:**

```
1. Resumo Executivo
2. Entregáveis Concluídos (Fase 1)
3. Migração de Documentos Legados
   - Status de cada documento
   - Próximos passos (Fase 2)
4. Comparação: v1.0.0 vs v2.0.0
5. Benefícios da Separação
6. Estrutura Final
7. Checklist de Validação
8. Lições Aprendidas
```

---

### 6. Resumo Executivo (CEO)

**Path:** `squads/strategy-sports/EXECUTIVE_SUMMARY.md`  
**Tamanho:** ~200 linhas  
**Conteúdo:**

```
1. Resumo Executivo
2. Entregáveis da Fase 1
3. Estrutura Criada
4. Benefícios da Separação
5. Checklist Fase 1
6. Próximos Passos (Fase 2)
7. Comparação de Estados
8. Impacto para Futuras Estratégias
```

---

### 7. Índice de Arquivos (Este Arquivo)

**Path:** `squads/strategy-sports/FILE_INDEX.md`  
**Propósito:** Lista completa de todos os arquivos criados/atualizados

---

## 📊 Resumo de Arquivos

| Tipo | Arquivo | Status | Linhas |
|------|---------|--------|--------|
| **Estratégia** | `strategy/tennis-favorite-30-0-comeback.md` | ✅ NOVO | 645 |
| **Gestão** | `config/management/tennis-favorite-30-0-comeback-config.yaml` | ✅ NOVO | 459 |
| **Arquitetura** | `strategy/ARCHITECTURE.md` | ✅ NOVO | ~400 |
| **README** | `data/tennis-favorite-30-0-comeback-readme.md` | ✅ ATUALIZADO | 305 |
| **Status** | `REFACTOR_STATUS.md` | ✅ NOVO | ~350 |
| **Executive** | `EXECUTIVE_SUMMARY.md` | ✅ NOVO | ~200 |
| **Index** | `FILE_INDEX.md` | ✅ NOVO | ~150 |

**Total:** 7 arquivos, ~2,500 linhas de documentação

---

## 🗂️ Estrutura de Diretórios

```
squads/strategy-sports/
│
├── strategy/                              ← NOVO DIRETÓRIO
│   ├── tennis-favorite-30-0-comeback.md   ← Estratégia pura (645 linhas)
│   └── ARCHITECTURE.md                     ← Arquitetura (400 linhas)
│
├── config/
│   └── management/                        ← NOVO DIRETÓRIO
│       └── tennis-favorite-30-0-comeback-config.yaml  ← Gestão (459 linhas)
│
├── data/
│   └── tennis-favorite-30-0-comeback-readme.md  ← ATUALIZADO (305 linhas)
│
├── REFACTOR_STATUS.md                     ← NOVO (350 linhas)
└── EXECUTIVE_SUMMARY.md                    ← NOVO (200 linhas)
```

---

## 📋 Checklist de Validação

### Validação de Conteúdo

- [x] Estratégia contém APENAS lógica
- [x] Config contém APENAS parâmetros de gestão
- [x] Schema de dados definido
- [x] Integrações técnicas documentadas
- [x] Arquitetura padronizada
- [x] README atualizado com separação
- [x] Guia de migração criado

### Validação de Estrutura

- [x] Diretório `strategy/` criado
- [x] Diretório `config/management/` criado
- [x] Arquivos nos locais corretos
- [x] Links entre documentos funcionais
- [x] Histórico de revisões atualizado

---

## 🔗 Links para Arquivos

### Documentos Principais (v2.0.0)

- [Estratégia Pura](./strategy/tennis-favorite-30-0-comeback.md)
- [Configuração de Gestão](./config/management/tennis-favorite-30-0-comeback-config.yaml)
- [Arquitetura](./strategy/ARCHITECTURE.md)
- [README Atualizado](./data/tennis-favorite-30-0-comeback-readme.md)

### Documentos de Status

- [Status da Refatoração](./REFACTOR_STATUS.md)
- [Resumo Executivo](./EXECUTIVE_SUMMARY.md)
- [Índice de Arquivos](./FILE_INDEX.md)

---

## 📝 Próximos Passos

### Fase 2: Migração de Legado

- [ ] Migrar `data/...-spec.md`
- [ ] Migrar `data/...-risk.md`
- [ ] Atualizar `data/...-validation.md`
- [ ] Atualizar `data/...-implementation.md`

### Fase 3: Implementação Técnica

- [ ] Definir schema TypeScript
- [ ] Implementar no backend
- [ ] Configurar integrações
- [ ] Testar injeção de config

---

**Status:** `FASE 1 CONCLUÍDA`  
**Data:** 2026-02-17  
**Responsável:** @strategy-sports
