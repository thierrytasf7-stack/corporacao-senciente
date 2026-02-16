# Comentários para Integração Facebook Ads

## 📝 Visão Geral

Este documento lista todos os locais onde comentários explícitos foram adicionados para facilitar a integração futura do Facebook Ads API.

## 🎯 Estratégia de Integração

Todos os pontos de integração estão marcados com comentários `TODO:` ou `// TODO: Quando Facebook Ads for implementado...` para facilitar a localização e implementação.

## 📍 Locais com Comentários

### 1. `scripts/cerebro/marketing_optimizer.js`

#### Função: `collectCampaignMetrics()`
**Linha:** ~50
```javascript
// TODO: Quando Facebook Ads for implementado, adicionar suporte aqui
// if (campaign.platform === 'facebook_ads') {
//     const metrics = await getFacebookCampaignMetrics(campaign.platform_campaign_id, startDate, endDate);
//     return formatFacebookMetrics(metrics);
// }
```

#### Função: `optimizeBudget()`
**Linha:** ~150
```javascript
// TODO: Quando Facebook Ads for implementado, adicionar suporte aqui
// if (perf.campaign.platform === 'facebook_ads') {
//     await updateFacebookCampaignBudget(perf.campaign.platform_campaign_id, newBudget);
// }
```

#### Função: `pauseUnderperformers()`
**Linha:** ~200
```javascript
// TODO: Quando Facebook Ads for implementado, adicionar suporte aqui
// if (perf.campaign.platform === 'facebook_ads') {
//     await pauseFacebookCampaign(perf.campaign.platform_campaign_id);
// }
```

#### Função: `resumeTopPerformers()`
**Linha:** ~250
```javascript
// TODO: Quando Facebook Ads for implementado, adicionar suporte aqui
// if (perf.campaign.platform === 'facebook_ads') {
//     await resumeFacebookCampaign(perf.campaign.platform_campaign_id);
// }
```

### 2. `scripts/cerebro/marketing_ab_testing.js`

#### Função: `createABTestVariants()`
**Linha:** ~40
```javascript
// TODO: Quando Facebook Ads for implementado, adicionar suporte aqui
// if (platform === 'facebook_ads') {
//     return await createFacebookABTestVariants(params, variantCount);
// }
```

#### Função: `analyzeABTestResults()`
**Linha:** ~150
```javascript
// TODO: Quando Facebook Ads for implementado, adicionar suporte aqui
// if (variant.platform === 'facebook_ads') {
//     const metrics = await getFacebookCampaignMetrics(variant.platform_campaign_id, startDate, endDate);
//     variantMetrics.push({ variant, metrics });
//     continue;
// }
```

#### Função: `scaleWinnerAndPauseLosers()`
**Linha:** ~300
```javascript
// TODO: Quando Facebook Ads for implementado, adicionar suporte aqui
// if (winnerCampaign.data.platform === 'facebook_ads') {
//     await updateFacebookCampaignBudget(winnerCampaign.data.platform_campaign_id, newBudget);
// }

// TODO: Quando Facebook Ads for implementado, adicionar suporte aqui
// if (loserCampaign.data.platform === 'facebook_ads') {
//     await pauseFacebookCampaign(loserCampaign.data.platform_campaign_id);
// }
```

### 3. `scripts/cerebro/agent_executor.js`

#### Tool: `segment_audience`
**Linha:** ~820
```javascript
// TODO: Quando Facebook Ads for implementado, adicionar suporte aqui
// if (platform === 'facebook_ads') {
//     return await segmentFacebookAudience({ demographics, behavior, interests });
// }
```

#### Tool: `create_ab_test`
**Linha:** ~880
```javascript
// TODO: Quando Facebook Ads for implementado, adicionar suporte aqui
// if (platform === 'facebook_ads') {
//     const { createABTestVariants } = await import('./marketing_ab_testing.js');
//     return await createABTestVariants(params, variantCount);
// }
```

## 🔧 Estrutura Sugerida para Implementação

### Arquivo: `scripts/utils/facebook_ads_client.js`

```javascript
/**
 * Facebook Ads API Client
 * 
 * Cliente para interagir com a Facebook/Meta Ads API
 * Similar ao google_ads_client.js
 */

import { FacebookAdsApi } from 'facebook-nodejs-business-sdk';
import { config } from 'dotenv';
import fs from 'fs';
import { logger } from './logger.js';

const log = logger.child({ module: 'facebook_ads_client' });

config({ path: fs.existsSync('.env') ? '.env' : 'env.local' });

const {
    META_ADS_APP_ID,
    META_ADS_APP_SECRET,
    META_ADS_ACCESS_TOKEN,
    META_ADS_ACCOUNT_ID,
} = process.env;

function validateCredentials() {
    const missing = [];
    if (!META_ADS_APP_ID) missing.push('META_ADS_APP_ID');
    if (!META_ADS_APP_SECRET) missing.push('META_ADS_APP_SECRET');
    if (!META_ADS_ACCESS_TOKEN) missing.push('META_ADS_ACCESS_TOKEN');
    if (!META_ADS_ACCOUNT_ID) missing.push('META_ADS_ACCOUNT_ID');

    if (missing.length > 0) {
        throw new Error(`Credenciais faltando: ${missing.join(', ')}`);
    }
}

function createClient() {
    validateCredentials();
    // Implementar criação do cliente Facebook Ads
}

export async function createCampaign({ name, objective, dailyBudget, adCopy, targetAudience }) {
    // Implementar criação de campanha Facebook Ads
}

export async function getCampaignMetrics(campaignId, startDate, endDate) {
    // Implementar coleta de métricas Facebook Ads
}

export async function updateCampaignBudget(campaignId, newDailyBudget) {
    // Implementar atualização de orçamento Facebook Ads
}

export async function pauseCampaign(campaignId) {
    // Implementar pausa de campanha Facebook Ads
}

export async function resumeCampaign(campaignId) {
    // Implementar retomada de campanha Facebook Ads
}

export async function listCampaigns() {
    // Implementar listagem de campanhas Facebook Ads
}

export async function createABTestVariants(params, variantCount) {
    // Implementar criação de variantes A/B Facebook Ads
}

export async function segmentAudience({ demographics, behavior, interests }) {
    // Implementar segmentação de audiência Facebook Ads
}
```

## 📋 Checklist de Implementação

Quando for implementar Facebook Ads:

- [ ] Criar `scripts/utils/facebook_ads_client.js`
- [ ] Instalar `facebook-nodejs-business-sdk`
- [ ] Configurar credenciais no `env.local`
- [ ] Remover TODOs em `marketing_optimizer.js` (4 locais)
- [ ] Remover TODOs em `marketing_ab_testing.js` (3 locais)
- [ ] Remover TODOs em `agent_executor.js` (2 locais)
- [ ] Testar criação de campanha
- [ ] Testar coleta de métricas
- [ ] Testar otimização automática
- [ ] Testar A/B testing
- [ ] Testar segmentação de audiência
- [ ] Documentar uso

## 🔗 Referências

- [Facebook Marketing API Documentation](https://developers.facebook.com/docs/marketing-apis)
- [facebook-nodejs-business-sdk](https://github.com/facebook/facebook-nodejs-business-sdk)
- [Google Ads Client (referência)](scripts/utils/google_ads_client.js)

## 📝 Notas

- Todos os comentários seguem o padrão: `// TODO: Quando Facebook Ads for implementado...`
- A estrutura deve seguir o mesmo padrão do Google Ads Client
- Testar cada funcionalidade isoladamente antes de integrar
- Manter compatibilidade com o código existente

---

**Criado em:** 16/12/2025  
**Status:** 📝 Comentários adicionados, aguardando implementação

















