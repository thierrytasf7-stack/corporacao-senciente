# Google Analytics OAuth 2.0 - Configuração

## ✅ Client ID Configurado

**Client ID:** `393659950592-j87063e0guq3iilqpuf2hepppqrq62cl.apps.googleusercontent.com`

## 📋 Próximos Passos

### 1. Obter Client Secret

1. Acessar Google Cloud Console
2. Ir em: **APIs & Services → Credentials**
3. Encontrar o cliente OAuth criado
4. Clicar em **"Baixar o JSON"** (Download JSON)
5. Abrir o arquivo JSON e copiar o `client_secret`

### 2. Obter Refresh Token

Para obter o Refresh Token, você precisa:

1. **Habilitar Google Analytics Data API:**
   - Google Cloud Console → APIs & Services → Library
   - Buscar "Google Analytics Data API"
   - Clicar em "Enable"

2. **Configurar OAuth Consent Screen:**
   - APIs & Services → OAuth consent screen
   - Escolher "External" (para desenvolvimento)
   - Preencher informações básicas
   - Adicionar scopes: `https://www.googleapis.com/auth/analytics.readonly`

3. **Adicionar Test Users:**
   - OAuth consent screen → Test users
   - Adicionar seu email

4. **Obter Refresh Token:**
   
   **Opção A - Via Script:**
   ```bash
   node scripts/get_google_refresh_token.js
   ```
   
   **Opção B - Manual:**
   1. Acessar URL de autorização:
   ```
   https://accounts.google.com/o/oauth2/v2/auth?client_id=393659950592-j87063e0guq3iilqpuf2hepppqrq62cl.apps.googleusercontent.com&redirect_uri=http://localhost:3000/callback&response_type=code&scope=https://www.googleapis.com/auth/analytics.readonly&access_type=offline
   ```
   
   2. Autorizar e copiar o `code` da URL de callback
   
   3. Trocar code por refresh token:
   ```bash
   curl -X POST https://oauth2.googleapis.com/token \
     -d "client_id=393659950592-j87063e0guq3iilqpuf2hepppqrq62cl.apps.googleusercontent.com" \
     -d "client_secret=SEU_CLIENT_SECRET" \
     -d "code=CODE_OBTIDO" \
     -d "grant_type=authorization_code" \
     -d "redirect_uri=http://localhost:3000/callback"
   ```

### 3. Atualizar env.local

Após obter Client Secret e Refresh Token:

```env
GOOGLE_ANALYTICS_CLIENT_ID=393659950592-j87063e0guq3iilqpuf2hepppqrq62cl.apps.googleusercontent.com
GOOGLE_ANALYTICS_CLIENT_SECRET=seu_client_secret_aqui
GOOGLE_ANALYTICS_REFRESH_TOKEN=seu_refresh_token_aqui
```

## 🔗 Links Úteis

- Google Cloud Console: https://console.cloud.google.com/
- OAuth Consent Screen: https://console.cloud.google.com/apis/credentials/consent
- Analytics Data API: https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com

## 📝 Notas

- O Client ID já está configurado no `env.local`
- Client Secret e Refresh Token são opcionais para funcionalidade básica
- Para análise completa de métricas, são necessários






















