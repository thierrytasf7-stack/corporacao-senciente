# Commits Inteligentes com Protocolo L.L.B.

## Visão Geral

Commits inteligentes integram Git com o Protocolo L.L.B., adicionando metadados de memória (Letta, LangMem, ByteRover) a cada commit.

## Funcionalidades

### 1. Mensagem de Commit Inteligente

A mensagem de commit inclui automaticamente:

- **Contexto do Letta**: Fase atual de evolução
- **Impacto do ByteRover**: Arquivos afetados, breaking changes
- **Sabedoria do LangMem**: Sabedoria relacionada encontrada

### 2. Sincronização Automática

Cada commit é automaticamente sincronizado com:

- **Letta**: Atualiza estado de evolução
- **LangMem**: Armazena sabedoria se necessário
- **ByteRover**: Atualiza timeline evolutiva

### 3. Metadados L.L.B.

Commits incluem metadados do Protocolo L.L.B.:

- Task relacionada (do Letta)
- Arquivos modificados
- Sabedoria descoberta (do LangMem)
- Impacto visual (do ByteRover)

## Uso

### Script de Commit Inteligente

```bash
# Commit básico
node scripts/memory/intelligent_git_commit.js "feat: Adicionar nova feature"

# Commit com arquivos específicos
node scripts/memory/intelligent_git_commit.js "fix: Corrigir bug" --files=file1.js,file2.js

# Commit armazenando sabedoria no LangMem
node scripts/memory/intelligent_git_commit.js "refactor: Refatorar módulo" --store-wisdom
```

### Via Protocolo L.L.B.

```javascript
import { getLLBProtocol } from './scripts/memory/llb_protocol.js';

const protocol = getLLBProtocol();

// Commit com memória
await protocol.commitWithMemory(
    'feat: Adicionar nova feature',
    {
        updateState: true,  // Atualizar Letta
        task: 'Implementar feature X',
        files: ['file1.js', 'file2.js']
    },
    {
        storeWisdom: true,  // Armazenar no LangMem
        dependencies: null
    }
);
```

## Git Hooks (Futuro)

### Pre-Commit Hook

Validar que commit segue padrões L.L.B.:

```bash
#!/bin/sh
# hooks/pre-commit

# Validar mensagem de commit
# Sincronizar com Letta e LangMem
# Verificar consistência
```

### Post-Commit Hook

Atualizar ByteRover após commit:

```bash
#!/bin/sh
# hooks/post-commit

# Atualizar timeline evolutiva
# Sincronizar com memória
```

## Formato de Mensagem

### Exemplo de Mensagem Inteligente

```
feat: Adicionar autenticação JWT

[Letta] Fase: coding
[ByteRover] Arquivos: 3
[LangMem] Sabedoria relacionada: 2 item(s)
```

### Metadados L.L.B.

Metadados são armazenados via:

1. **Git Notes**: Metadados adicionais no commit
2. **Arquivo de Metadados**: `.llb-metadata.json` no commit
3. **Sincronização Automática**: Com Letta e LangMem

## Integração com Letta

Cada commit atualiza o Letta:

```javascript
// Automaticamente após commit
await letta.updateState(
    'Commit: feat: Adicionar autenticação JWT',
    'done',
    {
        commit_hash: 'abc123',
        files_modified: ['auth.js', 'routes.js']
    }
);
```

## Integração com LangMem

Se `storeWisdom: true`, commit armazena sabedoria:

```javascript
// Automaticamente após commit
await langmem.storeArchitecture(
    'feat: Adicionar autenticação JWT',
    'Implementação de autenticação JWT seguindo padrão arquitetural',
    dependencies
);
```

## Integração com ByteRover

Cada commit atualiza timeline evolutiva:

```javascript
// Automaticamente após commit
await byterover.syncWithMemory(
    commitHash,
    { updateState: true },
    { storeWisdom: true }
);
```

## Git Issues e Docs

**Git issues e docs** são mantidos apenas como:

- ✅ Documentação oficial
- ✅ Referência histórica
- ✅ Comunicação externa

**NÃO são usados para:**
- ❌ Gestão de contexto (usar Letta)
- ❌ Sabedoria arquitetural (usar LangMem)
- ❌ Timeline evolutiva (usar ByteRover)

## Exemplos

### Exemplo 1: Commit de Feature

```bash
node scripts/memory/intelligent_git_commit.js \
  "feat: Adicionar sistema de notificações" \
  --files=notifications.js,notifications.test.js \
  --store-wisdom
```

**Resultado:**
- Commit criado com mensagem inteligente
- Letta atualizado com nova task
- LangMem armazena padrão de notificações
- ByteRover atualiza timeline

### Exemplo 2: Commit de Fix

```bash
node scripts/memory/intelligent_git_commit.js \
  "fix: Corrigir bug de autenticação" \
  --files=auth.js
```

**Resultado:**
- Commit criado
- Letta atualizado
- ByteRover mapeia impacto

## Referências

- **ByteRover**: `docs/02-architecture/BYTEROVER.md`
- **Protocolo L.L.B.**: `docs/02-architecture/LLB_PROTOCOL.md`
- **Script**: `scripts/memory/intelligent_git_commit.js`

---

**Última Atualização**: 2025-01-XX
**Status**: Implementado, git hooks pendentes


