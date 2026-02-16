# Error Handling Checklist

## Global Handlers
- [ ] Global error handler configurado (Express middleware, etc)
- [ ] Unhandled rejection handler ativo
- [ ] Uncaught exception handler ativo
- [ ] Stack traces NAO expostos em producao

## Error Patterns
- [ ] Zero empty catch blocks
- [ ] Errors com contexto (mensagem descritiva + causa)
- [ ] Error classes customizadas para dominios diferentes
- [ ] Error codes consistentes
- [ ] Error correlation IDs (request ID propagado)

## Resilience
- [ ] Retry logic para operacoes transientes
- [ ] Exponential backoff em retries
- [ ] Circuit breaker para dependencias externas
- [ ] Timeouts em toda chamada externa
- [ ] Request timeout configurado no server

## Shutdown
- [ ] Graceful shutdown implementado (SIGTERM handler)
- [ ] Para de aceitar novas conexoes
- [ ] Espera requests em andamento finalizar
- [ ] Fecha pools de conexao
- [ ] Limpa timers e listeners

## Partial Failures
- [ ] Bulk operations com error handling por item
- [ ] Rollback/compensation para operacoes multi-step
- [ ] Saga pattern para transactions distribuidas
- [ ] Dead letter queue para mensagens falhas
