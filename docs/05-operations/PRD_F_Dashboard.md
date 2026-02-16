# PRDs – Eixo F: Dashboard e Observabilidade (10 itens)

## PRD-F1: Dashboard Principal

- **Objetivo:** Interface única para monitorar e controlar evolução autônoma.
- **Requisitos:**
  - Abas: Overview, Decisões, Metas, Agentes, Evolução ✅ (implementado)
  - Status do loop (rodando/parado) ✅
  - Controles (start/stop/pause) ✅
  - Responsivo e acessível
- **Aceitação:** Dashboard carrega e exibe dados; controles funcionam; interface clara.
- **Tarefas:** Conectar APIs reais; melhorar UI; testes.
- **Métricas:** Tempo de carregamento; taxa de uso; satisfação.

## PRD-F2: Métricas DORA Reais

- **Objetivo:** Calcular e exibir métricas DORA a partir de dados reais.
- **Requisitos:**
  - Lead time (Git: commit → deploy)
  - Deploy frequency (deploys por período)
  - MTTR (Mean Time To Recovery)
  - Change fail rate (taxa de falha)
  - Cálculo a partir de Git/CI
- **Aceitação:** Métricas calculadas corretamente; atualização automática; exibição clara.
- **Tarefas:** Integrar Git; calcular métricas; exibir no dashboard.
- **Métricas:** Precisão dos cálculos; latência de atualização.

## PRD-F3: Timeline de Decisões

- **Objetivo:** Visualizar histórico completo de decisões do boardroom.
- **Requisitos:**
  - Timeline ordenada por data ✅ (implementado)
  - Opiniões dos agentes ✅
  - Síntese final ✅
  - Filtros (data, agente, tópico)
  - Busca
- **Aceitação:** Timeline carrega corretamente; filtros funcionam; busca precisa.
- **Tarefas:** Melhorar UI; adicionar filtros; busca.
- **Métricas:** Tempo de carregamento; uso de filtros.

## PRD-F4: Controles do Loop

- **Objetivo:** Permitir controle completo do loop de evolução.
- **Requisitos:**
  - Start/Stop/Pause ✅ (implementado)
  - Mudança de modo (auto/semi) ✅
  - Configurações do loop
  - Logs em tempo real
- **Aceitação:** Controles funcionam; modo muda corretamente; logs atualizados.
- **Tarefas:** Melhorar controles; logs em tempo real.
- **Métricas:** Taxa de uso; tempo de resposta.

## PRD-F5: Painel de Opções (Modo Semi)

- **Objetivo:** Apresentar opções de direção para aprovação humana.
- **Requisitos:**
  - Exibir decisão do boardroom ✅ (implementado)
  - Apresentar opções de direção ✅
  - Aguardar escolha ✅
  - Confirmar antes de executar ✅
- **Aceitação:** Opções apresentadas claramente; escolha registrada; execução conforme escolha.
- **Tarefas:** Melhorar apresentação; mais opções; validação.
- **Métricas:** Taxa de aprovação; tempo de decisão.

## PRD-F6: Gráficos e Visualizações

- **Objetivo:** Visualizar dados de forma clara e acionável.
- **Requisitos:**
  - Gráficos de métricas DORA
  - Gráfico de evolução de alinhamento
  - Gráfico de custos LLM
  - Visualização de decisões ao longo do tempo
- **Aceitação:** Gráficos carregam corretamente; dados precisos; visualização clara.
- **Tarefas:** Implementar gráficos; biblioteca de visualização.
- **Métricas:** Performance de renderização; uso dos gráficos.

## PRD-F7: Exportação de Dados

- **Objetivo:** Permitir exportar dados para análise externa.
- **Requisitos:**
  - Exportar decisões (CSV/JSON)
  - Exportar métricas
  - Exportar logs
  - Agendamento de exports
- **Aceitação:** Exports funcionam; formato correto; dados completos.
- **Tarefas:** Implementar exports; formatos; agendamento.
- **Métricas:** Taxa de uso; satisfação.

## PRD-F8: Alertas e Notificações

- **Objetivo:** Alertar sobre eventos importantes.
- **Requisitos:**
  - Alertas de erro crítico
  - Alertas de divergência alta
  - Alertas de alinhamento baixo
  - Notificações no dashboard
  - Integração com Slack/Email (opcional)
- **Aceitação:** Alertas acionados corretamente; não spam; ação clara.
- **Tarefas:** Sistema de alertas; integrações; configuração.
- **Métricas:** Taxa de alertas relevantes; tempo de resposta.

## PRD-F9: Ações Rápidas

- **Objetivo:** Permitir acionar funcionalidades do dashboard.
- **Requisitos:**
  - Botão "Rodar Boardroom"
  - Botão "Check Alignment"
  - Botão "QA Similarity"
  - Botão "Autotune"
  - Confirmação antes de executar
- **Aceitação:** Ações funcionam; confirmação funciona; feedback claro.
- **Tarefas:** Implementar ações; backend; confirmação.
- **Métricas:** Taxa de uso; tempo de execução.

## PRD-F10: Integração com Observabilidade

- **Objetivo:** Integrar com stack de observabilidade (Loki/Prom/Grafana).
- **Requisitos:**
  - Exportar métricas para Prometheus
  - Exportar logs para Loki
  - Dashboards Grafana pré-configurados
  - Alertas Prometheus
- **Aceitação:** Integração funciona; métricas expostas; dashboards úteis.
- **Tarefas:** Exporters; configuração; dashboards.
- **Métricas:** Taxa de coleta; latência.

























