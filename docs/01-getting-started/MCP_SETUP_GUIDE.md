# Guia de Configuração do MCP Atlassian (Obrigatório)

## Problema Atual
O MCP `jira-rovo-remote` requer OAuth 2.0 (3LO) com `client-secret` do OAuth app da Atlassian.

## Solução: Obter Client Secret

### Passo 1: Acessar Developer Console
1. Acesse: https://developer.atlassian.com/console/myapps/
2. Faça login com sua conta Atlassian (`thierry.tasf7@gmail.com`)

### Passo 2: Localizar o OAuth App
1. Procure pelo app **"coordenadorautonomo"** ou pelo **App ID**: `ddf7bd9f-24cb-4119-b6d9-3730eb3be971`
2. Clique no app para abrir os detalhes

### Passo 3: Obter Client Secret
1. Vá em **"Settings"** ou **"Authorization"**
2. Procure por **"OAuth 2.0 (3LO)"** ou **"3-legged OAuth"**
3. Localize o campo **"Client secret"**
4. Se não estiver visível, pode ser necessário:
   - Clicar em "Show" ou "Reveal" para revelar
   - Ou gerar um novo secret se necessário

### Passo 4: Adicionar ao env.local
1. Abra `env.local`
2. Adicione a linha:
   ```
   ATLASSIAN_CLIENT_SECRET=seu_client_secret_aqui
   ```
3. Substitua `seu_client_secret_aqui` pelo secret copiado

### Passo 5: Verificar Configuração do OAuth App
Certifique-se de que o OAuth app tem:
- **Authorization type**: OAuth 2.0 (3LO)
- **Redirect URI**: `http://localhost:1919/callback`
- **Scopes**:
  - `read:jira-work`
  - `write:jira-work`
  - `read:confluence-content.summary`
  - `write:confluence-content`
  - `read:compass-component`
  - `offline_access`

### Passo 6: Reiniciar Cursor
1. Feche completamente o Cursor
2. Reabra o Cursor
3. O MCP deve conectar automaticamente

## Teste de Conexão

Após configurar, teste com:
```javascript
// No chat do Cursor, pergunte:
"Liste os espaços do Confluence"
"Quais issues estão no projeto AUP?"
```

## Troubleshooting

### Erro: "Authentication failed: 401 Unauthorized"
- Verifique se o `ATLASSIAN_CLIENT_SECRET` está correto no `env.local`
- Verifique se o OAuth app está ativo e tem os scopes corretos
- Verifique se o redirect URI está exatamente como `http://localhost:1919/callback`

### Erro: "Invalid PKCE code_verifier"
- O OAuth app precisa estar configurado para OAuth 2.0 (3LO)
- Certifique-se de que o redirect URI está correto
- Pode ser necessário reautorizar o app

### MCP não conecta
- Verifique se o `mcp.json` está salvo corretamente
- Reinicie o Cursor completamente
- Verifique os logs do MCP no Cursor (Settings > Tools & MCP)

## Alternativa: API REST Direta

Se o MCP não funcionar, os scripts em `scripts/` usam API REST diretamente:
- `scripts/setup_atlassian_complete.js` - Cria páginas e épicos
- `scripts/create_jira_tasks.js` - Cria tasks no Jira
- `scripts/setup_confluence_pages.js` - Cria páginas no Confluence

Esses scripts funcionam com `ATLASSIAN_API_TOKEN_ADMIN` e não requerem OAuth.



























