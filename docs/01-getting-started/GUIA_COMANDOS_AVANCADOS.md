# 🚀 Guia de Comandos Avançados - Corporação Senciente

## Visão Geral

Este guia apresenta todos os comandos disponíveis para usuários avançados que desejam controlar a Corporação Senciente através da linha de comando.

---

## 🧠 Comandos de Senciência (CLI Principal)

### Comando Básico
```bash
# Executar senciência (modo interativo)
node scripts/senciencia/senciencia_cli.js

# Ou usar alias (se configurado)
npm run s
senc
```

### Modos de Operação

#### 📋 Executar Tasks
```bash
# Executar todas tasks pendentes
node scripts/senciencia/senciencia_cli.js executar

# Executar tasks de um projeto específico
node scripts/senciencia/senciencia_cli.js executar --projeto dashboard

# Executar com limite de tasks
node scripts/senciencia/senciencia_cli.js executar --limite 10

# Executar TODAS as tasks (cuidado!)
node scripts/senciencia/senciencia_cli.js executar --all
```

#### 📝 Planejar Tasks
```bash
# Planejar tasks autoevolutivas
node scripts/senciencia/senciencia_cli.js planejar

# Planejar para projeto específico
node scripts/senciencia/senciencia_cli.js planejar --projeto api-rest
```

#### 🤝 Roundtable de Agentes
```bash
# Avaliação completa dos agentes
node scripts/senciencia/senciencia_cli.js avaliar

# Avaliação focada em projeto
node scripts/senciencia/senciencia_cli.js avaliar --projeto mobile-app
```

### Incorporação de Agentes (Fase 3)

#### Incorporar Brain
```bash
# Incorporar Brain com tarefa específica
node scripts/senciencia/senciencia_cli.js incorporar brain "analisar requisitos do projeto X"

# Ver prompt que seria gerado
node scripts/senciencia/senciencia_cli.js prompt brain "design de arquitetura"
```

#### Incorporar Agente Específico
```bash
# Incorporar Marketing Agent
node scripts/senciencia/senciencia_cli.js incorporar agent marketing "criar campanha para produto Y"

# Incorporar Dev Agent
node scripts/senciencia/senciencia_cli.js incorporar agent dev "implementar autenticação JWT"

# Ver prompt do agente
node scripts/senciencia/senciencia_cli.js prompt agent architect "design API REST"
```

### Daemon Brain/Arms (Modo Autônomo)

```bash
# Iniciar daemon
node scripts/senciencia/daemon_chat.js start

# Parar daemon
node scripts/senciencia/daemon_chat.js stop

# Ver status
node scripts/senciencia/daemon_chat.js status

# Configurar intervalo Brain (5 minutos)
node scripts/senciencia/daemon_chat.js config set brainSessionInterval 300000

# Configurar máximo tasks por ciclo
node scripts/senciencia/daemon_chat.js config set maxTasksPerCycle 5

# Ver configuração atual
node scripts/senciencia/daemon_chat.js config
```

---

## 🏗️ Comandos de Swarm (Arquitetura Distribuída)

### Inicialização e Controle
```bash
# Inicializar swarm completo
node scripts/swarm/init.js

# Testar validação do swarm
node scripts/test_swarm_simple_validation.js

# Testar integração completa
node scripts/test_swarm_integration.js
```

### Gerenciamento de Prompts
```bash
# Testar geração de prompts do Brain
node scripts/test_brain_prompt_generator.js

# Testar geração de prompts de agentes
node scripts/test_agent_prompt_simple.js

# Testar cache de prompts
node scripts/test_prompt_cache.js
```

### Sistema de Aprendizado
```bash
# Testar feedback loop
node scripts/test_feedback_loop.js

# Testar sistema de confiança
node scripts/test_confidence_scorer_simple.js

# Testar métricas
node scripts/test_metrics_system.js
```

---

## 🖥️ Comandos de Infraestrutura Multi-PC

### Configuração de PCs
```powershell
# Configurar PC Central (Brain)
.\scripts\infra\setup_wsl2_ssh.ps1 -SshPort 2222 -Username brain

# Configurar PC Secundário (Business)
.\scripts\infra\setup_pc_secondary.ps1 -Specialization business -BrainHost "192.168.1.100"

# Configurar PC Secundário (Technical)
.\scripts\infra\setup_pc_secondary.ps1 -Specialization technical -BrainHost "192.168.1.100"

# Configurar PC Secundário (Operations)
.\scripts\infra\setup_pc_secondary.ps1 -Specialization operations -BrainHost "192.168.1.100"
```

### Gerenciamento de PCs
```bash
# Registrar PC manualmente
node scripts/infra/pc_registry.js register my-pc business 192.168.1.101

# Listar PCs registrados
node scripts/infra/pc_registry.js list

# Ver estatísticas da infraestrutura
node scripts/infra/pc_registry.js stats

# Executar comando remoto
curl -X POST http://localhost:3001/api/pcs/business-pc/command \
  -H "Content-Type: application/json" \
  -d '{"command": "npm run build", "timeout": 300000}'
```

---

## 📊 Comandos de Monitoramento

### Métricas e Observabilidade
```bash
# Verificar saúde do sistema
npm run health:check

# Ver métricas de LLM
node scripts/swarm/metrics_collector.js

# Ver custos otimizados
node scripts/test_cost_optimizer.js

# Ver auto-healing
node scripts/test_self_healing.js
```

### Logs e Debugging
```bash
# Ver logs do sistema
tail -f logs/2025-12-*.log

# Ver logs de agentes
tail -f logs/agent_*.log

# Ver logs de swarm
tail -f logs/swarm_*.log

# Debug interativo
node scripts/debug.js
```

---

## 🔧 Comandos de Desenvolvimento

### Testes e Qualidade
```bash
# Testar agentes
npm run test:agents

# Testar integração
npm run test:integration

# Testar validação
npm run test:validation

# Testar framework
npm run test:frameworks
```

### Integrações Externas
```bash
# Testar Supabase
npm run test:supabase

# Testar Ollama
npm run test:ollama

# Setup Google Ads
npm run google-ads:setup

# Testar WordPress
npm run wordpress:test
```

### Utilitários
```bash
# Popular conhecimento
npm run marketing:populate
npm run copywriting:popular
npm run sales:popular

# Vetorizar dados
node scripts/vetorizar_templates_copywriting.js

# Executar migração
node scripts/execute_sales_migration_supabase.js
```

---

## 🎯 Comandos por Especialização

### Marketing
```bash
# Otimizar campanhas
npm run marketing:optimize

# Analisar A/B testing
npm run marketing:ab:analyze

# Escalar campanha
npm run marketing:ab:scale
```

### Sales
```bash
# Analisar funil
npm run sales:analyze-funnel

# Forecast de receita
npm run sales:forecast

# Migrar dados
npm run sales:migrate
```

### Development
```bash
# Auto-evolução
npm run evolution:run

# Evolução completa
npm run evolution:all

# Evolução de agentes
npm run evolution:agent
```

---

## ⚙️ Comandos de Configuração

### Ambiente e Setup
```bash
# Validar configuração
npm run validate:config

# Setup WordPress
npm run wordpress:setup

# Setup Ollama
npm run setup:ollama
```

### Inicialização de Dados
```bash
# Seed do banco
npm run seed

# Inicializar L.L.B.
node scripts/memory/initialize_llb.js

# Popular agentes
npm run evolution:all-agents
```

---

## 🚨 Comandos de Emergência

### Recuperação de Sistema
```bash
# Reset completo (cuidado!)
node scripts/emergency/reset_system.js

# Backup de dados
node scripts/backup/create_backup.js

# Restauração
node scripts/backup/restore_backup.js backup.tar.gz
```

### Limpeza e Manutenção
```bash
# Limpar cache
node scripts/maintenance/clear_cache.js

# Otimizar banco
node scripts/maintenance/optimize_database.js

# Verificar integridade
node scripts/health/full_health_check.js
```

---

## 📋 Scripts NPM Disponíveis

```json
{
  "senciencia:iniciar": "node scripts/senciencia/context_awareness_protocol.js",
  "evolution:rigorous": "node scripts/cerebro/rigorous_evolution_manager.js",
  "board:meeting": "node scripts/board_meeting_grok.js",
  "wordpress:server": "node scripts/wordpress_server.js",
  "docs:gerar-agentes": "node scripts/gerar_documentacao_agentes.js",
  "agent:select": "node -e \"import('./scripts/cerebro/agent_selector.js')...\"",
  "health:check": "node -e \"import('./scripts/utils/health_check.js')...\"",
  "backend:start": "node backend/server.js",
  "check:align": "node scripts/check_alignment.js",
  "instance:create": "node scripts/create_instance.js create",
  "instance:list": "node scripts/create_instance.js list",
  "instance:clone": "node scripts/clone_instance.js",
  "orchestrator:init": "node scripts/orchestrator/core.js",
  "orchestrator:test": "node scripts/orchestrator/test_orchestrator.js",
  "orchestrator:monitor": "node -e \"import('./scripts/orchestrator/core.js')...\"",
  "cerebro:improve": "node scripts/cerebro/self_improvement_orchestrator.js",
  "wordpress:start": "scripts\\start_wordpress_server.bat",
  "wordpress:check": "node scripts/check_wordpress_ready.js",
  "wordpress:config": "node scripts/update_wordpress_env.js",
  "test:copywriting": "node scripts/test_copywriting_agent.js",
  "marketing:populate": "node scripts/popular_marketing_knowledge.js",
  "marketing:optimize": "node scripts/cerebro/marketing_optimizer.js",
  "marketing:ab:analyze": "node scripts/cerebro/marketing_ab_testing.js analyze",
  "marketing:ab:scale": "node scripts/cerebro/marketing_ab_testing.js scale",
  "test:marketing": "node scripts/test_marketing_agent.js",
  "sales:analyze-funnel": "node -e \"import('./scripts/cerebro/sales_funnel_analyzer.js')...\"",
  "sales:forecast": "node -e \"import('./scripts/cerebro/sales_funnel_analyzer.js')...\"",
  "sales:migrate": "node scripts/execute_sales_migration_supabase.js",
  "test:sales": "node scripts/test_sales_agent.js",
  "test:validation": "node scripts/test_validation_agent.js",
  "validation:popular": "node scripts/popular_validation_knowledge.js",
  "architect:evolve": "node scripts/popular_architect_knowledge.js",
  "product:evolve": "node scripts/popular_product_knowledge.js",
  "dev:evolve": "node scripts/popular_dev_knowledge.js",
  "devex:evolve": "node scripts/popular_devex_knowledge.js",
  "metrics:evolve": "node scripts/popular_metrics_knowledge.js",
  "entity:evolve": "node scripts/popular_entity_knowledge.js",
  "finance:evolve": "node scripts/popular_finance_knowledge.js",
  "evolution:all-agents": "npm run architect:evolve && npm run product:evolve...",
  "s": "node scripts/cli/index.js",
  "senc": "node scripts/cli/index.js",
  "think": "node scripts/cli/index.js think",
  "execute": "node scripts/cli/index.js execute",
  "status": "node scripts/cli/index.js status",
  "swarm": "node scripts/cli/index.js swarm",
  "chat": "node scripts/cli/index.js chat",
  "learn": "node scripts/cli/index.js learn",
  "monitor": "node scripts/cli/index.js monitor",
  "evolve": "node scripts/cli/index.js evolve",
  "dashboard": "node scripts/cli/index.js dashboard",
  "quick:brain": "node scripts/cli/index.js think",
  "quick:execute": "node scripts/cli/index.js execute",
  "quick:status": "node scripts/cli/index.js status --detailed",
  "quick:monitor": "node scripts/cli/index.js monitor --pcs",
  "quick:swarm": "node scripts/cli/index.js swarm status"
}
```

---

## 🔍 Comandos de Debug e Análise

### Análise de Sistema
```bash
# Ver estado atual
node scripts/senciencia/context_awareness_protocol.js

# Checar alinhamento
npm run check:align

# Análise de inventário
node scripts/inventory_analysis.js
```

### Performance e Otimização
```bash
# Benchmark de agentes
node scripts/benchmark_agents.js

# Análise de custos
node scripts/analyze_costs.js

# Otimização de cache
node scripts/optimize_cache.js
```

---

## 🎯 Workflows Recomendados

### Workflow Diário (Modo Assistido)
```bash
# 1. Ver status
node scripts/senciencia/senciencia_cli.js status

# 2. Planejar tarefas do dia
node scripts/senciencia/senciencia_cli.js planejar

# 3. Executar tarefas críticas
node scripts/senciencia/senciencia_cli.js executar --limite 5

# 4. Avaliar progresso
node scripts/senciencia/senciencia_cli.js avaliar
```

### Workflow de Desenvolvimento
```bash
# 1. Inicializar swarm
node scripts/swarm/init.js

# 2. Testar componentes
node scripts/test_swarm_simple_validation.js

# 3. Incorporar agentes conforme necessário
node scripts/senciencia/senciencia_cli.js incorporar agent dev "implementar feature X"

# 4. Monitorar progresso
node scripts/senciencia/daemon_chat.js status
```

### Workflow de Produção (Autônomo)
```bash
# 1. Configurar daemon
node scripts/senciencia/daemon_chat.js config set brainSessionInterval 600000
node scripts/senciencia/daemon_chat.js config set maxTasksPerCycle 10

# 2. Iniciar operação autônoma
node scripts/senciencia/daemon_chat.js start

# 3. Monitorar remotamente
# Dashboard: http://localhost:3000
# Status: node scripts/senciencia/daemon_chat.js status
```

---

**💡 Dica**: Use `npm run` para ver todos os scripts disponíveis no seu ambiente.

**📚 Para mais detalhes, consulte a documentação técnica em `docs/02-architecture/`**








