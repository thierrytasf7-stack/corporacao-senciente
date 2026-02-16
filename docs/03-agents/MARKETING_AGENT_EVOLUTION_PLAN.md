# Plano de Execução Detalhado - Marketing Agent Evolution

## 🎯 Objetivo Final

Evoluir Marketing Agent de **3.8/10 → 6.5+/10** (nível Agente 6.0)

## 📋 Checklist Completo de Implementação

### ✅ FASE 1: Setup e Configuração (Dias 1-3)

#### 1.1 Configuração Google Ads API
- [ ] Criar projeto no [Google Cloud Console](https://console.cloud.google.com)
- [ ] Habilitar "Google Ads API" no projeto
- [ ] Criar OAuth 2.0 credentials (Application Type: Desktop app)
- [ ] Solicitar Developer Token no [Google Ads](https://ads.google.com/aw/apicenter)
- [ ] Obter Customer ID da conta Google Ads
- [ ] Configurar variáveis em `env.local`:
  ```bash
  GOOGLE_ADS_CUSTOMER_ID=123-456-7890
  GOOGLE_ADS_DEVELOPER_TOKEN=your_token
  GOOGLE_ADS_CLIENT_ID=your_client_id
  GOOGLE_ADS_CLIENT_SECRET=your_client_secret
  GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token
  ```

#### 1.2 Configuração Facebook/Meta Ads API
- [ ] Criar [Meta Business Account](https://business.facebook.com)
- [ ] Criar app no [Meta for Developers](https://developers.facebook.com)
- [ ] Adicionar "Marketing API" ao app
- [ ] Criar System User e gerar token
- [ ] Obter Ad Account ID
- [ ] Configurar variáveis em `env.local`:
  ```bash
  META_ADS_APP_ID=your_app_id
  META_ADS_APP_SECRET=your_app_secret
  META_ADS_ACCESS_TOKEN=your_access_token
  META_ADS_ACCOUNT_ID=act_your_account_id
  ```

#### 1.3 Google Search Console API
- [ ] Verificar propriedade no [Search Console](https://search.google.com/search-console)
- [ ] Reutilizar OAuth do GA4 (já configurado)
- [ ] Configurar variável em `env.local`:
  ```bash
  GOOGLE_SEARCH_CONSOLE_SITE_URL=https://your-site.com
  ```

#### 1.4 Banco de Dados
- [ ] Criar migration `supabase/migrations/add_marketing_tables.sql`
- [ ] Aplicar migration via MCP Supabase ou manualmente
- [ ] Validar criação das tabelas

### ✅ FASE 2: Bibliotecas e Dependências (Dia 4)

- [ ] Instalar dependências:
  ```bash
  npm install google-ads-api facebook-nodejs-business-sdk
  ```
- [ ] Atualizar `package.json` com novas dependências

### ✅ FASE 3: Implementação de Clientes (Dias 5-7)

#### 3.1 Google Ads Client
- [ ] Criar `scripts/utils/google_ads_client.js`
- [ ] Implementar autenticação OAuth
- [ ] Implementar função `createCampaign()`
- [ ] Implementar função `getCampaignMetrics()`
- [ ] Implementar função `updateCampaignBudget()`
- [ ] Implementar função `pauseCampaign()`
- [ ] Testar com campanha de teste

#### 3.2 Facebook Ads Client
- [ ] Criar `scripts/utils/facebook_ads_client.js`
- [ ] Implementar autenticação
- [ ] Implementar função `createCampaign()`
- [ ] Implementar função `getCampaignMetrics()`
- [ ] Implementar função `updateCampaignBudget()`
- [ ] Testar com campanha de teste

#### 3.3 Marketing Metrics Calculator
- [ ] Criar `scripts/utils/marketing_metrics.js`
- [ ] Implementar `calculateROI()`
- [ ] Implementar `calculateCPA()`
- [ ] Implementar `calculateCTR()`
- [ ] Implementar `calculateCPC()`
- [ ] Implementar `aggregateMetrics()`

### ✅ FASE 4: Tools do Agent (Dias 8-10)

#### 4.1 Tool: `create_campaign`
- [ ] Integrar no `agent_executor.js` (case 'marketing')
- [ ] Implementar criação via Google Ads
- [ ] Implementar criação via Facebook Ads
- [ ] Salvar campanha no Supabase
- [ ] Handoff para Copywriting (se necessário)
- [ ] Testar criação real

#### 4.2 Tool: `optimize_budget`
- [ ] Buscar métricas de todas as campanhas ativas
- [ ] Calcular ROI por campanha
- [ ] Identificar campanhas abaixo do benchmark
- [ ] Redistribuir orçamento
- [ ] Atualizar campanhas via API
- [ ] Logar decisões

#### 4.3 Tool: `analyze_roi`
- [ ] Buscar métricas do Google Ads
- [ ] Buscar métricas do Facebook Ads
- [ ] Buscar receita do Google Analytics
- [ ] Calcular ROI agregado
- [ ] Calcular ROI por campanha
- [ ] Retornar relatório detalhado

#### 4.4 Tool: `segment_audience`
- [ ] Implementar análise demográfica
- [ ] Implementar segmentação por comportamento
- [ ] Criar audiências personalizadas
- [ ] Salvar audiências no Supabase

#### 4.5 Tool: `analyze_competitors`
- [ ] Reutilizar SerperAPI (já configurado)
- [ ] Buscar anúncios de concorrentes
- [ ] Analisar estratégias
- [ ] Retornar insights

### ✅ FASE 5: Base de Conhecimento (Dias 11-13)

#### 5.1 Scraping de Estratégias
- [ ] Criar `scripts/cerebro/marketing_knowledge_scraper.js`
- [ ] Implementar scraping do HubSpot Blog
- [ ] Implementar scraping do Neil Patel Blog
- [ ] Implementar scraping do Backlinko
- [ ] Vetorizar conteúdo scrapado
- [ ] Armazenar em `cerebro_specialized_knowledge`

#### 5.2 Frameworks Vetorizados
- [ ] Criar documento com framework AARRR
- [ ] Criar documento com Growth Hacking Funnel
- [ ] Criar documento com Content Marketing Matrix
- [ ] Vetorizar todos os frameworks
- [ ] Armazenar em `cerebro_specialized_knowledge`

#### 5.3 Templates de Campanhas
- [ ] Criar templates por indústria
- [ ] Criar templates por objetivo
- [ ] Criar templates por plataforma
- [ ] Vetorizar templates
- [ ] Armazenar em `cerebro_specialized_knowledge`

### ✅ FASE 6: Otimização Automática (Dias 14-16)

#### 6.1 Algoritmo de Otimização
- [ ] Criar `scripts/cerebro/marketing_optimizer.js`
- [ ] Implementar coleta diária de métricas
- [ ] Implementar análise de performance
- [ ] Implementar redistribuição de orçamento
- [ ] Implementar pausa/ativação automática
- [ ] Criar job scheduler (executar diariamente)

#### 6.2 A/B Testing
- [ ] Implementar criação de variantes
- [ ] Implementar tracking de variantes
- [ ] Implementar análise estatística
- [ ] Implementar seleção de vencedoras
- [ ] Implementar escala de vencedoras

### ✅ FASE 7: Testes e Validação (Dias 17-18)

- [ ] Testar todas as tools individualmente
- [ ] Testar integração completa
- [ ] Testar criação de campanha real (com orçamento mínimo)
- [ ] Testar otimização automática
- [ ] Validar ROI calculado
- [ ] Documentar uso e exemplos

### ✅ FASE 8: Documentação (Dias 19-20)

- [ ] Atualizar `ficha-tecnica-atual-v2-6_5.md`
- [ ] Criar `MARKETING_AGENT_GUIDE.md` (similar ao Copywriting)
- [ ] Atualizar `instrucoes-uso-humano.md`
- [ ] Atualizar `instrucoes-uso-ia-senciente.md`
- [ ] Atualizar `proximas-tasks-evolucao.md`
- [ ] Criar exemplos de uso

## 📦 Comandos de Instalação

```bash
# 1. Instalar dependências
npm install google-ads-api facebook-nodejs-business-sdk

# 2. Aplicar migration SQL
# Via MCP Supabase ou diretamente no Supabase Dashboard

# 3. Configurar variáveis de ambiente
# Adicionar todas as credenciais no env.local

# 4. Testar Google Ads (após configurar credenciais)
node scripts/test_google_ads.js

# 5. Testar Facebook Ads (após configurar credenciais)
node scripts/test_facebook_ads.js

# 6. Popular base de conhecimento
node scripts/popular_marketing_knowledge.js

# 7. Testar Marketing Agent completo
npm run test:marketing
```

## 🎯 Critérios de Sucesso

### Fase 1-2: Setup
- ✅ Todas as credenciais configuradas
- ✅ Migration aplicada com sucesso
- ✅ Dependências instaladas

### Fase 3-4: Implementação
- ✅ 8/8 tools funcionais
- ✅ Criação de campanha real funcionando
- ✅ Métricas sendo coletadas

### Fase 5-6: Otimização
- ✅ 500+ itens de conhecimento vetorizados
- ✅ Otimização automática funcionando
- ✅ A/B testing operacional

### Fase 7-8: Finalização
- ✅ Testes passando
- ✅ Documentação completa
- ✅ Nota alcançada: 6.5+/10

## 📊 Métricas de Acompanhamento

| Métrica | Meta | Status |
|---------|------|--------|
| Tools Funcionais | 8/8 | 0/8 |
| Integrações Ativas | 5+ | 0 |
| Base de Conhecimento | 500+ itens | 0 |
| ROI Calculado | Automático | Não |
| Campanhas Criadas | Real | Não |

## 🚀 Próximos Passos Imediatos

1. **Configurar Google Ads API** (prioridade máxima)
2. **Configurar Facebook Ads API** (prioridade alta)
3. **Criar migration SQL** (prioridade alta)
4. **Implementar primeira tool** (`create_campaign`)

---

**Criado em:** 15/12/2025  
**Status:** 📋 Pronto para execução  
**Estimativa:** 20 dias de trabalho (2-3 semanas)



















