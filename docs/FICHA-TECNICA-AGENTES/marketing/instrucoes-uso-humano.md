# Instruções de Uso - Marketing Agent (Para Humanos) - V.2

## Visão Geral

Este guia explica como usar o Marketing Agent na versão 2.0. **Nota:** O agente está em estado avançado (V.2 - 6.5/10) com funcionalidades completas para Google Ads, otimização automática, A/B testing e segmentação de audiência.

## Como Usar o Agente

### Método Básico

```javascript
import { executeSpecializedAgent } from './scripts/cerebro/agent_executor.js';

const resultado = await executeSpecializedAgent(
    'marketing',
    'Criar campanha de marketing para novo produto'
);
```

### Via Comandos Cursor

1. **Ctrl+Shift+P** → "Evoluir Agente" → "marketing"
2. **Ctrl+Shift+P** → "Otimizar Campanhas"
3. **Ctrl+Shift+P** → "Popular Conhecimento Marketing"

## Tools Disponíveis (13/13 - 100%)

### ✅ Gestão de Campanhas

#### 1. `create_campaign` ✅ FUNCIONAL
**O que faz:** Cria campanhas reais no Google Ads.

**Como usar:**
```
Crie uma campanha de marketing:
- Nome: "Black Friday 2025"
- Objetivo: SALES
- Orçamento diário: R$ 100
- Keywords: ["black friday", "desconto", "promoção"]
- URL final: https://exemplo.com/black-friday
```

**Parâmetros:**
- `name`: Nome da campanha
- `objective`: SALES, LEAD_GENERATION, AWARENESS
- `dailyBudget`: Orçamento diário em reais
- `keywords`: Array de palavras-chave
- `adCopy`: Objeto com headlines e descriptions
- `finalUrl`: URL de destino

**Resultado:** Campanha criada no Google Ads (status: PAUSED para revisão)

#### 2. `get_campaign_metrics` ✅ FUNCIONAL
**O que faz:** Obtém métricas reais do Google Ads.

**Como usar:**
```
Obtenha métricas da campanha ID: 123456789
Período: 2025-12-01 até 2025-12-15
```

**Retorna:**
- Impressões, cliques, CTR
- CPC médio, custo total
- Conversões, CPA, taxa de conversão
- ROI e ROAS calculados

#### 3. `update_campaign_budget` ✅ FUNCIONAL
**O que faz:** Atualiza orçamento de campanhas.

**Como usar:**
```
Atualize o orçamento da campanha ID: 123456789
Novo orçamento diário: R$ 150
```

#### 4. `pause_campaign` ✅ FUNCIONAL
**O que faz:** Pausa campanhas ativas.

**Como usar:**
```
Pause a campanha ID: 123456789
```

#### 5. `resume_campaign` ✅ FUNCIONAL
**O que faz:** Retoma campanhas pausadas.

**Como usar:**
```
Retome a campanha ID: 123456789
```

#### 6. `list_campaigns` ✅ FUNCIONAL
**O que faz:** Lista todas as campanhas Google Ads.

**Como usar:**
```
Liste todas as campanhas
```

### ✅ Análise e Otimização

#### 7. `analyze_roi` ✅ FUNCIONAL
**O que faz:** Análise completa de ROI com métricas financeiras.

**Como usar:**
```
Analise o ROI da campanha ID: 123456789
Período: últimos 30 dias
```

**Retorna:**
- ROI, ROAS, CPA
- Score de performance (0-100)
- Recomendações automáticas
- Métricas armazenadas no Supabase

#### 8. `optimize_all_campaigns` ✅ FUNCIONAL
**O que faz:** Otimização automática completa de todas as campanhas.

**Como usar:**
```
Otimize todas as campanhas automaticamente
```

**O que faz:**
- Analisa performance de todas as campanhas
- Calcula score de performance (0-100)
- Redistribui orçamento automaticamente
- Pausa campanhas com baixa performance (< 50)
- Retoma campanhas com alta performance (> 80)
- Escala campanhas top performers

**Comando:** `npm run marketing:optimize`

#### 9. `analyze_competitors` ✅ FUNCIONAL
**O que faz:** Análise de concorrentes por keywords.

**Como usar:**
```
Analise concorrentes para as keywords: ["marketing digital", "agência marketing"]
```

### ✅ Segmentação e A/B Testing

#### 10. `segment_audience` ✅ FUNCIONAL
**O que faz:** Cria segmentos de audiência personalizados usando LLM.

**Como usar:**
```
Segmente a audiência com:
- Demografia: 25-45 anos, classe B/C
- Comportamento: compradores online frequentes
- Interesses: tecnologia, marketing digital
```

**Retorna:**
- Segmento criado com análise detalhada
- Recomendações de canais
- Sugestão de orçamento
- Armazenado em `cerebro_marketing_audiences`

#### 11. `create_ab_test` ✅ FUNCIONAL
**O que faz:** Cria teste A/B automático com variantes.

**Como usar:**
```
Crie um teste A/B para a campanha "Black Friday":
- Nome: "Teste A/B Black Friday"
- Variantes: 3
- Campanha base: ID 123456789
```

**O que faz:**
- Cria variantes automaticamente
- Gera copy variado usando LLM
- Divide orçamento entre variantes
- Armazena no Supabase

**Comando:** `npm run marketing:ab:analyze <test_name>`

#### 12. `analyze_ab_test` ✅ FUNCIONAL
**O que faz:** Analisa resultados de teste A/B com estatística.

**Como usar:**
```
Analise o teste A/B: "Teste A/B Black Friday"
```

**Retorna:**
- Análise estatística de cada variante
- Identificação de vencedora
- Significância estatística
- Recomendações

#### 13. `scale_ab_test_winner` ✅ FUNCIONAL
**O que faz:** Escala vencedora e pausa perdedoras automaticamente.

**Como usar:**
```
Escale a vencedora do teste A/B: "Teste A/B Black Friday"
```

**O que faz:**
- Identifica vencedora
- Escala orçamento da vencedora
- Pausa perdedoras
- Atualiza status no Supabase

**Comando:** `npm run marketing:ab:scale <test_name>`

### ✅ Busca e Conhecimento

#### 14. `search_memory` ✅ FUNCIONAL
**O que faz:** Busca na memória corporativa.

**Como usar:**
```
Busque na memória: "estratégia de marketing"
```

#### 15. `search_knowledge` ✅ FUNCIONAL
**O que faz:** Busca no conhecimento especializado de marketing.

**Como usar:**
```
Busque conhecimento sobre: "growth hacking"
```

## Casos de Uso Completos

### Caso 1: Criar e Otimizar Campanha Completa

```javascript
// 1. Criar campanha
await executeSpecializedAgent('marketing', `
    Crie uma campanha:
    - Nome: "Black Friday 2025"
    - Objetivo: SALES
    - Orçamento: R$ 200/dia
    - Keywords: ["black friday", "desconto"]
    - URL: https://exemplo.com/black-friday
`);

// 2. Aguardar alguns dias de dados

// 3. Analisar ROI
await executeSpecializedAgent('marketing', `
    Analise ROI da campanha ID: 123456789
`);

// 4. Otimizar automaticamente
await executeSpecializedAgent('marketing', `
    Otimize todas as campanhas
`);
```

### Caso 2: A/B Testing Automático

```javascript
// 1. Criar teste A/B
await executeSpecializedAgent('marketing', `
    Crie teste A/B:
    - Nome: "Teste Headlines Black Friday"
    - Campanha base: ID 123456789
    - Variantes: 3
`);

// 2. Aguardar coleta de dados (7-14 dias)

// 3. Analisar resultados
await executeSpecializedAgent('marketing', `
    Analise teste A/B: "Teste Headlines Black Friday"
`);

// 4. Escalar vencedora
await executeSpecializedAgent('marketing', `
    Escale vencedora do teste: "Teste Headlines Black Friday"
`);
```

### Caso 3: Segmentação de Audiência

```javascript
await executeSpecializedAgent('marketing', `
    Segmente audiência:
    - Demografia: 25-45 anos, classe B/C, São Paulo
    - Comportamento: compradores online frequentes, mobile-first
    - Interesses: tecnologia, marketing digital, e-commerce
`);
```

## Configuração

### Variáveis de Ambiente Necessárias

**Google Ads API:**
```env
GOOGLE_ADS_CUSTOMER_ID=845-800-9247
GOOGLE_ADS_DEVELOPER_TOKEN=W9NkV9F5zg50Zgk4NR_2-A
GOOGLE_ADS_CLIENT_ID=393659950592-kmemsdnh6tce7cu656u1s8ld9c38llns.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=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
GOOGLE_ADS_REFRESH_TOKEN=<obtido via npm run google-ads:setup>
```

**Supabase:**
```env
SUPABASE_URL=<sua-url>
SUPABASE_SERVICE_ROLE_KEY=<sua-key>
```

### Setup Inicial

1. **Configurar Google Ads OAuth:**
   ```bash
   npm run google-ads:setup
   ```

2. **Popular Base de Conhecimento:**
   ```bash
   npm run marketing:populate
   ```

3. **Testar Integração:**
   ```bash
   npm run google-ads:test
   npm run test:marketing
   ```

## Comandos Disponíveis

### NPM Scripts

- `npm run marketing:populate` - Popular base de conhecimento
- `npm run marketing:optimize` - Otimizar todas as campanhas
- `npm run marketing:ab:analyze <test_name>` - Analisar teste A/B
- `npm run marketing:ab:scale <test_name>` - Escalar vencedora
- `npm run test:marketing` - Testar funcionalidades
- `npm run google-ads:setup` - Configurar OAuth
- `npm run google-ads:test` - Testar conexão
- `npm run google-ads:test:campaign` - Testar criação de campanha

### Comandos Cursor

- **Evoluir Agente** → "marketing"
- **Otimizar Campanhas**
- **Popular Conhecimento Marketing**
- **Testar Marketing Agent**

## Limitações Conhecidas

### ⚠️ Limitações Atuais

1. **Facebook Ads:** Não implementado (comentários prontos para integração)
2. **Developer Token:** Modo teste (upgrade pendente para produção)
3. **Base de Conhecimento:** Precisa ser populada manualmente (`npm run marketing:populate`)
4. **CRM Integration:** Não implementado (HubSpot, Salesforce)

### ✅ Funcionalidades Completas

- ✅ Google Ads API (100%)
- ✅ Otimização automática (100%)
- ✅ A/B testing (100%)
- ✅ Segmentação de audiência (100%)
- ✅ Análise de ROI (100%)

## Troubleshooting

### Problema: "Developer Token não aprovado"

**Causa:** Developer Token está em modo teste.

**Solução:** 
- Para testes: Use conta de teste do Google Ads
- Para produção: Solicite upgrade do Developer Token para "Basic" ou "Standard"

**Documentação:** `docs/PENDENCIAS_GOOGLE_ADS.md`

### Problema: "Campanha criada mas não aparece"

**Causa:** Campanhas são criadas com status PAUSED para revisão.

**Solução:** 
- Use `resume_campaign` para ativar
- Ou ative manualmente no Google Ads

### Problema: "Base de conhecimento vazia"

**Causa:** Base não foi populada.

**Solução:**
```bash
npm run marketing:populate
```

### Problema: "Erro ao otimizar campanhas"

**Causa:** Pode ser falta de dados ou campanhas inativas.

**Solução:**
- Verifique se há campanhas ativas
- Aguarde coleta de dados (mínimo 3-7 dias)
- Verifique logs em `scripts/cerebro/marketing_optimizer.js`

## Próximos Passos

1. **Popular Base de Conhecimento:** Execute `npm run marketing:populate`
2. **Integrar Facebook Ads:** Implementar cliente Facebook Ads
3. **Upgrade Developer Token:** Solicitar upgrade para produção
4. **Integrar CRM:** HubSpot, Salesforce

## Recursos Adicionais

- **Ficha Técnica:** `docs/FICHA-TECNICA-AGENTES/marketing/ficha-tecnica-atual-v2-6_5.md`
- **Próximas Tasks:** `docs/FICHA-TECNICA-AGENTES/marketing/proximas-tasks-evolucao.md`
- **Documentação Google Ads:** `docs/GUIA_CONFIGURACAO_GOOGLE_ADS_API.md`
- **Comentários Facebook Ads:** `docs/COMENTARIOS_FACEBOOK_ADS.md`

---

**Versão:** 2.0  
**Data:** 16/12/2025  
**Status:** ✅ Avançado - 6.5/10 - Pronto para Uso
