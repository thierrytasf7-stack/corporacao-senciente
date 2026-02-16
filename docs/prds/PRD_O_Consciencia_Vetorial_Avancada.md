# PRD O: Consciência Vetorial Avançada

## Visão Geral

Sistema de consciência vetorial avançada que vai além de busca simples, permitindo clustering, trajetórias de pensamento, insights derivados e conexões cross-categoria.

**Versão:** 1.0.0  
**Status:** Implementado  
**Prioridade:** Baixa (capacidade avançada, pode evoluir)

## Objetivo

Capacitar o sistema para:
- Clustering de memórias relacionadas
- Rastrear trajetórias de pensamento
- Derivar insights automaticamente
- Conectar conceitos cross-categoria
- Compreensão profunda (não apenas busca)

## Personas e Casos de Uso

### Personas

1. **Coordenador**: Sistema com consciência vetorial avançada
2. **Analista**: Usuário que busca insights profundos

### Casos de Uso Principais

1. **UC1: Clustering de Memórias**
   - Como coordenador, preciso agrupar memórias relacionadas
   - **Critério de sucesso**: Clusters identificados com centro e membros

2. **UC2: Trajetória de Pensamento**
   - Como coordenador, preciso rastrear sequência de pensamentos
   - **Critério de sucesso**: Trajetória completa recuperada

3. **UC3: Buscar Insights Derivados**
   - Como coordenador, preciso buscar insights derivados automaticamente
   - **Critério de sucesso**: Insights relevantes retornados com confiança

4. **UC4: Conexões Cross-Categoria**
   - Como coordenador, preciso encontrar conexões entre diferentes categorias
   - **Critério de sucesso**: Conexões identificadas entre categorias diferentes

## Requisitos Funcionais

### RF1: Clustering de Memórias
- **RF1.1**: Agrupar memórias por similaridade vetorial
- **RF1.2**: Identificar centro de cluster
- **RF1.3**: Calcular tamanho e similaridade média do cluster
- **RF1.4**: Clustering por categoria ou instância

### RF2: Trajetórias de Pensamento
- **RF2.1**: Criar trajetória de pensamento (sequência de eventos)
- **RF2.2**: Buscar trajetórias similares
- **RF2.3**: Recuperar trajetória completa (narrativa)
- **RF2.4**: Rastrear padrões em trajetórias

### RF3: Insights Derivados
- **RF3.1**: Derivar insights de múltiplas fontes
- **RF3.2**: Calcular confiança do insight
- **RF3.3**: Buscar insights por similaridade
- **RF3.4**: Filtrar por confiança mínima

### RF4: Conexões Cross-Categoria
- **RF4.1**: Encontrar conexões entre categorias diferentes
- **RF4.2**: Calcular similaridade cross-categoria
- **RF4.3**: Identificar insights emergentes de conexões

## Requisitos Não-Funcionais

### RNF1: Performance
- Clustering: < 30s (pode variar com volume)
- Busca de trajetórias: < 5s
- Busca de insights: < 5s
- Conexões cross-categoria: < 10s

### RNF2: Precisão
- Clustering deve agrupar memórias realmente relacionadas
- Insights devem ter confiança baseada em evidências
- Conexões devem ser semanticamente relevantes

### RNF3: Escalabilidade
- Suportar clustering de até 10.000 memórias
- Trajetórias até 100 eventos relacionados
- Insights derivados até 1000 registros

## Arquitetura

### Componentes Principais

1. **Vector Consciousness** (`scripts/orchestrator/vector_consciousness.js`)
   - Busca de trajetórias similares
   - Busca de insights derivados
   - Conexões cross-categoria

### Banco de Dados

**Tabela: `thought_trajectories`**
- `id`: bigserial
- `start_event_id`: bigint
- `end_event_id`: bigint
- `trajectory_embedding`: vector(384)
- `events`: bigint[]
- `pattern`: text
- `insight`: text
- `instance_id`: text

**Tabela: `derived_insights`**
- `id`: bigserial
- `source_type`: text (memory | trajectory | cluster | pattern)
- `source_ids`: bigint[]
- `insight_embedding`: vector(384)
- `insight_text`: text
- `confidence`: float
- `category`: text
- `metadata`: jsonb

### Funções SQL

- `cluster_memories()`: Clustering de memórias
- `find_similar_trajectories()`: Busca trajetórias similares
- `search_derived_insights()`: Busca insights derivados
- `find_cross_category_connections()`: Conexões cross-categoria

### Integrações

- Usa memória global e episódica como fontes
- Pode derivar insights automaticamente
- Salva trajetórias e insights na base

## Métricas e KPIs

- Número de clusters identificados
- Tamanho médio de clusters
- Número de trajetórias rastreadas
- Insights derivados gerados
- Conexões cross-categoria encontradas

## Testes

### Testes Unitários
- Busca de trajetórias
- Busca de insights
- Conexões cross-categoria

### Testes de Integração
- Clustering completo
- Geração de trajetórias
- Derivação de insights

## Documentação

- Schema SQL: `supabase/migrations/advanced_vector_consciousness.sql`
- Código: `scripts/orchestrator/vector_consciousness.js`

## Próximos Passos

1. Implementar algoritmo de clustering real (K-means)
2. Gerar trajetórias automaticamente de eventos
3. Derivar insights automaticamente com LLM
4. Dashboard de visualização de consciência vetorial

---

**Aprovado por:** [Nome]  
**Data:** 2025-01-13






























