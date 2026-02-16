# Memória Vetorial Global - Coordenador

## Visão Geral

A **Memória Vetorial Global** é a memória agregada do coordenador central, contendo aprendizados de todas as empresas gerenciadas.

## Schema

```sql
create table orchestrator_global_memory (
  id bigserial primary key,
  content text not null,
  embedding vector(384) not null,
  source_instance text,  -- Qual empresa originou
  category text not null,  -- pattern | solution | component | insight | best_practice
  shared boolean default false,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## Categorias

- **pattern** - Padrões identificados
- **solution** - Soluções que funcionaram
- **component** - Componentes/microservices
- **insight** - Insights gerais
- **best_practice** - Melhores práticas

## Uso

### Adicionar Memória

```javascript
import { addGlobalMemory } from './scripts/orchestrator/global_memory.js';

await addGlobalMemory({
  content: 'Solução de cache que melhorou performance em 50%...',
  sourceInstance: 'empresa-a',
  category: 'solution',
  shared: true, // Disponível para outras empresas
  metadata: {
    performanceGain: '50%',
    technology: 'redis',
  },
});
```

### Buscar Memória

```javascript
import { searchGlobalMemory } from './scripts/orchestrator/global_memory.js';

// Busca geral
const results = await searchGlobalMemory('autenticação segura', {
  matchCount: 5,
});

// Busca filtrada
const solutions = await searchGlobalMemory('cache', {
  matchCount: 10,
  category: 'solution',
  onlyShared: true,
});
```

### SQL Direto

```sql
-- Buscar usando função SQL
SELECT * FROM match_global_memory(
  query_embedding := '[384d vector]',
  match_count := 5,
  filter_category := 'solution',
  filter_source := 'empresa-a',
  only_shared := true
);
```

## Agregação de Aprendizados

### De Uma Empresa

```javascript
import { aggregateInstanceLearnings } from './scripts/orchestrator/global_memory.js';

const learnings = [
  {
    content: 'Solução X funcionou bem',
    category: 'solution',
    shared: true,
  },
  {
    content: 'Padrão Y identificado',
    category: 'pattern',
    shared: false,
  },
];

await aggregateInstanceLearnings('empresa-a', learnings);
```

### Sugestões de Compartilhamento

```javascript
import { suggestShareableFromMemory } from './scripts/orchestrator/global_memory.js';

const suggestions = await suggestShareableFromMemory('empresa-b');
// Retorna insights e padrões compartilháveis
```

## Estatísticas

```javascript
import { getGlobalMemoryStats } from './scripts/orchestrator/global_memory.js';

const stats = getGlobalMemoryStats();
// {
//   total: 150,
//   shared: 45,
//   byCategory: { solution: 50, pattern: 30, ... },
//   bySource: { 'empresa-a': 60, 'empresa-b': 40, ... }
// }
```

## Marcar como Compartilhável

```javascript
import { markAsShared } from './scripts/orchestrator/global_memory.js';

// Tornar memória compartilhável
await markAsShared(memoryId, true);

// Remover do compartilhamento
await markAsShared(memoryId, false);
```

## Integração com Evolution Loop

Após cada iteração de evolução, agregar aprendizado:

```javascript
import { addGlobalMemory } from './scripts/orchestrator/global_memory.js';

// No evolution_loop.js, após validação
await addGlobalMemory({
  content: `
    Iteração ${iteration} - ${objetivo.summary}
    Decisão: ${decisao.sintese}
    Resultado: ${validacao.success ? 'Sucesso' : 'Falha'}
    Aprendizado: ${validacao.message}
  `,
  sourceInstance: instanceName,
  category: 'insight',
  shared: validacao.success, // Compartilhar apenas sucessos
});
```

## Segurança

### RLS (Row Level Security)

- **service_role**: Acesso completo
- **anon/auth**: Apenas itens com `shared = true`

```sql
-- Apenas service_role pode inserir/atualizar
-- Apenas itens compartilhados são públicos
```

## Boas Práticas

1. **Compartilhar sucessos** - Marcar como `shared = true` apenas quando realmente útil
2. **Categorizar corretamente** - Facilitar buscas futuras
3. **Incluir contexto** - Metadados ajudam na busca
4. **Rastrear origem** - Sempre incluir `sourceInstance`
5. **Revisar periodicamente** - Limpar memórias antigas/irrelevantes

---

**Referências:**
- [ORQUESTRADOR_CENTRAL.md](ORQUESTRADOR_CENTRAL.md)
- [ARQUITETURA_MULTI_INSTANCIA.md](ARQUITETURA_MULTI_INSTANCIA.md)

























