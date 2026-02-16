# LLB Executor - Executor que segue Protocolo L.L.B.

## Visão Geral

O LLB Executor implementa as diretrizes de execução do Protocolo L.L.B.:
- **Eficiência > Burocracia**: Documenta na memória enquanto coda
- **Latência Zero**: Cache de consultas frequentes
- **Auto-Correção**: Verifica consistência e sugere refatoração

## Diretrizes de Execução

### 1. Eficiência > Burocracia

- Documenta na memória enquanto coda (sem pedir permissão)
- Atualiza LangMem automaticamente quando padrão é descoberto
- Sincroniza com Letta e ByteRover automaticamente

### 2. Latência Zero

- Usa protocolo MCP do ByteRover para buscar contextos locais instantaneamente
- Cache de consultas frequentes ao LangMem e Letta
- Timeout de cache: 1 minuto

### 3. Auto-Correção

- Verifica se código conflita com LangMem antes de executar
- Sugere refatoração quando há inconsistência
- Interrompe execução se conflito for detectado

## Uso

### Exemplo Básico

```javascript
import { getLLBExecutor } from './memory/llb_executor.js';

const executor = getLLBExecutor();

// Executar ação seguindo Protocolo L.L.B.
const result = await executor.execute(
    {
        type: 'create_file',
        path: 'src/new_module.js',
        content: '// código...'
    },
    {
        agent: 'dev',
        brainContext: { ... }
    }
);

if (result.requiresRefactoring) {
    console.log('Refatoração necessária:', result.refactoring);
} else if (result.success) {
    console.log('Ação executada com sucesso');
}
```

## Métodos

### `execute(action, context)`

Executa ação seguindo Protocolo L.L.B.

**Parâmetros:**
- `action` (object): Ação a executar
- `context` (object): Contexto adicional

**Retorna:** `Promise<object>` - Resultado da execução

**Fluxo:**
1. Verifica consistência com LangMem
2. Busca contexto com cache (latência zero)
3. Executa ação
4. Atualiza memória automaticamente

### `checkConsistency(code, langmem_rules)`

Verifica se código conflita com LangMem.

**Parâmetros:**
- `code` (object|string): Código ou ação a verificar
- `langmem_rules` (object): Regras do LangMem (opcional)

**Retorna:** `Promise<object>` - Resultado da verificação

**Estrutura:**
```javascript
{
  valid: true,
  conflicts: [],
  warnings: [],
  langmem_rule: { ... }
}
```

### `suggestRefactoring(conflict, langmem_rule)`

Sugere refatoração quando há conflito.

**Parâmetros:**
- `conflict` (object): Conflito detectado
- `langmem_rule` (object): Regra do LangMem

**Retorna:** `Promise<object>` - Sugestão de refatoração

### `getContextWithCache(action, context)`

Busca contexto com cache (latência zero).

**Parâmetros:**
- `action` (object): Ação
- `context` (object): Contexto

**Retorna:** `Promise<object>` - Contexto completo

### `updateMemoryAutomatically(action, result, context)`

Atualiza memória automaticamente (eficiência > burocracia).

**Parâmetros:**
- `action` (object): Ação executada
- `result` (object): Resultado
- `context` (object): Contexto

**Retorna:** `Promise<boolean>` - Sucesso

## Integração com Executor Híbrido

O LLB Executor pode ser usado pelo Executor Híbrido Inteligente:

```javascript
import { getExecutor } from './swarm/executor.js';
import { getLLBExecutor } from './memory/llb_executor.js';

const executor = getExecutor();
const llbExecutor = getLLBExecutor();

// Executor híbrido decide modo de execução
// Se ação requer Protocolo L.L.B., usa LLB Executor
const result = await executor.executeAction(action, context);
```

## Cache

O LLB Executor mantém cache para latência zero:

- **Timeout**: 1 minuto
- **Tamanho máximo**: 50 entradas
- **Limpeza automática**: Mantém apenas entradas mais recentes

## Auto-Correção

Quando conflito é detectado:

1. Busca regra relevante no LangMem
2. Identifica conflito específico
3. Sugere refatoração detalhada
4. Retorna resultado com `requiresRefactoring: true`

---

**Última Atualização**: 2025-01-XX
**Status**: Implementado, integrado com Protocolo L.L.B.



