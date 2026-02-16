# Auto-Percepção (Self-Awareness)

## Visão Geral

Sistema que permite ao coordenador entender seu próprio estado, refletir sobre decisões e auto-observar continuamente.

## Componentes

### 1. Monitoramento de Saúde

```javascript
import { monitorHealth } from './scripts/orchestrator/self_awareness.js';

const health = await monitorHealth();
// {
//   status: 'healthy' | 'degraded' | 'unhealthy',
//   checks: {
//     supabase: 'healthy',
//     instances: { status: 'healthy', count: 3 },
//     catalog: { status: 'healthy', components: 10 },
//   }
// }
```

### 2. Monitoramento de Performance

```javascript
import { monitorPerformance } from './scripts/orchestrator/self_awareness.js';

const performance = await monitorPerformance();
// {
//   metrics: {
//     globalMemory: { total: 150, shared: 45 },
//     instances: { total: 3, active: 2 },
//     catalog: { totalComponents: 10, mostUsed: [...] },
//   }
// }
```

### 3. Metacognição (Reflexão sobre Decisões)

```javascript
import { reflectOnDecisions } from './scripts/orchestrator/self_awareness.js';

const reflection = await reflectOnDecisions([
  { decision: '...', confidence: 0.8 },
  { decision: '...', confidence: 0.9 },
]);
// {
//   patterns: [...],
//   insights: [...],
// }
```

### 4. Auto-Observação Completa

```javascript
import { performSelfObservation } from './scripts/orchestrator/self_awareness.js';

const observation = await performSelfObservation();
// Combina health + performance + reflection
```

## Integração com Coordenador

O coordenador executa auto-observação automaticamente em cada ciclo:

```javascript
// Em core.js, durante runCoordinationCycle()
const selfObservation = await performSelfObservation();
```

## Estado Interno

O sistema mantém estado de auto-percepção:

```javascript
import { getSelfAwarenessState } from './scripts/orchestrator/self_awareness.js';

const state = getSelfAwarenessState();
// {
//   health: 'healthy',
//   performance: {...},
//   decisions: [...],
//   reflections: [...],
//   lastCheck: '2025-01-01T00:00:00Z',
// }
```

## Próximos Passos

Ver também:
- [MEMORIA_EPISODICA.md](MEMORIA_EPISODICA.md) - Memória episódica avançada
- [ROBUSTIZACAO_SENCIENTE.md](ROBUSTIZACAO_SENCIENTE.md) - Outras capacidades sencientes

---

**Referências:**
- [ORQUESTRADOR_CENTRAL.md](ORQUESTRADOR_CENTRAL.md)

























