# Task: Baixar Midias WhatsApp

## Descricao
O listener salva midias automaticamente na pasta `logs/media/`. Esta task ajuda a localizar e copiar midias especificas.

## Como funciona

### Salvamento automatico
O listener intercepta mensagens com midia e salva em:
```
apps/backend/integrations/whatsapp/logs/media/
├── img_1707831234567.jpg
├── aud_1707831234568.ogg
├── vid_1707831234569.mp4
├── doc_1707831234570.pdf
└── stk_1707831234571.webp
```

O JSONL registra o campo `mediaFile` com o nome do arquivo salvo.

### Buscar midias de uma conversa
```bash
# Ver midias de um contato
node squads/whatsapp-bridge/scripts/wa-query.js --number 5511999999999 --media-only

# Ver midias de um grupo
node squads/whatsapp-bridge/scripts/wa-query.js --group 120363408111554407 --media-only
```

### Exportar com midias
```bash
# Exporta conversa + copia midias para pasta
node squads/whatsapp-bridge/scripts/wa-export.js --number 5511999999999 --output ./exports/fulano
```
O export automaticamente copia midias referenciadas para `output/media/`.

## Tipos de midia suportados
| Tipo | Prefixo | Extensao |
|------|---------|----------|
| Imagem | `img_` | `.jpg` |
| Audio | `aud_` | `.ogg` |
| Video | `vid_` | `.mp4` |
| Documento | `doc_` | extensao original |
| Sticker | `stk_` | `.webp` |

## Exemplos
- "Baixa os audios da conversa com fulano" → query media-only + export
- "Quais fotos recebi no grupo X?" → query media-only com filtro image
- "Exporta tudo do fulano com midias" → export completo
