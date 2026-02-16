# Sistema de Memória Compartilhada do Swarm

## Visão Geral

O Sistema de Memória Compartilhada é o componente central que permite aos agentes do swarm aprenderem uns com os outros, manterem histórico de decisões e acessarem conhecimento contextual. Ele integra perfeitamente com o Protocolo L.L.B. (LangMem, Letta, ByteRover) para fornecer memória de longo prazo e contextual.

## Funcionalidades Principais

### 1. Armazenamento de Decisões
```javascript
await storeDecision('marketing_agent', 'criar campanha', 'usar Google Ads', 'sucesso', {
  confidence: 0.85,
  executionTime: 1500
});
```

### 2. Busca de Decisões Similares
```javascript
const similares = await getSimilarDecisions('campanha', 5);
// Retorna array de decisões similares baseadas em tarefas
```

### 3. Histórico de Agentes
```javascript
const historico = await getAgentHistory('marketing_agent', 10);
// Retorna últimas 10 decisões do agente
```

### 4. Busca de Conhecimento
```javascript
const conhecimento = await getKnowledge('marketing', 'strategy', 3);
// Busca conhecimento na memória corporativa
```

### 5. Estatísticas de Performance
```javascript
const stats = await getAgentStats('marketing_agent');
// Retorna: totalDecisions, averageConfidence, averageExecutionTime, successRate
```

## Arquitetura Técnica

### Estrutura de Dados

#### Tabela `agent_logs`
```sql
CREATE TABLE agent_logs (
  id BIGSERIAL PRIMARY KEY,
  agent_name TEXT NOT NULL,
  thought_process TEXT NOT NULL, -- JSON com detalhes da decisão
  decision_vector VECTOR(384) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tabela `corporate_memory`
```sql
CREATE TABLE corporate_memory (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  embedding VECTOR(384) NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Sistema de Cache

- **TTL**: 5 minutos por entrada
- **Máximo**: 100 entradas simultâneas
- **Invalidation**: Automática por agente
- **Estatísticas**: Monitoramento em tempo real

### Integração com Protocolo L.L.B.

#### LangMem (Memória de Longo Prazo)
- Armazenamento de conhecimento arquitetural
- Busca semântica por categoria
- Context enrichment automático

#### Letta (Gerenciador de Estado)
- Histórico de decisões por agente
- Estatísticas de performance
- Aprendizado contínuo

#### ByteRover (Interface com Código)
- Timeline de decisões
- Mapeamento de impacto de mudanças
- Contexto de código integrado

## APIs Disponíveis

### Classe Principal: `SwarmMemory`

```javascript
import { swarmMemory } from './swarm/memory.js';

// Métodos principais
await swarmMemory.storeDecision(agent, task, decision, result, metadata);
await swarmMemory.getSimilarDecisions(task, limit);
await swarmMemory.getAgentHistory(agentName, limit);
await swarmMemory.getKnowledge(query, category, limit);
await swarmMemory.getAgentStats(agentName);

// Utilitários
swarmMemory.invalidateAgentCache(agentName);
swarmMemory.clearCache();
swarmMemory.getCacheStats();
```

### Funções de Compatibilidade

```javascript
import { storeDecision, getSimilarDecisions, getAgentHistory, getKnowledge, getAgentStats } from './swarm/memory.js';
```

## Casos de Uso

### 1. Aprendizado entre Agentes
```javascript
// Agente A aprende com decisões similares de outros agentes
const similares = await getSimilarDecisions('otimizar conversão');
for (const decisao of similares) {
  console.log(`${decisao.agent} tentou: ${decisao.decision} → ${decisao.result}`);
}
```

### 2. Análise de Performance
```javascript
// Monitorar performance de agentes
const stats = await getAgentStats('marketing_agent');
if (stats.successRate < 70) {
  console.log('⚠️ Agente precisa de otimização');
}
```

### 3. Contexto Histórico
```javascript
// Fornecer contexto histórico para decisões
const historico = await getAgentHistory('architect_agent', 3);
const contexto = historico.map(h => h.decision).join('; ');
```

## Métricas e Monitoramento

### Métricas de Performance
- **Taxa de Cache Hit**: Eficiência do cache
- **Tempo Médio de Resposta**: Performance das queries
- **Uso de Memória**: Overhead do sistema
- **Taxa de Sucesso**: Decisões bem-sucedidas

### Monitoramento em Tempo Real
```javascript
const cacheStats = swarmMemory.getCacheStats();
console.log(`Cache: ${cacheStats.size}/${cacheStats.maxSize}`);
```

## Testes e Validação

### Suite de Testes Completa
```bash
node scripts/test_memory_system.js
```

### Cobertura de Testes
- ✅ Armazenamento de decisões
- ✅ Busca de decisões similares
- ✅ Histórico de agentes
- ✅ Busca de conhecimento
- ✅ Estatísticas de agentes
- ✅ Sistema de cache
- ✅ Limpeza de cache

## Configuração

### Variáveis de Ambiente
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
```

### Configuração de Cache
```javascript
// Valores padrão (podem ser alterados)
cacheTimeout: 5 * 60 * 1000, // 5 minutos
maxCacheSize: 100 // entradas
```

## Próximas Evoluções

### Melhorias Planejadas
1. **Embeddings Contextuais**: Usar embeddings reais em vez de vetores zero
2. **Busca Híbrida**: Combinar busca semântica com filtros estruturados
3. **Compressão de Dados**: Reduzir tamanho do armazenamento
4. **Sincronização Distribuída**: Suporte a múltiplas instâncias
5. **Machine Learning**: Recomendações baseadas em padrões

### Integrações Futuras
- **Neo4j**: Para relacionamentos complexos entre decisões
- **Redis**: Para cache distribuído de alta performance
- **Elasticsearch**: Para busca full-text avançada

## Troubleshooting

### Problemas Comuns

#### Erro de Conexão com Supabase
```
Verifique SUPABASE_URL e SUPABASE_ANON_KEY
Confirme que as tabelas existem no banco
```

#### Cache Não Funcionando
```
Verifique cacheTimeout e maxCacheSize
Confirme que invalidateAgentCache está sendo chamado
```

#### Queries Lentas
```
Adicione índices nas colunas de busca
Aumente ivfflat.probes no PostgreSQL
Considere particionamento de tabelas grandes
```

## Conclusão

O Sistema de Memória Compartilhada é fundamental para a inteligência coletiva do swarm, permitindo que agentes aprendam, compartilhem conhecimento e tomem decisões cada vez mais inteligentes. Sua integração perfeita com o Protocolo L.L.B. garante evolução contínua e auto-aprendizado.








