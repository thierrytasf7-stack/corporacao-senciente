# Task: Enviar Mensagem WhatsApp

## Descricao
Envia mensagem via API do WhatsApp listener.

## Pre-requisitos
- WhatsApp listener rodando na porta 21350
- Listener conectado (health check OK)

## Instrucoes

### 1. Verificar conexao
```bash
curl http://localhost:21350/health
```
Deve retornar `{"connected":true}`.

### 2. Identificar destinatario
- **Contato individual:** numero com codigo pais (ex: `5511999999999@s.whatsapp.net`)
- **Grupo:** ID do grupo (ex: `120363408111554407@g.us`)

### 3. Enviar mensagem
```bash
curl -X POST http://localhost:21350/api/send \
  -H "Content-Type: application/json" \
  -d '{"chat":"DESTINATARIO","message":"TEXTO"}'
```

### 4. Confirmar envio
- Verificar resposta `{"ok":true}`
- Informar usuario que mensagem foi enviada

## Seguranca
- SEMPRE confirmar com o usuario antes de enviar
- Mostrar preview da mensagem e destinatario
- Nunca enviar mensagens automaticamente sem autorizacao explicita
- Mensagens em nome do usuario devem ser claramente indicadas

## Exemplos
- "Manda pro grupo X: reuniao amanha 15h" → POST com group JID
- "Fala pro 5511999999999: estou chegando" → POST com number JID
