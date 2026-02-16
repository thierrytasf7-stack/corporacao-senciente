# Task: Entregar Resultados

## Descricao
Envia resultados do PUV Score via WhatsApp ou salva localmente.

## Instrucoes

### Entrega Local
```bash
node squads/puv-score/scripts/puv-pipeline.js --canal website --link URL --output ./results/
```
Gera diretorio com: `scorecard.jpg`, `slides.pdf`, `report.pdf`, `analysis.json`

### Entrega WhatsApp
```bash
node squads/puv-score/scripts/puv-pipeline.js --canal website --link URL --deliver whatsapp --chat "5511999999999@s.whatsapp.net"
```
Envia scorecard como imagem + mensagem com link para completo.

## WhatsApp Bridge
- Endpoint: `http://localhost:21350/api/send`
- Formato: `{"chat": "jid", "message": "texto"}` ou `{"chat": "jid", "image": "base64"}`

## Dependencias
- WhatsApp Bridge rodando na porta 21350
