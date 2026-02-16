# Descontinuação do Jira

## Visão Geral

O Jira foi **descontinuado** e substituído pelo **Protocolo L.L.B. (Letta)** - o gerenciador de estado e fluxo da Corporação Senciente 7.0.

## Data de Descontinuação

**2025-01-XX** - Jira não é mais usado para gestão de tasks e estado do sistema.

## Substituição: Letta

O **Letta** substitui completamente o Jira fornecendo:

- **Estado de Evolução**: `getCurrentState()` - substitui consulta de issues
- **Próximos Passos**: `getNextEvolutionStep()` - substitui sprint planning
- **Atualização de Estado**: `updateState()` - substitui atualização de issues
- **Registro de Bloqueios**: `registerBlockage()` - substitui blockers
- **Histórico**: `getEvolutionHistory()` - substitui histórico de issues

## Migração de Dados

### Issues do Jira → Tasks no Letta

Todas as issues ativas do Jira devem ser migradas para o Letta:

1. **Script de Migração**: `scripts/memory/migrate_jira_to_letta.js`
2. **Formato**: Issues são convertidas para `task_context` no Supabase
3. **Mapeamento de Status**:
   - `To Do` → `planning`
   - `In Progress` → `coding`
   - `In Review` → `review`
   - `Done` → `done`
   - `Blocked` → `blocked`

### Como Migrar

```bash
# 1. Buscar issues do Jira (usar API REST)
# 2. Executar script de migração
node scripts/memory/migrate_jira_to_letta.js

# 3. Validar migração
# Verificar task_context no Supabase
```

## Aviso de Descontinuação no Jira

### Issue de Descontinuação

**Título**: 🚨 DESCONTINUAÇÃO: Jira substituído por Protocolo L.L.B. (Letta)

**Descrição**:
```
Este projeto migrou para o Protocolo L.L.B. (LangMem, Letta, ByteRover).

O Jira foi substituído pelo Letta - gerenciador de estado e fluxo.

📚 Documentação:
- Letta: docs/02-architecture/LETTA.md
- Protocolo L.L.B.: docs/02-architecture/LLB_PROTOCOL.md
- Guia de Migração: docs/02-architecture/LLB_MIGRATION.md

🔄 Como Migrar Tasks:
1. Tasks ativas foram migradas automaticamente para Letta
2. Novas tasks devem ser criadas via Protocolo L.L.B.
3. Estado atual: Consultar via Letta.getCurrentState()

📅 Data de Descontinuação: 2025-01-XX

⚠️ Este Jira não será mais atualizado. Use o Protocolo L.L.B. para gestão de estado.
```

### Comentário em Issues Ativas

Adicionar comentário padrão em todas as issues ativas:

```
🚨 Esta issue foi migrada para o Protocolo L.L.B. (Letta).

Para consultar o estado atual desta task:
- Use: Letta.getCurrentState()
- Ou: GET /api/llb/letta/state

Esta issue no Jira não será mais atualizada.
```

## Script de Aviso (Manual)

Para adicionar avisos no Jira, use o script:

```javascript
// scripts/memory/add_jira_discontinuation_notice.js
// (Criar se necessário)

import { fetchJiraIssues, updateJiraIssue, createJiraIssue } from '../_archive/jira_rest_api.js';

async function addDiscontinuationNotice() {
    // 1. Criar issue de descontinuação
    const discontinuationIssue = await createJiraIssue({
        project: 'PROJ',
        summary: '🚨 DESCONTINUAÇÃO: Jira substituído por Protocolo L.L.B. (Letta)',
        description: '...', // Ver template acima
        issuetype: 'Task'
    });

    // 2. Buscar todas issues ativas
    const activeIssues = await fetchJiraIssues({ status: ['To Do', 'In Progress', 'In Review'] });

    // 3. Adicionar comentário em cada issue
    for (const issue of activeIssues) {
        await updateJiraIssue(issue.key, {
            comment: {
                body: '🚨 Esta issue foi migrada para o Protocolo L.L.B. (Letta)...'
            }
        });
    }
}
```

## Referências

- **Letta**: `docs/02-architecture/LETTA.md`
- **Protocolo L.L.B.**: `docs/02-architecture/LLB_PROTOCOL.md`
- **Guia de Migração**: `docs/02-architecture/LLB_MIGRATION.md`
- **Script de Migração**: `scripts/memory/migrate_jira_to_letta.js`

---

**Última Atualização**: 2025-01-XX
**Status**: Jira descontinuado, migração para Letta em progresso


