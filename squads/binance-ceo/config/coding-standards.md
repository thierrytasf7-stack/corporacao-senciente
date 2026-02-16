# Coding Standards - BINANCE-CEO Squad

## General
- TypeScript strict mode (sem `any`)
- ES2022 target
- Conventional Commits

## Trading-Specific Rules
- Sempre usar `Decimal.js` ou similar para calculos financeiros (evitar floating point)
- Precos devem ter precisao da exchange (tickSize)
- Quantidades devem respeitar lotSize e stepSize
- Timestamps em UTC sempre
- Logs de trade DEVEM incluir: timestamp, par, lado, preco, quantidade, motivo
- Nunca hardcodar API keys - usar env vars

## Error Handling
- Trades falhados devem ter retry com backoff
- Rate limit errors: exponential backoff
- Connection lost: reconnect automatico com limite
- Nunca silenciar erros em execucao de trades

## Data Safety
- Backup de configs antes de alteracao
- Nunca deletar logs de trades (append-only)
- Strategy configs devem ser versionados
