---
task: Execute Daily Briefing
tipo: "data-lead"
responsavel: "@data-lead"
atomic_layer: task
Entrada: |
  - date: Data do briefing
  - data_quality_metrics: Métricas de qualidade dos dados
  - scraping_performance: Performance do scraping
  - processing_stats: Estatísticas de processamento
  - validation_results: Resultados de validação
  - system_health: Saúde do sistema
Saida: |
  - briefing_report: Relatório completo do briefing
  - quality_summary: Resumo da qualidade de dados
  - performance_metrics: Métricas de performance
  - issues_alerts: Alertas e problemas identificados
  - recommendations: Recomendações de melhoria
---

# lead-daily-briefing

Gera relatório diário completo sobre qualidade, performance e saúde do pipeline de dados esportivos.

## Processo

1. Coletar métricas de qualidade dos últimos 24 horas
2. Analisar performance do scraping (sucesso, falhas, rate limits)
3. Revisar estatísticas de processamento (velocidade, volume, erros)
4. Avaliar resultados de validação (precisão, consistência, anomalias)
5. Verificar saúde do sistema (uptime, recursos, dependências)
6. Identificar tendências e padrões nos dados
7. Gerar relatório com insights e recomendações

## Métricas Analisadas

- **Qualidade:** Precisão, consistência, completude, atualidade
- **Performance:** Velocidade de scraping, volume processado, taxa de erro
- **Saúde:** Disponibilidade de fontes, status de dependências
- **Tendências:** Mudanças nos padrões de dados, novas anomalias

## Alertas e Recomendações

- Identificar fontes com performance degradada
- Alertar sobre aumento de anomalias ou inconsistências
- Recomendar ajustes nas estratégias de scraping
- Sugerir melhorias nos processos de validação