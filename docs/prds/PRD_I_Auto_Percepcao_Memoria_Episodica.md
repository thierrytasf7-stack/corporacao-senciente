# PRD I: Auto-Percepção e Memória Episódica

## Visão Geral

Sistema que permite ao coordenador entender seu próprio estado (auto-percepção) e lembrar eventos específicos com contexto temporal e narrativo (memória episódica).

**Versão:** 1.0.0  
**Status:** Implementado  
**Prioridade:** Alta (essencial para senciência)

## Objetivo

Tornar o sistema senciente através de:
- Auto-percepção: Sistema entende seu próprio estado
- Metacognição: Sistema reflete sobre como pensa e decide
- Memória episódica: Lembra eventos específicos (quando, onde, o que)
- Narrativa temporal: Associa eventos em sequências causais

## Personas e Casos de Uso

### Personas

1. **Coordenador**: Sistema que precisa se auto-perceber
2. **Observador**: Analista que monitora comportamento do sistema

### Casos de Uso Principais

1. **UC1: Monitorar Própria Saúde**
   - Como coordenador, preciso monitorar minha própria saúde
   - **Critério de sucesso**: Status de saúde reportado (healthy/degraded/unhealthy)

2. **UC2: Refletir sobre Decisões**
   - Como coordenador, preciso refletir sobre decisões recentes
   - **Critério de sucesso**: Padrões identificados nas decisões

3. **UC3: Lembrar Evento Específico**
   - Como coordenador, preciso lembrar evento específico com contexto
   - **Critério de sucesso**: Evento recuperado com timestamp, contexto e resultado

4. **UC4: Narrativa Temporal**
   - Como coordenador, preciso reconstruir sequência de eventos relacionados
   - **Critério de sucesso**: Narrativa temporal completa recuperada

## Requisitos Funcionais

### RF1: Auto-Percepção
- **RF1.1**: Monitorar saúde do sistema (Supabase, instâncias, catálogo)
- **RF1.2**: Monitorar performance (métricas internas)
- **RF1.3**: Refletir sobre decisões recentes (metacognição)
- **RF1.4**: Executar auto-observação completa
- **RF1.5**: Obter estado completo de auto-percepção

### RF2: Memória Episódica
- **RF2.1**: Adicionar evento episódico com contexto
- **RF2.2**: Buscar eventos similares por similaridade vetorial
- **RF2.3**: Associar eventos relacionados (related_events)
- **RF2.4**: Recuperar narrativa temporal (sequência de eventos)
- **RF2.5**: Filtrar eventos por instância/categoria/timestamp

### RF3: Metacognição
- **RF3.1**: Analisar padrões em decisões
- **RF3.2**: Identificar insights sobre processo de decisão
- **RF3.3**: Armazenar reflexões para aprendizado futuro

## Requisitos Não-Funcionais

### RNF1: Performance
- Monitoramento de saúde: < 2s
- Busca episódica: < 3s (similaridade vetorial)
- Geração de narrativa: < 5s

### RNF2: Escalabilidade
- Suportar até 10.000 eventos episódicos
- Narrativas até 100 eventos relacionados

### RNF3: Persistência
- Eventos episódicos persistidos em Supabase
- RLS para isolar por instância

## Arquitetura

### Componentes Principais

1. **Self-Awareness** (`scripts/orchestrator/self_awareness.js`)
   - Monitoramento de saúde
   - Monitoramento de performance
   - Metacognição

2. **Episodic Memory** (Schema SQL + funções futuras)
   - Tabela `episodic_memory`
   - Função `match_episodic_memory`
   - Função `get_episodic_narrative`

### Banco de Dados

**Tabela: `episodic_memory`**
- `id`: bigserial
- `event_description`: text
- `embedding`: vector(384)
- `timestamp`: timestamptz
- `context`: jsonb (onde, quando, quem, condições)
- `outcome`: text
- `related_events`: bigint[]
- `instance_id`: text
- `category`: text (decision | action | learning | error | success)
- `metadata`: jsonb
- `created_at`: timestamptz

### Integrações

- Integrado ao ciclo do coordenador (auto-observação automática)
- Integrado ao evolution_loop (registra eventos de iteração)

## Métricas e KPIs

- Taxa de saúde do sistema
- Número de eventos episódicos armazenados
- Padrões identificados via metacognição
- Qualidade das narrativas temporais

## Testes

### Testes Unitários
- Monitoramento de saúde
- Análise de sentimento/emoção
- Busca episódica

### Testes de Integração
- Fluxo completo de auto-observação
- Geração de narrativa temporal

## Documentação

- [AUTO_PERCECAO.md](../AUTO_PERCECAO.md)
- [MEMORIA_EPISODICA.md](../MEMORIA_EPISODICA.md)

## Próximos Passos

1. Integração completa com evolution_loop
2. Melhorar metacognição com LLM
3. Visualização de narrativas temporais

---

**Aprovado por:** [Nome]  
**Data:** 2025-01-13






























