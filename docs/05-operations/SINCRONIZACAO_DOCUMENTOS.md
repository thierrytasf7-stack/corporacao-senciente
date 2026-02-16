# Sincronização de Documentos Online

**Data:** 2025-01-18  
**Status:** Processo Documentado

---

## Visão Geral

Este documento descreve o processo de sincronização de documentação entre:
- **Git** (repositório)
- **Jira** (tasks e issues)
- **Confluence** (documentação)

---

## Processo de Sincronização

### 1. Git (Repositório)

#### Commits de Documentação

**Quando fazer commit:**
- Após completar uma task do plano
- Após atualizar documentação importante
- Após reorganizar estrutura de pastas

**Mensagem de commit:**
```
docs: [tipo] [descrição]

- Detalhe 1
- Detalhe 2
- Referência à task do plano (ex: Fase 1.2.6)
```

**Exemplos:**
```
docs: Atualizar arquitetura para Chat/IDE
docs: Reorganizar documentação em pastas
docs: Adicionar guia de prompts
```

#### Branches

- **main**: Documentação estável e consolidada
- **feature/docs-***: Branches para mudanças grandes de documentação
- **fix/docs-***: Correções rápidas de documentação

### 2. Jira (Tasks e Issues)

#### Tasks de Documentação

**Criar task no Jira quando:**
- Iniciar uma nova fase do plano
- Completar uma task importante
- Identificar necessidade de documentação

**Template de Task:**
```
Título: [Fase X.Y.Z] [Nome da Task]

Descrição:
- Objetivo: [o que será feito]
- Documentos afetados: [lista]
- Status: [Em Progresso/Concluído]
- Link para Git: [commit ou branch]
- Link para Confluence: [página relacionada]
```

**Atualizar task quando:**
- Progresso significativo
- Completar subtasks
- Mudanças de escopo

#### Links entre Git e Jira

- Incluir link do Jira no commit: `[JIRA-123]`
- Incluir link do commit no Jira: `Commit: abc123`

### 3. Confluence (Documentação)

#### Páginas Principais

**Páginas a manter atualizadas:**
1. **Arquitetura do Sistema**
   - Visão geral
   - Componentes principais
   - Fluxos
   - Diagramas

2. **Status do Projeto**
   - Progresso das fases
   - Tasks completas
   - Próximos passos

3. **Guias de Uso**
   - Como usar o sistema
   - Comandos disponíveis
   - Troubleshooting

#### Sincronização com Git

**Quando atualizar Confluence:**
- Após mudanças significativas em `docs/`
- Após completar uma fase do plano
- Quando documentação no Git está desatualizada

**Processo:**
1. Verificar mudanças no Git
2. Identificar páginas do Confluence afetadas
3. Atualizar páginas do Confluence
4. Adicionar link para commit do Git
5. Adicionar data de última atualização

#### Links entre Confluence e Git

- Incluir link do Confluence no README: `[Confluence: Arquitetura](link)`
- Incluir link do Git no Confluence: `[Git: docs/arquitetura.md](link)`

---

## Checklist de Sincronização

### Após Completar Task do Plano

- [ ] Fazer commit no Git com mensagem clara
- [ ] Atualizar task no Jira (se existir)
- [ ] Verificar se precisa atualizar Confluence
- [ ] Adicionar links entre plataformas
- [ ] Documentar mudanças no changelog (se aplicável)

### Após Completar Fase do Plano

- [ ] Fazer commit final no Git
- [ ] Atualizar todas tasks relacionadas no Jira
- [ ] Atualizar páginas principais no Confluence
- [ ] Criar resumo da fase no Confluence
- [ ] Verificar consistência entre todas plataformas

### Revisão Periódica (Semanal)

- [ ] Verificar se Git está sincronizado
- [ ] Verificar se Jira está atualizado
- [ ] Verificar se Confluence está atualizado
- [ ] Identificar e corrigir inconsistências
- [ ] Atualizar links quebrados

---

## Ferramentas e Scripts

### Scripts de Sincronização

**A criar:**
- `scripts/sync/git_to_jira.js` - Sincronizar commits com Jira
- `scripts/sync/git_to_confluence.js` - Sincronizar docs com Confluence
- `scripts/sync/verify_sync.js` - Verificar sincronização

### MCPs Disponíveis

- **Jira MCP**: Criar e atualizar tasks
- **Confluence MCP**: Criar e atualizar páginas
- **GitKraken MCP**: Commits e branches

---

## Exemplos

### Exemplo 1: Atualizar Arquitetura

1. **Git:**
   ```bash
   git add docs/02-architecture/ARQUITETURA_CHAT_IDE.md
   git commit -m "docs: Adicionar documentação de arquitetura Chat/IDE [JIRA-123]"
   ```

2. **Jira:**
   - Atualizar task JIRA-123: "Documentação criada, commit abc123"
   - Adicionar link para arquivo no Git

3. **Confluence:**
   - Atualizar página "Arquitetura do Sistema"
   - Adicionar seção sobre Chat/IDE
   - Adicionar link para commit abc123

### Exemplo 2: Completar Fase

1. **Git:**
   ```bash
   git commit -m "docs: Completar Fase 1 - Consolidação e Limpeza [JIRA-100]"
   ```

2. **Jira:**
   - Fechar todas tasks da Fase 1
   - Criar resumo da fase
   - Criar tasks para Fase 2

3. **Confluence:**
   - Atualizar página "Status do Projeto"
   - Adicionar resumo da Fase 1
   - Atualizar progresso geral

---

## Troubleshooting

### Problema: Documentação desatualizada no Confluence

**Solução:**
1. Verificar última atualização no Git
2. Comparar com Confluence
3. Atualizar Confluence manualmente
4. Criar script de sincronização automática (futuro)

### Problema: Links quebrados entre plataformas

**Solução:**
1. Executar `scripts/sync/verify_sync.js`
2. Identificar links quebrados
3. Corrigir links manualmente
4. Adicionar validação no processo

### Problema: Tasks no Jira não refletem progresso

**Solução:**
1. Revisar tasks abertas
2. Atualizar status manualmente
3. Criar script de atualização automática (futuro)

---

## Próximos Passos

1. Criar scripts de sincronização automática
2. Integrar com MCPs (Jira, Confluence, GitKraken)
3. Adicionar validação de consistência
4. Automatizar processo de sincronização

---

**Última atualização:** 2025-01-18  
**Responsável:** Sistema de Documentação





