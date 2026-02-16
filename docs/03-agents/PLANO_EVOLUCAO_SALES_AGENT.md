# Plano de Evolução - Sales Agent V.2

## Objetivo

Evoluir Sales Agent de **3.5/10** para **6.0+/10**, implementando funcionalidades completas de vendas, CRM, análise de funil e forecasting.

## Estado Atual (V.1 - 3.5/10)

- ✅ 2 tools básicas (search_memory, search_knowledge)
- ❌ Sem integrações CRM
- ❌ Sem análise de funil
- ❌ Sem gestão de leads
- ❌ Sem forecasting
- ❌ Base de conhecimento vazia

## Estado Alvo (V.2 - 6.0+/10)

- ✅ 10+ tools funcionais
- ✅ Integração com Pipedrive (gratuito) e HubSpot (freemium)
- ✅ Análise completa de funil de vendas
- ✅ Gestão de leads e deals
- ✅ Sistema de forecasting
- ✅ Base de conhecimento com frameworks de vendas
- ✅ Criação automática de propostas

## Tecnologias e APIs

### Integrações CRM

1. **Pipedrive API** (Gratuito)
   - Plano gratuito: 3 usuários, leads ilimitados
   - API completa disponível
   - Documentação: https://developers.pipedrive.com

2. **HubSpot API** (Freemium)
   - Plano gratuito: CRM completo, até 1M contatos
   - API REST completa
   - Documentação: https://developers.hubspot.com

### Frameworks de Vendas

- **SPIN Selling** (Situação, Problema, Implicação, Necessidade)
- **Challenger Sale** (Ensinar, Personalizar, Assumir controle)
- **BANT** (Budget, Authority, Need, Timing)
- **GPCT** (Goals, Plans, Challenges, Timeline)
- **MEDDIC** (Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion)

## Tools a Implementar

### 1. Gestão de Leads e Deals

- `create_lead` - Criar lead no CRM
- `update_lead` - Atualizar informações do lead
- `qualify_lead` - Qualificar lead usando BANT/GPCT
- `create_deal` - Criar negócio no CRM
- `update_deal` - Atualizar negócio
- `move_deal_stage` - Mover negócio para próxima etapa

### 2. Análise de Funil

- `analyze_funnel` - Análise completa do funil de vendas
- `calculate_conversion` - Calcular taxas de conversão
- `identify_bottlenecks` - Identificar gargalos no funil
- `forecast_revenue` - Previsão de receita

### 3. Propostas e Negociação

- `create_proposal` - Criar proposta comercial usando LLM
- `analyze_proposal` - Analisar proposta existente
- `negotiate_deal` - Sugerir estratégias de negociação

### 4. Análise e Insights

- `analyze_sales_performance` - Análise de performance de vendas
- `identify_win_patterns` - Identificar padrões de vitória
- `recommend_next_actions` - Recomendar próximas ações

## Estrutura de Dados

### Tabelas Supabase

```sql
-- Leads
CREATE TABLE cerebro_sales_leads (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    company TEXT,
    phone TEXT,
    source TEXT,
    status TEXT DEFAULT 'new',
    qualification_score INTEGER,
    bant_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deals
CREATE TABLE cerebro_sales_deals (
    id BIGSERIAL PRIMARY KEY,
    lead_id BIGINT REFERENCES cerebro_sales_leads(id),
    name TEXT NOT NULL,
    value DECIMAL(10,2),
    stage TEXT NOT NULL,
    probability INTEGER DEFAULT 0,
    expected_close_date DATE,
    win_loss_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Funnel Analysis
CREATE TABLE cerebro_sales_funnel_analysis (
    id BIGSERIAL PRIMARY KEY,
    analysis_date DATE NOT NULL,
    stage TEXT NOT NULL,
    leads_count INTEGER,
    conversion_rate DECIMAL(5,2),
    avg_time_in_stage INTEGER,
    bottleneck_score INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Proposals
CREATE TABLE cerebro_sales_proposals (
    id BIGSERIAL PRIMARY KEY,
    deal_id BIGINT REFERENCES cerebro_sales_deals(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    value DECIMAL(10,2),
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Base de Conhecimento

### Frameworks a Vetorizar

1. **SPIN Selling**
   - Situação: Perguntas para entender contexto
   - Problema: Identificar desafios
   - Implicação: Explorar consequências
   - Necessidade: Determinar solução

2. **Challenger Sale**
   - Ensinar: Apresentar insights
   - Personalizar: Adaptar à necessidade
   - Assumir controle: Guiar conversa

3. **BANT Qualification**
   - Budget: Orçamento disponível
   - Authority: Autoridade para decisão
   - Need: Necessidade do produto
   - Timing: Momento adequado

4. **GPCT Framework**
   - Goals: Objetivos do cliente
   - Plans: Planos atuais
   - Challenges: Desafios enfrentados
   - Timeline: Cronograma

5. **MEDDIC**
   - Metrics: Métricas de sucesso
   - Economic Buyer: Comprador econômico
   - Decision Criteria: Critérios de decisão
   - Decision Process: Processo de decisão
   - Identify Pain: Identificar dores
   - Champion: Campeão interno

### Fontes de Conhecimento

- Artigos sobre técnicas de vendas
- Casos de sucesso
- Templates de propostas
- Scripts de negociação
- Análises de funil

## Implementação

### Fase 1: Integrações CRM (Prioridade ALTA)

1. **Pipedrive API Client**
   - Criar `scripts/utils/pipedrive_client.js`
   - Implementar CRUD de leads e deals
   - Testar integração

2. **HubSpot API Client**
   - Criar `scripts/utils/hubspot_client.js`
   - Implementar CRUD de contacts e deals
   - Testar integração

### Fase 2: Tools Principais (Prioridade ALTA)

1. **Gestão de Leads**
   - `create_lead`
   - `update_lead`
   - `qualify_lead`

2. **Gestão de Deals**
   - `create_deal`
   - `update_deal`
   - `move_deal_stage`

3. **Análise de Funil**
   - `analyze_funnel`
   - `calculate_conversion`
   - `identify_bottlenecks`

### Fase 3: Funcionalidades Avançadas (Prioridade MÉDIA)

1. **Forecasting**
   - `forecast_revenue`
   - Análise de pipeline
   - Previsão baseada em histórico

2. **Propostas**
   - `create_proposal`
   - `analyze_proposal`
   - Templates personalizados

3. **Análise Avançada**
   - `analyze_sales_performance`
   - `identify_win_patterns`
   - `recommend_next_actions`

### Fase 4: Base de Conhecimento (Prioridade ALTA)

1. **Script de Popularização**
   - Criar `scripts/popular_sales_knowledge.js`
   - Vetorizar frameworks de vendas
   - Scraping de artigos e casos

2. **Armazenamento**
   - Salvar em `cerebro_specialized_knowledge`
   - Categorizar por framework
   - Validar qualidade

## Métricas de Sucesso

### KPIs Técnicos

- ✅ **Tools Funcionais:** 2 → 10+ (400%+)
- ✅ **Integrações:** 0 → 2 (Pipedrive + HubSpot)
- ✅ **Base de Conhecimento:** 0 → 100+ itens
- ✅ **Capacidade de Execução:** 0% → 100%

### KPIs de Negócio

- ✅ **Leads Gerenciados:** 0 → Automático
- ✅ **Deals Rastreados:** 0 → Automático
- ✅ **Análise de Funil:** Não → Sim
- ✅ **Forecasting:** Não → Sim

## Cronograma

- **Semana 1:** Integrações CRM (Pipedrive + HubSpot)
- **Semana 2:** Tools principais (leads, deals, funil)
- **Semana 3:** Funcionalidades avançadas (forecasting, propostas)
- **Semana 4:** Base de conhecimento + Documentação

## Próximos Passos

1. ✅ Criar plano de evolução
2. ⏳ Implementar integrações CRM
3. ⏳ Criar tools principais
4. ⏳ Popular base de conhecimento
5. ⏳ Documentar tudo

---

**Versão:** 1.0  
**Data:** 16/12/2025  
**Status:** 📋 Plano Criado - Pronto para Implementação

















