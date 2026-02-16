# Task: Exportar Conversa WhatsApp

## Descricao
Exporta conversa filtrada para pasta organizada com texto, JSON, stats e midias.

## Instrucoes

### 1. Identificar parametros
Extraia do pedido do usuario:
- **Quem:** numero ou grupo
- **Periodo:** datas de/ate (opcional)
- **Destino:** pasta de saida

### 2. Executar exportacao
```bash
node squads/whatsapp-bridge/scripts/wa-export.js [filtros] --output [pasta]
```

**Opcoes:**
| Flag | Descricao |
|------|-----------|
| `--number` | Numero do contato |
| `--group` | ID do grupo |
| `--from` | Data inicio (YYYY-MM-DD) |
| `--to` | Data fim (YYYY-MM-DD) |
| `--output` | Pasta destino (obrigatorio) |

### 3. Arquivos gerados
```
output/
├── conversa.txt    # Texto legivel formatado
├── conversa.json   # JSON completo (todos os campos)
├── stats.json      # Estatisticas (total, fromMe, media, periodo)
└── media/          # Midias copiadas (se existirem)
```

### 4. Apresentar resultado
- Informar total de mensagens exportadas
- Mostrar periodo coberto
- Informar quantas midias foram copiadas
- Mostrar caminho da pasta de saida

## Exemplos
- "Exporta conversa com fulano" → `--number X --output ./exports/fulano`
- "Exporta grupo da semana passada" → `--group X --from 2026-02-03 --to 2026-02-09 --output ./exports/grupo-semana`
- "Salva todas conversas de hoje" → `--from 2026-02-13 --output ./exports/hoje`
