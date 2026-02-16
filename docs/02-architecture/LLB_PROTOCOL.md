# Protocolo L.L.B. - Orquestrador

## Visão Geral

O Protocolo L.L.B. orquestra as três camadas (LangMem, Letta, ByteRover) e fornece abstrações que substituem Jira, Confluence e GitKraken.

## Arquitetura

### Três Camadas

1. **LangMem (O Arquivo de Sabedoria)**: Memória de longo prazo, substitui Confluence
2. **Letta (A Consciência)**: Gerenciador de estado e fluxo, substitui Jira
3. **ByteRover (A Ação)**: Interface nervosa com código, substitui GitKraken

## Abstrações

### Abstração do Jira (via Letta)

#### `startSession()`
Consulta Letta sobre "Estado de Evolução Atual" ao iniciar sessão.

**Retorna:** `Promise<object>` - Estado atual e próximo passo

#### `endSession(task, result)`
Atualiza Letta com novo estado ao finalizar tarefa.

**Parâmetros:**
- `task` (string): Tarefa executada
- `result` (object): Resultado da execução

**Retorna:** `Promise<boolean>` - Sucesso

#### `registerFailure(task, error)`
Registra bloqueio na memória de curto prazo do Letta.

**Parâmetros:**
- `task` (string): Tarefa que falhou
- `error` (string|Error): Erro ou mensagem

**Retorna:** `Promise<boolean>` - Sucesso

### Abstração do Confluence (via LangMem)

#### `storePattern(pattern, context)`
Envia "Sinal de Sabedoria" para LangMem.

**Parâmetros:**
- `pattern` (string): Padrão descoberto
- `context` (object): Contexto do padrão

**Retorna:** `Promise<boolean>` - Sucesso

#### `checkDependencies(module)`
Verifica no LangMem se existe grafo de dependência antes de criar módulo.

**Parâmetros:**
- `module` (string): Nome do módulo

**Retorna:** `Promise<object>` - Validação de dependências

#### `storeArchitecture(decision, rationale, dependencies)`
Armazena decisão arquitetural no LangMem.

**Parâmetros:**
- `decision` (string): Decisão tomada
- `rationale` (string): Justificativa
- `dependencies` (object): Dependências relacionadas

**Retorna:** `Promise<boolean>` - Sucesso

### Abstração do GitKraken (via ByteRover)

#### `visualizeChanges(changes)`
Usa ByteRover para mapear impacto visual.

**Parâmetros:**
- `changes` (object): Mudanças a visualizar

**Retorna:** `Promise<object>` - Impacto mapeado

#### `commitWithMemory(message, letta_metadata, langmem_metadata)`
Commit com metadados de memória.

**Parâmetros:**
- `message` (string): Mensagem do commit
- `letta_metadata` (object): Metadados do Letta
- `langmem_metadata` (object): Metadados do LangMem

**Retorna:** `Promise<object>` - Resultado do commit

#### `getEvolutionTimeline(limit)`
Retorna timeline evolutiva.

**Parâmetros:**
- `limit` (number): Limite de commits

**Retorna:** `Promise<array>` - Timeline evolutiva

## Métodos Unificados

### `getFullContext(query)`
Busca contexto completo (L.L.B.).

**Parâmetros:**
- `query` (string): Query de busca

**Retorna:** `Promise<object>` - Contexto completo (wisdom, state, timeline)

### `updateAllLayers(task, result, changes)`
Atualiza todas as camadas após ação.

**Parâmetros:**
- `task` (string): Tarefa executada
- `result` (object): Resultado
- `changes` (object): Mudanças realizadas

**Retorna:** `Promise<boolean>` - Sucesso

## Uso

### Exemplo Básico

```javascript
import { getLLBProtocol } from './memory/llb_protocol.js';

const protocol = getLLBProtocol();

// Iniciar sessão (substitui consulta ao Jira)
const session = await protocol.startSession();
console.log('Estado atual:', session.state);
console.log('Próximo passo:', session.nextStep);

// Armazenar padrão (substitui Confluence)
await protocol.storePattern(
    'Padrão de autenticação JWT',
    { context: 'API REST' }
);

// Verificar dependências (substitui Confluence)
const validation = await protocol.checkDependencies('new_module');

// Visualizar mudanças (substitui GitKraken)
const impact = await protocol.visualizeChanges({
    type: 'create',
    files: [{ path: 'new_feature.js' }]
});

// Commit com memória (substitui GitKraken)
await protocol.commitWithMemory(
    'feat: Adicionar nova feature',
    { updateState: true },
    { storeWisdom: true }
);

// Finalizar sessão (substitui atualização no Jira)
await protocol.endSession('Implementar feature X', { success: true });
```

## Migração de Ferramentas

### Jira → Letta

| Jira | Letta |
|------|-------|
| Issues | Tasks em `task_context` |
| Status | Estado de evolução |
| Sprint Planning | `getNextEvolutionStep()` |
| Blockers | `registerBlockage()` |

### Confluence → LangMem

| Confluence | LangMem |
|------------|---------|
| Páginas de Arquitetura | `storeArchitecture()` |
| Padrões Técnicos | `storePattern()` |
| Grafos de Dependência | `checkDependencies()` |
| Busca | `getWisdom()` |

### GitKraken → ByteRover

| GitKraken | ByteRover |
|-----------|-----------|
| Visualização de Mudanças | `mapVisualImpact()` |
| Timeline | `getEvolutionTimeline()` |
| Contexto | `injectContext()` |
| Commits Inteligentes | `commitWithMemory()` |

---

**Última Atualização**: 2025-01-XX
**Status**: Implementado, pronto para substituir Jira/Confluence/GitKraken



