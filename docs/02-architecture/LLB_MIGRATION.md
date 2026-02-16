# Guia de Migração para Protocolo L.L.B.

## Visão Geral

Este guia descreve como migrar de Jira, Confluence e GitKraken para o Protocolo L.L.B. (LangMem, Letta, ByteRover).

## Por Que Migrar?

### Vantagens do Protocolo L.L.B.

1. **Independência**: Não depende de ferramentas externas
2. **Integração Nativa**: Integrado diretamente no código
3. **Autoevolução**: Sistema evolui automaticamente
4. **Memória Vetorial**: Busca semântica via embeddings
5. **Latência Zero**: Cache e consultas locais

### Desvantagens das Ferramentas Externas

1. **Dependência Externa**: Requer serviços terceiros
2. **Custo**: Assinaturas mensais
3. **Latência**: Consultas via API externa
4. **Desconexão**: Dados separados do código

## Mapeamento de Funcionalidades

### Jira → Letta

| Jira | Letta | Método |
|------|-------|--------|
| Issues | Tasks | `task_context` (Supabase) |
| Status | Estado de Evolução | `getCurrentState()` |
| Sprint Planning | Próximos Passos | `getNextEvolutionStep()` |
| Blockers | Bloqueios | `registerBlockage()` |
| History | Histórico | `getEvolutionHistory()` |

### Confluence → LangMem

| Confluence | LangMem | Método |
|------------|---------|--------|
| Páginas de Arquitetura | Sabedoria Arquitetural | `storeArchitecture()` |
| Padrões Técnicos | Padrões | `storePattern()` |
| Grafos de Dependência | Verificação de Dependências | `checkDependencies()` |
| Busca | Busca Semântica | `getWisdom()` |

### GitKraken → ByteRover

| GitKraken | ByteRover | Método |
|-----------|-----------|--------|
| Visualização de Mudanças | Mapeamento de Impacto | `mapVisualImpact()` |
| Timeline | Timeline Evolutiva | `getEvolutionTimeline()` |
| Contexto | Injeção de Contexto | `injectContext()` |
| Commits Inteligentes | Commits com Memória | `commitWithMemory()` |

## Processo de Migração

### Fase 1: Preparação

1. **Backup de Dados**
   - Exportar issues do Jira
   - Exportar páginas do Confluence
   - Exportar histórico do GitKraken

2. **Instalação do Protocolo L.L.B.**
   - Verificar que todas as camadas estão instaladas
   - Testar conexão com Supabase
   - Validar endpoints da API

### Fase 2: Migração de Dados

#### Migrar Issues do Jira para Letta

```javascript
// Script de migração (exemplo)
import { getLetta } from './scripts/memory/letta.js';

const letta = getLetta();

// Para cada issue do Jira
for (const issue of jiraIssues) {
    await letta.updateState(
        issue.summary,
        issue.status === 'Done' ? 'done' : 'coding',
        {
            jira_key: issue.key,
            migrated_from: 'jira',
            migrated_at: new Date().toISOString()
        }
    );
}
```

#### Migrar Páginas do Confluence para LangMem

```javascript
// Script de migração (exemplo)
import { getLangMem } from './scripts/memory/langmem.js';

const langmem = getLangMem();

// Para cada página do Confluence
for (const page of confluencePages) {
    await langmem.storeWisdom(
        page.content,
        page.space === 'Architecture' ? 'architecture' : 'other',
        {
            confluence_id: page.id,
            migrated_from: 'confluence',
            migrated_at: new Date().toISOString()
        }
    );
}
```

### Fase 3: Atualização de Código

1. **Substituir Consultas a Jira**
   ```javascript
   // Antes
   const issues = await jiraClient.getIssues();
   
   // Depois
   const state = await letta.getCurrentState();
   ```

2. **Substituir Consultas a Confluence**
   ```javascript
   // Antes
   const pages = await confluenceClient.getPages();
   
   // Depois
   const wisdom = await langmem.getWisdom('query');
   ```

3. **Substituir Consultas a GitKraken**
   ```javascript
   // Antes
   const commits = await gitkrakenClient.getCommits();
   
   // Depois
   const timeline = await byterover.getEvolutionTimeline();
   ```

### Fase 4: Validação

1. **Testar Funcionalidades**
   - Validar que todas as funcionalidades antigas funcionam
   - Testar novos recursos do Protocolo L.L.B.
   - Verificar performance

2. **Comparar Resultados**
   - Comparar dados migrados com originais
   - Validar integridade dos dados
   - Verificar se nada foi perdido

### Fase 5: Descontinuação

1. **Adicionar Avisos**
   - Aviso no Jira sobre descontinuação
   - Aviso no Confluence sobre descontinuação
   - Aviso no GitKraken sobre descontinuação

2. **Período de Transição**
   - Manter ferramentas antigas por período de transição
   - Monitorar uso e migração
   - Suportar usuários durante migração

3. **Desativação Final**
   - Desativar integrações antigas
   - Remover dependências
   - Documentar processo

## Exemplos de Uso

### Exemplo 1: Consultar Estado Atual (Substitui Jira)

```javascript
import { getLLBProtocol } from './scripts/memory/llb_protocol.js';

const protocol = getLLBProtocol();

// Iniciar sessão (substitui consulta ao Jira)
const session = await protocol.startSession();
console.log('Fase atual:', session.state.current_phase);
console.log('Próximo passo:', session.nextStep);
```

### Exemplo 2: Armazenar Sabedoria (Substitui Confluence)

```javascript
import { getLLBProtocol } from './scripts/memory/llb_protocol.js';

const protocol = getLLBProtocol();

// Armazenar padrão (substitui Confluence)
await protocol.storePattern(
    'Padrão de autenticação JWT',
    { context: 'API REST' }
);
```

### Exemplo 3: Visualizar Mudanças (Substitui GitKraken)

```javascript
import { getLLBProtocol } from './scripts/memory/llb_protocol.js';

const protocol = getLLBProtocol();

// Visualizar mudanças (substitui GitKraken)
const impact = await protocol.visualizeChanges({
    type: 'create',
    files: [{ path: 'new_feature.js' }]
});
```

## Checklist de Migração

### Preparação
- [ ] Backup de dados do Jira
- [ ] Backup de dados do Confluence
- [ ] Backup de dados do GitKraken
- [ ] Protocolo L.L.B. instalado e testado

### Migração
- [ ] Issues do Jira migradas para Letta
- [ ] Páginas do Confluence migradas para LangMem
- [ ] Histórico do GitKraken migrado para ByteRover
- [ ] Código atualizado para usar Protocolo L.L.B.

### Validação
- [ ] Todas as funcionalidades testadas
- [ ] Dados validados
- [ ] Performance verificada
- [ ] Documentação atualizada

### Descontinuação
- [ ] Avisos adicionados nas ferramentas antigas
- [ ] Período de transição definido
- [ ] Ferramentas antigas desativadas
- [ ] Dependências removidas

## Suporte

Para dúvidas ou problemas durante a migração:

1. **Documentação:**
   - `docs/02-architecture/LETTA.md`
   - `docs/02-architecture/LANGMEM.md`
   - `docs/02-architecture/BYTEROVER.md`
   - `docs/02-architecture/LLB_PROTOCOL.md`

2. **API:**
   - Endpoints em `backend/api/llb.js`
   - Documentação em `docs/05-operations/LLB_STATUS.md`

3. **Testes:**
   - Script de teste: `scripts/test_llb_protocol.js`
   - Validação: `docs/02-architecture/LLB_VALIDATION.md`

---

**Última Atualização**: 2025-01-XX
**Status**: Guia completo, pronto para migração


