# PRDs – Eixo E: Workflow START e Evolução (10 itens)

## PRD-E1: Checklist Pré-START e Validação

- **Objetivo:** Garantir que sistema está pronto antes de iniciar evolução autônoma.
- **Requisitos:** 
  - Validar credenciais (variáveis de ambiente)
  - Validar RLS/Supabase (conexão)
  - Validar hooks Git (instalados)
  - Validar seeds (memória corporativa populada)
  - Validar integrações (Jira, Confluence acessíveis)
- **Aceitação:** Checklist completo; sistema bloqueia se itens críticos falharem; warnings para itens opcionais.
- **Tarefas:** Implementar validações; mensagens claras; documentação.
- **Métricas:** % de inícios bem-sucedidos; tempo médio de validação.

## PRD-E2: Loop de Evolução Contínua

- **Objetivo:** Manter sistema evoluindo através de ciclos completos.
- **Requisitos:**
  - Modo automático (loop contínuo)
  - Modo semi-automático (com aprovação)
  - Buscar próximo objetivo automaticamente
  - Continuar até parar manualmente ou erro crítico
- **Aceitação:** Loop roda continuamente; modo semi para para aprovação; logs completos.
- **Tarefas:** Implementar loop; gerenciar estado; tratamento de erros.
- **Métricas:** Número de iterações; tempo médio por ciclo; taxa de sucesso.

## PRD-E3: Executor de Ações Melhorado

- **Objetivo:** Executar decisões do boardroom de forma completa.
- **Requisitos:**
  - Criar tasks Jira ✅ (implementado)
  - Criar branches Git automaticamente
  - Criar PRs automaticamente
  - Atualizar arquivos de código (se necessário)
  - Executar comandos/shell (com guardrails)
- **Aceitação:** Executor cria tasks, branches, PRs; valida antes de executar código; logs completos.
- **Tarefas:** Integrar Git; criar PRs; guardrails de execução.
- **Métricas:** Taxa de sucesso de execuções; tempo médio; erros.

## PRD-E4: Validador de Resultados Robusto

- **Objetivo:** Validar que execuções foram bem-sucedidas e alinhadas.
- **Requisitos:**
  - Validar ações executadas ✅ (básico)
  - Validar alinhamento vetorial ✅ (implementado)
  - Rodar testes automaticamente
  - Validar qualidade de código (lint, format)
  - Validar métricas DORA impactadas
- **Aceitação:** Validador roda testes; verifica qualidade; gera relatório completo.
- **Tarefas:** Integrar testes; validação de código; métricas.
- **Métricas:** Taxa de validações passando; tempo de validação; falsos positivos.

## PRD-E5: Integração Git Completa

- **Objetivo:** Automatizar criação de branches, commits e PRs.
- **Requisitos:**
  - Criar branch a partir de objetivo/task
  - Commits automáticos (com mensagem padronizada)
  - PRs automáticos (com descrição do boardroom)
  - Vincular PR a tasks Jira
- **Aceitação:** Branches criados automaticamente; PRs criados com contexto; vinculação funcional.
- **Tarefas:** Integrar GitKraken MCP; criar branches; criar PRs; vincular.
- **Métricas:** Taxa de sucesso; tempo de criação; qualidade de PRs.

## PRD-E6: Modo Simulação (What-If)

- **Objetivo:** Permitir testar decisões sem aplicar mudanças.
- **Requisitos:**
  - Flag dry-run
  - Executar boardroom sem aplicar
  - Gerar relatório de "o que seria feito"
  - Não gravar em tabelas principais
- **Aceitação:** Modo simulação não altera sistema; relatório completo; zero efeitos colaterais.
- **Tarefas:** Implementar flag; diferenciar simulação; relatórios.
- **Métricas:** Uso do modo; taxa de aprovação após simulação.

## PRD-E7: Scheduler e Triggers Automáticos

- **Objetivo:** Automatizar atualização de memória e triggers de evolução.
- **Requisitos:**
  - @update_memory após commits (via hooks)
  - Scheduler para atualizações periódicas
  - Triggers baseados em eventos (Jira, Git)
  - Webhooks para integrações externas
- **Aceitação:** Memória atualizada automaticamente; triggers funcionam; logs completos.
- **Tarefas:** Implementar hooks; scheduler; webhooks.
- **Métricas:** Taxa de atualizações automáticas; latência de triggers.

## PRD-E8: Rollback Automático

- **Objetivo:** Reverter mudanças em caso de erro crítico.
- **Requisitos:**
  - Detecção de erro crítico
  - Rollback de branches/PRs
  - Rollback de tasks Jira
  - Logs de rollback
- **Aceitação:** Rollback funciona automaticamente; sistema retorna ao estado anterior; logs completos.
- **Tarefas:** Implementar detecção; rollback Git; rollback Jira.
- **Métricas:** Taxa de rollbacks; tempo de rollback; sucesso de rollback.

## PRD-E9: Notificações e Alertas

- **Objetivo:** Informar usuário sobre eventos importantes.
- **Requisitos:**
  - Notificações de decisões importantes
  - Alertas de erros
  - Alertas de divergência alta
  - Integração com Slack/Email (opcional)
- **Aceitação:** Notificações funcionam; alertas acionados corretamente; não spam.
- **Tarefas:** Sistema de notificações; integrações; configuração.
- **Métricas:** Taxa de notificações relevantes; tempo de resposta.

## PRD-E10: Métricas de Evolução

- **Objetivo:** Medir eficácia do loop de evolução.
- **Requisitos:**
  - Tempo de ciclo completo
  - Taxa de sucesso de decisões
  - Taxa de sucesso de execuções
  - Alinhamento médio das decisões
  - Custo por ciclo (LLM)
- **Aceitação:** Métricas coletadas; dashboard mostra evolução; tendências visíveis.
- **Tarefas:** Implementar coleta; dashboard; análise.
- **Métricas:** Precisão das métricas; uso do dashboard.






























