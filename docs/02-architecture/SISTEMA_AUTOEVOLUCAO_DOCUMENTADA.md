# Sistema de Autoevolução Documentada

## Visão Geral

Sistema completo de autoevolução documentada para todos os 30 agentes da corporação senciente. Permite evolução contínua e documentada sem necessidade de briefing, focando em eficiência máxima antes de produção.

## Componentes do Sistema

### 1. Documentação Técnica Completa

Cada agente possui 5 documentos:

1. **`ficha-tecnica-utopica-6.0-7.0.md`** - Visão utópica do agente
2. **`ficha-tecnica-atual-v1.md`** - Estado atual real
3. **`instrucoes-uso-humano.md`** - Guia para humanos
4. **`instrucoes-uso-ia-senciente.md`** - Guia técnico para IAs
5. **`proximas-tasks-evolucao.md`** - Roadmap de evolução

**Status:** ✅ 30/30 agentes documentados (150 documentos)

### 2. Auto Evolution Manager

**Arquivo:** `scripts/cerebro/auto_evolution_manager.js`

**Funcionalidades:**
- Analisa gaps entre estado atual e utópico
- Gera tasks de evolução automaticamente
- Prioriza tasks baseado em impacto/esforço
- Cria issues no Jira (preparado para MCP)
- Documenta evolução em Confluence (preparado para MCP)
- Atualiza fichas técnicas automaticamente
- Commita mudanças no Git (preparado para MCP)

**Uso:**
```bash
# Processar evolução de um agente específico
npm run evolution:agent -- --agent=copywriting

# Processar evolução de todos os agentes
npm run evolution:all

# Dry-run (sem fazer mudanças)
npm run evolution:all -- --dry-run

# Atualizar fichas técnicas automaticamente
npm run evolution:all -- --atualizar-ficha
```

### 3. Evolution Documenter

**Arquivo:** `scripts/cerebro/evolution_documenter.js`

**Funcionalidades:**
- Gera changelogs de evolução
- Compara versões de fichas técnicas
- Documenta evoluções em Confluence
- Mantém histórico completo

## Fluxo de Autoevolução

### 1. Análise de Gaps

O sistema compara:
- Estado atual (ficha-tecnica-atual-v1.md)
- Estado utópico (ficha-tecnica-utopica-6.0-7.0.md)
- Próximas tasks (proximas-tasks-evolucao.md)

### 2. Geração de Tasks

Baseado nos gaps, gera tasks priorizadas:
- Implementar tools não implementadas
- Converter stubs em tools reais
- Implementar integrações MCP
- Expandir base de conhecimento
- Implementar capacidade de execução

### 3. Criação de Issues

Tasks são convertidas em issues no Jira:
- Título descritivo
- Descrição completa
- Prioridade e impacto
- Labels e categorização

### 4. Documentação

Evolução é documentada:
- Página no Confluence
- Changelog local
- Atualização de ficha técnica

### 5. Commit

Mudanças são commitadas:
- Branch por agente/feature
- Mensagem descritiva
- Histórico completo

## Integração com MCPs

### GitKraken MCP

**Status:** ✅ Preparado (aguardando implementação real)

**Funcionalidades:**
- `git_add_or_commit`: Adicionar e commitar mudanças
- `git_branch`: Criar branches por agente
- `git_push`: Push automático

**Uso Futuro:**
```javascript
await mcp_gitkraken.git_add_or_commit({
    directory: process.cwd(),
    action: 'commit',
    message: 'docs: Evolução Copywriting Agent V.1.1',
    files: ['docs/FICHA-TECNICA-AGENTES/copywriting/*']
});
```

### Confluence MCP

**Status:** ✅ Preparado (aguardando implementação real)

**Funcionalidades:**
- `createConfluencePage`: Criar páginas de documentação
- `updateConfluencePage`: Atualizar páginas existentes
- Versionamento automático

**Uso Futuro:**
```javascript
await mcp_confluence.createConfluencePage({
    spaceId: 'AGENTS',
    title: `Evolução - ${agentName}`,
    body: pageContent,
});
```

### Jira MCP

**Status:** ✅ Preparado (aguardando implementação real)

**Funcionalidades:**
- `createJiraIssue`: Criar issues de evolução
- `editJiraIssue`: Atualizar issues
- Tracking de progresso

**Uso Futuro:**
```javascript
await mcp_jira.createJiraIssue({
    projectKey: 'AGENT',
    issueTypeName: 'Task',
    summary: task.title,
    description: task.description,
});
```

## Execução Periódica

### Configuração de Execução Automática

O sistema pode ser configurado para executar periodicamente:

```javascript
// Executar diariamente
setInterval(async () => {
    await executarAutoevolucao({ all: true, dryRun: false });
}, 24 * 60 * 60 * 1000); // 24 horas
```

### Monitoramento

- Logs de todas as operações
- Métricas de evolução
- Alertas de bloqueadores
- Dashboard de progresso

## Versionamento

### Sistema de Versões

- **V.1:** Estado inicial
- **V.1.1, V.1.2, ...:** Evoluções menores
- **V.2.0:** Milestone maior
- **V.6.0:** Alcançar nível 6.0
- **V.7.0:** Alcançar nível 7.0 utópico

### Changelog Automático

Cada evolução gera entrada no changelog:
- Data da evolução
- Mudanças implementadas
- Métricas atualizadas
- Próximos passos

## Exemplo de Uso Completo

```bash
# 1. Gerar documentação inicial (se necessário)
npm run docs:gerar-agentes

# 2. Analisar gaps e gerar tasks (dry-run)
npm run evolution:all -- --dry-run

# 3. Executar autoevolução real
npm run evolution:all -- --atualizar-ficha

# 4. Verificar mudanças
git status
git log

# 5. Revisar issues criadas no Jira
# 6. Revisar documentação no Confluence
```

## Próximos Passos

1. **Implementar Integrações MCP Reais:**
   - GitKraken MCP para commits
   - Confluence MCP para documentação
   - Jira MCP para issues

2. **Melhorar Análise de Gaps:**
   - Usar LLM para análise mais profunda
   - Identificar dependências entre tasks
   - Priorização mais inteligente

3. **Automação Completa:**
   - Execução periódica automática
   - Aprovação workflow
   - Rollback automático se necessário

## Conclusão

O sistema de autoevolução documentada está implementado e pronto para uso. As integrações com MCPs estão preparadas e serão ativadas quando os MCPs estiverem disponíveis.

---

**Versão:** 1.0  
**Data:** 15/12/2025  
**Status:** ✅ Implementado - Aguardando Integrações MCP




















