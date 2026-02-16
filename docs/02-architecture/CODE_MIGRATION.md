# Migração de Código: Jira/Confluence/GitKraken → Protocolo L.L.B.

## Visão Geral

Este documento descreve as mudanças necessárias no código para remover dependências de Jira, Confluence e GitKraken e migrar para o Protocolo L.L.B.

## Arquivos que Precisam de Atualização

### Scripts que Usam Jira

1. **`scripts/senciencia/context_awareness_protocol.js`**
   - ❌ Consulta Jira para issues
   - ✅ Substituir por: `letta.getCurrentState()`, `letta.getNextEvolutionStep()`

2. **`scripts/consolidacao/sincronizar_jira_confluence.js`**
   - ❌ Sincroniza com Jira
   - ✅ Marcar como descontinuado ou atualizar para usar Letta

3. **Scripts em `scripts/_archive/`**
   - ❌ Vários scripts antigos usam Jira
   - ✅ Manter em `_archive` (já descontinuados)

### Scripts que Usam Confluence

1. **`scripts/senciencia/context_awareness_protocol.js`**
   - ❌ Consulta Confluence para páginas
   - ✅ Substituir por: `langmem.getWisdom()`, `langmem.checkDependencies()`

2. **`scripts/consolidacao/sincronizar_jira_confluence.js`**
   - ❌ Sincroniza com Confluence
   - ✅ Marcar como descontinuado ou atualizar para usar LangMem

### Scripts que Usam GitKraken

1. **Referências no código**
   - ❌ Qualquer referência a GitKraken MCP
   - ✅ Substituir por: `byterover.getEvolutionTimeline()`, `byterover.mapVisualImpact()`

## Substituições de Código

### 1. Substituir Consultas a Jira

**Antes:**
```javascript
// Consultar issues do Jira
const issues = await jiraClient.getIssues({ project: 'PROJ' });
const activeIssues = issues.filter(i => i.status !== 'Done');
```

**Depois:**
```javascript
import { getLetta } from './scripts/memory/letta.js';

const letta = getLetta();
const state = await letta.getCurrentState();
const nextSteps = state.next_steps; // Substitui activeIssues
```

### 2. Substituir Consultas a Confluence

**Antes:**
```javascript
// Buscar páginas do Confluence
const pages = await confluenceClient.getPages({ space: 'ARCH' });
const architecturePages = pages.filter(p => p.space === 'Architecture');
```

**Depois:**
```javascript
import { getLangMem } from './scripts/memory/langmem.js';

const langmem = getLangMem();
const wisdom = await langmem.getWisdom('architecture', 'architecture');
// Substitui architecturePages
```

### 3. Substituir Consultas a GitKraken

**Antes:**
```javascript
// Timeline do GitKraken
const commits = await gitkrakenClient.getCommits({ limit: 20 });
```

**Depois:**
```javascript
import { getByteRover } from './scripts/memory/byterover.js';

const byterover = getByteRover();
const timeline = await byterover.getEvolutionTimeline(20);
// Substitui commits
```

## Atualização do Context Awareness Protocol

### Arquivo: `scripts/senciencia/context_awareness_protocol.js`

**Mudanças Necessárias:**

1. **Substituir consultas a Jira:**
   ```javascript
   // Antes
   this.jira.issues = await fetchJiraIssues();
   
   // Depois
   import { getLetta } from '../memory/letta.js';
   const letta = getLetta();
   const state = await letta.getCurrentState();
   this.letta = state;
   ```

2. **Substituir consultas a Confluence:**
   ```javascript
   // Antes
   this.confluence.paginas = await fetchConfluencePages();
   
   // Depois
   import { getLangMem } from '../memory/langmem.js';
   const langmem = getLangMem();
   const wisdom = await langmem.getWisdom('');
   this.langmem = wisdom;
   ```

3. **Substituir consultas a GitKraken:**
   ```javascript
   // Antes
   this.git.commits = await fetchGitKrakenCommits();
   
   // Depois
   import { getByteRover } from '../memory/byterover.js';
   const byterover = getByteRover();
   const timeline = await byterover.getEvolutionTimeline();
   this.byterover = timeline;
   ```

## Checklist de Migração

### Preparação
- [ ] Identificar todos os arquivos que usam Jira/Confluence/GitKraken
- [ ] Criar backup do código atual
- [ ] Documentar dependências

### Substituição
- [ ] Substituir consultas a Jira por Letta
- [ ] Substituir consultas a Confluence por LangMem
- [ ] Substituir consultas a GitKraken por ByteRover
- [ ] Atualizar imports e dependências

### Validação
- [ ] Testar que código não quebra
- [ ] Validar que funcionalidades antigas funcionam
- [ ] Verificar que novas funcionalidades L.L.B. funcionam

### Limpeza
- [ ] Remover imports não utilizados
- [ ] Remover dependências de pacotes Jira/Confluence (se houver)
- [ ] Atualizar documentação

## Scripts de Migração

### Scripts Criados

1. **`scripts/memory/migrate_jira_to_letta.js`**
   - Migra issues do Jira para Letta

2. **`scripts/memory/migrate_confluence_to_langmem.js`**
   - Migra páginas do Confluence para LangMem

3. **`scripts/memory/add_jira_discontinuation_notice.js`**
   - Adiciona avisos de descontinuação no Jira

4. **`scripts/memory/add_confluence_discontinuation_notice.js`**
   - Adiciona avisos de descontinuação no Confluence

5. **`scripts/memory/intelligent_git_commit.js`**
   - Commits inteligentes com Protocolo L.L.B.

## Referências

- **Letta**: `docs/02-architecture/LETTA.md`
- **LangMem**: `docs/02-architecture/LANGMEM.md`
- **ByteRover**: `docs/02-architecture/BYTEROVER.md`
- **Protocolo L.L.B.**: `docs/02-architecture/LLB_PROTOCOL.md`

---

**Última Atualização**: 2025-01-XX
**Status**: Guia de migração criado, código em processo de atualização


