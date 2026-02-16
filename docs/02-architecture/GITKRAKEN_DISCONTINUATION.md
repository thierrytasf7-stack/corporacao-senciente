# Descontinuação do GitKraken

## Visão Geral

O GitKraken foi **descontinuado** e substituído pelo **Protocolo L.L.B. (ByteRover)** - a interface nervosa com código da Corporação Senciente 7.0.

## Data de Descontinuação

**2025-01-XX** - GitKraken não é mais usado para visualização de Git e gestão de commits.

## Substituição: ByteRover

O **ByteRover** substitui completamente o GitKraken fornecendo:

- **Visualizar Mudanças**: `mapVisualImpact()` - substitui visualização de diffs
- **Timeline Evolutiva**: `getEvolutionTimeline()` - substitui timeline de commits
- **Injetar Contexto**: `injectContext()` - substitui contexto de código
- **Commits com Memória**: `commitWithMemory()` - substitui commits inteligentes

## Git Nativo Mantido

**Git nativo** continua sendo usado para:
- Commits básicos
- Branches
- Merges
- Operações Git padrão

**Git issues e docs** são mantidos apenas como:
- Documentação oficial (não gestão de contexto)
- Referência histórica
- Comunicação externa

## Migração de Funcionalidades

### Visualizações GitKraken → ByteRover

Todas as visualizações do GitKraken são substituídas pelo ByteRover:

1. **Timeline de Commits**: `byterover.getEvolutionTimeline()`
2. **Visualização de Mudanças**: `byterover.mapVisualImpact()`
3. **Contexto de Código**: `byterover.injectContext()`

### Como Usar

```javascript
import { getByteRover } from './scripts/memory/byterover.js';

const byterover = getByteRover();

// Timeline evolutiva (substitui GitKraken)
const timeline = await byterover.getEvolutionTimeline(20);

// Visualizar impacto (substitui GitKraken)
const impact = await byterover.mapVisualImpact({
    type: 'create',
    files: [{ path: 'new_feature.js' }]
});
```

## Remoção de Dependências

### GitKraken MCP

O GitKraken MCP foi removido e substituído por:

1. **Git Nativo**: Para operações Git básicas
2. **ByteRover**: Para visualização e contexto
3. **ByteRover Cipher** (futuro): Para funcionalidades avançadas

### Código Atualizado

Todas as referências a GitKraken foram removidas ou substituídas:

- ❌ `gitkraken-mcp` → ✅ `byterover` ou `git nativo`
- ❌ Visualizações GitKraken → ✅ `byterover.mapVisualImpact()`
- ❌ Timeline GitKraken → ✅ `byterover.getEvolutionTimeline()`

## Commits Inteligentes

Commits agora usam Protocolo L.L.B.:

```javascript
import { getLLBProtocol } from './scripts/memory/llb_protocol.js';

const protocol = getLLBProtocol();

// Commit com memória (substitui GitKraken)
await protocol.commitWithMemory(
    'feat: Adicionar nova feature',
    { updateState: true }, // Atualizar Letta
    { storeWisdom: true }  // Armazenar no LangMem
);
```

## Referências

- **ByteRover**: `docs/02-architecture/BYTEROVER.md`
- **Protocolo L.L.B.**: `docs/02-architecture/LLB_PROTOCOL.md`
- **Commits Inteligentes**: `docs/02-architecture/INTELLIGENT_GIT_COMMITS.md` (quando criado)

---

**Última Atualização**: 2025-01-XX
**Status**: GitKraken descontinuado, ByteRover em uso


