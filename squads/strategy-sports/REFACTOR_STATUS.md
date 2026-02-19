# Status da Refatoração: Separação Estratégia/Gestão

**Estratégia:** `TENNIS_FAV_30_0_COMEBACK`  
**Versão:** 2.0.0  
**Data:** 2026-02-17  
**Status:** `EM_ANDAMENTO`  

---

## 📋 Resumo Executivo

### Problema Identificado

A documentação inicial (v1.0.0) misturava **estratégia pura** (lógica, regras, gatilhos) com **parâmetros de gestão matemática** (stakes, bankroll, ROI, circuit breakers).

### Solução Implementada

Separação arquitetural completa em dois conjuntos de documentos:

```
v1.0.0 (Legado)                v2.0.0 (Refatorado)
─────────────────                ───────────────────
Documentos mistos:               Documentos separados:
• spec.md (lógica + gestão)  →  • strategy/*.md (apenas lógica)
• risk.md (gestão)           →  • config/management/*.yaml (apenas gestão)
• validation.md              →  • data/*.md (legado, será migrado)
• implementation.md
```

---

## ✅ Entregáveis Concluídos (Fase 1)

### 1. Estrutura de Diretórios

```
squads/strategy-sports/
├── strategy/                    ✅ CRIADO
│   └── tennis-favorite-30-0-comeback.md
│
├── config/
│   └── management/              ✅ CRIADO
│       └── tennis-favorite-30-0-comeback-config.yaml
│
└── data/                        ✅ ATUALIZADO
    └── tennis-favorite-30-0-comeback-readme.md
```

### 2. Estratégia Pura

**Arquivo:** `strategy/tennis-favorite-30-0-comeback.md`

**Conteúdo:**
- ✅ Separação arquitetural documentada
- ✅ Visão geral da estratégia
- ✅ Especificação do trigger (pseudocódigo)
- ✅ Condições de entrada
- ✅ Regras de exclusão
- ✅ Seleção e mercado
- ✅ Condições de saída
- ✅ Schema de dados (Signal, Result, Config)
- ✅ Integrações técnicas
- ✅ Arquitetura de implementação
- ✅ Guia de testes unitários

**NÃO CONTÉM:**
- ❌ Valores de stake
- ❌ Parâmetros de bankroll
- ❌ Metas de ROI
- ❌ Limites de perda
- ❌ Circuit breakers financeiros

### 3. Configuração de Gestão

**Arquivo:** `config/management/tennis-favorite-30-0-comeback-config.yaml`

**Conteúdo:**
- ✅ Parâmetros de odds (filtro de mercado)
- ✅ Método de staking (percentage, kelly, fixed)
- ✅ Gestão de bankroll (alocação, rebalanceamento)
- ✅ Limites de exposição (por partida, dia, semana, mês)
- ✅ Circuit breakers (diário, semanal, mensal)
- ✅ Ajuste de risco por condição (low, medium, high)
- ✅ Resposta a drawdown (progressiva)
- ✅ Filtros de mercado (exclusões, inclusões)
- ✅ Parâmetros de execução (latência, slippage)
- ✅ Perfis de gestão (conservador, moderado, agressivo)
- ✅ Fases de operação (validation, standard, full)
- ✅ Monitoramento e alertas

### 4. README Atualizado

**Arquivo:** `data/tennis-favorite-30-0-comeback-readme.md`

**Atualizações:**
- ✅ Seção de separação arquitetural
- ✅ Nova estrutura de arquivos
- ✅ Links para estratégia pura
- ✅ Links para config de gestão
- ✅ Guia de migração (v1.0 → v2.0)
- ✅ Checklist de implementação - Fase 1
- ✅ Histórico de revisões atualizado

### 5. Documento de Arquitetura

**Arquivo:** `strategy/ARCHITECTURE.md`

**Conteúdo:**
- ✅ Princípio fundamental da separação
- ✅ Por que separar (benefícios)
- ✅ Estrutura de arquivos padrão
- ✅ O que vai em cada lugar
- ✅ Interface estratégia-gestão
- ✅ Arquitetura do sistema (diagramas)
- ✅ Guia para novas estratégias
- ✅ Checklist de validação

---

## 🔄 Migração de Documentos Legados

### Status dos Documentos v1.0.0

| Documento | Status | Ação Necessária |
|-----------|--------|-----------------|
| `data/...-spec.md` | ⚠️ MISTO | Extrair lógica → strategy/, mover gestão → config/ |
| `data/...-risk.md` | ⚠️ MISTO | Mover para config/management/ (já criado) |
| `data/...-validation.md` | ⏳ PENDENTE | Revisar sem parâmetros de gestão |
| `data/...-implementation.md` | ⏳ PENDENTE | Atualizar referências |
| `data/...-readme.md` | ✅ ATUALIZADO | Separação documentada |

### Próximos Passos (Fase 2)

- [ ] Migrar `-spec.md` para nova estrutura
  - [ ] Extrair lógica pura → `strategy/`
  - [ ] Extrair gestão → `config/management/`
  
- [ ] Migrar `-risk.md` para `config/management/`
  - [ ] Revisar parâmetros
  - [ ] Consolidar com config existente

- [ ] Atualizar `-validation.md`
  - [ ] Remover referências a parâmetros de gestão
  - [ ] Focar em validação da lógica

- [ ] Atualizar `-implementation.md`
  - [ ] Atualizar checklist com nova estrutura
  - [ ] Atualizar referências de arquivos

---

## 📊 Comparação: v1.0.0 vs v2.0.0

### v1.0.0 (Legado)

```
Problemas:
❌ Estratégia e gestão misturadas
❌ Parâmetros de stake no spec.md
❌ Circuit breakers no spec.md
❌ Dificil reutilizar lógica com diferentes riscos
❌ Mudança de gestão exigia mudar spec
```

### v2.0.0 (Refatorado)

```
Benefícios:
✅ Estratégia pura e reutilizável
✅ Gestão injetável e configurável
✅ Mesma estratégia, múltiplos perfis de risco
✅ Separação clara de responsabilidades
✅ Manutenção simplificada
```

---

## 🎯 Benefícios da Separação

### Para Desenvolvedores

1. **Código mais limpo:** Lógica separada de configuração
2. **Testes mais fáceis:** Testar lógica sem mockar parâmetros
3. **Reuso:** Mesma estratégia, diferentes configs

### Para Operadores

1. **Flexibilidade:** Ajustar risco sem mudar lógica
2. **Perfis prontos:** Conservador, moderado, agressivo
3. **Ramp-up automático:** Fases de operação

### Para Gestores

1. **Controle:** Parâmetros centralizados
2. **Transparência:** Risco claramente definido
3. **Compliance:** Limites bem documentados

---

## 📁 Estrutura Final

### Completado (Fase 1)

```
squads/strategy-sports/
├── strategy/
│   ├── tennis-favorite-30-0-comeback.md    ✅ NOVO
│   └── ARCHITECTURE.md                      ✅ NOVO
│
├── config/
│   └── management/
│       └── tennis-favorite-30-0-comeback-config.yaml   ✅ NOVO
│
└── data/
    └── tennis-favorite-30-0-comeback-readme.md          ✅ ATUALIZADO
```

### Pendente (Fase 2)

```
squads/strategy-sports/
├── strategy/
│   └── tennis-favorite-30-0-comeback.md    ✅
│
├── config/
│   └── management/
│       ├── tennis-favorite-30-0-comeback-config.yaml   ✅
│       └── tennis-favorite-30-0-comeback-risk.yaml     ⏳ MIGRAR
│
└── data/                                              ⏳ LEGADO
    └── ... (será removido após migração completa)
```

---

## ✅ Checklist de Validação

### Fase 1: Fundamentos

- [x] Criar diretório `strategy/`
- [x] Criar diretório `config/management/`
- [x] Criar estratégia pura (`strategy/tennis-favorite-30-0-comeback.md`)
  - [x] Lógica de trigger
  - [x] Condições de entrada
  - [x] Regras de exclusão
  - [x] Schema de dados
  - [x] Integrações técnicas
  - [x] Sem parâmetros de gestão
- [x] Criar config de gestão (`config/management/...config.yaml`)
  - [x] Parâmetros de odds
  - [x] Métodos de staking
  - [x] Limites de exposição
  - [x] Circuit breakers
  - [x] Perfis de gestão
  - [x] Fases de operação
- [x] Atualizar README (`data/...-readme.md`)
  - [x] Documentar separação
  - [x] Atualizar estrutura de arquivos
  - [x] Guia de migração
  - [x] Checklist Fase 1
- [x] Criar documento de arquitetura (`strategy/ARCHITECTURE.md`)

### Fase 2: Migração

- [ ] Migrar `-spec.md` (extrair lógica, mover gestão)
- [ ] Migrar `-risk.md` (consolidar config)
- [ ] Atualizar `-validation.md` (remover gestão)
- [ ] Atualizar `-implementation.md` (novas referências)

### Fase 3: Validação

- [ ] Revisar documentos com squad
- [ ] Validar schema TypeScript
- [ ] Testar injeção de config
- [ ] Documentar lições aprendidas

---

## 📝 Lições Aprendidas

### O Que Funcionou Bem

1. **Separação clara:** Fácil entender o que vai em cada lugar
2. **Config único:** Todos os parâmetros em um arquivo YAML
3. **Perfis prontos:** Operadores podem escolher perfil
4. **Documentação:** Arquitetura bem documentada para futuras estratégias

### Desafios

1. **Legado:** Migrar documentos existentes demanda tempo
2. **Referências:** Atualizar todos os links entre documentos
3. **Validação:** Revisar critérios sem parâmetros de gestão

### Recomendações para Futuras Estratégias

1. **Começar pela separação:** Já criar na estrutura v2.0
2. **Usar templates:** Seguir ARCHITECTURE.md
3. **Validar com squad:** Revisar antes de implementar

---

## 🔗 Links Relacionados

### Documentos Novos (v2.0.0)

- [Estratégia Pura](../strategy/tennis-favorite-30-0-comeback.md)
- [Configuração de Gestão](../config/management/tennis-favorite-30-0-comeback-config.yaml)
- [Arquitetura](../strategy/ARCHITECTURE.md)
- [README Atualizado](../data/tennis-favorite-30-0-comeback-readme.md)

### Documentos Legados (v1.0.0)

- [Spec (será migrado)](./tennis-favorite-30-0-comeback-spec.md)
- [Risk (será migrado)](./tennis-favorite-30-0-comeback-risk.md)
- [Validation (será atualizado)](./tennis-favorite-30-0-comeback-validation.md)
- [Implementation (será atualizado)](./tennis-favorite-30-0-comeback-implementation.md)

---

**Status:** `FASE 1 CONCLUÍDA`  
**Próxima fase:** Migração de documentos legados  
**Responsável:** @strategy-sports  
**Data:** 2026-02-17
