# Interface de Status L.L.B.

## Visão Geral

A Interface de Status L.L.B. fornece visibilidade sobre o estado das três camadas do Protocolo L.L.B. (LangMem, Letta, ByteRover) através de endpoints de API e componentes de frontend.

## Endpoints da API

### `GET /api/llb/status`

Retorna status geral do Protocolo L.L.B.

**Resposta:**
```json
{
  "langmem": {
    "connected": true,
    "lastWisdom": {
      "content": "...",
      "category": "architecture",
      "timestamp": "2025-01-XX..."
    },
    "totalWisdom": 3
  },
  "letta": {
    "connected": true,
    "currentPhase": "coding",
    "nextStep": {
      "action": "execute_task",
      "description": "...",
      "priority": "high"
    },
    "blockages": 0,
    "pendingTasks": 2
  },
  "byterover": {
    "connected": true,
    "lastCommit": {
      "hash": "abc123",
      "message": "feat: ...",
      "date": "2025-01-XX",
      "type": "feature"
    },
    "recentCommits": 5
  },
  "protocol": {
    "version": "1.0.0",
    "status": "operational"
  },
  "timestamp": "2025-01-XX..."
}
```

### `GET /api/llb/letta/state`

Retorna estado detalhado do Letta.

**Parâmetros de Query:**
- Nenhum

**Resposta:**
```json
{
  "state": {
    "current_phase": "coding",
    "last_task": { ... },
    "next_steps": [ ... ],
    "blockages": [ ... ],
    "evolution_history": [ ... ]
  },
  "nextStep": { ... },
  "history": [ ... ],
  "timestamp": "2025-01-XX..."
}
```

### `GET /api/llb/langmem/wisdom`

Retorna sabedoria recente do LangMem.

**Parâmetros de Query:**
- `category` (opcional): Filtrar por categoria (architecture, business_rules, patterns)
- `limit` (opcional): Limite de resultados (padrão: 10)
- `query` (opcional): Query de busca

**Resposta:**
```json
{
  "wisdom": [
    {
      "content": "...",
      "category": "architecture",
      "similarity": 0.95
    }
  ],
  "total": 10,
  "category": "architecture",
  "query": "",
  "timestamp": "2025-01-XX..."
}
```

### `GET /api/llb/byterover/timeline`

Retorna timeline evolutiva do ByteRover.

**Parâmetros de Query:**
- `limit` (opcional): Limite de commits (padrão: 20)

**Resposta:**
```json
{
  "timeline": [
    {
      "hash": "abc123",
      "author": "User",
      "date": "2025-01-XX",
      "message": "feat: ...",
      "type": "feature"
    }
  ],
  "success": true,
  "timestamp": "2025-01-XX..."
}
```

## Componente Frontend (Futuro)

### `LLBStatus.jsx`

Componente React para exibir status do Protocolo L.L.B.

**Funcionalidades:**
- Status de conexão com cada camada
- Estado atual de evolução (Letta)
- Última sabedoria armazenada (LangMem)
- Última ação do ByteRover
- Indicadores visuais de saúde

**Uso:**
```jsx
import LLBStatus from './components/LLBStatus';

function Dashboard() {
  return (
    <div>
      <LLBStatus />
    </div>
  );
}
```

## Integração com Dashboard

A Interface de Status L.L.B. pode ser integrada ao dashboard principal:

1. **Widget de Status**: Mostrar status geral das três camadas
2. **Painel de Evolução**: Mostrar estado atual e próximos passos (Letta)
3. **Sabedoria Recente**: Mostrar últimas decisões arquiteturais (LangMem)
4. **Timeline Evolutiva**: Mostrar histórico de commits (ByteRover)

## Monitoramento

### Métricas Disponíveis

- **LangMem**:
  - Total de sabedoria armazenada
  - Última sabedoria adicionada
  - Taxa de consultas

- **Letta**:
  - Fase atual de evolução
  - Número de tasks pendentes
  - Número de bloqueios
  - Próximo passo evolutivo

- **ByteRover**:
  - Último commit
  - Número de commits recentes
  - Tipos de commits (feature, fix, refactor)

### Alertas

O sistema pode gerar alertas quando:
- Alguma camada está desconectada
- Há muitos bloqueios no Letta
- Não há commits recentes no ByteRover
- LangMem não tem sabedoria recente

## Exemplo de Uso

### JavaScript/Node.js

```javascript
// Obter status geral
const response = await fetch('http://localhost:3001/api/llb/status');
const status = await response.json();

console.log('LangMem:', status.langmem.connected ? '✅' : '❌');
console.log('Letta:', status.letta.currentPhase);
console.log('ByteRover:', status.byterover.recentCommits, 'commits');
```

### cURL

```bash
# Status geral
curl http://localhost:3001/api/llb/status

# Estado do Letta
curl http://localhost:3001/api/llb/letta/state

# Sabedoria do LangMem
curl "http://localhost:3001/api/llb/langmem/wisdom?category=architecture&limit=5"

# Timeline do ByteRover
curl "http://localhost:3001/api/llb/byterover/timeline?limit=10"
```

---

**Última Atualização**: 2025-01-XX
**Status**: Endpoints implementados, componente frontend pendente


