# Marketing Agent - Credenciais e Configurações

## 📋 Arquivo de Referência

Este documento referencia todas as variáveis de ambiente do Marketing Agent.

**Arquivos de referência:**
- `env.local` (raiz do projeto) - **FONTE PRINCIPAL - usado pelo sistema**
- `docs/FICHA-TECNICA-AGENTES/marketing/credenciais-marketing.txt` - Documentação completa

---

## ✅ Google Ads API - Configurado

**Status:** ✅ OAuth Client criado, Developer Token configurado  
**Pendente:** ⚠️ Refresh Token (aguardando autorização OAuth)  
**Nível:** ⚠️ Conta de Teste - UPGRADE PENDENTE para Produção

### Credenciais Configuradas:

```bash
# Customer ID (Manager Account)
GOOGLE_ADS_CUSTOMER_ID=845-800-9247

# Developer Token
GOOGLE_ADS_DEVELOPER_TOKEN=W9NkV9F5zg50Zgk4NR_2-A

# OAuth 2.0 Credentials
GOOGLE_ADS_CLIENT_ID=393659950592-kmemsdnh6tce7cu656u1s8ld9c38llns.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=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

# OAuth Tokens (aguardando)
GOOGLE_ADS_REFRESH_TOKEN=
GOOGLE_ADS_ACCESS_TOKEN=
GOOGLE_ADS_TOKEN_EXPIRY=
```

### Informações da Conta:

- **Nome:** tasf-admin-ads
- **Email:** thierry.tasf7@gmail.com
- **Customer ID:** 845-800-9247
- **Tipo:** Manager Account

### Próximos Passos:

1. ✅ **Developer Token:** Configurado
2. ⚠️ **Refresh Token:** Executar `npm run google-ads:setup`
3. 📋 **Upgrade Produção:** Ver `docs/PENDENCIAS_GOOGLE_ADS.md`

---

## ⚠️ Facebook/Meta Ads API - Pendente

**Status:** ⚠️ Aguardando configuração

### Credenciais Necessárias:

```bash
META_ADS_APP_ID=
META_ADS_APP_SECRET=
META_ADS_ACCESS_TOKEN=
META_ADS_ACCOUNT_ID=
```

### Como Configurar:

1. Criar Meta Business Account: https://business.facebook.com
2. Criar App: https://developers.facebook.com
3. Adicionar "Marketing API" ao app
4. Criar System User e gerar token

---

## ✅ Google Analytics 4 - Compartilhado

**Status:** ✅ Configurado (compartilhado com Copywriting Agent)

**Nota:** Reutiliza credenciais do Copywriting Agent. Ver `env.local` principal.

---

## ✅ Google Search Console - Compartilhado

**Status:** ✅ Configurado (compartilhado com SEO Agent)

**Nota:** Reutiliza OAuth do Google Analytics.

---

## 📚 Documentação Relacionada

- **Guia Completo:** `docs/GUIA_CONFIGURACAO_GOOGLE_ADS_API.md`
- **Pendências:** `docs/PENDENCIAS_GOOGLE_ADS.md`
- **Arquivo .env Completo:** `.env.marketing` (nesta pasta)
- **env.local Principal:** `env.local` (raiz do projeto)

