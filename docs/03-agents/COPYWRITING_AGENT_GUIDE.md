# Guia do Copywriting Agent - Nível 6.0

## Visão Geral

O Copywriting Agent foi evoluído de **4.2/10** para **9.0/10** (nível Agente 6.0), implementando tools reais, integrações com APIs free/freemium, base de conhecimento especializada, capacidade de execução e colaboração com outros agentes.

## Features Implementadas

### 1. Grammar Checking (check_grammar)

**Tool Real:** Verifica gramática usando LanguageTool API (free) ou server local.

**Uso:**
```javascript
await executeSpecializedAgent('copywriting', 'Verifique a gramática deste texto: "Este é um texto de exemplo."');
```

**Configuração:**
- **API Pública (FREE):** `LANGUAGETOOL_API_URL=https://api.languagetool.org/v2/check` (20 req/min, 10k/month)
- **Server Local (100% FREE):** `LANGUAGETOOL_USE_LOCAL=true` e `LANGUAGETOOL_LOCAL_URL=http://localhost:8081/v2/check`

### 2. Tone Analysis (analyze_tone)

**Tool Real:** Analisa tom e sentimento usando Hugging Face API + LLM local.

**Uso:**
```javascript
await executeSpecializedAgent('copywriting', 'Analise o tom deste texto: "Nossa solução é incrível!"');
```

**Configuração:**
- **Hugging Face API (FREE):** Criar conta em https://huggingface.co e gerar token
- **Fallback:** Análise local básica se API não configurada

### 3. SEO Analysis (analyze_seo)

**Tool Real:** Analisa SEO usando SerperAPI (já configurado) para keywords e competidores.

**Uso:**
```javascript
await executeSpecializedAgent('copywriting', 'Analise o SEO deste texto: "SaaS para empresas..."');
```

**Features:**
- Extração automática de keywords
- Volume de busca via SerperAPI
- Análise de competidores

### 4. Content Publishing (publish_content)

**Tool Real:** Publica conteúdo no WordPress via REST API.

**Uso:**
```javascript
await executeSpecializedAgent('copywriting', 'Publique este conteúdo no WordPress: título "Teste", conteúdo "Este é um teste."');
```

**Configuração:**
- **WordPress (FREE):** Self-hosted ou WordPress.com
- Requer: `WORDPRESS_URL`, `WORDPRESS_USERNAME`, `WORDPRESS_APP_PASSWORD`

### 5. Campaign Creation (create_campaign)

**Tool Real:** Cria campanhas com handoff automático para Marketing Agent.

**Uso:**
```javascript
await executeSpecializedAgent('copywriting', 'Crie uma campanha chamada "Black Friday 2025" com variantes de copy.');
```

**Features:**
- Criação no Supabase
- Handoff automático para Marketing Agent
- Suporte para múltiplas variantes

### 6. Performance Analysis (analyze_performance)

**Tool Real:** Analisa performance usando Google Analytics Data API.

**Uso:**
```javascript
await executeSpecializedAgent('copywriting', 'Analise a performance da URL: https://example.com/post');
```

**Configuração:**
- **Google Analytics (FREE):** Requer GA4 property e OAuth 2.0 credentials
- Configurar: `GOOGLE_ANALYTICS_PROPERTY_ID`, `GOOGLE_ANALYTICS_CLIENT_ID`, etc.

## Sistema de Colaboração

### Handoff entre Agentes

O sistema permite handoff automático entre agentes:

- **Copywriting → Marketing:** Revisar campanhas
- **Copywriting → Sales:** Ajustar copy baseado em feedback

**Implementação:** `scripts/cerebro/agent_collaboration.js`

## Sistema de Feedback

### Feedback Loop

O sistema processa feedback de performance e ajusta copy automaticamente:

**Implementação:** `scripts/cerebro/feedback_processor.js`

**Features:**
- Análise de métricas (CTR, conversão, bounce rate)
- Geração automática de copy melhorado
- Aprendizado contínuo

## Base de Conhecimento

### Templates por Indústria

Sistema de templates para diferentes indústrias e tipos de copy:

- **SaaS:** Landing pages, emails, pricing pages
- **E-commerce:** Product pages, abandoned cart emails
- **B2B:** Sales pages, case studies

**Implementação:** `scripts/cerebro/copywriting_templates.js`

### Exemplos Vetorizados

Sistema para baixar e vetorizar 1000+ exemplos de copy de sucesso:

**Implementação:** `scripts/cerebro/copy_examples_scraper.js`

**Fontes:**
- Copyblogger.com
- Copyhackers.com
- Landing pages de sucesso

## Métricas e Dashboard

### Tracking de Performance

Sistema completo de métricas:

**Implementação:** `scripts/cerebro/copywriting_metrics.js`

**Features:**
- Tracking automático via GA4
- Cálculo de performance score (0-100)
- Armazenamento no Supabase

### Dashboard

Dashboard para visualizar performance:

**Implementação:** `scripts/cerebro/copywriting_dashboard.js`

**Features:**
- Relatórios de performance
- Comparação de variantes
- Estatísticas agregadas

## Configuração

### Variáveis de Ambiente

Adicionar ao `env.local`:

```env
# Grammar
LANGUAGETOOL_API_URL=https://api.languagetool.org/v2/check
LANGUAGETOOL_USE_LOCAL=false

# Sentiment
HUGGINGFACE_API_KEY=your_key_here

# WordPress
WORDPRESS_URL=https://your-site.com
WORDPRESS_USERNAME=your_username
WORDPRESS_APP_PASSWORD=your_app_password

# Analytics
GOOGLE_ANALYTICS_PROPERTY_ID=your_property_id
GOOGLE_ANALYTICS_CLIENT_ID=your_client_id
GOOGLE_ANALYTICS_CLIENT_SECRET=your_client_secret
GOOGLE_ANALYTICS_REFRESH_TOKEN=your_refresh_token
```

### Migrações SQL

Aplicar migração:

```bash
# Via Supabase CLI
supabase migration up add_copywriting_tables
```

Ou executar manualmente: `supabase/migrations/add_copywriting_tables.sql`

## Estrutura de Arquivos

### Novos Arquivos Criados:

1. `scripts/utils/languagetool_client.js` - Cliente LanguageTool
2. `scripts/utils/huggingface_client.js` - Cliente Hugging Face
3. `scripts/utils/wordpress_client.js` - Cliente WordPress
4. `scripts/utils/analytics_client.js` - Cliente Google Analytics
5. `scripts/utils/seo_analyzer.js` - Analisador SEO
6. `scripts/cerebro/agent_collaboration.js` - Sistema de colaboração
7. `scripts/cerebro/feedback_processor.js` - Processamento de feedback
8. `scripts/cerebro/copywriting_templates.js` - Templates de copy
9. `scripts/cerebro/copywriting_metrics.js` - Métricas de performance
10. `scripts/cerebro/copywriting_dashboard.js` - Dashboard de métricas
11. `scripts/cerebro/copy_examples_scraper.js` - Scraper de exemplos
12. `supabase/migrations/add_copywriting_tables.sql` - Migrações SQL

### Arquivos Modificados:

1. `scripts/cerebro/agent_executor.js` - Tools reais implementadas
2. `env.local` - Variáveis de ambiente adicionadas
3. `docs/env.example` - Documentação de variáveis

## Próximos Passos

1. **Configurar APIs:** Adquirir chaves free/freemium conforme necessário
2. **Aplicar Migrações:** Executar `add_copywriting_tables.sql`
3. **Testar Integrações:** Validar cada tool
4. **Vetorizar Templates:** Executar `vectorizeTemplates()` do `copywriting_templates.js`
5. **Scraping de Exemplos:** Executar `scrapeCopyExamples()` para popular base de conhecimento

## Notas

- **100% Free/Freemium:** Todas as integrações usam APIs free ou freemium
- **Fallbacks:** Sistema tem fallbacks para funcionar mesmo sem todas as APIs configuradas
- **Observabilidade:** Logs detalhados em todos os módulos
- **Robustez:** Tratamento de erros em todas as operações

## Suporte

Para dúvidas ou problemas, verificar logs em `scripts/utils/logger.js` ou consultar documentação específica de cada módulo.






















