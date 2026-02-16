# Como Instalar o App OAuth no Confluence

## Opção 1: Via Site do Confluence (Recomendado)

1. **Acesse o Confluence:**
   - https://coorporacaoautonoma.atlassian.net/wiki/

2. **Vá em Configurações:**
   - Clique no ícone de engrenagem (⚙️) no canto superior direito
   - Ou acesse: https://coorporacaoautonoma.atlassian.net/wiki/admin

3. **Gerenciar Apps:**
   - No menu lateral, vá em "Apps" > "Manage apps"
   - Ou acesse: https://coorporacaoautonoma.atlassian.net/wiki/plugins/servlet/upm

4. **Autorizar App OAuth:**
   - Procure por "coordenadorautonomo" ou "OAuth"
   - Se não aparecer, você pode precisar autorizar via Developer Console primeiro

## Opção 2: Via Developer Console (OAuth 3LO)

1. **Acesse a Developer Console:**
   - https://developer.atlassian.com/console/myapps/

2. **Abra o App:**
   - Procure por "coordenadorautonomo" (ID: `ddf7bd9f-24cb-4119-b6d9-3730eb3be971`)
   - Clique no app

3. **Verifique Scopes:**
   - Certifique-se de que os scopes do Confluence estão habilitados:
     - `read:confluence-content.summary`
     - `write:confluence-content`

4. **Autorize no Site:**
   - O app OAuth 3LO requer autorização do usuário na primeira vez
   - Quando usar o MCP pela primeira vez, você será redirecionado para autorizar

## Opção 3: Via Admin Atlassian (Onde você está agora)

1. **No painel atual:**
   - Clique em "Apps" no menu lateral
   - Procure por "Application access settings" ou "Configurações de acesso ao aplicativo"
   - Verifique se o app está listado e autorizado para Confluence

2. **Ou use o botão "Adicionar aplicativo":**
   - Clique no botão "Adicionar aplicativo" na seção "Ações rápidas"
   - Procure pelo app OAuth

## Verificação

Após instalar/autorizar, teste no Cursor:

```
"Liste todos os espaços do Confluence"
```

Se funcionar, você verá os espaços listados. Se ainda der erro 403, o app precisa ser autorizado especificamente para Confluence.


























