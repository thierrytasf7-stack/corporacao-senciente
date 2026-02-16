# 📊 **SCHEMA DE DADOS - CORPORAÇÃO SENCIENTE**

**Data:** Janeiro 2026
**Versão:** 1.0 - Pipeline de Dados Completo
**Status:** Documento Vivo - Referência para Memórias

---

## 🎯 **OBJETIVO DESTE DOCUMENTO**

Este documento serve como **referência viva** para o pipeline de dados da Corporação Senciente. Todas as memórias, agentes e sistemas devem consultar este documento para entender:

- **Estrutura atual dos dados**
- **Relacionamentos entre entidades**
- **Fluxos de dados** (ETL pipelines)
- **APIs e endpoints** disponíveis
- **Regras de negócio** implementadas

**IMPORTANTE:** Este documento deve ser atualizado sempre que houver mudanças na estrutura de dados.

---

## 🏗️ **ARQUITETURA GERAL DE DADOS**

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CORPORAÇÃO SENCIENTE                           │
│                    SISTEMA DE DADOS DISTRIBUÍDO                     │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   SUPABASE  │  │   REDIS     │  │  SISTEMA    │  │   ARQUIVOS  │ │
│  │  (Primário) │  │  (Cache)   │  │   LOCAL     │  │   (Backup)  │ │
│  │             │  │            │  │            │  │             │ │
│  │ • PostgreSQL│  │ • Estado   │  │ • JSON     │  │ • Logs      │ │
│  │ • pgvector  │  │ • Sessões  │  │ • Configs  │  │ • Exports    │ │
│  │ • Row Level │  │ • Cache    │  │ • Cache    │  │ • Histórico  │ │
│  │   Security  │  │ • Temp     │  │ • Local    │  │             │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
│           │             │             │             │              │
│           └─────────────┼─────────────┼─────────────┘              │
│                        │             │                            │
│             ┌──────────▼─────────────▼─────────────────────────┐   │
│             │           PROTOCOLO L.L.B.                       │   │
│             │    ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │   │
│             │    │Lang│ │Lett│ │Byte│ │Fin │ │Risk│       │   │
│             │    │Mem │ │a   │ │Rove│ │ance│ │Mgmt│       │   │
│             │    └─────┘ └─────┘ └─────┘ └─────┘ └─────┘       │   │
│             └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📋 **TABELAS PRINCIPAIS (SUPABASE)**

### **1. corporate_entities**
**Propósito:** Entidades da corporação (Cérebro, Braços, Empresas)

```sql
CREATE TABLE corporate_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL, -- cerebro_central, braco_operacional, empresa_autonoma
  business_type VARCHAR(100), -- app_development, trading, marketing, research
  node_id VARCHAR(255) UNIQUE NOT NULL,
  hostname VARCHAR(255),
  ip_address INET,
  status VARCHAR(50) DEFAULT 'active',
  autonomy_level INTEGER CHECK (autonomy_level >= 0 AND autonomy_level <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  config JSONB
);
```

**Relacionamentos:**
- **1:N** com `marketing_campaigns` (created_by)
- **1:N** com `sales_pipelines` (assigned_to)
- **1:N** com `automations` (created_by, owned_by)
- **1:N** com `etl_logs` (executed_by, entity_id)

**Regras de Negócio:**
- `autonomy_level` determina permissões de decisão
- `entity_type` define capacidades da entidade
- `status` controla atividade (active/inactive/maintenance)

### **2. marketing_campaigns**
**Propósito:** Campanhas de marketing automatizadas

```sql
CREATE TABLE marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  product_description TEXT,
  target_audience JSONB,
  goals TEXT[],
  channels TEXT[],
  status VARCHAR(50) DEFAULT 'draft',
  content JSONB,
  schedule JSONB,
  metrics JSONB,
  created_by UUID REFERENCES corporate_entities(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  budget DECIMAL(10,2) DEFAULT 0,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  category VARCHAR(100) DEFAULT 'product_launch'
);
```

**Relacionamentos:**
- **N:1** com `corporate_entities` (created_by)
- **1:N** com `sales_pipelines` (campaign_id)

**Estrutura JSON (exemplos):**
```json
{
  "target_audience": {
    "demographics": {"age_range": "25-45", "interests": ["tecnologia"]},
    "psychographics": {"motivations": ["crescimento"], "values": ["eficiência"]}
  },
  "content": {
    "linkedin": {"template": "...", "variables": {...}},
    "twitter": {"template": "...", "variables": {...}}
  },
  "metrics": {
    "reach": 1000,
    "engagement": 150,
    "conversions": 25,
    "roi": 250
  }
}
```

### **3. sales_pipelines**
**Propósito:** Pipelines de vendas inteligentes

```sql
CREATE TABLE sales_pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id VARCHAR(255) NOT NULL,
  funnel_type VARCHAR(50) NOT NULL,
  lead_data JSONB,
  lead_score INTEGER CHECK (lead_score >= 0 AND lead_score <= 100),
  stages JSONB,
  metrics JSONB,
  assigned_to UUID REFERENCES corporate_entities(id),
  expected_close_date DATE,
  status VARCHAR(50) DEFAULT 'active',
  deal_value DECIMAL(15,2),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  campaign_id UUID REFERENCES marketing_campaigns(id)
);
```

**Estrutura JSON (exemplos):**
```json
{
  "lead_data": {
    "name": "João Silva",
    "email": "joao@empresa.com",
    "company": "TechCorp",
    "company_size": 50,
    "budget": 5000
  },
  "stages": [
    {
      "name": "prospect",
      "status": "completed",
      "actions": [{"type": "email", "status": "sent"}]
    },
    {
      "name": "qualified",
      "status": "active",
      "actions": [{"type": "demo", "scheduled": "2026-01-15"}]
    }
  ],
  "metrics": {
    "total_interactions": 5,
    "emails_sent": 3,
    "conversion_probability": 75
  }
}
```

### **4. automations**
**Propósito:** Automações independentes

```sql
CREATE TABLE automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  triggers JSONB,
  actions JSONB,
  conditions JSONB,
  schedule VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  metrics JSONB,
  created_by UUID REFERENCES corporate_entities(id),
  owned_by UUID REFERENCES corporate_entities(id),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  category VARCHAR(100) DEFAULT 'general'
);
```

**Estrutura JSON (exemplos):**
```json
{
  "triggers": [
    {"type": "schedule", "schedule": "0 9 * * 1-5"},
    {"type": "webhook", "url": "https://api.example.com/hook"}
  ],
  "actions": [
    {"type": "email", "config": {"template": "daily_report"}},
    {"type": "task_creation", "config": {"title": "Backup", "priority": "high"}}
  ],
  "conditions": [
    {"type": "time", "condition": "after 09:00"},
    {"type": "status", "condition": "system_healthy"}
  ],
  "metrics": {
    "executions": 45,
    "success_rate": 95.5,
    "average_duration": 1250,
    "last_run": "2026-01-09T09:00:00Z"
  }
}
```

### **5. etl_logs**
**Propósito:** Logs detalhados de execuções ETL

```sql
CREATE TABLE etl_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline VARCHAR(255) NOT NULL,
  execution_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  records_processed INTEGER DEFAULT 0,
  duration INTEGER DEFAULT 0,
  config JSONB,
  extract_stats JSONB,
  transform_stats JSONB,
  load_stats JSONB,
  error_message TEXT,
  executed_by UUID REFERENCES corporate_entities(id),
  entity_id UUID REFERENCES corporate_entities(id),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[]
);
```

**Estrutura JSON (exemplos):**
```json
{
  "config": {
    "source": "supabase",
    "table": "agents",
    "destination": "analytics_db"
  },
  "extract_stats": {
    "source": "supabase",
    "table": "agents",
    "filters": {"status": "active"},
    "records_extracted": 150
  },
  "transform_stats": {
    "validations": 150,
    "transformations": 45,
    "errors": 2,
    "data_quality_score": 96.7
  },
  "load_stats": {
    "destination": "analytics_db",
    "table": "agents_clean",
    "inserted": 148,
    "updated": 0,
    "skipped": 2
  }
}
```

### **6. system_metrics**
**Propósito:** Métricas do sistema coletadas automaticamente

```sql
CREATE TABLE system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL,
  infrastructure JSONB,
  agents JSONB,
  business JSONB,
  performance JSONB,
  system_health JSONB,
  version VARCHAR(50) DEFAULT '1.0',
  source VARCHAR(100) DEFAULT 'metrics_collector'
);
```

---

## 🔄 **PIPELINES ETL ATIVOS**

### **Pipeline 1: supabase_to_analytics**
```
Fonte: Supabase (agents, campaigns, pipelines)
Transformação: Limpeza, normalização, agregação
Destino: Analytics DB (Power BI/Tableau)
Frequência: Diária (02:00)
Responsável: Data Agent
```

**Fluxo:**
1. **Extract:** Busca dados de múltiplas tabelas
2. **Transform:** Limpa dados, calcula métricas, agrega
3. **Load:** Insere em warehouse analítico

### **Pipeline 2: api_to_warehouse**
```
Fonte: APIs externas (Stripe, GitHub, etc.)
Transformação: Validação, conversão, enriquecimento
Destino: Data Warehouse
Frequência: Horária
Responsável: Data Agent
```

### **Pipeline 3: logs_to_insights**
```
Fonte: Arquivos de log (sistema, agentes, aplicações)
Transformação: Parsing, agregação, análise
Destino: Monitoring Dashboard
Frequência: Em tempo real
Responsável: Data Agent
```

---

## 📡 **APIs E ENDPOINTS**

### **Marketing Agent API**
```
POST /api/agents/marketing/campaign
- Cria campanha de marketing completa
- Body: { product, targetAudience, goals }

GET /api/agents/marketing/templates
- Retorna templates disponíveis
- Response: { templates: [...] }
```

### **Sales Agent API**
```
POST /api/agents/sales/lead
- Processa lead e cria pipeline
- Body: { lead: { name, email, company, ... } }

GET /api/agents/sales/funnels
- Retorna funis de vendas
- Response: { funnels: [...], pricing: {...} }
```

### **Automation Agent API**
```
POST /api/agents/automation/create
- Cria automação independente
- Body: { config: { name, type, triggers, actions } }

POST /api/agents/automation/execute/:id
- Executa automação específica
```

### **Data Agent API**
```
POST /api/agents/data/etl
- Executa pipeline ETL
- Body: { pipelineName, config }

GET /api/agents/data/pipelines
- Retorna pipelines disponíveis
```

### **System APIs**
```
GET /api/dashboard/main
- Dashboard principal com métricas

GET /api/dashboard/agents
- Dashboard específico de agentes

GET /api/system/metrics
- Métricas em tempo real

POST /api/system/validate
- Validação do sistema
```

---

## 🔐 **REGRAS DE SEGURANÇA E ACESSO**

### **Row Level Security (RLS)**
- Todas as tabelas têm RLS habilitado
- Políticas permitem acesso público para operações básicas
- Controle de granularidade por entidade corporativa

### **Autenticação**
- Supabase Auth para usuários
- Service Role Key para operações do sistema
- Tokens temporários para integrações

### **Auditoria**
- Todas as operações são logadas
- Timestamps automáticos (created_at, updated_at)
- Rastreamento de quem executou cada operação

---

## 📈 **MÉTRICAS E MONITORAMENTO**

### **Métricas de Sistema**
- **Infraestrutura:** CPU, memória, disco, rede dos 3 PCs
- **Agentes:** Atividade, autonomia, performance
- **Negócio:** Receita, usuários, conversões
- **Performance:** Latência APIs, taxa erros, throughput

### **Dashboards Disponíveis**
- **Dashboard Principal:** Visão geral do sistema
- **Dashboard Agentes:** Detalhes dos 30 agentes
- **Dashboard Infraestrutura:** Status dos 3 PCs
- **Dashboard Business:** Métricas de receita

### **Alertas Configurados**
- CPU > 80% em qualquer PC
- Memória > 85% disponível
- API response time > 2s
- Taxa erro API > 5%
- Agentes ativos < 80% do total

---

## 🔄 **PROCESSO DE ATUALIZAÇÃO**

### **Quando Atualizar Este Documento:**
1. **Nova tabela criada** no Supabase
2. **Schema alterado** (novas colunas, tipos)
3. **Novo pipeline ETL** implementado
4. **Nova API criada** ou modificada
5. **Regra de negócio** alterada

### **Como Atualizar:**
1. **Modificar** este arquivo `.md`
2. **Atualizar** schemas SQL mostrados
3. **Documentar** novos relacionamentos
4. **Incluir** exemplos JSON atualizados
5. **Testar** referências em memórias

### **Validação:**
- [ ] Todas as tabelas documentadas
- [ ] Relacionamentos corretos
- [ ] Exemplos JSON válidos
- [ ] APIs atualizadas
- [ ] Regras de negócio claras

---

## 📚 **REFERÊNCIAS PARA MEMÓRIAS**

### **Para Agentes:**
- Consultar schemas antes de criar queries
- Usar exemplos JSON como templates
- Verificar relacionamentos para JOINS
- Respeitar regras RLS

### **Para Sistemas:**
- Seguir pipelines ETL estabelecidos
- Usar APIs documentadas
- Manter compatibilidade com schemas
- Logar operações conforme padrões

### **Para Desenvolvedores:**
- Atualizar documento após mudanças
- Testar queries antes de deploy
- Documentar novas regras de negócio
- Manter consistência com arquitetura

---

**Este documento é a fonte de verdade para toda a estrutura de dados da Corporação Senciente. Todas as decisões técnicas devem ser validadas contra este schema.**

**🔄 ÚLTIMA ATUALIZAÇÃO:** Janeiro 2026
**📊 VERSÃO:** 1.0
**✅ STATUS:** Atual e Completo