# WhatsApp Agent

## Identidade
- **Nome:** WhatsApp Bridge
- **Icone:** 📱
- **Papel:** Agente de interacao com WhatsApp - scraping, consulta, envio e exportacao de conversas

## Capacidades

### 1. Consultar Conversas
Busca mensagens no log do WhatsApp por filtros:
- Por numero de telefone (`--number 5511999999999`)
- Por grupo (`--group <group-id>`)
- Por periodo (`--from 2026-02-01 --to 2026-02-13`)
- Por palavra-chave (`--search "palavra"`)
- Listar contatos (`--list-contacts`)
- Listar grupos (`--list-groups`)

**Script:** `scripts/wa-query.js`

### 2. Enviar Mensagem
Envia mensagem via API do WhatsApp listener:
- Para contato individual (numero@s.whatsapp.net)
- Para grupo (groupid@g.us)
- Endpoint: `POST http://localhost:21350/api/send`

### 3. Exportar Conversa
Exporta conversa filtrada para pasta organizada:
- `conversa.txt` - Texto legivel
- `conversa.json` - JSON completo
- `stats.json` - Estatisticas
- `media/` - Midias copiadas

**Script:** `scripts/wa-export.js`

### 4. Baixar Midias
O listener salva midias automaticamente em `logs/media/`:
- Imagens, videos, audios, documentos, stickers
- Referencia salva no campo `mediaFile` do JSONL

## Dependencias
- WhatsApp listener rodando na porta 21350
- Arquivo `messages.jsonl` com historico
- Node.js para executar scripts

## Como Usar

### Via Claude Code (conversacional)
O usuario pode pedir naturalmente:
- "Pega minha conversa com 5511999999999 de ontem"
- "Exporta as mensagens do grupo X da ultima semana"
- "Lista meus contatos do WhatsApp"
- "Manda uma mensagem pro grupo tal dizendo X"
- "Baixa todos os audios da conversa com fulano"

### Via CLI (direto)
```bash
# Consultar
node squads/whatsapp-bridge/scripts/wa-query.js --number 5511999999999
node squads/whatsapp-bridge/scripts/wa-query.js --list-contacts
node squads/whatsapp-bridge/scripts/wa-query.js --search "reuniao" --from 2026-02-01

# Exportar
node squads/whatsapp-bridge/scripts/wa-export.js --number 5511999999999 --output ./exports/fulano
node squads/whatsapp-bridge/scripts/wa-export.js --group 120363408111554407 --from 2026-02-10 --output ./exports/grupo

# Enviar (via curl)
curl -X POST http://localhost:21350/api/send -H "Content-Type: application/json" -d '{"chat":"5511999999999@s.whatsapp.net","message":"Ola!"}'
```

## Arquitetura
```
WhatsApp Cloud
    |
    v
[Baileys Socket] -- port 21350
    |
    +--> messages.jsonl (log)
    +--> logs/media/ (arquivos)
    +--> /api/send (envio)
    |
    v
[wa-query.js] --> consulta
[wa-export.js] --> exportacao
[sentinela_whatsapp_alex.py] --> automacao grupo
```
