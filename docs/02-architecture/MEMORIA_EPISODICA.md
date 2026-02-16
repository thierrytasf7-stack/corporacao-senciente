# Memória Episódica Avançada

## Visão Geral

Sistema de memória episódica que lembra eventos específicos: quando, onde, o que aconteceu, com contexto e associações.

## Schema

```sql
create table episodic_memory (
  id bigserial primary key,
  event_description text not null,
  embedding vector(384) not null,
  timestamp timestamptz not null,
  context jsonb,  -- onde, quando, quem, condições
  outcome text,   -- resultado do evento
  related_events bigint[],  -- IDs de eventos relacionados
  instance_id text,  -- Qual empresa
  category text,  -- decision | action | learning | error | success
  metadata jsonb,
  created_at timestamptz default now()
);
```

## Uso

### Adicionar Evento Episódico

```javascript
import { addEpisodicMemory } from './scripts/orchestrator/episodic_memory.js';

await addEpisodicMemory({
  eventDescription: 'Implementação de cache Redis melhorou performance',
  context: {
    where: 'empresa-a',
    when: '2025-01-01T10:00:00Z',
    who: 'dev-agent',
    conditions: { load: 'high', users: 1000 },
  },
  outcome: 'success',
  instanceId: 'empresa-a',
  category: 'success',
  metadata: { performanceGain: '50%' },
});
```

### Buscar Eventos Similares

```javascript
import { searchEpisodicMemory } from './scripts/orchestrator/episodic_memory.js';

const events = await searchEpisodicMemory('implementação de cache', {
  matchCount: 10,
  filterInstance: 'empresa-a',
  sinceTimestamp: '2025-01-01T00:00:00Z',
});
```

### Narrativa Temporal

Obter sequência de eventos relacionados (causa-efeito):

```sql
SELECT * FROM get_episodic_narrative(event_id := 123, max_events := 10);
```

## Integração

### Com Evolution Loop

```javascript
// Após cada iteração
await addEpisodicMemory({
  eventDescription: `Iteração ${iteration}: ${objetivo.summary}`,
  context: {
    iteration,
    objetivo: objetivo.summary,
    modo: mode,
  },
  outcome: validacao.success ? 'success' : 'error',
  relatedEvents: [previousEventId],
  instanceId: instanceName,
  category: 'action',
});
```

### Com Self-Awareness

```javascript
// Durante auto-observação
await addEpisodicMemory({
  eventDescription: 'Auto-observação detectou degradação',
  context: {
    health: health.status,
    checks: health.checks,
  },
  outcome: 'alert',
  category: 'learning',
});
```

## Categorias

- **decision** - Decisões tomadas
- **action** - Ações executadas
- **learning** - Aprendizados
- **error** - Erros encontrados
- **success** - Sucessos alcançados

## Narrativa e Associações

Eventos podem ser associados através de `related_events`:

```
Evento A (decisão)
  ↓
Evento B (ação baseada em A)
  ↓
Evento C (resultado de B)
  ↓
Evento D (aprendizado de C)
```

A função `get_episodic_narrative()` retorna essa cadeia.

## Busca Vetorial

Eventos são buscados por similaridade vetorial, permitindo encontrar:

- Eventos similares que aconteceram antes
- Padrões de causa-efeito
- Soluções para problemas similares

---

**Referências:**
- [AUTO_PERCECAO.md](AUTO_PERCECAO.md)
- [ROBUSTIZACAO_SENCIENTE.md](ROBUSTIZACAO_SENCIENTE.md)

























