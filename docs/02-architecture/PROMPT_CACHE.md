# Sistema de Cache de Prompts

Documentação do sistema de cache inteligente para redução de latência e custos na Corporação Senciente 7.0.

## Visão Geral

O sistema de cache de prompts reduz significativamente a latência e os custos de geração de prompts, armazenando prompts eficazes e permitindo busca por similaridade. Isso é crucial para manter a eficiência em um sistema multi-agente com alto volume de interações.

## Como Funciona

### 1. Armazenamento Inteligente

O cache armazena apenas prompts com alta taxa de sucesso (>80% por padrão):

```javascript
const cache = getPromptCache();

// Armazenar prompt eficaz
cache.store('Create React component', { framework: 'react' }, generatedPrompt, {
    successRate: 0.95,
    executionTime: 1200,
    source: 'agent.generatePrompt'
});
```

### 2. Recuperação por Hash Exato

Busca primeiro por hash exato do prompt + contexto:

```javascript
const cached = cache.get('Create React component', { framework: 'react' });
if (cached) {
    // Usar prompt do cache - economia de ~1-2 segundos e custos de LLM
    return cached.result;
}
```

### 3. Busca por Similaridade

Se não encontrar exato, busca prompts similares usando embeddings simplificados:

```javascript
const similar = cache.getSimilar('Build React component', { framework: 'react' });
if (similar && similar.similarity > 0.85) {
    // Usar prompt similar - economia parcial
    return similar.result;
}
```

### 4. Expiração Automática

Entries expiram automaticamente (TTL padrão: 24 horas):

```javascript
// Cache antigo é automaticamente limpo
const expired = cache.get('Old prompt', {});
// retorna null se expirado
```

### 5. Limite de Tamanho

Cache tem limite máximo, removendo entradas menos acessadas (LRU):

```javascript
const cache = getPromptCache({ maxSize: 10000 }); // Máximo 10k entradas
// Automaticamente remove entradas antigas quando cheio
```

## Integração com Generators

### Agent Prompt Generator

```javascript
// Verifica cache antes de gerar
const cached = this.cache.get(cacheKey, { agentName, task, context });
if (cached) return cached.result;

// Gera novo prompt
const prompt = this.buildPrompt(agentName, agentConfig, task, context, agentHistory);

// Armazena no cache
this.cache.store(cacheKey, { agentName, task, context }, prompt, metadata);
```

### Brain Prompt Generator

```javascript
// Mesmo padrão para Brain prompts
const cached = this.cache.get(cacheKey, { task, context });
if (cached) return cached.result;

// Busca contexto L.L.B., memória, routing...
const prompt = this.buildPrompt(taskDescription, brainContext, llbContext);

// Armazena resultado complexo
this.cache.store(cacheKey, { task, context }, prompt, {
    successRate: 0.85,
    llbContext: true
});
```

## Configuração

### Opções do Cache

```javascript
const cache = getPromptCache({
    maxSize: 10000,        // Máximo de entradas (padrão: 10000)
    ttl: 86400000,         // TTL em ms (padrão: 24h)
    minSuccessRate: 0.8,   // Taxa mínima de sucesso (padrão: 0.8)
    similarityThreshold: 0.85, // Threshold de similaridade (padrão: 0.85)
    persistencePath: './data/prompt_cache.json' // Caminho de persistência
});
```

### Persistência

Cache pode ser persistido em disco para sobreviver restarts:

```javascript
// Carregar do disco
await cache.load();

// Persistir em disco
await cache.persist();
```

## Estatísticas e Monitoramento

### Métricas Disponíveis

```javascript
const stats = cache.getStats();
// {
//   size: 1250,           // Entradas atuais
//   maxSize: 10000,       // Limite máximo
//   hits: 15420,          // Cache hits exatos
//   misses: 2340,         // Cache misses
//   similarityHits: 890,  // Hits por similaridade
//   hitRate: 87.3,        // Taxa de hit total (%)
//   expired: 45           // Entradas expiradas
// }
```

### Limpeza Automática

```javascript
// Limpar entradas expiradas
cache.cleanupExpired();

// Limpar todo cache
cache.clear();
```

## Otimizações de Performance

### 1. Redução de Latência

- **Cache hit**: ~0ms (vs 1-3s para LLM)
- **Similaridade**: ~50-100ms (vs 1-3s para LLM)
- **Taxa alvo**: >80% hit rate

### 2. Redução de Custos

- **LLM calls evitados**: Cada cache hit economiza custo de API
- **Estimativa**: 60-80% redução de custos com hit rate >80%

### 3. Estratégias de Cache

- **Hash-based**: Para prompts idênticos
- **Similarity-based**: Para prompts similares
- **Quality-filtered**: Apenas prompts de alta qualidade
- **Time-based**: Expiração automática

## Limitações

- **Embeddings simplificados**: Implementação básica para MVP
- **Memória**: Limitado pelo tamanho máximo configurado
- **Persistência**: Não thread-safe entre processos
- **Similaridade**: Baseada em implementação simplificada

## Testes

Execute os testes do sistema de cache:

```bash
node scripts/test_prompt_cache.js
```

## Próximas Melhorias

1. **Embeddings reais**: Integrar OpenAI embeddings ou modelos locais
2. **Clustering**: Agrupar prompts similares para melhor cache
3. **Predictive caching**: Cache baseado em padrões de uso
4. **Distributed cache**: Redis para cache distribuído
5. **Analytics avançado**: Métricas detalhadas de performance

## Referências

- **PromptCache**: `scripts/swarm/prompt_cache.js`
- **Agent Prompt Generator**: `scripts/swarm/agent_prompt_generator.js`
- **Brain Prompt Generator**: `scripts/swarm/brain_prompt_generator.js`

---

**Última Atualização**: 2025-01-XX
**Status**: ✅ Implementado e Integrado

