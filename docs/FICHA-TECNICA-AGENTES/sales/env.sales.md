# Credenciais Sales Agent - Variáveis de Ambiente

## Visão Geral

Este documento lista todas as credenciais necessárias para o Sales Agent funcionar completamente. As credenciais estão organizadas por plataforma CRM e separadas entre contas oficiais e de teste.

## Pipedrive API

### Conta Oficial
```env
# ============================================================================
# PIPEDRIVE API - Conta Oficial
# ============================================================================
# Função: Integração com Pipedrive CRM para gestão de leads e deals
# Uso: Sales Agent - create_lead, create_deal, analyze_funnel
# Documentação: https://developers.pipedrive.com
# Plano: Gratuito (3 usuários, leads ilimitados)
# ============================================================================
PIPEDRIVE_API_TOKEN=ccf3833dc78064d414f71fc30ffabcc46313e0d3
# Company Name: Coorporacao-Senciente
# Company Domain: coorporacao-senciente
# URL completa: https://coorporacao-senciente.pipedrive.com
PIPEDRIVE_COMPANY_DOMAIN=coorporacao-senciente
```

**Como obter:**
1. Acesse https://yourcompany.pipedrive.com/settings/api
2. Copie o API Token
3. Configure o COMPANY_DOMAIN (nome da sua empresa no Pipedrive)

## HubSpot API

### Conta Oficial (Produção)
```env
# ============================================================================
# HUBSPOT API - Conta Oficial (Produção)
# ============================================================================
# Função: Integração com HubSpot CRM para gestão de contacts e deals
# Uso: Sales Agent - create_lead, create_deal, analyze_funnel
# Documentação: https://developers.hubspot.com
# Plano: Gratuito (CRM completo, até 1M contatos)
# ============================================================================
HUBSPOT_API_KEY=CiRuYTEtNzYxYS1mOWU4LTRmYzQtYmQ0YS1jYzEzNDM3M2JhNmMQ9tCdGBiyi5IpKhkABeaRgrnYhLANmqYCJHr-JDl02TIqZcvQSgNuYTE
HUBSPOT_DEVELOPER_API_KEY=9dd2ad79-efc6-4bba-9459-156720ba23e0
```

**Como obter:**
1. Acesse https://app.hubspot.com/private-apps
2. Crie uma Private App
3. Copie a API Key (Chave de acesso pessoal)
4. Copie a Developer API Key (Chave de API do desenvolvedor)

### Conta de Teste (Desenvolvimento/Treino)
```env
# ============================================================================
# HUBSPOT API - Conta de Teste (Desenvolvimento/Treino)
# ============================================================================
# Função: Ambiente de teste para desenvolvimento e treinamento
# Uso: Testes, desenvolvimento, treinamento de modelos
# IMPORTANTE: Use esta conta para testes, não para produção
# ============================================================================
HUBSPOT_TEST_API_KEY=CiRuYTEtNTgyMy00ODc2LTQxMmItOTlhYS0wOTk5MGRjYTYwYTQQi9GdGBiyi5IpKhkABeaRgn15mnT6aOEc2IjiaDdQ-rQHUZSCSgNuYTE
HUBSPOT_TEST_DEVELOPER_API_KEY=66a2a577-6feb-445e-9d5d-a4b37c6e2f01
```

**Como usar:**
- Para testes: Configure `HUBSPOT_API_KEY` com `HUBSPOT_TEST_API_KEY`
- Para produção: Use `HUBSPOT_API_KEY` oficial
- O sistema pode alternar entre contas conforme necessário

## Salesforce API

### Configuração Básica
```env
# ============================================================================
# SALESFORCE API
# ============================================================================
# Função: Integração com Salesforce CRM
# Uso: Sales Agent - create_salesforce_lead, create_salesforce_opportunity
# Documentação: https://developer.salesforce.com/docs/apis
# Plano: Developer Edition (gratuito para desenvolvimento)
# ============================================================================
# Opção 1: Access Token direto
SALESFORCE_INSTANCE_URL=https://yourinstance.salesforce.com
SALESFORCE_ACCESS_TOKEN=your_access_token

# Opção 2: OAuth (recomendado para produção)
SALESFORCE_CLIENT_ID=your_client_id
SALESFORCE_CLIENT_SECRET=your_client_secret
SALESFORCE_USERNAME=your_username
SALESFORCE_PASSWORD=your_password
SALESFORCE_SECURITY_TOKEN=your_security_token
```

**Como obter:**
1. Crie uma conta Developer Edition em https://developer.salesforce.com
2. Configure OAuth ou obtenha Access Token
3. Configure as credenciais acima

## Configuração no env.local

Adicione todas as credenciais acima no arquivo `env.local` na raiz do projeto, na seção do Sales Agent.

## Alternância entre Contas

### HubSpot Test vs Oficial

O sistema pode alternar entre contas de teste e oficiais:

**Para usar conta de teste:**
```env
HUBSPOT_API_KEY=${HUBSPOT_TEST_API_KEY}
```

**Para usar conta oficial:**
```env
HUBSPOT_API_KEY=${HUBSPOT_API_KEY}  # Conta oficial
```

**No código:**
```javascript
// O cliente HubSpot pode verificar se deve usar test ou oficial
const apiKey = process.env.USE_HUBSPOT_TEST === 'true' 
    ? process.env.HUBSPOT_TEST_API_KEY 
    : process.env.HUBSPOT_API_KEY;
```

## Segurança

⚠️ **IMPORTANTE:**
- Nunca commite credenciais no Git
- Use `.env.local` (já está no `.gitignore`)
- Rotacione credenciais periodicamente
- Use contas de teste para desenvolvimento
- Use contas oficiais apenas em produção

## Troubleshooting

### Erro: "API Token inválido"
- Verifique se o token está correto
- Verifique se o domínio está correto (Pipedrive)
- Verifique se a conta está ativa

### Erro: "Rate limit exceeded"
- Use conta de teste para desenvolvimento
- Implemente retry com backoff
- Monitore uso de API

---

**Versão:** 1.0  
**Data:** 16/12/2025  
**Última Atualização:** 16/12/2025

