# Guia Completo - Configuração Google Ads API

## Passo 1: Criar OAuth Client ID

### 1.1 Tipo de Aplicativo
✅ **Selecione: "App para computador" (Desktop app)**

### 1.2 Preencher Informações
- **Nome:** `Marketing Agent - Google Ads API`
- **Redirect URIs:** Deixe vazio OU adicione `http://localhost:8080/oauth/callback`

### 1.3 Criar e Copiar Credenciais
Após clicar em "Criar", você receberá:
- ✅ **Client ID** (copie e salve)
- ✅ **Client Secret** (copie e salve - só aparece uma vez!)

## Passo 2: Adicionar Credenciais ao env.local

Abra `env.local` e adicione:

```bash
# Google Ads API
GOOGLE_ADS_CLIENT_ID=seu_client_id_aqui
GOOGLE_ADS_CLIENT_SECRET=seu_client_secret_aqui
```

**IMPORTANTE:** Substitua pelos valores reais que você copiou!

## Passo 3: Obter Developer Token

1. Acesse: https://ads.google.com/aw/apicenter
2. Vá em **"Tools" > "API Center"**
3. Clique em **"Apply for access"**
4. Preencha o formulário:
   - **Application type:** "My Client Library"
   - **Use case:** Selecione "I will access the API for my own use"
   - **Description:** "Automação de campanhas para Marketing Agent - Sistema interno de gestão de publicidade"
5. Aguarde aprovação (pode levar algumas horas ou dias)

Após aprovação:
- Copie o **Developer Token**
- Adicione ao `env.local`:
  ```bash
  GOOGLE_ADS_DEVELOPER_TOKEN=seu_developer_token_aqui
  ```

## Passo 4: Obter Customer ID

1. Acesse: https://ads.google.com
2. No canto superior direito, você verá seu **Customer ID** (formato: XXX-XXX-XXXX)
3. Adicione ao `env.local`:
  ```bash
  GOOGLE_ADS_CUSTOMER_ID=XXX-XXX-XXXX
  ```

**Dica:** Se você tem múltiplas contas (Manager Account), use o ID da conta específica que deseja gerenciar.

## Passo 5: Obter Refresh Token (OAuth)

Execute o script de autenticação:

```bash
node scripts/setup_google_ads_oauth.js
```

O script irá:
1. ✅ Gerar URL de autorização
2. ✅ Abrir navegador automaticamente
3. ✅ Processar autorização
4. ✅ Obter Refresh Token
5. ✅ Atualizar `env.local` automaticamente

## Passo 6: Validar Configuração

Após completar todos os passos, seu `env.local` deve ter:

```bash
# Google Ads API
GOOGLE_ADS_CUSTOMER_ID=XXX-XXX-XXXX
GOOGLE_ADS_DEVELOPER_TOKEN=seu_developer_token
GOOGLE_ADS_CLIENT_ID=seu_client_id
GOOGLE_ADS_CLIENT_SECRET=seu_client_secret
GOOGLE_ADS_REFRESH_TOKEN=seu_refresh_token
```

## Resolução de Problemas

### Erro: "Developer Token not approved"
- ⏳ Aguarde aprovação (pode levar até 5 dias úteis)
- ✅ Verifique email para status

### Erro: "Invalid credentials"
- ✅ Verifique se copiou Client ID e Secret corretamente
- ✅ Verifique se não há espaços extras

### Erro: "Access denied"
- ✅ Verifique se está usando a conta correta do Google Ads
- ✅ Verifique permissões da conta

### Erro: "Port 8080 already in use"
- ✅ Feche outros serviços usando porta 8080
- ✅ Ou altere `REDIRECT_URI` no script

## Próximos Passos

Após configuração completa:
1. ✅ Testar conexão: `node scripts/test_google_ads_connection.js`
2. ✅ Implementar primeira campanha
3. ✅ Integrar no Marketing Agent

---

**Status:** 📋 Aguardando sua configuração  
**Prioridade:** 🔴 ALTA - Primeiro passo da evolução do Marketing Agent



















