# Guia de Autoaperfeiçoamento do Cérebro

## Visão Geral

O sistema de autoaperfeiçoamento cognitivo permite que o Cérebro Central e seus agentes especializados se aprimorem continuamente através de:

- Busca e download de conhecimento dos melhores experts
- Vetorização e armazenamento em `cerebro_specialized_knowledge`
- Treinamento sintético e evolução de prompts
- Deep research contínuo para atualização
- Análise de concorrência automatizada

## Setup Inicial

### 1. Aplicar Migração SQL

```bash
# Aplicar migração no Supabase Dashboard ou via CLI
psql -f supabase/migrations/cerebro_self_improvement.sql
```

### 2. Configurar APIs de Busca (Opcional)

Adicione ao `.env` ou `env.local`:

```env
# Tavily API (recomendado)
TAVILY_API_KEY=seu_api_key_aqui

# Ou Serper API (alternativa)
SERPER_API_KEY=seu_api_key_aqui
```

**Nota:** Se não configurar, o sistema usará apenas busca básica.

### 3. Verificar Estrutura

O diretório `knowledge_cache/` será criado automaticamente.

## Uso

### Executar Processo Completo

```bash
npm run cerebro:improve
```

Isso executa todas as fases:
1. Pesquisa inicial (deep research)
2. Treinamento sintético
3. Evolução de prompts
4. Análise competitiva

### Executar Fases Individuais

#### Fase 1: Pesquisa Inicial

```bash
npm run cerebro:improve:research
```

Busca conhecimento para todos os agentes via web search e documentações oficiais.

#### Fase 2: Treinamento Sintético

```bash
npm run cerebro:improve:synthetic
```

Gera exemplos sintéticos (Q&A, failure cases, success patterns) para todos os agentes.

#### Fase 3: Evolução de Prompts

```bash
npm run cerebro:improve:prompts
```

Evolui prompts dos agentes baseado no conhecimento disponível.

#### Fase 4: Análise Competitiva

```bash
npm run cerebro:improve:competitors
```

Auto-descobre e analisa concorrentes.

### Opções Avançadas

```bash
# Pesquisar apenas agentes específicos
node scripts/cerebro/self_improvement_orchestrator.js --phase=research --agents=copywriting,marketing

# Ativar prompts automaticamente após evolução
node scripts/cerebro/self_improvement_orchestrator.js --phase=prompts --auto-activate

# Análise competitiva com descrição customizada
node scripts/cerebro/self_improvement_orchestrator.js --phase=competitors --product-description="sistema de corporação autônoma"
```

## Procedimento Passo a Passo

### Passo 1: Setup Inicial ✅

1. ✅ Aplicar migração SQL (`cerebro_self_improvement.sql`)
2. ✅ Configurar APIs de busca (opcional)
3. ✅ Criar diretório `knowledge_cache/` (automático)
4. ✅ Configurar variáveis de ambiente

### Passo 2: Pesquisa Inicial

```bash
npm run cerebro:improve:research
```

Para cada agente:
- Busca conhecimento via web search
- Download de documentações oficiais
- Processa e vetoriza
- Armazena em `cerebro_specialized_knowledge`

### Passo 3: Treinamento Sintético

```bash
npm run cerebro:improve:synthetic
```

Gera exemplos para cada agente:
- Q&A pairs (10 por padrão)
- Failure cases (5 por padrão)
- Success patterns (5 por padrão)

### Passo 4: Evolução de Prompts

```bash
npm run cerebro:improve:prompts
```

Para cada agente:
- Analisa conhecimento disponível
- Gera prompt otimizado
- Cria nova versão
- (Opcional) Ativa automaticamente

### Passo 5: Análise Competitiva

```bash
npm run cerebro:improve:competitors
```

- Auto-descobre concorrentes
- Analisa e extrai insights
- Vetoriza e armazena

### Passo 6: Validação Final

Verificar resultados:

```sql
-- Verificar conhecimento armazenado
SELECT agent_name, COUNT(*) as total
FROM cerebro_specialized_knowledge
GROUP BY agent_name;

-- Verificar exemplos sintéticos
SELECT agent_name, example_type, COUNT(*) as total
FROM cerebro_synthetic_examples
WHERE validation_status = 'validated'
GROUP BY agent_name, example_type;

-- Verificar prompts ativos
SELECT agent_name, version, is_active
FROM cerebro_prompt_evolution
WHERE is_active = true;
```

### Passo 7: Deploy e Monitoramento

1. Ativar prompts melhorados (se não auto-ativados)
2. Monitorar performance dos agentes
3. Configurar atualizações contínuas (futuro)

## Estrutura de Arquivos

```
scripts/cerebro/
├── knowledge_fetcher.js          # Busca de conhecimento
├── content_processor.js          # Processamento de conteúdo
├── deep_research_engine.js       # Motor de deep research
├── agent_search_strategies.js    # Estratégias de busca por agente
├── official_docs_downloader.js   # Download de documentações
├── knowledge_vectorizer.js       # Vetorização
├── synthetic_training_generator.js # Treinamento sintético
├── prompt_evolution_manager.js   # Evolução de prompts
├── competitor_analyzer.js        # Análise competitiva
├── research_scheduler.js         # Scheduler de pesquisas
└── self_improvement_orchestrator.js # Orquestrador principal
```

## Tabelas do Banco de Dados

- `cerebro_knowledge_sources` - Fontes pesquisadas
- `cerebro_training_sessions` - Sessões de treinamento
- `cerebro_prompt_evolution` - Histórico de prompts
- `cerebro_synthetic_examples` - Exemplos sintéticos
- `cerebro_competitor_analysis` - Análise de concorrência
- `cerebro_agent_performance` - Métricas de performance

## Monitoramento

### Verificar Estatísticas de Treinamento

```sql
SELECT * FROM cerebro_get_agent_training_stats('copywriting');
```

### Verificar Performance dos Agentes

```sql
SELECT agent_name, measurement_date, average_confidence, total_decisions
FROM cerebro_agent_performance
ORDER BY measurement_date DESC
LIMIT 10;
```

## Troubleshooting

### Erro: "TAVILY_API_KEY não configurado"

**Solução:** Configure `TAVILY_API_KEY` no `.env` ou use `SERPER_API_KEY` como alternativa.

### Erro: "Embedding inválido"

**Solução:** Verifique se o modelo de embedding está configurado corretamente (384 dimensões).

### Erro: "Erro ao armazenar conhecimento"

**Solução:** Verifique se a migração SQL foi aplicada e se as permissões do Supabase estão corretas.

## Próximos Passos

1. Configurar atualizações semanais automáticas
2. Implementar detecção de gaps no conhecimento
3. Adicionar validação humana de exemplos sintéticos
4. Expandir análise competitiva

---

**Última atualização:** Dezembro 2025
























