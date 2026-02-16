# Task: Buscar Conversas WhatsApp

## Descricao
Busca e filtra mensagens do log do WhatsApp (messages.jsonl).

## Instrucoes

### 1. Identificar filtros do usuario
Extraia do pedido do usuario:
- **Numero:** telefone com DDD (ex: 5511999999999)
- **Grupo:** ID do grupo WhatsApp
- **Periodo:** datas de inicio/fim
- **Busca texto:** palavra-chave
- **Tipo:** private ou group
- **Limite:** quantidade maxima de resultados

### 2. Executar consulta
```bash
node squads/whatsapp-bridge/scripts/wa-query.js [filtros]
```

**Opcoes:**
| Flag | Descricao | Exemplo |
|------|-----------|---------|
| `--number` | Filtrar por numero | `--number 5511999999999` |
| `--group` | Filtrar por grupo | `--group 120363408111554407` |
| `--chat` | Tipo de chat | `--chat private` |
| `--from` | Data inicio | `--from 2026-02-01` |
| `--to` | Data fim | `--to 2026-02-13` |
| `--search` | Busca texto | `--search "reuniao"` |
| `--limit` | Ultimas N msgs | `--limit 50` |
| `--media-only` | So midias | `--media-only` |
| `--json` | Output JSON | `--json` |
| `--list-contacts` | Listar contatos | (sem valor) |
| `--list-groups` | Listar grupos | (sem valor) |

### 3. Apresentar resultados
- Mostrar total de mensagens encontradas
- Resumir conteudo se muitas mensagens
- Oferecer exportar se usuario quiser

## Exemplos de uso
- "Quais mensagens recebi hoje?" → `--chat private --from 2026-02-13`
- "Mostra conversas com 5511999999999" → `--number 5511999999999`
- "Lista meus grupos" → `--list-groups`
- "Busca quem falou sobre 'projeto'" → `--search "projeto"`
