# Como Autorizar o App OAuth no Confluence

## ⚠️ Importante
O app OAuth `coordenadorautonomo` **não aparece** na lista de "Apps da Atlassian" porque é um app OAuth 3LO (three-legged OAuth) que requer autorização do usuário.

## Método 1: Autorização Automática (Recomendado)

O app será autorizado automaticamente quando você tentar usá-lo pela primeira vez:

1. **No Cursor, peça para listar espaços do Confluence:**
   ```
   "Liste todos os espaços do Confluence"
   ```

2. **Você será redirecionado para uma página de autorização do Atlassian**

3. **Clique em "Autorizar" ou "Allow"**

4. **O app estará autorizado e funcionando**

## Método 2: Autorização Manual via Developer Console

1. **Acesse a Developer Console:**
   - https://developer.atlassian.com/console/myapps/

2. **Encontre o app:**
   - Procure por "coordenadorautonomo" ou use o Client ID: `ddf7bd9f-24cb-4119-b6d9-3730eb3be971`

3. **Verifique os scopes:**
   - Certifique-se de que os scopes do Confluence estão habilitados:
     - `read:confluence-content.summary`
     - `write:confluence-content`

4. **Autorize no site:**
   - Vá para: https://coorporacaoautonoma.atlassian.net/wiki/admin
   - O app deve aparecer em "Manage apps" após a primeira autorização

## Método 3: Via URL de Autorização Direta

Você pode acessar diretamente a URL de autorização:

```
https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=ddf7bd9f-24cb-4119-b6d9-3730eb3be971&scope=read%3Ajira-work%20write%3Ajira-work%20read%3Aconfluence-content.summary%20write%3Aconfluence-content%20read%3Acompass-component%20offline_access&redirect_uri=http%3A%2F%2Flocalhost%3A1919%2Fcallback&state=YOUR_STATE&response_type=code&prompt=consent
```

**Nota:** Substitua `YOUR_STATE` por um valor aleatório ou deixe vazio.

## Verificação

Após autorizar, teste no Cursor:

```
"Liste todos os espaços do Confluence"
```

Se funcionar, você verá os espaços listados. Se ainda der erro 403, tente reiniciar o Cursor.


























