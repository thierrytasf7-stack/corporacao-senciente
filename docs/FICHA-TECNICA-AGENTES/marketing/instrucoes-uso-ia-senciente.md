# Instruções de Uso - Marketing Agent (Para IA-Senciente) - V.2

## Visão Geral

Este documento fornece informações técnicas para que outras IAs possam utilizar o Marketing Agent na versão 2.0. **Nota:** O agente está em estado avançado (V.2 - 6.5/10) com funcionalidades completas para Google Ads.

## Capacidades do Agente

### O que o Marketing Agent tem e faz

O Marketing Agent é um agente especializado em estratégia de marketing, campanhas, otimização automática, A/B testing e segmentação de audiência. Atualmente possui:

- **13 tools funcionais** (100% implementadas)
- **1 integração ativa** (Google Ads API)
- **Sistema de otimização automática** completo
- **Sistema de A/B testing** automático
- **Segmentação de audiência** com LLM

### Domínio de Especialização

- Estratégia de marketing
- Campanhas e canais (Google Ads ✅, Facebook Ads ⚠️)
- Otimização automática de campanhas
- A/B testing automático
- Segmentação de audiência
- Análise de ROI, ROAS, CPA
- Posicionamento e growth marketing

## Quando Usar Este Agente

### Use o Marketing Agent quando:

1. **Precisa criar campanhas reais:**
   - ✅ Criar campanhas Google Ads
   - ✅ Configurar orçamento, keywords, ad copy
   - ⚠️ Facebook Ads (comentários prontos, não implementado)

2. **Precisa otimizar campanhas:**
   - ✅ Otimização automática completa
   - ✅ Redistribuição de orçamento
   - ✅ Pausa/retomada automática
   - ✅ Análise de performance

3. **Precisa fazer A/B testing:**
   - ✅ Criação automática de variantes
   - ✅ Geração de copy variado
   - ✅ Análise estatística
   - ✅ Escalação automática de vencedoras

4. **Precisa segmentar audiência:**
   - ✅ Análise demográfica, comportamental e de interesses
   - ✅ Criação de segmentos personalizados
   - ✅ Recomendações de canais

5. **Precisa analisar performance:**
   - ✅ ROI, ROAS, CPA
   - ✅ Métricas do Google Ads
   - ✅ Análise de concorrentes

### NÃO use o Marketing Agent quando:

- Precisa criar campanhas Facebook Ads (não implementado, mas comentários prontos)
- Precisa integrar com CRM (HubSpot, Salesforce - não implementado)
- Precisa de dados de outras plataformas além de Google Ads

## Como Solicitar Tarefas

### Formato de Input

```
[Action] [Target] [Context] [Parameters]
```

**Exemplos:**
- `Crie uma campanha: nome="Black Friday", objetivo=SALES, orçamento=R$ 200`
- `Otimize todas as campanhas automaticamente`
- `Analise ROI da campanha ID: 123456789`
- `Crie teste A/B: nome="Teste Headlines", variantes=3`
- `Segmente audiência: demografia="25-45 anos", interesses="tecnologia"`

### Formato de Output

- **Sucesso:** Resultado formatado com dados reais
- **Erro:** Mensagem de erro clara com código de erro
- **Limitação:** Indicação quando funcionalidade não está disponível

## Tools Disponíveis (13/13)

### 1. `create_campaign` ✅ FUNCIONAL

**Quando usar:** Para criar campanhas reais no Google Ads.

**Input:**
```javascript
{
    name: "Black Friday 2025",
    objective: "SALES", // SALES, LEAD_GENERATION, AWARENESS
    dailyBudget: 200, // em reais
    keywords: ["black friday", "desconto", "promoção"],
    adGroupName: "Grupo Principal",
    adCopy: {
        headline1: "Black Friday 2025",
        headline2: "Até 70% OFF",
        headline3: "Frete Grátis",
        description1: "Aproveite os melhores descontos",
        description2: "Ofertas por tempo limitado",
        path1: "black-friday",
        path2: "2025"
    },
    finalUrl: "https://exemplo.com/black-friday"
}
```

**Output:**
```javascript
{
    success: true,
    campaignId: "123456789",
    campaignName: "Black Friday 2025",
    adGroupId: "987654321",
    status: "PAUSED", // Sempre inicia pausada para revisão
    message: "Campanha criada com sucesso. Status: PAUSED (aguardando ativação)"
}
```

**Nota:** Campanhas são criadas com status PAUSED para revisão. Use `resume_campaign` para ativar.

### 2. `get_campaign_metrics` ✅ FUNCIONAL

**Quando usar:** Para obter métricas reais do Google Ads.

**Input:**
```javascript
{
    campaignId: "123456789",
    startDate: "2025-12-01",
    endDate: "2025-12-15"
}
```

**Output:**
```javascript
{
    success: true,
    campaignId: "123456789",
    campaignName: "Black Friday 2025",
    status: "ENABLED",
    impressions: 50000,
    clicks: 2500,
    ctr: 0.05,
    averageCpc: 1.50,
    cost: 3750.00,
    conversions: 125,
    costPerConversion: 30.00,
    conversionRate: 0.05
}
```

### 3. `update_campaign_budget` ✅ FUNCIONAL

**Quando usar:** Para atualizar orçamento de campanhas.

**Input:**
```javascript
{
    campaignId: "123456789",
    newDailyBudget: 300 // em reais
}
```

### 4. `pause_campaign` ✅ FUNCIONAL

**Quando usar:** Para pausar campanhas ativas.

**Input:**
```javascript
{
    campaignId: "123456789"
}
```

### 5. `resume_campaign` ✅ FUNCIONAL

**Quando usar:** Para retomar campanhas pausadas.

**Input:**
```javascript
{
    campaignId: "123456789"
}
```

### 6. `list_campaigns` ✅ FUNCIONAL

**Quando usar:** Para listar todas as campanhas.

**Output:**
```javascript
{
    success: true,
    campaigns: [
        {
            id: "123456789",
            name: "Black Friday 2025",
            status: "ENABLED",
            startDate: "2025-11-20",
            endDate: null
        }
    ]
}
```

### 7. `analyze_roi` ✅ FUNCIONAL

**Quando usar:** Para análise completa de ROI.

**Input:**
```javascript
{
    campaignId: "123456789",
    startDate: "2025-12-01",
    endDate: "2025-12-15",
    revenue: 50000 // receita gerada (opcional)
}
```

**Output:**
```javascript
{
    success: true,
    campaignId: "123456789",
    roi: 1233.33, // %
    roas: 13.33,
    cpa: 30.00,
    performanceScore: 85, // 0-100
    recommendations: [
        "Aumentar orçamento em 20%",
        "Expandir keywords de alto desempenho"
    ]
}
```

### 8. `optimize_all_campaigns` ✅ FUNCIONAL

**Quando usar:** Para otimização automática completa.

**Input:** Nenhum (otimiza todas as campanhas ativas)

**Output:**
```javascript
{
    success: true,
    optimized: [
        {
            campaignId: "123456789",
            campaignName: "Black Friday",
            oldBudget: 200,
            newBudget: 250,
            increase: 50,
            reason: "Alta performance (score: 85)"
        }
    ],
    paused: [
        {
            campaignId: "987654321",
            campaignName: "Campanha Teste",
            score: 35,
            reason: "Baixa performance"
        }
    ],
    resumed: [],
    totalOptimizations: 1,
    totalPaused: 1
}
```

**Comando:** `npm run marketing:optimize`

### 9. `analyze_competitors` ✅ FUNCIONAL

**Quando usar:** Para análise de concorrentes.

**Input:**
```javascript
{
    keywords: ["marketing digital", "agência marketing"]
}
```

### 10. `segment_audience` ✅ FUNCIONAL

**Quando usar:** Para criar segmentos de audiência personalizados.

**Input:**
```javascript
{
    demographics: {
        ageRange: "25-45",
        gender: "all",
        location: "São Paulo, Brasil",
        income: "B/C"
    },
    behavior: {
        onlineShopping: "frequent",
        device: "mobile-first",
        engagement: "high"
    },
    interests: ["tecnologia", "marketing digital", "e-commerce"]
}
```

**Output:**
```javascript
{
    success: true,
    segmentId: "seg_123",
    segmentName: "Tech-Savvy Shoppers 25-45 SP",
    analysis: "Audiência altamente engajada...",
    recommendedChannels: ["Google Ads", "Facebook Ads", "LinkedIn"],
    suggestedBudget: 500,
    estimatedReach: 500000
}
```

**Armazenamento:** Salvo em `cerebro_marketing_audiences`

### 11. `create_ab_test` ✅ FUNCIONAL

**Quando usar:** Para criar teste A/B automático.

**Input:**
```javascript
{
    testName: "Teste Headlines Black Friday",
    baseCampaignId: "123456789",
    variantCount: 3,
    splitBudget: true // divide orçamento entre variantes
}
```

**Output:**
```javascript
{
    success: true,
    testId: "ab_test_123",
    testName: "Teste Headlines Black Friday",
    variants: [
        {
            variantId: "var_1",
            campaignId: "111111111",
            headline: "Black Friday 2025 - Até 70% OFF"
        },
        {
            variantId: "var_2",
            campaignId: "222222222",
            headline: "Black Friday: Ofertas Imperdíveis"
        },
        {
            variantId: "var_3",
            campaignId: "333333333",
            headline: "Black Friday: Economize Agora"
        }
    ]
}
```

**Comando:** `npm run marketing:ab:analyze <test_name>`

### 12. `analyze_ab_test` ✅ FUNCIONAL

**Quando usar:** Para analisar resultados de teste A/B.

**Input:**
```javascript
{
    testName: "Teste Headlines Black Friday"
}
```

**Output:**
```javascript
{
    success: true,
    testName: "Teste Headlines Black Friday",
    winner: {
        variantId: "var_1",
        campaignId: "111111111",
        ctr: 0.08,
        conversionRate: 0.06,
        roi: 1500
    },
    statisticalSignificance: 0.95,
    recommendation: "Escalar variante var_1"
}
```

### 13. `scale_ab_test_winner` ✅ FUNCIONAL

**Quando usar:** Para escalar vencedora e pausar perdedoras.

**Input:**
```javascript
{
    testName: "Teste Headlines Black Friday"
}
```

**Output:**
```javascript
{
    success: true,
    scaled: {
        variantId: "var_1",
        campaignId: "111111111",
        newBudget: 300
    },
    paused: ["var_2", "var_3"],
    message: "Vencedora escalada, perdedoras pausadas"
}
```

**Comando:** `npm run marketing:ab:scale <test_name>`

### 14. `search_memory` ✅ FUNCIONAL

**Quando usar:** Para buscar na memória corporativa.

**Input:**
```javascript
{
    query: "estratégia de marketing",
    limit: 5
}
```

### 15. `search_knowledge` ✅ FUNCIONAL

**Quando usar:** Para buscar conhecimento especializado.

**Input:**
```javascript
{
    query: "growth hacking",
    agentName: "marketing",
    limit: 5
}
```

## Colaboração com Outros Agentes

### Handoff Recebido

- ✅ **Copywriting → Marketing:** Recebe copy para campanhas
- ✅ **Product → Marketing:** Recebe informações de produto para campanhas
- ✅ **Finance → Marketing:** Recebe orçamento e ROI esperado

### Handoff Enviado

- ✅ **Marketing → Sales:** Envia leads e métricas de conversão
- ✅ **Marketing → Finance:** Envia ROI e custos
- ✅ **Marketing → Product:** Envia feedback de mercado

## Integração Técnica

```javascript
import { executeSpecializedAgent } from './scripts/cerebro/agent_executor.js';

// Criar campanha
const resultado = await executeSpecializedAgent(
    'marketing',
    'Crie uma campanha: nome="Black Friday", objetivo=SALES, orçamento=R$ 200'
);

// Otimizar campanhas
const otimizacao = await executeSpecializedAgent(
    'marketing',
    'Otimize todas as campanhas automaticamente'
);
```

## Error Handling

### Erros Comuns

- **DEVELOPER_TOKEN_NOT_APPROVED:** Developer Token em modo teste (esperado)
- **Campaign not found:** ID de campanha inválido
- **Insufficient budget:** Orçamento muito baixo
- **No active campaigns:** Nenhuma campanha ativa para otimizar

### Tratamento de Erros

O agente retorna erros estruturados:
```javascript
{
    success: false,
    error: "Campaign not found",
    errorCode: "CAMPAIGN_NOT_FOUND",
    details: "Campaign ID 123456789 does not exist"
}
```

## Limitações Conhecidas

1. **Facebook Ads:** Não implementado (comentários prontos em código)
2. **Developer Token:** Modo teste (upgrade pendente)
3. **Base de Conhecimento:** Precisa ser populada (`npm run marketing:populate`)
4. **CRM Integration:** Não implementado (HubSpot, Salesforce)

## Sistemas Avançados

### Otimização Automática

- Algoritmo de análise de performance
- Score de performance (0-100)
- Redistribuição automática de orçamento
- Pausa/retomada automática

**Arquivo:** `scripts/cerebro/marketing_optimizer.js`

### A/B Testing

- Criação automática de variantes
- Geração de copy variado usando LLM
- Tracking de performance
- Análise estatística
- Escalação automática

**Arquivo:** `scripts/cerebro/marketing_ab_testing.js`

### Segmentação

- Análise com LLM
- Criação de segmentos personalizados
- Recomendações de canais
- Armazenamento em Supabase

## Conclusão

O Marketing Agent está em estado avançado (V.2 - 6.5/10) com todas as funcionalidades principais implementadas para Google Ads. Sistema completo de otimização automática, A/B testing e segmentação de audiência.

**Status:** ✅ Pronto para uso em produção (Google Ads)

---

**Versão:** 2.0  
**Data:** 16/12/2025  
**Status:** ✅ Avançado - 6.5/10
