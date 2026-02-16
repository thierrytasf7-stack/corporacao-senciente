# Letta - A Consciência

## Visão Geral

Letta é o gerenciador de estado e fluxo que substitui Jira. Mantém rastro de "quem somos", "onde paramos" e "qual o próximo passo evolutivo".

## Funcionalidades

### 1. Gerenciamento de Estado

Letta mantém estado atual de evolução:

- **Fase Atual**: planning, coding, review, execution
- **Última Tarefa**: Última tarefa executada
- **Próximos Passos**: Lista de próximas ações
- **Bloqueios**: Tasks bloqueadas e razões

### 2. Histórico de Evolução

Mantém histórico de evolução do sistema:

- Tasks concluídas
- Timeline de progresso
- Padrões de evolução

### 3. Detecção de Bloqueios

Identifica e registra bloqueios:

- Tasks bloqueadas explicitamente
- Tasks sem progresso há muito tempo
- Dependências não resolvidas

## Uso

### Exemplo Básico

```javascript
import { getLetta } from './memory/letta.js';

const letta = getLetta();

// Obter estado atual
const state = await letta.getCurrentState();
console.log('Fase atual:', state.current_phase);
console.log('Próximos passos:', state.next_steps);

// Obter próximo passo evolutivo
const nextStep = await letta.getNextEvolutionStep();
console.log('Próximo passo:', nextStep);

// Atualizar estado após tarefa
await letta.updateState('Implementar feature X', 'done', {
    files_modified: ['file1.js', 'file2.js']
});

// Registrar bloqueio
await letta.registerBlockage('Task Y', 'Dependência não resolvida');
```

## Métodos

### `getCurrentState()`

Retorna estado atual de evolução.

**Retorna:** `Promise<object>` - Estado atual

**Estrutura:**
```javascript
{
  current_phase: "coding",
  last_task: { ... },
  next_steps: [
    {
      action: "execute_task",
      description: "...",
      priority: "high",
      estimated_effort: "high"
    }
  ],
  blockages: [
    {
      task: "...",
      reason: "...",
      timestamp: "..."
    }
  ],
  evolution_history: [ ... ],
  timestamp: "..."
}
```

### `getNextEvolutionStep()`

Retorna próximo passo evolutivo.

**Retorna:** `Promise<object>` - Próximo passo

### `updateState(task, status, metadata)`

Atualiza estado após tarefa.

**Parâmetros:**
- `task` (string): Descrição da tarefa
- `status` (string): Status (planning, coding, review, done, failed, blocked)
- `metadata` (object): Metadados adicionais

**Retorna:** `Promise<boolean>` - Sucesso

### `registerBlockage(task, reason)`

Registra bloqueio na memória de curto prazo.

**Parâmetros:**
- `task` (string): Tarefa bloqueada
- `reason` (string): Razão do bloqueio

**Retorna:** `Promise<boolean>` - Sucesso

### `getEvolutionHistory(limit)`

Retorna histórico de evolução.

**Parâmetros:**
- `limit` (number): Limite de resultados

**Retorna:** `Promise<array>` - Histórico

## Integração com Supabase

Letta usa a tabela `task_context` do Supabase:

- **task_description**: Descrição da tarefa
- **requirements_vector**: Embedding vetorial
- **status**: Status atual (planning, coding, review, done, blocked)
- **updated_at**: Última atualização

## Cache

Letta mantém cache do estado atual:

- Timeout: 5 minutos
- Invalidação automática após atualizações

## Substituição do Jira

Letta substitui Jira fornecendo:

- **Estado de Tasks**: Via `getCurrentState()`
- **Próximos Passos**: Via `getNextEvolutionStep()`
- **Registro de Bloqueios**: Via `registerBlockage()`
- **Histórico**: Via `getEvolutionHistory()`

---

**Última Atualização**: 2025-01-XX
**Status**: Implementado, integrado com Supabase



