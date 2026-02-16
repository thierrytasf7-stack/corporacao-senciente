# Guia Completo de Migração para Protocolo L.L.B.

## Visão Geral

Este guia completo descreve o processo de migração de Jira, Confluence e GitKraken para o Protocolo L.L.B. (LangMem, Letta, ByteRover).

## Por Que Migrar?

### Vantagens do Protocolo L.L.B.

1. **Independência Total**: Não depende de ferramentas externas
2. **Integração Nativa**: Integrado diretamente no código
3. **Autoevolução**: Sistema evolui automaticamente
4. **Memória Vetorial**: Busca semântica via embeddings
5. **Latência Zero**: Cache e consultas locais
6. **Custo Zero**: Sem assinaturas mensais

### Desvantagens das Ferramentas Externas

1. **Dependência Externa**: Requer serviços terceiros
2. **Custo**: Assinaturas mensais (Jira, Confluence)
3. **Latência**: Consultas via API externa
4. **Desconexão**: Dados separados do código
5. **Limitações**: Funcionalidades limitadas por APIs externas

## Mapeamento Completo

### Jira → Letta

| Funcionalidade Jira | Funcionalidade Letta | Método |
|---------------------|---------------------|--------|
| Issues | Tasks | `task_context` (Supabase) |
| Status | Estado de Evolução | `getCurrentState()` |
| Sprint Planning | Próximos Passos | `getNextEvolutionStep()` |
| Blockers | Bloqueios | `registerBlockage()` |
| History | Histórico | `getEvolutionHistory()` |
| Update Issue | Atualizar Estado | `updateState()` |

### Confluence → LangMem

| Funcionalidade Confluence | Funcionalidade LangMem | Método |
|---------------------------|------------------------|--------|
| Páginas de Arquitetura | Sabedoria Arquitetural | `storeArchitecture()` |
| Padrões Técnicos | Padrões | `storePattern()` |
| Grafos de Dependência | Verificação de Dependências | `checkDependencies()` |
| Busca | Busca Semântica | `getWisdom()` |
| Criar Página | Armazenar Sabedoria | `storeWisdom()` |

### GitKraken → ByteRover

| Funcionalidade GitKraken | Funcionalidade ByteRover | Método |
|--------------------------|-------------------------|--------|
| Visualização de Mudanças | Mapeamento de Impacto | `mapVisualImpact()` |
| Timeline | Timeline Evolutiva | `getEvolutionTimeline()` |
| Contexto | Injeção de Contexto | `injectContext()` |
| Commits Inteligentes | Commits com Memória | `commitWithMemory()` |

## Processo de Migração Passo a Passo

### Fase 1: Preparação

1. **Backup de Dados**
   ```bash
   # Exportar issues do Jira
   # Exportar páginas do Confluence
   # Exportar histórico do GitKraken (se necessário)
   ```

2. **Instalação do Protocolo L.L.B.**
   - ✅ Verificar que todas as camadas estão instaladas
   - ✅ Testar conexão com Supabase
   - ✅ Validar endpoints da API

### Fase 2: Migração de Dados

#### Migrar Issues do Jira para Letta

```bash
# 1. Buscar issues do Jira (usar API REST)
# 2. Executar script de migração
node scripts/memory/migrate_jira_to_letta.js

# 3. Validar migração
# Verificar task_context no Supabase
```

**Script**: `scripts/memory/migrate_jira_to_letta.js`

#### Migrar Páginas do Confluence para LangMem

```bash
# 1. Buscar páginas do Confluence (usar API REST)
# 2. Executar script de migração
node scripts/memory/migrate_confluence_to_langmem.js

# 3. Validar migração
# Verificar corporate_memory no Supabase
# Testar: langmem.getWisdom('query')
```

**Script**: `scripts/memory/migrate_confluence_to_langmem.js`

### Fase 3: Adicionar Avisos de Descontinuação

#### Jira

```bash
# Adicionar avisos no Jira
node scripts/memory/add_jira_discontinuation_notice.js --project=PROJ
```

**Script**: `scripts/memory/add_jira_discontinuation_notice.js`

#### Confluence

```bash
# Adicionar avisos no Confluence
node scripts/memory/add_confluence_discontinuation_notice.js --space=SPACE
```

**Script**: `scripts/memory/add_confluence_discontinuation_notice.js`

### Fase 4: Atualização de Código

1. **Substituir Consultas a Jira**
   - Ver: `docs/02-architecture/CODE_MIGRATION.md`

2. **Substituir Consultas a Confluence**
   - Ver: `docs/02-architecture/CODE_MIGRATION.md`

3. **Substituir Consultas a GitKraken**
   - Ver: `docs/02-architecture/CODE_MIGRATION.md`

### Fase 5: Commits Inteligentes

```bash
# Usar commits inteligentes com Protocolo L.L.B.
node scripts/memory/intelligent_git_commit.js "feat: Nova feature" --files=file1.js,file2.js
```

**Script**: `scripts/memory/intelligent_git_commit.js`

## Scripts Disponíveis

### Scripts de Migração

1. **`scripts/memory/migrate_jira_to_letta.js`**
   - Migra issues do Jira para Letta
   - Converte formato e mapeia status

2. **`scripts/memory/migrate_confluence_to_langmem.js`**
   - Migra páginas do Confluence para LangMem
   - Categoriza conteúdo e extrai dependências

### Scripts de Descontinuação

3. **`scripts/memory/add_jira_discontinuation_notice.js`**
   - Adiciona avisos de descontinuação no Jira

4. **`scripts/memory/add_confluence_discontinuation_notice.js`**
   - Adiciona avisos de descontinuação no Confluence

### Scripts de Uso

5. **`scripts/memory/intelligent_git_commit.js`**
   - Commits inteligentes com Protocolo L.L.B.

## Documentação

### Guias de Descontinuação

- **Jira**: `docs/02-architecture/JIRA_DISCONTINUATION.md`
- **Confluence**: `docs/02-architecture/CONFLUENCE_DISCONTINUATION.md`
- **GitKraken**: `docs/02-architecture/GITKRAKEN_DISCONTINUATION.md`

### Guias de Migração

- **Migração Geral**: `docs/02-architecture/LLB_MIGRATION.md`
- **Migração de Código**: `docs/02-architecture/CODE_MIGRATION.md`
- **Commits Inteligentes**: `docs/02-architecture/INTELLIGENT_GIT_COMMITS.md`

### Documentação do Protocolo L.L.B.

- **LangMem**: `docs/02-architecture/LANGMEM.md`
- **Letta**: `docs/02-architecture/LETTA.md`
- **ByteRover**: `docs/02-architecture/BYTEROVER.md`
- **Protocolo L.L.B.**: `docs/02-architecture/LLB_PROTOCOL.md`

## Checklist Completo

### Preparação
- [x] Protocolo L.L.B. instalado e testado
- [ ] Backup de dados do Jira
- [ ] Backup de dados do Confluence
- [ ] Backup de dados do GitKraken (se necessário)

### Migração de Dados
- [ ] Issues do Jira migradas para Letta
- [ ] Páginas do Confluence migradas para LangMem
- [ ] Histórico do GitKraken migrado para ByteRover

### Avisos de Descontinuação
- [ ] Avisos adicionados no Jira
- [ ] Avisos adicionados no Confluence
- [ ] Documentação atualizada

### Atualização de Código
- [ ] Código atualizado para usar Protocolo L.L.B.
- [ ] Imports e dependências atualizados
- [ ] Testes validados

### Validação
- [ ] Todas as funcionalidades testadas
- [ ] Dados validados
- [ ] Performance verificada

### Descontinuação Final
- [ ] Ferramentas antigas desativadas
- [ ] Dependências removidas
- [ ] Documentação final atualizada

## Suporte

Para dúvidas ou problemas durante a migração:

1. **Documentação Completa**: Ver seção "Documentação" acima
2. **Scripts de Migração**: Ver seção "Scripts Disponíveis"
3. **Validação**: `docs/02-architecture/LLB_VALIDATION_REPORT.md`

---

**Última Atualização**: 2025-01-XX
**Status**: Guia completo, pronto para migração


