# Como Identificar o Developer Token do Google Ads

## O que é o Developer Token?

O Developer Token é uma credencial única que identifica sua aplicação no Google Ads API. Ele tem o formato:
- **String alfanumérica** (geralmente 12-20 caracteres)
- Pode conter letras, números e hífens
- Exemplo: `ABC123DEF456` ou `abc-def-ghi`

## Onde Encontrar?

### Opção 1: API Center do Google Ads
1. Acesse: https://ads.google.com/aw/apicenter
2. Você verá o Developer Token na página principal
3. Aparece como "Your Developer Token" ou "Token de Desenvolvedor"

### Opção 2: Após Solicitar Acesso
1. Após solicitar acesso e ser aprovado
2. Receberá email de confirmação
3. O token aparecerá no API Center

### Opção 3: Se Já Tem Conta com API Acessada
- O token pode aparecer diretamente na interface
- Geralmente na seção "API Access" ou "Developer Tools"

## Como Validar se é o Token Correto?

Execute após configurar:

```bash
npm run google-ads:test
```

O teste verificará se o token é válido.

## Formato Esperado

- ✅ Letras maiúsculas e minúsculas
- ✅ Números
- ✅ Hífens opcionais
- ❌ Não contém espaços
- ❌ Não contém caracteres especiais além de hífen

## Adicionar ao env.local

```bash
GOOGLE_ADS_DEVELOPER_TOKEN=seu_token_aqui
```

---

**Dica:** Se você viu o token na imagem, copie exatamente como aparece e cole aqui.



















