# Plano Completo de Evolução - Marketing Agent

## Objetivo

Evoluir o **Marketing Agent** de **3.8/10** para **6.5+/10** (nível Agente 6.0), implementando tools reais, integrações com APIs free/freemium, base de conhecimento especializada, capacidade de execução real e colaboração perfeita com Copywriting Agent.

## Estado Atual vs. Meta

| Aspecto | Atual (3.8/10) | Meta (6.5+/10) |
|---------|----------------|----------------|
| Tools Funcionais | 2/8 (25%) | 8/8 (100%) |
| Integrações | 0 APIs reais | 5+ APIs reais |
| Capacidade de Execução | 0% | 100% |
| Base de Conhecimento | Baixa | 500+ itens vetorizados |
| ROI Mensurável | Não | Sim |
| Autonomia | Nenhuma | Alta |

## Fase 1: Fundamentos (Semanas 1-2)

### 1.1 Configuração de APIs Free/Freemium

#### Google Ads API
**Status:** 📋 Planejado  
**Tipo:** Freemium (gratuito até $50/dia em campanhas)  
**Requisitos:**
- Criar projeto no Google Cloud Console
- Habilitar Google Ads API
- Criar OAuth 2.0 credentials
- Obter Developer Token (requer aprovação, pode levar dias)

**Configuração:**
```bash
# Variáveis de ambiente necessárias
GOOGLE_ADS_CUSTOMER_ID=123-456-7890
GOOGLE_ADS_DEVELOPER_TOKEN=your_token
GOOGLE_ADS_CLIENT_ID=your_client_id
GOOGLE_ADS_CLIENT_SECRET=your_client_secret
GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token
```

#### Facebook/Meta Ads API
**Status:** 📋 Planejado  
**Tipo:** Free (requer aprovação de conta)  
**Requisitos:**
- Meta Business Account
- App criado no Meta for Developers
- System User Token
- Ad Account ID

**Configuração:**
```bash
META_ADS_APP_ID=your_app_id
META_ADS_APP_SECRET=your_app_secret
META_ADS_ACCESS_TOKEN=your_access_token
META_ADS_ACCOUNT_ID=act_your_account_id
```

#### Google Analytics 4 API
**Status:** ✅ Já configurado (usado pelo Copywriting Agent)  
**Reutilização:** Sim, podemos reutilizar as mesmas credenciais

#### Google Search Console API
**Status:** 📋 Planejado  
**Tipo:** Free  
**Requisitos:**
- OAuth 2.0 (mesmo do GA4)
- Propriedade verificada no Search Console

**Configuração:**
```bash
GOOGLE_SEARCH_CONSOLE_SITE_URL=https://your-site.com
```

### 1.2 Estrutura de Banco de Dados

Criar tabelas no Supabase para campanhas e métricas:

```sql
-- Tabela de campanhas de marketing
CREATE TABLE IF NOT EXISTS cerebro_marketing_campaigns (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- draft | active | paused | completed
  platform TEXT NOT NULL, -- google_ads | facebook_ads | linkedin_ads | email
  campaign_type TEXT NOT NULL, -- search | display | social | email
  budget DECIMAL(10, 2),
  spent DECIMAL(10, 2) DEFAULT 0,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  conversions BIGINT DEFAULT 0,
  roi DECIMAL(5, 2),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  target_audience JSONB DEFAULT '{}',
  ad_variants JSONB DEFAULT '[]',
  platform_campaign_id TEXT, -- ID na plataforma externa
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Tabela de métricas de campanhas
CREATE TABLE IF NOT EXISTS cerebro_marketing_metrics (
  id BIGSERIAL PRIMARY KEY,
  campaign_id BIGINT REFERENCES cerebro_marketing_campaigns(id),
  date DATE NOT NULL,
  platform TEXT NOT NULL,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  conversions BIGINT DEFAULT 0,
  spend DECIMAL(10, 2) DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  roi DECIMAL(5, 2),
  ctr DECIMAL(5, 2), -- Click-through rate
  cpc DECIMAL(5, 2), -- Cost per click
  cpa DECIMAL(5, 2), -- Cost per acquisition
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON cerebro_marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_platform ON cerebro_marketing_campaigns(platform);
CREATE INDEX IF NOT EXISTS idx_marketing_metrics_campaign ON cerebro_marketing_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_marketing_metrics_date ON cerebro_marketing_metrics(date);
```

## Fase 2: Implementação de Tools (Semanas 3-4)

### 2.1 Tool: `create_campaign`

**Objetivo:** Criar campanhas reais em plataformas de publicidade

**Plataformas Suportadas:**
1. Google Ads (prioridade)
2. Facebook Ads (prioridade)
3. LinkedIn Ads (futuro)
4. Email Marketing (futuro)

**Implementação:**
- `scripts/utils/google_ads_client.js` - Cliente Google Ads API
- `scripts/utils/facebook_ads_client.js` - Cliente Facebook Ads API
- Integração no `agent_executor.js`

### 2.2 Tool: `optimize_budget`

**Objetivo:** Otimizar distribuição de orçamento entre campanhas

**Funcionalidades:**
- Análise de ROI por campanha
- Redistribuição automática de orçamento
- Pausa/ativação automática de campanhas

### 2.3 Tool: `analyze_roi`

**Objetivo:** Calcular ROI real de campanhas

**Fontes de Dados:**
- Google Ads API (custo, conversões)
- Facebook Ads API (custo, conversões)
- Google Analytics (receita)
- CRM (se integrado)

### 2.4 Tool: `segment_audience`

**Objetivo:** Segmentação avançada de audiência

**Funcionalidades:**
- Análise de dados demográficos
- Segmentação baseada em comportamento
- Criação de audiências personalizadas

### 2.5 Tool: `analyze_competitors`

**Objetivo:** Análise automatizada de concorrentes

**Fontes:**
- SerperAPI (já configurado)
- Tavily API (já configurado)
- Google Trends (futuro)

## Fase 3: Base de Conhecimento (Semanas 5-6)

### 3.1 Scraping de Estratégias de Marketing

**Fontes:**
- HubSpot Blog (growth hacking, inbound marketing)
- Neil Patel Blog (SEO, content marketing)
- Backlinko (SEO, link building)
- Marketing Land (tendências, cases)

### 3.2 Vetorização de Frameworks

**Frameworks a Vetorizar:**
- AARRR (Pirate Metrics)
- Growth Hacking Funnel
- Content Marketing Matrix
- Email Marketing Funnels
- Social Media Strategies

### 3.3 Templates de Campanhas

**Criar templates por:**
- Indústria (SaaS, E-commerce, B2B, B2C)
- Objetivo (Awareness, Consideration, Conversion)
- Plataforma (Google, Facebook, LinkedIn)

## Fase 4: Otimização Automática (Semanas 7-8)

### 4.1 Algoritmo de Otimização

**Lógica:**
1. Coletar métricas diárias de todas as campanhas
2. Calcular ROI, CPA, CTR por campanha
3. Identificar campanhas abaixo do benchmark
4. Redistribuir orçamento para campanhas top performers
5. Pausar campanhas com ROI negativo

### 4.2 A/B Testing Automático

**Funcionalidades:**
- Criar variantes automaticamente
- Rodar testes A/B
- Selecionar vencedoras automaticamente
- Escalar vencedoras

## Checklist de Implementação

### Semana 1-2: Setup e Configuração
- [ ] Criar projeto Google Cloud e habilitar Ads API
- [ ] Solicitar Developer Token Google Ads
- [ ] Criar app Meta for Developers
- [ ] Configurar OAuth para todas as APIs
- [ ] Criar migration SQL para tabelas
- [ ] Aplicar migration no Supabase

### Semana 3-4: Implementação de Tools
- [ ] Implementar `google_ads_client.js`
- [ ] Implementar `facebook_ads_client.js`
- [ ] Implementar `create_campaign` tool
- [ ] Implementar `optimize_budget` tool
- [ ] Implementar `analyze_roi` tool
- [ ] Implementar `segment_audience` tool
- [ ] Implementar `analyze_competitors` tool
- [ ] Integrar todas as tools no `agent_executor.js`

### Semana 5-6: Base de Conhecimento
- [ ] Criar script de scraping de estratégias
- [ ] Vetorizar frameworks de marketing
- [ ] Criar templates de campanhas
- [ ] Popular base de conhecimento (500+ itens)

### Semana 7-8: Otimização e Testes
- [ ] Implementar algoritmo de otimização
- [ ] Implementar A/B testing automático
- [ ] Testar integração completa
- [ ] Documentar uso

## Tecnologias Necessárias

### APIs e Credenciais

| API | Tipo | Custo | Status |
|-----|------|-------|--------|
| Google Ads API | Freemium | Free até $50/dia | 📋 Requer aprovação |
| Facebook Ads API | Free | Gratuito | 📋 Requer conta business |
| Google Analytics 4 | Free | Gratuito | ✅ Já configurado |
| Google Search Console | Free | Gratuito | 📋 Configurar OAuth |
| SerperAPI | Free tier | 2,500 req/mês | ✅ Já configurado |
| Tavily API | Free tier | 1,000 req/mês | ✅ Já configurado |

### Bibliotecas JavaScript

```json
{
  "google-ads-api": "^17.0.0",
  "facebook-nodejs-business-sdk": "^19.0.0",
  "@google-cloud/analytics-data": "^4.0.0"
}
```

## Estrutura de Arquivos

```
scripts/
├── utils/
│   ├── google_ads_client.js          # Novo - Cliente Google Ads
│   ├── facebook_ads_client.js        # Novo - Cliente Facebook Ads
│   ├── marketing_metrics.js          # Novo - Cálculo de métricas
│   └── analytics_client.js           # Existente - Reutilizar
├── cerebro/
│   ├── marketing_campaigns.js        # Novo - Gestão de campanhas
│   ├── marketing_optimizer.js        # Novo - Otimização automática
│   └── marketing_knowledge_scraper.js # Novo - Scraping de conhecimento
└── ...

supabase/
└── migrations/
    └── add_marketing_tables.sql      # Novo - Tabelas de marketing
```

## Métricas de Sucesso

### KPIs Técnicos
- ✅ 8/8 tools funcionais
- ✅ 5+ integrações ativas
- ✅ 500+ itens de conhecimento vetorizados
- ✅ ROI calculado automaticamente

### KPIs de Negócio
- ✅ Campanhas criadas e executadas automaticamente
- ✅ ROI médio > 3x
- ✅ CPA < 50% da média de mercado
- ✅ Taxa de conversão > 2%

## Próximos Passos Imediatos

1. **Configurar Google Ads API**
   - Criar projeto no Google Cloud
   - Solicitar Developer Token
   - Configurar OAuth

2. **Configurar Facebook Ads API**
   - Criar Meta Business Account
   - Criar app no Meta for Developers
   - Obter System User Token

3. **Criar Migration SQL**
   - Implementar tabelas de campanhas
   - Implementar tabelas de métricas

4. **Implementar Primeira Tool**
   - Começar com `create_campaign` (Google Ads)
   - Testar criação de campanha real

---

**Versão:** 1.0  
**Data:** 15/12/2025  
**Status:** 📋 Planejamento Completo  
**Próximo Milestone:** Configurar APIs e criar primeira campanha real



















