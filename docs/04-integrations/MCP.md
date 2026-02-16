# ⚠️ CONFIGURAÇÃO OBRIGATÓRIA DO MCP

## Status Atual
O MCP `jira-rovo-remote` **NÃO está funcionando** porque falta o **Client Secret** do OAuth app.

## Solução Rápida (3 passos)

### 1️⃣ Obter Client Secret
1. Acesse: https://developer.atlassian.com/console/myapps/ddf7bd9f-24cb-4119-b6d9-3730eb3be971/settings/
2. Vá em **"OAuth 2.0 (3LO)"** ou **"Authorization"**
3. Copie o **"Client secret"**

### 2️⃣ Adicionar no env.local
Abra `env.local` e adicione:
```
ATLASSIAN_CLIENT_SECRET=cole_o_secret_aqui
```

### 3️⃣ Atualizar mcp.json
Execute:
```bash
node scripts/update_mcp_config.js
```

### 4️⃣ Reiniciar Cursor
Feche e reabra o Cursor completamente.

## Verificação

Após configurar, teste no chat do Cursor:
- "Liste os espaços do Confluence"
- "Quais issues estão no projeto AUP?"

Se funcionar, você verá as respostas do MCP.

## Documentação Completa
Veja `docs/MCP_SETUP_GUIDE.md` para detalhes completos.



























